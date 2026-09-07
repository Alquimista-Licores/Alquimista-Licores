import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJornadaAdminData, processSolicitacao, rejectSolicitacao, getRuneSecretCode, updateRuneSecretCode } from "@/lib/admin-jornada.functions";
import { updateOrderStatus } from "@/lib/admin-orders.functions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Users, 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  Award,
  TrendingUp,
  Ban,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Search,
  Instagram,
  MapPin,
  Calendar,
  ShieldCheck,
  User,
  Image as ImageIcon,
  Check,
  X,
  Lock,
  Save,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";

export const Route = createFileRoute("/admin/jornada")({
  head: () => ({ meta: [{ title: "Jornada · Admin" }, { name: "robots", content: "noindex" }] }),
  component: JornadaAdmin,
});

function normalizeInstagramHandle(raw: string) {
  return raw
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@+/, "")
    .replace(/\/+$/, "")
    .split(/[/?#]/)[0]
    .trim();
}

function instagramProfileUrl(raw: string) {
  const handle = normalizeInstagramHandle(raw);
  return handle ? `https://www.instagram.com/${encodeURIComponent(handle)}` : undefined;
}

function formatPhoneNumber(phone: string | null | undefined) {
  if (!phone) return "-";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
  }
  return phone;
}

function parseCronistaReference(raw: string | null | undefined) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.tipo_referencia && parsed?.referencia_verificacao) return parsed;
  } catch {
    // Solicitações antigas continuam visíveis como texto simples.
  }
  return { tipo_referencia: "nome", referencia_verificacao: raw };
}

function JornadaAdmin() {
  const queryClient = useQueryClient();
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({
    concluida: true,
    clientes: true,
    solicitacoesV2: false,
    indicacoes: true
  });
  const [runeCode, setRuneCode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedClienteId, setExpandedClienteId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-jornada-data"],
    queryFn: () => getJornadaAdminData(),
  });

  const processMutation = useMutation({
    mutationFn: (args: { id: string, status: 'aprovado' | 'rejeitado', motivo?: string }) => 
      processSolicitacao({ data: { solicitacaoId: args.id, status: args.status, motivoRejeicao: args.motivo } }),
    onSuccess: () => {
      toast.success("Solicitação processada com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["admin-jornada-data"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao processar solicitação.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectSolicitacao({ data: { solicitacaoId: id } }),
    onSuccess: () => {
      toast.success("Solicitação rejeitada com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["admin-jornada-data"] });
    },
    onError: () => {
      toast.error("Erro ao rejeitar solicitação.");
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: (orderId: string) => updateOrderStatus({ data: { orderId, status: "pago" } }),
    onSuccess: () => {
      toast.success("Pedido marcado como pago!");
      queryClient.invalidateQueries({ queryKey: ["admin-jornada-data"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao atualizar pedido.");
    },
  });

  const { data: configData } = useQuery({
    queryKey: ["admin-rune-code"],
    queryFn: () => getRuneSecretCode(),
  });

  useEffect(() => {
    if (configData?.code !== undefined) {
      setRuneCode(configData.code);
    }
  }, [configData]);

  const updateCodeMutation = useMutation({
    mutationFn: (code: string) => updateRuneSecretCode({ data: { code } }),
    onSuccess: () => {
      toast.success("Código secreto atualizado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["admin-rune-code"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao atualizar código.");
    },
  });

  if (isLoading) return <AdminShell title="Jornada do Alquimista">Carregando...</AdminShell>;
  if (error) return <AdminShell title="Jornada do Alquimista">Erro ao carregar dados.</AdminShell>;

  const { solicitacoes, solicitacoesV2, clientes, siteOrders, indicacoes } = data as any || { solicitacoes: [], solicitacoesV2: [], clientes: [], siteOrders: [], indicacoes: [] };
  
  const filteredClientes = (clientes as any[] || []).filter((c: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (c.nome?.toLowerCase().includes(term) || 
            c.telefone?.toLowerCase().includes(term) ||
            c.apelido?.toLowerCase().includes(term));
  });

  const filteredSolicitacoes = (solicitacoes as any[] || []).filter((s: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (s.numero_pedido_digitado?.toLowerCase().includes(term) ||
            s.cliente?.nome?.toLowerCase().includes(term) ||
            s.cliente?.telefone?.toLowerCase().includes(term));
  });

  const filteredSolicitacoesV2 = (solicitacoesV2 as any[] || []).filter((s: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (s.cliente?.nome?.toLowerCase().includes(term) ||
            s.conquista?.nome?.toLowerCase().includes(term) ||
            s.texto_evidencia?.toLowerCase().includes(term));
  });

  const groupedSolicitacoes = {
    pendente: filteredSolicitacoes.filter((s: any) => s.status === "pendente"),
    concluida: filteredSolicitacoes.filter((s: any) => s.status !== "pendente"),
  };

  const groupedV2 = {
    pendente: filteredSolicitacoesV2.filter((s: any) => s.status === "pendente"),
    resolvida: filteredSolicitacoesV2.filter((s: any) => s.status !== "pendente"),
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleClienteExpand = (id: string) => {
    setExpandedClienteId(prev => prev === id ? null : id);
  };

  const findRelatedOrder = (numeroPedido: string) => {
    return (siteOrders as any[] || []).find((o: any) => o.codigo_pedido === numeroPedido);
  };

  const exportClientesCSV = () => {
    if (!clientes || clientes.length === 0) {
      toast.error("Não há clientes para exportar.");
      return;
    }

    const headers = [
      "ID",
      "Nome",
      "Telefone",
      "Apelido",
      "Cidade",
      "Aniversário",
      "Instagram",
      "Como Conheceu",
      "XP",
      "Passo Atual",
      "Cenário Atual",
      "Qtd Conquistas",
      "Criado Em",
      "Aceite Termos Em"
    ];

    const rows = clientes.map((c: any) => {
      const progressos = Array.isArray(c.progresso) ? c.progresso : (c.progresso ? [c.progresso] : []);
      const lastProgresso = [...progressos].sort((a: any, b: any) => 
        new Date(b.criado_em || b.created_at || 0).getTime() - new Date(a.criado_em || a.created_at || 0).getTime()
      )?.[0];

      return [
        c.id,
        c.nome || "",
        c.telefone || "",
        c.apelido || "",
        c.cidade || "",
        c.data_aniversario || "",
        c.instagram || "",
        c.como_conheceu || "",
        c.xp || 0,
        lastProgresso?.passo_atual ?? 0,
        lastProgresso?.cenario ?? "Início",
        c.conquistas_desbloqueadas?.length || 0,
        c.criado_em ? new Date(c.criado_em).toLocaleString("pt-BR") : "",
        c.aceite_termos_em ? new Date(c.aceite_termos_em).toLocaleString("pt-BR") : ""
      ].map(val => {
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `clientes-jornada-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exportado com sucesso!");
  };

  function SolicitacaoV2Card({ s }: { s: any }) {
    const instagramMission = ["seguidor-guilda", "selo-alquimista", "memoria-encantada"].includes(s.conquista_slug);
    const instagramHandle = instagramMission ? normalizeInstagramHandle(s.texto_evidencia || "") : "";
    const cronistaReference = s.conquista_slug === "cronista-dourado"
      ? parseCronistaReference(s.texto_evidencia)
      : null;
    const meta = Number(s.conquista?.meta_objetivo || 1);
    const progressoAtual = Math.min(meta, Number(s.progresso_atual || 0));

    return (
      <div className="bg-black/40 border border-[var(--gold)]/20 p-4 rounded-sm space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[var(--cream)] font-medium">{s.cliente?.nome}</h4>
              <p className="text-[10px] text-[var(--gold)] uppercase tracking-widest">
                {s.conquista?.nome}
                {meta > 1 && ` (${progressoAtual}/${meta})`}
              </p>
              {(s.conquista_slug === 'selo-alquimista' || s.conquista_slug === 'memoria-encantada') && (
                <p className="text-[9px] text-red-400 uppercase font-bold italic">O perfil do Instagram precisa estar público!</p>
              )}
            </div>
          </div>
          <div className="text-[10px] text-[var(--cream)]/40">
            {format(new Date(s.created_at), "dd/MM HH:mm", { locale: ptBR })}
          </div>
        </div>

        {instagramHandle && (
          <a
            href={instagramProfileUrl(instagramHandle)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-pink-400 hover:text-pink-300 underline underline-offset-2"
          >
            <Instagram className="w-4 h-4" /> @{instagramHandle}
          </a>
        )}

        {cronistaReference && (
          <div className="bg-black/20 p-3 border-l-2 border-[var(--gold)]/40 rounded-r-sm space-y-1">
            <p className="text-[9px] uppercase tracking-widest text-[var(--gold)]/60">
              {cronistaReference.tipo_referencia === "link" ? "Link da avaliação" : "Nome público para busca"}
            </p>
            {cronistaReference.tipo_referencia === "link" ? (
              <a
                href={cronistaReference.referencia_verificacao}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 underline break-all"
              >
                {cronistaReference.referencia_verificacao}
              </a>
            ) : (
              <p className="text-xs text-[var(--cream)]/80">{cronistaReference.referencia_verificacao}</p>
            )}
          </div>
        )}

        {s.data_evidencia && s.conquista_slug === "memoria-encantada" && (
          <p className="text-xs text-[var(--cream)]/60">
            Data do story: <strong className="text-[var(--cream)]">{format(new Date(`${s.data_evidencia}T12:00:00`), "dd/MM/yyyy")}</strong>
          </p>
        )}

        {s.texto_evidencia && !instagramMission && !cronistaReference && (
          <div className="bg-black/20 p-3 border-l-2 border-[var(--gold)]/40 rounded-r-sm">
            <p className="text-xs text-[var(--cream)]/80 italic">"{s.texto_evidencia}"</p>
          </div>
        )}

        {s.foto_signed_url && (
          <div className="relative aspect-video bg-black/40 rounded-sm overflow-hidden border border-[var(--gold)]/10">
            <img 
              src={s.foto_signed_url} 
              alt="Evidência" 
              className="w-full h-full object-contain"
            />
            <a 
              href={s.foto_signed_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-[var(--gold)] hover:bg-black transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {s.status === 'pendente' ? (
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => processMutation.mutate({ id: s.id, status: 'aprovado' })}
              disabled={processMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600/20 hover:bg-green-600/40 text-green-500 border border-green-600/30 py-2 rounded-sm text-xs font-bold uppercase transition-all"
            >
              <Check className="w-4 h-4" /> Aprovar
            </button>
            <button
              onClick={() => {
                const motivo = prompt("Motivo da rejeição:");
                if (motivo) processMutation.mutate({ id: s.id, status: 'rejeitado', motivo });
              }}
              disabled={processMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-600/30 py-2 rounded-sm text-xs font-bold uppercase transition-all"
            >
              <X className="w-4 h-4" /> Rejeitar
            </button>
          </div>
        ) : (
          <div className={`text-center py-2 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] ${s.status === 'aprovado' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {s.status} {s.motivo_rejeicao && `(${s.motivo_rejeicao})`}
          </div>
        )}
      </div>
    );
  }

  return (
    <AdminShell title="Jornada do Alquimista">
      <div className="space-y-10">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--gold)]/40 group-focus-within:text-[var(--gold)] transition-colors" />
            <input
              type="text"
              placeholder="Buscar por cliente, pedido ou conquista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-[var(--gold)]/20 rounded-sm py-4 pl-12 pr-4 text-[var(--cream)] placeholder:text-[var(--cream)]/20 focus:outline-none focus:border-[var(--gold)]/50 transition-all font-display tracking-widest uppercase text-sm"
            />
          </div>

          <div className="flex items-center gap-2 bg-black/40 border border-cyan-900/30 rounded-sm p-2 group/rune">
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-cyan-500/40 group-focus-within/rune:text-cyan-500 transition-colors" />
            </div>
            <input
              type="text"
              value={runeCode}
              onChange={(e) => setRuneCode(e.target.value)}
              placeholder="Runa Ativa..."
              className="w-32 bg-transparent border-none py-1 px-1 text-[10px] text-[var(--cream)]/60 placeholder:text-[var(--cream)]/20 focus:outline-none focus:text-cyan-400 transition-all font-mono tracking-widest uppercase"
            />
            {runeCode !== (configData?.code || "") && (
              <button
                onClick={() => updateCodeMutation.mutate(runeCode)}
                disabled={updateCodeMutation.isPending}
                className="p-1.5 text-cyan-500 hover:bg-cyan-500/10 rounded-sm transition-all disabled:opacity-50"
                title="Salvar alteração da Runa"
              >
                {updateCodeMutation.isPending ? (
                  <Clock className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* NOVA SEÇÃO: VALIDAÇÃO DE CONQUISTAS V2 */}
        <section className="space-y-6">
          <button 
            onClick={() => toggleCategory('solicitacoesV2')}
            className="w-full flex items-center justify-between px-4 py-3 bg-[var(--gold)]/5 border-l-4 border-[var(--gold)] rounded-r-sm hover:bg-[var(--gold)]/10 transition-colors"
          >
            <div className="flex items-center gap-2 text-[var(--gold)]">
              <Award className="w-5 h-5" />
              <h2 className="font-display uppercase tracking-widest text-lg font-bold">SOLICITAÇÕES DE CONQUISTAS ({groupedV2.pendente.length})</h2>
            </div>
            {!collapsedCategories.solicitacoesV2 ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
          </button>

          {!collapsedCategories.solicitacoesV2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedV2.pendente.map((s: any) => <SolicitacaoV2Card key={s.id} s={s} />)}
              {groupedV2.pendente.length === 0 && (
                <div className="col-span-full py-10 text-center text-[var(--cream)]/20 text-xs italic tracking-widest uppercase">
                  Nenhuma solicitação aguardando validação
                </div>
              )}
            </div>
          )}
        </section>

        {/* Clientes Ativos */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button 
              onClick={() => toggleCategory('clientes')}
              className="flex-1 flex items-center justify-between px-4 py-3 bg-[var(--gold)]/5 border-l-4 border-[var(--gold)]/40 rounded-r-sm hover:bg-[var(--gold)]/10 transition-colors"
            >
              <div className="flex items-center gap-2 text-[var(--gold)]">
                <Users className="w-5 h-5" />
                <h2 className="font-display uppercase tracking-widest text-lg font-bold">CLIENTES ATIVOS ({filteredClientes.length})</h2>
              </div>
              {!collapsedCategories.clientes ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
            </button>
            
            <button
              onClick={exportClientesCSV}
              className="px-4 py-3 bg-black/40 border border-[var(--gold)]/20 rounded-sm text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-all flex items-center justify-center gap-2 group/export"
              title="Exportar CSV de Clientes"
            >
              <Download className="w-4 h-4 group-hover/export:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Exportar CSV</span>
            </button>
          </div>

          {!collapsedCategories.clientes && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClientes.map((c: any) => {
                const isExpanded = expandedClienteId === c.id;
                const conquistasCount = c.conquistas_desbloqueadas?.length || 0;
                const progressos = Array.isArray(c.progresso) ? c.progresso : (c.progresso ? [c.progresso] : []);
                const lastProgresso = [...progressos].sort((a: any, b: any) => 
                  new Date(b.criado_em || b.created_at || 0).getTime() - new Date(a.criado_em || a.created_at || 0).getTime()
                )?.[0];
                const currentStepNumber = lastProgresso?.passo_atual ?? 0;
                const currentScenario = lastProgresso?.cenario ?? "Início";

                
                // Regra Identidade do Aprendiz
                const camposObrigatorios = [
                  { key: 'nome', label: 'Nome' },
                  { key: 'telefone', label: 'Telefone' },
                  { key: 'apelido', label: 'Apelido' },
                  { key: 'cidade', label: 'Cidade' },
                  { key: 'data_aniversario', label: 'Aniversário' },
                  { key: 'instagram', label: 'Instagram' },
                  { key: 'como_conheceu', label: 'Como Conheceu' },
                  { key: 'aceite_termos_em', label: 'Aceite' }
                ];
                
                const camposAusentes = camposObrigatorios.filter(campo => !c[campo.key]);
                const isIdentidadeCompleta = camposAusentes.length === 0;

                return (
                  <div 
                    key={c.id} 
                    className={`bg-black/20 border transition-all duration-300 ${isExpanded ? 'border-[var(--gold)] shadow-[0_0_20px_rgba(212,175,55,0.1)] col-span-full' : 'border-[var(--gold)]/20 hover:border-[var(--gold)]/50 cursor-pointer'} p-4 rounded-sm`}
                    onClick={() => !isExpanded && toggleClienteExpand(c.id)}
                  >
                    <div className="flex justify-between items-start relative">
                      <div className="flex items-center gap-3 w-full pr-16">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-[var(--cream)] font-medium truncate ${isExpanded ? 'text-xl' : 'text-base'}`}>
                            {c.nome ? (c.nome.length > 15 ? `${c.nome.substring(0, 15)}...` : c.nome) : 'Sem Nome'}
                          </h3>
                          {!isExpanded && c.apelido && (
                            <p className="text-[12px] text-[var(--gold)]/80 italic mt-[-2px] truncate">
                              {c.apelido}
                            </p>
                          )}
                          {isExpanded && c.apelido && (
                            <span className="text-sm text-[var(--gold)]/60"> ({c.apelido})</span>
                          )}
                          <div className="flex items-center gap-2 mt-0.5 overflow-hidden">
                            <p className="text-[11px] text-[var(--cream)]/60 font-mono tracking-wider whitespace-nowrap">{formatPhoneNumber(c.telefone)}</p>
                            {!isExpanded && (
                              <div className="flex flex-col border-l border-[var(--gold)]/10 pl-2">
                                <span className="text-[10px] text-[var(--gold)]/60 uppercase tracking-tight">Passo {currentStepNumber}</span>
                                <span className="text-[10px] text-[var(--gold)]/60 uppercase tracking-tight">Conquistas {conquistasCount}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 absolute top-0 right-0">
                        <div className="flex items-center gap-1 text-[var(--gold)] text-xs font-bold bg-[var(--gold)]/10 px-2 py-1 rounded-sm border border-[var(--gold)]/20">
                          <TrendingUp className="w-3 h-3 shrink-0" />
                          <span>{c.xp || 0} XP</span>
                        </div>
                        {isExpanded && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleClienteExpand(c.id);
                            }}
                            className="text-[var(--gold)] hover:text-[var(--cream)] transition-colors p-1"
                          >
                            <ChevronUp className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-[var(--gold)]/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Informações Básicas */}
                        <div className="space-y-4">
                          <h4 className="text-[14px] text-[var(--gold)] uppercase tracking-[0.2em] font-bold border-b border-[var(--gold)]/20 pb-1.5">Dados Cadastrais</h4>
                          <div className="space-y-2">
                            <DetailRow label="ID" value={c.id} mono />
                            <DetailRow label="Nome" value={c.nome} />
                            <DetailRow label="Telefone" value={formatPhoneNumber(c.telefone)} mono />
                            <DetailRow label="Apelido" value={c.apelido} />
                            <DetailRow
                              label="Instagram"
                              value={c.instagram ? `@${normalizeInstagramHandle(c.instagram)}` : undefined}
                              href={c.instagram ? instagramProfileUrl(c.instagram) : undefined}
                            />
                            <DetailRow label="Cidade" value={c.cidade} />
                            <DetailRow label="Aniversário" value={c.data_aniversario} />
                            <DetailRow label="Conheceu por" value={c.como_conheceu} />
                            <DetailRow label="Criado em" value={c.criado_em ? format(new Date(c.criado_em), "dd/MM/yyyy HH:mm") : '-'} />
                          </div>
                        </div>

                        {/* Status e Segurança */}
                        <div className="space-y-4">
                          <h4 className="text-[14px] text-[var(--gold)] uppercase tracking-[0.2em] font-bold border-b border-[var(--gold)]/20 pb-1.5">Jornada & Segurança</h4>
                          <div className="space-y-3">
                            <div className="bg-black/40 p-3 rounded-sm border border-[var(--gold)]/10">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-[var(--cream)]/60 uppercase">Identidade do Aprendiz</span>
                                {isIdentidadeCompleta ? (
                                  <span className="flex items-center gap-1 text-[9px] text-green-500 font-bold uppercase"><ShieldCheck className="w-3 h-3" /> Completa</span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[9px] text-red-500 font-bold uppercase"><Ban className="w-3 h-3" /> Incompleta</span>
                                )}
                              </div>
                              {!isIdentidadeCompleta && (
                                <div className="space-y-1">
                                  <p className="text-[9px] text-[var(--cream)]/40 uppercase mb-1">Faltando:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {camposAusentes.map(campo => (
                                      <span key={campo.key} className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-sm border border-red-500/20">{campo.label}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                             <DetailRow label="Passo Atual" value={currentStepNumber !== undefined ? String(currentStepNumber) : '-'} className="text-[var(--gold)] font-bold" />
                             <DetailRow label="Cenário" value={currentScenario} className="text-[var(--gold)] font-bold" />
                             <DetailRow label="XP Total" value={c.xp !== undefined ? String(c.xp) : '0'} className="text-[var(--gold)] font-bold" />
                             <DetailRow label="Aceite em" value={c.aceite_termos_em ? format(new Date(c.aceite_termos_em), "dd/MM/yyyy HH:mm") : '-'} />

                          </div>
                        </div>

                        {/* Conquistas */}
                        <div className="space-y-4">
                          <h4 className="text-[14px] text-[var(--gold)] uppercase tracking-[0.2em] font-bold border-b border-[var(--gold)]/20 pb-1.5">Conquistas ({conquistasCount})</h4>
                          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {c.conquistas_desbloqueadas && c.conquistas_desbloqueadas.length > 0 ? (
                              c.conquistas_desbloqueadas.map((cd: any) => (
                                <div key={cd.id} className="flex items-center justify-between bg-black/40 p-2 rounded-sm border border-[var(--gold)]/10 group hover:border-[var(--gold)]/30 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <Award className="w-3 h-3 text-[var(--gold)]" />
                                    <span className="text-[10px] text-[var(--cream)] uppercase tracking-wider">{cd.conquista}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[9px] text-[var(--gold)] font-bold">+{cd.xp_recompensa} XP</span>
                                    <span className="text-[8px] text-[var(--cream)]/30">{format(new Date(cd.desbloqueada_em), "dd/MM/yy")}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] text-[var(--cream)]/20 italic">Nenhuma conquista desbloqueada</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Indicações */}
        <section className="space-y-4">
          <button 
            onClick={() => toggleCategory('indicacoes')}
            className="w-full flex items-center justify-between px-4 py-3 bg-[var(--gold)]/5 border-l-4 border-purple-500 rounded-r-sm hover:bg-[var(--gold)]/10 transition-colors"
          >
            <div className="flex items-center gap-2 text-purple-400">
              <Users className="w-5 h-5" />
              <h2 className="font-display uppercase tracking-widest text-lg font-bold">INDICAÇÕES ({indicacoes.length})</h2>
            </div>
            {!collapsedCategories.indicacoes ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
          </button>
          {!collapsedCategories.indicacoes && (
             <div className="overflow-x-auto bg-black/10 rounded-sm border border-[var(--gold)]/5">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--gold)]/10 text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]/60">
                      <th className="py-3 px-4 font-normal">Indicador</th>
                      <th className="py-3 px-4 font-normal">Indicado</th>
                      <th className="py-3 px-4 font-normal">Qualificada?</th>
                      <th className="py-3 px-4 font-normal">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicacoes.map((i: any) => (
                      <tr key={i.id} className="border-b border-[var(--gold)]/10">
                        <td className="py-4 px-4 text-[var(--cream)]">{i.indicador?.nome}</td>
                        <td className="py-4 px-4 font-mono text-[var(--gold)]">{formatPhoneNumber(i.telefone_indicado)}</td>
                        <td className="py-4 px-4">
                          {i.qualificada_at ? (
                            <span className="text-green-500 text-[10px] font-bold">SIM</span>
                          ) : (
                            <span className="text-[var(--cream)]/40 text-[10px]">AGUARDANDO COMPRA</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-[var(--cream)]/40 text-xs">
                          {format(new Date(i.qualificada_at || i.created_at), "dd/MM/yyyy")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

function SolicitacaoRow({ s, relatedOrder, findRelatedOrder, markAsPaidMutation, rejectMutation }: any) {
  // Simplificado para evitar erros de tipos no write
  return (
    <tr className="border-b border-[var(--gold)]/10">
       <td className="py-4 px-4">{s.cliente?.nome}</td>
       <td className="py-4 px-4 font-mono">{s.numero_pedido_digitado}</td>
       <td className="py-4 px-4 text-xs capitalize">{relatedOrder?.status || 'Não encontrado'}</td>
       <td className="py-4 px-4 text-xs">{s.status}</td>
       <td className="py-4 px-4">
          {s.status === 'pendente' && (
            <button onClick={() => rejectMutation.mutate(s.id)} className="text-red-500"><XCircle className="w-4 h-4"/></button>
          )}
       </td>
    </tr>
  );
}

function DetailRow({ label, value, mono, prefix, className, href }: { label: string, value: string | null | undefined, mono?: boolean, prefix?: string, className?: string, href?: string }) {
  return (
    <div className={`flex justify-between items-center gap-4 ${className}`}>
      <span className="text-[9px] text-[var(--cream)]/40 uppercase shrink-0">{label}</span>
      {href && value ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={`text-[10px] text-pink-400 hover:text-pink-300 underline truncate ${mono ? 'font-mono' : ''}`}>
          {`${prefix || ''}${value}`}
        </a>
      ) : (
        <span className={`text-[10px] text-[var(--cream)] truncate ${mono ? 'font-mono' : ''}`}>
          {value ? `${prefix || ''}${value}` : '-'}
        </span>
      )}
    </div>
  );
}
