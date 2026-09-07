import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AgeGate } from "@/components/AgeGate";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFAB } from "@/components/WhatsAppFAB";
import { CursorParticles } from "@/components/CursorParticles";
import { CartDrawer } from "@/components/CartDrawer";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Alquimista - Licores Artesanais" },
      { name: "description", content: "Licores artesanais feitos à mão em Criciúma/SC. Pequenos lotes, ingredientes naturais, alma e propósito." },
      { name: "author", content: "Alquimista Licores" },
      { property: "og:title", content: "Alquimista - Licores Artesanais" },
      { property: "og:description", content: "Licores artesanais feitos à mão em Criciúma/SC. Pequenos lotes, ingredientes naturais, alma e propósito." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Alquimista - Licores Artesanais" },
      { name: "twitter:description", content: "Licores artesanais feitos à mão em Criciúma/SC. Pequenos lotes, ingredientes naturais, alma e propósito." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/x3CeDgiXdoN0Ni7fJZP9NoFyuZ43/social-images/social-1780272973487-bg.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/x3CeDgiXdoN0Ni7fJZP9NoFyuZ43/social-images/social-1780272973487-bg.webp" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Lato:wght@300;400;700;900&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });
  
  // MODO MANUTENÇÃO: Ative para redirecionar usuários para a página de manutenção
  // (Exceto para a própria rota de manutenção e para a área administrativa)
  const isMaintenanceActive = false; 

  const isAdmin = path.startsWith("/admin");
  const isMaintenancePage = path === "/manutencao";

  if (isMaintenanceActive && !isAdmin && !isMaintenancePage) {
    // Redirecionamento forçado via client-side para manter o site "escondido"
    // Usamos um efeito ou simplesmente renderizamos um redirecionamento se necessário,
    // mas para ser mais robusto e "apenas ela aparecendo", podemos usar o navigate do router
    const router = useRouter();
    React.useEffect(() => {
      router.navigate({ to: "/manutencao", replace: true });
    }, [router]);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="parchment-bg min-h-screen relative">
        <AgeGate />
        {!isAdmin && <CursorParticles />}
        {!isAdmin && !isMaintenancePage && <Header />}
        <main className="relative z-10">
          <Outlet />
        </main>
        {!isAdmin && !isMaintenancePage && <Footer />}
        {!isAdmin && !isMaintenancePage && <WhatsAppFAB />}
        <CartDrawer />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
