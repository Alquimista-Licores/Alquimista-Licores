import { createServerFn } from "@tanstack/react-start";

export const refreshGerenciappStock = createServerFn({ method: "POST" }).handler(async () => {
  const { syncStockFromGerenciapp } = await import("@/lib/gerenciapp-integration.server");
  return syncStockFromGerenciapp();
});
