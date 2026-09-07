import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Phone,
  MapPin,
  Calendar,
  Hash,
  ChevronDown,
  ChevronUp,
  User,
  ShoppingBag,
  Info,
  Trash2,
  Plus,
  Loader2,
  FileDown
} from "lucide-react";
import { useState, useMemo } from "react";
import { fmtPrice, SITE } from "@/lib/site";
import { updateOrderStatus, deleteOrder, createManualOrder } from "@/lib/admin-orders.functions";


export const Route = createFileRoute("/admin/pedidos")({
  head: () => ({ meta: [{ title: "Pedidos · Admin" }, { name: "robots", content: "noindex" }] }),
  component: PedidosAdmin,
});

function PedidosAdmin() {
  const qc = useQueryClient();
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_orders")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: "pago" | "cancelado" }) => {
      return updateOrderStatus({ data: { orderId, status } });
    },
    onSuccess: () => {
      toast.success("Status atualizado com sucesso");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar status");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return deleteOrder({ data: { orderId } });
    },
    onSuccess: () => {
      toast.success("Pedido excluído com sucesso");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir pedido");
    }
  });

  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({
    pago: true,
    cancelado: true
  });

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleDelete = (e: React.MouseEvent, orderId: string, codigo: string) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja EXCLUIR permanentemente o pedido #${codigo}? Esta ação não pode ser desfeita e permitirá a reutilização do número.`)) {
      deleteMutation.mutate(orderId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago": return "text-green-400 border-green-400/30 bg-green-400/5";
      case "cancelado": return "text-red-400 border-red-400/30 bg-red-400/5";
      default: return "text-amber-400 border-amber-400/30 bg-amber-400/5";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pago": return <CheckCircle2 className="w-3 h-3" />;
      case "cancelado": return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const exportToCSV = () => {
    if (!orders || orders.length === 0) {
      toast.error("Não há pedidos para exportar");
      return;
    }

    // Header do CSV
    const headers = [
      "Código",
      "Status",
      "Data",
      "Cliente",
      "Telefone",
      "Total",
      "Frete",
      "Subtotal",
      "Itens",
      "Indicado por",
      "Endereço"
    ];

    const rows = orders.map(o => {
      const items = Array.isArray(o.items_snapshot) 
        ? o.items_snapshot.map((i: any) => {
            const flavors = i.saboresLabels?.map((s: any) => `${s.nome}: ${s.sabor}`).join(" | ") || i.sabor || "";
            return `${i.qty}x ${i.nome}${flavors ? ` (${flavors})` : ""}`;
          }).join(" | ")
        : "";

      return [
        o.codigo_pedido,
        o.status,
        new Date(o.created_at).toLocaleString("pt-BR"),
        o.cliente_nome,
        o.cliente_telefone,
        o.total,
        o.frete_valor || 0,
        Number(o.total) - (Number(o.frete_valor) || 0),
        items,
        o.indicador_nome || "",
        o.endereco_completo || "Retirada"
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pedidos-alquimista-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (isLoading) {
    return (
      <AdminShell title="Pedidos">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--gold)]" />
        </div>
      </AdminShell>
    );
  }

  const grouped = {
    pendente: orders?.filter(o => o.status === 'pendente') || [],
    pago: orders?.filter(o => o.status === 'pago') || [],
    cancelado: orders?.filter(o => o.status === 'cancelado' || o.status === 'arquivado') || []
  };

  const OrderCard = ({ order }: { order: any }) => {
    const isExpanded = !!expandedOrders[order.id];
    return (
      <div className="border border-[var(--gold)]/15 bg-[var(--surface)]/60 rounded-sm overflow-hidden transition-all duration-300">
        <div 
          onClick={() => toggleExpand(order.id)}
          className="px-4 py-3 border-b border-[var(--gold)]/10 flex flex-wrap items-center justify-between gap-3 bg-[var(--surface)]/80 cursor-pointer hover:bg-[var(--surface)]/100"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[var(--gold)] min-w-[80px]">
              <Hash className="w-3 h-3" />
              <span className="text-base font-bold font-sans tracking-tight">{order.codigo_pedido}</span>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-tighter border flex items-center gap-1 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              {order.status === 'arquivado' ? 'cancelado' : order.status}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[var(--cream)]/80 font-medium text-xs">
              <User className="w-3 h-3 text-[var(--gold)]/60" />
              {order.cliente_nome}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[var(--gold)] font-display text-2xl leading-none">{fmtPrice(order.total)}</div>
              <div className="text-[10px] text-[var(--cream)]/40 uppercase tracking-widest leading-none mt-1.5">
                {Array.isArray(order.items_snapshot) ? order.items_snapshot.length : 0} item(ns)
              </div>
            </div>
            {isExpanded ? <ChevronUp className="w-5 h-5 text-[var(--gold)]" /> : <ChevronDown className="w-5 h-5 text-[var(--gold)]/40" />}
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[var(--gold)] text-[10px] uppercase tracking-widest font-bold">
                  <User className="w-3 h-3" />
                  Cliente & Contato
                </div>
                <div className="bg-black/20 p-3 rounded-sm border border-[var(--gold)]/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--cream)] font-medium">{order.cliente_nome}</span>
                    <a 
                      href={`https://wa.me/${order.cliente_telefone.replace(/\D/g, "")}`} 
                      target="_blank" 
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-2 py-1 bg-[var(--gold)]/10 text-[var(--gold)] rounded-full text-[10px] hover:bg-[var(--gold)]/20 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      WhatsApp
                    </a>
                  </div>
                  {order.indicador_nome && (
                    <div className="pt-2 border-t border-[var(--gold)]/5">
                      <div className="text-[9px] text-[var(--cream)]/40 uppercase mb-0.5">Indicado por:</div>
                      <div className="text-xs text-[var(--cream)]/80 flex items-center gap-2">
                        {order.indicador_nome}
                        {order.indicador_whatsapp && (
                          <span className="text-[var(--cream)]/40">({order.indicador_whatsapp})</span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[var(--cream)]/40 text-[10px] pt-1">
                    <Calendar className="w-3 h-3" />
                    Registrado em {new Date(order.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[var(--gold)] text-[10px] uppercase tracking-widest font-bold">
                  <MapPin className="w-3 h-3" />
                  Logística
                </div>
                <div className="bg-black/20 p-3 rounded-sm border border-[var(--gold)]/5 text-sm text-[var(--cream)]/80">
                  {order.endereco_completo ? (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-[var(--gold)]/60" />
                      <span>{order.endereco_completo}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 italic text-[var(--cream)]/40">
                      <ShoppingBag className="w-3 h-3" />
                      Retirada no local
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[var(--gold)] text-[10px] uppercase tracking-widest font-bold">
                  <ShoppingBag className="w-3 h-3" />
                  Itens Selecionados
                </div>
                <div className="bg-black/20 rounded-sm p-3 border border-[var(--gold)]/5 space-y-3">
                  {(order.items_snapshot as any[]).map((item, idx) => (
                    <div key={idx} className="flex justify-between gap-4 border-b border-[var(--gold)]/5 last:border-0 pb-2 last:pb-0">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[var(--gold)] font-display text-2xl leading-none">{item.qty}x</span>
                          <span className="text-lg text-[var(--cream)]">{item.nome}</span>
                        </div>
                        {item.saboresLabels && Array.isArray(item.saboresLabels) && (
                          <div className="mt-1.5 ml-8 space-y-1">
                            {item.saboresLabels.map((s: any, sIdx: number) => (
                              <div key={sIdx} className="text-sm text-[var(--cream)]/60 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[var(--gold)]/30" />
                                {s.nome} · {s.sabor}
                              </div>
                            ))}
                          </div>
                        )}
                        {item.sabor && !item.saboresLabels && (
                          <div className="mt-1 ml-8 text-sm text-[var(--cream)]/60">
                            Sabor: {item.sabor}
                          </div>
                        )}
                        {item.embalagem && (
                          <div className="mt-1 ml-8 text-xs text-[var(--gold)]/60 uppercase tracking-tighter">
                            Embalagem: {item.embalagem}
                          </div>
                        )}
                      </div>
                      <div className="text-[var(--cream)] text-2xl font-display self-start font-bold">
                        {fmtPrice(item.preco * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-black/40 p-4 rounded-sm border border-[var(--gold)]/10 space-y-2">
                  <div className="flex justify-between text-xs text-[var(--cream)]/60 uppercase tracking-widest font-medium">
                    <span>Subtotal</span>
                    <span>{fmtPrice(Number(order.subtotal) || (Number(order.total) - (Number(order.frete_valor) || 0)))}</span>
                  </div>
                  {Number(order.frete_valor) > 0 && (
                    <div className="flex justify-between text-xs text-[var(--cream)]/60 uppercase tracking-widest font-medium">
                      <span>Frete</span>
                      <span>{fmtPrice(Number(order.frete_valor))}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-[var(--gold)]/10">
                    <span className="text-[var(--gold)] text-sm font-bold uppercase tracking-widest">Total</span>
                    <span className="text-3xl font-display text-[var(--gold)] leading-none">{fmtPrice(order.total)}</span>
                  </div>

                  <div className="pt-4 flex flex-wrap gap-2">
                    {order.status === "pendente" && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); mutation.mutate({ orderId: order.id, status: "pago" }); }}
                          disabled={mutation.isPending}
                          className="flex-1 px-3 py-2 bg-green-600/20 text-green-400 text-[10px] font-display tracking-widest uppercase rounded-sm border border-green-600/30 hover:bg-green-600/40 disabled:opacity-50 transition-colors"
                        >
                          Confirmar Pagamento
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); mutation.mutate({ orderId: order.id, status: "cancelado" }); }}
                          disabled={mutation.isPending}
                          className="flex-1 px-3 py-2 bg-red-600/20 text-red-400 text-[10px] font-display tracking-widest uppercase rounded-sm border border-red-600/30 hover:bg-red-600/40 disabled:opacity-50 transition-colors"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, order.id, order.codigo_pedido)}
                      disabled={deleteMutation.isPending}
                      className="w-full px-3 py-2 bg-red-900/20 text-red-500 text-[10px] font-display tracking-widest uppercase rounded-sm border border-red-900/30 hover:bg-red-900/40 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir Pedido
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CategorySection = ({ title, status, orders, icon: Icon, colorClass }: { title: string, status: string, orders: any[], icon: any, colorClass: string }) => {
    const isCollapsed = collapsedCategories[status];
    if (orders.length === 0 && status !== 'pendente') return null;

    return (
      <div className="space-y-3">
        <button 
          onClick={() => toggleCategory(status)}
          className={`w-full flex items-center justify-between px-4 py-2 bg-[var(--surface)]/40 border-l-4 ${colorClass} rounded-r-sm hover:bg-[var(--surface)]/60 transition-colors`}
        >
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <h2 className="font-display uppercase tracking-widest text-sm font-bold">{title} ({orders.length})</h2>
          </div>
          {isCollapsed ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronUp className="w-4 h-4 opacity-50" />}
        </button>
        
        {!isCollapsed && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
            {orders.map(o => <OrderCard key={o.id} order={o} />)}
            {orders.length === 0 && (
              <div className="text-center py-10 text-[var(--cream)]/20 text-xs italic tracking-widest uppercase">
                Sem pedidos nesta categoria
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminShell 
      title="Pedidos do Site"
      actions={(
        <div className="flex items-center gap-2">
          <button 
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-[var(--gold)] font-display tracking-widest text-xs uppercase rounded-sm border border-[var(--gold)]/20 hover:bg-white/10 transition-colors"
          >
            <FileDown className="w-4 h-4" /> Exportar CSV
          </button>
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-[var(--background)] font-display tracking-widest text-xs uppercase rounded-sm hover:bg-[var(--gold-hover)]"
          >
            <Plus className="w-4 h-4" /> Novo Pedido
          </button>
        </div>
      )}

    >
      <div className="space-y-8 pb-20">
        <CategorySection 
          title="Pendentes" 
          status="pendente" 
          orders={grouped.pendente} 
          icon={Clock} 
          colorClass="border-amber-500" 
        />
        
        <CategorySection 
          title="Pagos" 
          status="pago" 
          orders={grouped.pago} 
          icon={CheckCircle2} 
          colorClass="border-green-500" 
        />
        
        <CategorySection 
          title="Cancelados" 
          status="cancelado" 
          orders={grouped.cancelado} 
          icon={XCircle} 
          colorClass="border-red-600" 
        />
      </div>

      {isManualModalOpen && (
        <ManualOrderModal 
          onClose={() => setIsManualModalOpen(false)} 
          onSuccess={() => {
            setIsManualModalOpen(false);
            qc.invalidateQueries({ queryKey: ["admin-orders"] });
          }}
        />
      )}
    </AdminShell>
  );
}

function ManualOrderModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clienteNome: "",
    clienteTelefone: "",
    indicadorNome: "",
    indicadorWhatsapp: "",
    tipoEntrega: "retirada" as "retirada" | "delivery",
    enderecoCompleto: "",
    freteManual: 0,
    statusInicial: "pago" as "pendente" | "pago" | "cancelado"
  });

  const [items, setItems] = useState<any[]>([]);
  const [showAvulsoSelector, setShowAvulsoSelector] = useState(false);


  // Carregar produtos para o seletor
  const { data: products } = useQuery({
    queryKey: ["admin-products-minimal"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, nome, sabor, preco, categoria, foto_url").eq("ativo", true).order("nome");
      if (error) throw error;
      return data;
    }
  });

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.preco * item.qty), 0);
  }, [items]);

  const total = subtotal + form.freteManual;

  async function handleSubmit() {
    if (!form.clienteNome || !form.clienteTelefone || items.length === 0) {
      toast.error("Preencha o cliente e adicione pelo menos um item.");
      return;
    }

    // Validação básica de kits antes de enviar
    const kitsIncompletos = items.some(it => {
      if (it.tipo === 'kit-degustacao' && (!it.saboresIds || it.saboresIds.filter(Boolean).length < 3)) return true;
      if (it.tipo === 'kit-presenteavel' && !it.licor?.id) return true;
      return false;
    });

    if (kitsIncompletos) {
      toast.error("Por favor, selecione todos os sabores dos kits antes de salvar.");
      return;
    }

    setLoading(true);
    try {
      const res = await createManualOrder({
        data: {
          requestId: crypto.randomUUID(),
          clienteNome: form.clienteNome,
          clienteTelefone: form.clienteTelefone,
          indicadorNome: form.indicadorNome || undefined,
          indicadorWhatsapp: form.indicadorWhatsapp || undefined,
          itemsSnapshot: items.map(it => {
            const cleanItem: any = {
              tipo: it.tipo,
              id: it.id,
              nome: it.nome,
              preco: Number(it.preco),
              qty: Number(it.qty)
            };
            if (it.tipo === "avulso") {
              cleanItem.sabor = it.sabor;
              cleanItem.categoria = it.categoria;
              cleanItem.foto_url = it.foto_url || null;
            } else if (it.tipo === "kit-degustacao") {
              cleanItem.saboresIds = it.saboresIds && it.saboresIds.length === 3 ? it.saboresIds : [];
              cleanItem.saboresLabels = it.saboresLabels;
            } else if (it.tipo === "kit-presenteavel") {
              cleanItem.licor = it.licor;
              cleanItem.acompanhamento = it.acompanhamento;
              cleanItem.embalagem = it.embalagem;
              cleanItem.dedicatoria = it.dedicatoria || "";
            }
            return cleanItem;
          }),
          tipoEntrega: form.tipoEntrega,
          enderecoCompleto: form.enderecoCompleto || undefined,
          freteManual: form.freteManual,
          statusInicial: form.statusInicial
        }
      });

      if (res.success) {
        toast.success(`Pedido #${res.order.codigo_pedido} criado com sucesso!`);
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar pedido manual");
    } finally {
      setLoading(false);
    }
  }

  function addItem(p: any) {
    const existing = items.find(it => it.id === p.id && it.tipo === "avulso");
    if (existing) {
      setItems(items.map(it => it.id === p.id && it.tipo === "avulso" ? { ...it, qty: it.qty + 1 } : it));
    } else {
      setItems([...items, {
        tipo: "avulso",
        id: p.id,
        nome: p.nome,
        sabor: p.sabor,
        preco: p.preco,
        categoria: p.categoria,
        foto_url: p.foto_url,
        qty: 1
      }]);
    }
    setShowAvulsoSelector(false);
  }


  function addKitDegustacao() {
    setItems([...items, {
      tipo: "kit-degustacao",
      id: `kit-deg-${Date.now()}`,
      nome: "Kit Degustação",
      preco: 20, // Preço padrão para degustação
      qty: 1,
      saboresIds: [],
      saboresLabels: []
    }]);
  }

  function addKitPresenteavel() {
    setItems([...items, {
      tipo: "kit-presenteavel",
      id: `kit-pres-${Date.now()}`,
      nome: "Kit Presenteável",
      preco: 130, // Preço base médio
      qty: 1,
      licor: { id: "", nome: "", sabor: "" },
      acompanhamento: "Brownie",
      embalagem: "Box MDF",
      dedicatoria: ""
    }]);
  }

  function updateKitDegustacaoSabor(kitId: string, index: number, product: any) {
    setItems(items.map(it => {
      if (it.id === kitId) {
        const ids = [...(it.saboresIds || [])];
        const labels = [...(it.saboresLabels || [])];
        ids[index] = product.id;
        labels[index] = { nome: product.nome, sabor: product.sabor };
        return { ...it, saboresIds: ids, saboresLabels: labels };
      }
      return it;
    }));
  }

  function updateKitPresenteavel(kitId: string, updates: any) {
    setItems(items.map(it => {
      if (it.id === kitId) {
        return { ...it, ...updates };
      }
      return it;
    }));
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[var(--surface)] border border-[var(--gold)]/30 rounded-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl text-[var(--gold)] uppercase tracking-widest">Novo Pedido Manual</h3>
          <button onClick={onClose} className="text-[var(--cream)]/40 hover:text-[var(--vinho)]"><Trash2 className="w-5 h-5" /></button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <SectionTitle icon={User} title="Cliente" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nome">
                <input value={form.clienteNome} onChange={e => setForm({ ...form, clienteNome: e.target.value })} className={inputCls} placeholder="Ex: João Silva" />
              </Field>
              <Field label="Telefone">
                <input value={form.clienteTelefone} onChange={e => setForm({ ...form, clienteTelefone: e.target.value })} className={inputCls} placeholder="Ex: 48999999999" />
              </Field>
            </div>

            <SectionTitle icon={MapPin} title="Logística & Status" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Entrega">
                <select value={form.tipoEntrega} onChange={e => setForm({ ...form, tipoEntrega: e.target.value as any })} className={inputCls}>
                  <option value="retirada">Retirada</option>
                  <option value="delivery">Entrega (Criciúma)</option>
                </select>
              </Field>
              <Field label="Status Inicial">
                <select value={form.statusInicial} onChange={e => setForm({ ...form, statusInicial: e.target.value as any })} className={inputCls}>
                   <option value="pago">Pago</option>
                   <option value="pendente">Pendente</option>
                   <option value="cancelado">Cancelado</option>

                </select>
              </Field>
            </div>
            {form.tipoEntrega === "delivery" && (
              <Field label="Endereço Completo">
                <input value={form.enderecoCompleto} onChange={e => setForm({ ...form, enderecoCompleto: e.target.value })} className={inputCls} placeholder="Rua, Número, Bairro..." />
              </Field>
            )}

            <SectionTitle icon={Info} title="Indicação (Opcional)" />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.indicadorNome} onChange={e => setForm({ ...form, indicadorNome: e.target.value })} className={inputCls} placeholder="Nome do indicador" />
              <input value={form.indicadorWhatsapp} onChange={e => setForm({ ...form, indicadorWhatsapp: e.target.value })} className={inputCls} placeholder="WhatsApp indicador" />
            </div>
          </div>

          <div className="space-y-4 flex flex-col">
            <SectionTitle icon={ShoppingBag} title="Itens do Pedido" />
            
            <div className="flex-1 bg-black/20 border border-[var(--gold)]/10 rounded-sm p-3 space-y-3 overflow-y-auto max-h-[400px]">
              {items.length === 0 && <div className="text-center py-10 text-[var(--cream)]/20 italic text-xs">Nenhum item adicionado</div>}
              {items.map((it, idx) => (
                <div key={it.id || idx} className="border-b border-[var(--gold)]/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-lg text-[var(--cream)] font-bold">{it.qty}x {it.nome}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-[var(--gold)] text-2xl font-display font-bold">{fmtPrice(it.preco * it.qty)}</div>
                      <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-[var(--vinho)]/60 hover:text-[var(--vinho)]"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {it.tipo === "avulso" && (
                    <div className="text-[10px] text-[var(--cream)]/40 ml-4 italic">{it.sabor}</div>
                  )}

                  {it.tipo === "kit-degustacao" && (
                    <div className="ml-4 space-y-2">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="flex flex-col gap-1">
                          <span className="text-[9px] text-[var(--gold)]/40 uppercase tracking-widest">Garrafinha {i + 1}</span>
                          <select 
                            className={`${inputCls} text-[10px] py-1 h-auto`}
                            value={it.saboresIds?.[i] || ""}
                            onChange={(e) => {
                              const p = products?.find(x => x.id === e.target.value);
                              if (p) updateKitDegustacaoSabor(it.id, i, p);
                            }}
                          >
                            <option value="">Selecione o sabor...</option>
                            {products?.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.sabor})</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  {it.tipo === "kit-presenteavel" && (
                    <div className="ml-4 space-y-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-[var(--gold)]/40 uppercase tracking-widest">Licor</span>
                        <select 
                          className={`${inputCls} text-[10px] py-1 h-auto`}
                          value={it.licor?.id || ""}
                          onChange={(e) => {
                            const p = products?.find(x => x.id === e.target.value);
                            if (p) updateKitPresenteavel(it.id, { licor: { id: p.id, nome: p.nome, sabor: p.sabor } });
                          }}
                        >
                          <option value="">Selecione o licor...</option>
                          {products?.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.sabor})</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-[var(--gold)]/40 uppercase tracking-widest">Acompanhamento</span>
                          <select 
                            className={`${inputCls} text-[10px] py-1 h-auto`}
                            value={it.acompanhamento}
                            onChange={(e) => updateKitPresenteavel(it.id, { acompanhamento: e.target.value })}
                          >
                            <option value="Brownie">Brownie</option>
                            <option value="Pão de Mel">Pão de Mel</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-[var(--gold)]/40 uppercase tracking-widest">Embalagem</span>
                          <select 
                            className={`${inputCls} text-[10px] py-1 h-auto`}
                            value={it.embalagem}
                            onChange={(e) => updateKitPresenteavel(it.id, { embalagem: e.target.value })}
                          >
                            <option value="Box MDF">Box MDF</option>
                            <option value="Box Premium">Box Premium</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3 mt-auto pt-2">
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setShowAvulsoSelector(true)}
                  className="px-2 py-1.5 bg-black/40 border border-[var(--gold)]/10 text-[9px] uppercase tracking-widest text-[var(--cream)] hover:bg-black/60 rounded-sm"
                >
                  + Avulso
                </button>
                <button 
                  onClick={addKitDegustacao}
                  className="px-2 py-1.5 bg-black/40 border border-[var(--gold)]/10 text-[9px] uppercase tracking-widest text-[var(--cream)] hover:bg-black/60 rounded-sm"
                >
                  + Degustação
                </button>
                <button 
                  onClick={addKitPresenteavel}
                  className="px-2 py-1.5 bg-black/40 border border-[var(--gold)]/10 text-[9px] uppercase tracking-widest text-[var(--cream)] hover:bg-black/60 rounded-sm"
                >
                  + Presente
                </button>
              </div>

              {showAvulsoSelector && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Field label="Selecionar Produto Avulso">
                    <div className="flex gap-2">
                      <select 
                        className={inputCls}
                        autoFocus
                        onChange={(e) => {
                          const p = products?.find(x => x.id === e.target.value);
                          if (p) addItem(p);
                          e.target.value = "";
                        }}
                      >
                        <option value="">Escolha um licor...</option>
                        {products?.map(p => (
                          <option key={p.id} value={p.id}>{p.nome} ({p.sabor}) — {fmtPrice(p.preco)}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => setShowAvulsoSelector(false)}
                        className="px-3 py-2 bg-red-900/20 text-red-500 rounded-sm border border-red-900/30 hover:bg-red-900/40 transition-colors"
                        title="Cancelar seleção"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </Field>
                </div>
              )}



              <div className="bg-black/40 p-4 border border-[var(--gold)]/20 rounded-sm space-y-2">
                <div className="flex justify-between text-xs text-[var(--cream)]/60 uppercase tracking-widest font-medium">
                  <span>Subtotal</span>
                  <span>{fmtPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-[var(--cream)]/60 uppercase tracking-widest font-medium">
                  <span>Frete Manual</span>
                  <input 
                    type="number" 
                    value={form.freteManual} 
                    onChange={e => setForm({ ...form, freteManual: Number(e.target.value) })}
                    className="w-20 bg-transparent border-b border-[var(--gold)]/20 text-right outline-none text-[var(--gold)]"
                  />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[var(--gold)]/10">
                  <span className="text-[var(--gold)] text-sm font-bold uppercase tracking-widest">Total</span>
                  <span className="text-3xl font-display text-[var(--gold)]">{fmtPrice(total)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 bg-red-900/10 text-red-500/60 font-display tracking-[0.2em] text-[10px] uppercase rounded-sm border border-red-900/20 hover:bg-red-900/20 hover:text-red-500 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-[2] py-3 bg-[var(--gold)] text-[var(--background)] font-display tracking-[0.2em] text-xs uppercase rounded-sm hover:bg-[var(--gold-hover)] transition-all disabled:opacity-50"
                >
                  {loading ? "Processando..." : "Salvar Pedido"}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-[var(--background)] border border-[var(--gold)]/20 rounded-sm px-3 py-2 text-[var(--cream)] text-sm focus:border-[var(--gold)] outline-none transition-colors placeholder:text-[var(--cream)]/20";
function Field({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <span className="block text-[9px] uppercase tracking-widest text-[var(--gold)]/60 font-bold">{label}</span>
      {children}
    </div>
  );
}
function SectionTitle({ icon: Icon, title }: { icon: any, title: string }) {
  return (
    <div className="flex items-center gap-2 text-[var(--gold)] border-b border-[var(--gold)]/10 pb-1 mb-2">
      <Icon className="w-3 h-3" />
      <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{title}</span>
    </div>
  );
}