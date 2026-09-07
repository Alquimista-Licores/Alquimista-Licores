import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bell, BellOff, BellRing } from "lucide-react";
import { toast } from "sonner";
import { subscribePush, unsubscribePush } from "@/lib/push.functions";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/push-config";

type Status = "unsupported" | "ios-needs-pwa" | "denied" | "off" | "on" | "loading";

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}
function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function EnablePushButton() {
  const [status, setStatus] = useState<Status>("loading");
  const subscribe = useServerFn(subscribePush);
  const unsubscribe = useServerFn(unsubscribePush);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window === "undefined") return;
      const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      if (!supported) {
        if (isIOS() && !isStandalone()) {
          if (!cancelled) setStatus("ios-needs-pwa");
        } else if (!cancelled) setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.getRegistration("/sw-push.js");
        const sub = await reg?.pushManager.getSubscription();
        if (!cancelled) setStatus(sub ? "on" : "off");
      } catch {
        if (!cancelled) setStatus("off");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function enable() {
    try {
      setStatus("loading");
      const reg = await navigator.serviceWorker.register("/sw-push.js");
      await navigator.serviceWorker.ready;
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        toast.error("Permissão negada pelo navegador.");
        setStatus(perm === "denied" ? "denied" : "off");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
      const json = sub.toJSON();
      await subscribe({
        data: {
          endpoint: sub.endpoint,
          p256dh: json.keys!.p256dh!,
          auth: json.keys!.auth!,
          user_agent: navigator.userAgent.slice(0, 500),
        },
      });
      setStatus("on");
      toast.success("Notificações ativadas neste dispositivo.");
    } catch (e) {
      console.error(e);
      const msg = (e as { message?: string })?.message ?? String(e);
      let friendly = `Não foi possível ativar: ${msg}`;
      const isBrave = !!(navigator as Navigator & { brave?: { isBrave?: () => Promise<boolean> } }).brave;
      if (/push service|registration failed|aborterror/i.test(msg)) {
        friendly = isBrave
          ? "O Brave bloqueia push por padrão. Abra brave://settings/privacy, ative \"Use Google services for push messaging\", reinicie o navegador e tente novamente. Como alternativa, use Chrome, Edge ou Firefox."
          : "O serviço de push do navegador recusou a inscrição. Tente reiniciar o navegador, ou use Chrome, Edge ou Firefox atualizado.";
      } else if (/unauthorized|401|jwt|auth/i.test(msg)) {
        friendly = "Faça login na área admin antes de ativar as notificações.";
      } else if (/permission|denied|notallowed/i.test(msg)) {
        friendly = "O navegador bloqueou a permissão de notificações.";
      } else if (/serviceworker|register|sw-push/i.test(msg)) {
        friendly = "Falha ao registrar o service worker. Tente recarregar a página.";
      }
      toast.error(friendly);
      setStatus("off");
    }
  }

  async function disable() {
    try {
      setStatus("loading");
      const reg = await navigator.serviceWorker.getRegistration("/sw-push.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await unsubscribe({ data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
      setStatus("off");
      toast.success("Notificações desativadas neste dispositivo.");
    } catch (e) {
      console.error(e);
      setStatus("on");
    }
  }

  const base =
    "border border-[var(--gold)]/30 bg-[var(--surface)]/60 p-4 rounded-sm mb-6 flex items-start gap-3";

  if (status === "loading") return null;

  if (status === "ios-needs-pwa") {
    return (
      <div className={base}>
        <Bell className="w-5 h-5 text-[var(--gold)] mt-0.5 shrink-0" />
        <div className="text-sm text-[var(--cream)]/90">
          <div className="font-display text-[var(--gold)] mb-1">Ativar no iPhone</div>
          No Safari, toque em <strong>Compartilhar → Adicionar à Tela de Início</strong>. Depois abra
          o ícone do Alquimista na tela inicial e volte aqui para ativar as notificações.
        </div>
      </div>
    );
  }

  if (status === "unsupported") {
    return (
      <div className={base}>
        <BellOff className="w-5 h-5 text-[var(--cream)]/50 mt-0.5 shrink-0" />
        <div className="text-sm text-[var(--cream)]/70">
          Este navegador não suporta notificações push. Use Chrome, Edge, Firefox ou Safari atualizado.
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className={base}>
        <BellOff className="w-5 h-5 text-red-300 mt-0.5 shrink-0" />
        <div className="text-sm text-[var(--cream)]/90">
          Notificações bloqueadas neste navegador. Abra as configurações do site e libere notificações,
          depois recarregue esta página.
        </div>
      </div>
    );
  }

  return (
    <div className={base}>
      {status === "on" ? (
        <BellRing className="w-5 h-5 text-[var(--gold)] mt-0.5 shrink-0" />
      ) : (
        <Bell className="w-5 h-5 text-[var(--gold)] mt-0.5 shrink-0" />
      )}
      <div className="flex-1 text-sm text-[var(--cream)]/90">
        <div className="font-display text-[var(--gold)] mb-1">
          {status === "on" ? "Notificações ativas neste dispositivo" : "Receber alerta quando uma poção zerar"}
        </div>
        <p className="text-[var(--cream)]/70 mb-2">
          {status === "on"
            ? "Você vai receber uma notificação imediatamente quando o estoque chegar a zero."
            : "Ative uma vez neste celular ou computador. Funciona mesmo com o navegador fechado."}
        </p>
        {status === "on" ? (
          <button
            onClick={disable}
            className="text-xs uppercase tracking-widest text-[var(--cream)]/60 hover:text-[var(--cream)]"
          >
            Desativar neste dispositivo
          </button>
        ) : (
          <button
            onClick={enable}
            className="bg-[var(--gold)] text-[var(--bg)] px-4 py-2 text-xs uppercase tracking-widest font-display rounded-sm hover:opacity-90"
          >
            🔔 Ativar notificações
          </button>
        )}
      </div>
    </div>
  );
}