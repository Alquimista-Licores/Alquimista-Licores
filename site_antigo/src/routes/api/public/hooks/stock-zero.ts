import { createFileRoute } from "@tanstack/react-router";
import webpush from "web-push";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { VAPID_PUBLIC_KEY } from "@/lib/push-config";

export const Route = createFileRoute("/api/public/hooks/stock-zero")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = request.headers.get("x-hook-secret");
        if (!secret) {
          console.warn("[stock-zero] missing x-hook-secret header");
          return new Response("Unauthorized", { status: 401 });
        }

        // Read expected secret from app_config so it always matches the
        // value the Postgres trigger sends (single source of truth).
        const { data: cfg, error: cfgErr } = await supabaseAdmin
          .from("app_config")
          .select("value")
          .eq("key", "stock_hook_secret")
          .maybeSingle();
        const expected = cfg?.value ?? process.env.STOCK_HOOK_SECRET;
        if (cfgErr) console.warn("[stock-zero] app_config read error:", cfgErr.message);
        if (!expected) {
          console.error("[stock-zero] no expected secret configured (app_config + env both empty)");
          return new Response("Server misconfigured", { status: 500 });
        }
        if (secret !== expected) {
          console.warn("[stock-zero] secret mismatch");
          return new Response("Unauthorized", { status: 401 });
        }

        let body: { product_id?: string; nome?: string; tipo?: string; estoque?: number };
        try {
          body = await request.json();
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }
        const nome = (body.nome || "Uma poção").toString().slice(0, 120);
        const tipo = body.tipo === "low" ? "low" : "zero";
        const estoque = typeof body.estoque === "number" ? body.estoque : 0;

        const privateKey = process.env.VAPID_PRIVATE_KEY;
        if (!privateKey) {
          return new Response("Missing VAPID key", { status: 500 });
        }
        webpush.setVapidDetails(
          "mailto:alquimista@alquimistalicores.com.br",
          VAPID_PUBLIC_KEY,
          privateKey,
        );

        const { data: subs, error } = await supabaseAdmin
          .from("push_subscriptions")
          .select("id, endpoint, p256dh, auth_key");
        if (error) {
          console.error("[stock-zero] failed to load subscriptions:", error.message);
          return new Response(error.message, { status: 500 });
        }
        console.log(`[stock-zero] sending to ${subs?.length ?? 0} subscription(s) for "${nome}"`);

        const payload = JSON.stringify(
          tipo === "low"
            ? {
                title: "🧪 Estoque baixo",
                body: `${nome} está com apenas ${estoque} garrafa${estoque === 1 ? "" : "s"}. Prepare a próxima fornada.`,
                url: "/admin/produtos",
                tag: `stock-low-${body.product_id ?? Date.now()}`,
              }
            : {
                title: "⚠️ Estoque zerado",
                body: `${nome} acabou. Hora de reabastecer.`,
                url: "/admin/produtos",
                tag: `stock-zero-${body.product_id ?? Date.now()}`,
              },
        );

        const results = await Promise.allSettled(
          (subs ?? []).map((s) =>
            webpush.sendNotification(
              { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } },
              payload,
            ),
          ),
        );

        const stale: string[] = [];
        const failures: Array<{
          endpoint: string;
          statusCode: number | null;
          message: string | null;
          body: string | null;
        }> = [];
        results.forEach((r, i) => {
          if (r.status === "rejected") {
            const reason = r.reason as { statusCode?: number; body?: unknown; message?: string; headers?: unknown };
            const code = reason?.statusCode;
            const bodyStr =
              typeof reason?.body === "string"
                ? reason.body.slice(0, 300)
                : JSON.stringify(reason?.body)?.slice(0, 300);
            console.warn(
              `[stock-zero] push failed [${i}] endpoint=${subs[i].endpoint.slice(0, 60)} statusCode=${code} message=${reason?.message} body=${bodyStr}`,
            );
            failures.push({
              endpoint: subs[i].endpoint.slice(0, 60),
              statusCode: typeof code === "number" ? code : null,
              message: reason?.message ?? null,
              body: bodyStr ?? null,
            });
            if (code === 404 || code === 410) stale.push(subs[i].id);
          }
        });
        if (stale.length) {
          await supabaseAdmin.from("push_subscriptions").delete().in("id", stale);
        }

        const sent = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.length - sent;
        console.log(`[stock-zero] sent=${sent} failed=${failed} pruned=${stale.length}`);
        return Response.json({ sent, failed, pruned: stale.length, failures: failures.slice(0, 5) });
      },
    },
  },
});