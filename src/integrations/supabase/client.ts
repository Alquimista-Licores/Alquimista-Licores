import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Client Integration Oficial
 * Projeto Oficial Atual: https://bktegbisdaqdhpqtxqxy.supabase.co
 */

const OFFICIAL_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdGVnYmlzZGFxZGhwcXR4cXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1Njg2NzksImV4cCI6MjEwNTE0NDY3OX0.nUbhe2vFtcnFOZPO6Nww-IjdGJAPCIC1Z82CladmjG4";

export const SUPABASE_CONFIG = {
  url: import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || "https://bktegbisdaqdhpqtxqxy.supabase.co",
  anonKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY || OFFICIAL_ANON_KEY,
  projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID || "bktegbisdaqdhpqtxqxy",
  storage: {
    productImages: "https://bktegbisdaqdhpqtxqxy.supabase.co/storage/v1/object/public/product-images",
    jornadaEvidencias: "https://bktegbisdaqdhpqtxqxy.supabase.co/storage/v1/object/authenticated/jornada-evidencias",
  }
};

/**
 * Instância singleton do cliente Supabase para o navegador e SSR
 */
export const supabase: SupabaseClient = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey || "sb_placeholder_anon_key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: `sb-${SUPABASE_CONFIG.projectId}-auth-token`,
    }
  }
);

/**
 * Helper para chamadas REST genéricas ao Supabase
 */
export async function supabaseRestFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const url = `${SUPABASE_CONFIG.url}/rest/v1/${endpoint.replace(/^\//, '')}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };

    if (SUPABASE_CONFIG.anonKey) {
      headers["apikey"] = SUPABASE_CONFIG.anonKey;
      headers["Authorization"] = `Bearer ${SUPABASE_CONFIG.anonKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errText = await response.text();
      return { data: null, error: errText || `HTTP Error ${response.status}` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || "Falha na conexão com Supabase" };
  }
}
