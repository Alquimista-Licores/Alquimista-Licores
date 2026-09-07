import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { integrationAuthorized } from "@/lib/gerenciapp-integration.server";

const payloadSchema = z.object({
  siteOrderId: z.string().uuid(),
  gerenciappOrderId: z.string().uuid(),
  paid: z.literal(true),
  paidAt: z.string().datetime(),
  receivedAmount: z.number().nonnegative(),
});

export const Route = createFileRoute("/api/public/integration/gerenciapp/payment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!integrationAuthorized(request)) return new Response("Unauthorized", { status: 401 });

        let payload: z.infer<typeof payloadSchema>;
        try {
          payload = payloadSchema.parse(await request.json());
        } catch (error) {
          return Response.json({ error: "Payload inválido", details: String(error) }, { status: 400 });
        }

        const { data: order, error: readError } = await supabaseAdmin
          .from("site_orders")
          .select("id, status")
          .eq("id", payload.siteOrderId)
          .maybeSingle();
        if (readError) return Response.json({ error: readError.message }, { status: 500 });
        if (!order) return Response.json({ error: "Pedido do Site não encontrado" }, { status: 404 });

        if (order.status !== "pago") {
          const { error: updateError } = await supabaseAdmin
            .from("site_orders")
            .update({
              status: "pago",
              pago_at: payload.paidAt,
              status_gerenciapp: "sincronizado",
              gerenciapp_order_id: payload.gerenciappOrderId,
              sincronizado_gerenciapp_at: new Date().toISOString(),
            })
            .eq("id", payload.siteOrderId);
          if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
        }

        return Response.json({ ok: true, alreadyPaid: order.status === "pago" });
      },
    },
  },
});
