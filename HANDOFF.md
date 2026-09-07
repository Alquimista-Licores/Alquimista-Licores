# 📜 Handoff do Projeto — Alquimista Licores

> **Documento Oficial de Transição e Continuidade Técnica.**  
> Este arquivo deve ser **sempre atualizado** a cada nova funcionalidade, refatoração estrutural, ajuste de design system ou adição de novas dobras/componentes.

---

## 1. 🏛️ Visão Geral & Stack Tecnológica

- **Framework:** [Astro 5](https://astro.build/) (Static Site Generation / Hybrid Rendering)
- **Estilização:** Tailwind CSS v4 + Vanilla CSS Tokens (Custom Properties)
- **Tipografia:** Google Fonts (`Cinzel Decorative`, `Cormorant Garamond`, `Questrial`, `Outfit`, `Lato`, `Inter`) + `Century Gothic`
- **Banco de Dados / Backend:** Supabase (Projeto `crsjmyrkbpawxqgvfmrv`) com fallback local resiliente em `src/lib/data.ts`
- **Integrações:** WhatsApp Checkout, GerenciApp (Sincronização de estoque e pedidos), OpenStreetMap/OSRM (Cálculo de frete)
- **Hospedagem & Build:** Node.js / Vite Static Build (`dist/`)

---

## 2. 🎨 Design System & Identidade Visual Alquímica

O projeto segue uma estética de **Dark Luxury Artesanal**, inspirada em boticas antigas, grimórios e alquimia clássica.

### 🎨 Tokens de Cores Principais
- `--gold`: `#C8A97E` (Dourado alquímico principal)
- `--gold-light`: `#E8D5BC` (Dourado luminoso para destaques e hovers)
- `--gold-bright`: `#D4B23A` (Dourado de alta vibração para pontos focais)
- `--gold-dark`: `#9A7B4F`
- `--background`: `#0A0A0A` (Obsidiana profunda)
- `--surface`: `#12100E` / `--surface-elevated`: `#2C2620`
- `--cream`: `#F5EFEB` (Texto principal suave)
- `--text-soft`: `#D1C7BD` / `--text-faded`: `#9E9188`
- `--vinho`: `#6B1D2F` / `--amber-warm`: `#D97706`

### ✍️ Famílias Tipográficas
- **Display & Títulos Místicos:** `'Cinzel Decorative', 'Cormorant Garamond', serif`
- **Subtítulos & Citações Poéticas:** `'Cormorant Garamond', Georgia, serif` (Itálico)
- **Header & Navegação:** `'Century Gothic', 'Questrial', 'Outfit', -apple-system, sans-serif` (`font-weight: 300`, `letter-spacing: 0.22em`)
- **Corpo de Texto & UI:** `'Lato', 'Inter', -apple-system, sans-serif`

### ⚠️ Regras Críticas de Design
1. **Transparência Global:** Seções intermediárias da Home **NÃO devem ter fundos pretos sólidos ou gradientes opacos cobrindo a tela**. O background pergaminho e o canvas de partículas devem fluir continuamente por trás das dobras.
2. **Sem Clichês Modernos:** Evitar glassmorphism pesado, neons estridentes, cantos ultra-arredondados estilo SaaS ou cards genéricos.
3. **Ornamentos Nobres:** Uso de cantoneiras sutis (`⌜ ⌝ ⌞ ⌟`), símbolos alquímicos (`🜄`, `🜃`, `🜁`, `🜂`, `⚗`, `☥`) e linhas douradas finas com transição suave.

---

## 3. 🧩 Camadas e Hierarquia de Stacking Context (`z-index`)

Para garantir que modais, header, vídeo hero, botão do WhatsApp e partículas se comportem perfeitamente sem conflitos de sobreposição:

| Elemento / Componente | `z-index` | Descrição do Comportamento |
|---|---|---|
| `ProductModal` / `CartDrawer` / `AgeGate` | `z-50` / `z-[100]` | Modais e gavetas que cobrem toda a tela |
| `Header` (`#site-header`) | `z-40` | Barra de navegação fixa no topo |
| `HeroCinematic` (`.hero-scroll`) | `z-30` | Contêiner sticky do vídeo Hero (cobre a tela durante o scroll de 350vh) |
| `WhatsAppFAB` (`#whatsapp-fab`) | `z-20` | Ícone dourado flutuante (fica sobre o conteúdo, mas é coberto pelo vídeo Hero) |
| Seções de Conteúdo (`section`) | `z-10` | Dobras da página (`relative z-10`) |
| `BackgroundParticles` | `z-0` | Canvas de partículas (`fixed inset-0 pointer-events-none`) |

---

## 4. 📂 Estrutura de Componentes Principais

### `src/components/`
- **`HeroCinematic.astro`**: Seção inicial baseada em scroll-driven video (350vh). Revela os títulos monumentais *"Licores artesanais feitos como antigamente."* e *"Alquimia"* com tipografia em caixa alta/baixa equilibrada.
- **`BackgroundParticles.astro`**: Motor de partículas em Canvas 2D dividido em **3 planos de profundidade**:
  - *Foreground (Plano 1):* Orbes grandes desfocados (7.5px–14px), ascensão lenta e repulsão suave ao mouse.
  - *Midground (Plano 2):* Fagulhas nítidas (1.6px–3.1px) com velocidade intermediária e brilho nobre.
  - *Background (Plano 3):* Micro-poeira atmosférica (0.9px–1.8px) com movimento lento.
  - *Otimização:* Listener passivo único em `window`, cancelamento de RAF em navegação Astro (`astro:page-load`), 60 FPS estáveis.
- **`InfiniteMarquee.astro`**: Marquee infinito elegante com tipografia serifada (`Cormorant Garamond`), glifos dourados estilizados (`✦`), animação contínua e fade gradiente nas bordas. Substitui os antigos cards de features na Home.
- **`Header.astro`**: Barra superior fixa com tipografia geométrica arredondada fina, linha dourada indicadora de rota ativa e botão do Caldeirão de compras.
- **`WhatsAppFAB.astro`**: Ícone do WhatsApp transparente (sem fundo circular sólido), renderizado com cor dourada e filtro de sombra suave.
- **`RituaisDegustacao.astro`**: Dobra assimétrica estilo *Grimório de Servir*, posicionada imediatamente após *Poções em Destaque*. Apresenta 4 rituais (I — Puro & Gelado, II — Sobre Gelo, III — À Mesa, IV — Em Alquimia) com crossfade cinematográfico contínuo entre imagens dedicadas e links para produtos recomendados.
- **`ProductCard.astro`**: Card de produto na vitrine com hover com halo de iluminação e badge de preparação.
- **`ProductModal.astro`**: Modal detalhado com ficha técnica (graduação °GL, Brix, notas aromáticas, sugestões de harmonização e adição ao caldeirão). Escuta o evento global `open-product-modal`.
- **`CartDrawer.astro`**: Gaveta lateral do caldeirão com suporte a itens avulsos e kits personalizados.

---

## 5. 🗺️ Mapa de Páginas e Rotas

| Rota | Arquivo Fonte | Descrição |
|---|---|---|
| `/` | `src/pages/index.astro` | Home completa: Hero Vídeo → **Infinite Marquee** → Story → Poções Destaque → **Rituais de Degustação** → Kits Banner → Depoimentos |
| `/pocoes` | `src/pages/pocoes.astro` | Catálogo de licores com filtros de categoria (Finos, Cremosos, Especiais) |
| `/kits` | `src/pages/kits.astro` | Página informativa de kits e opções de presente |
| `/monte-seu-kit` | `src/pages/monte-seu-kit.astro` | Wizard interativo para montagem de Kit Degustação (3 mini-poções 50ml) e Kit Presenteável |
| `/sobre` | `src/pages/sobre.astro` | História do Alquimista, manifesto e processo de produção artesanal |
| `/contato` | `src/pages/contato.astro` | Localização física em Criciúma/SC, formulário e links de atendimento |
| `/manutencao` | `src/pages/manutencao.astro` | Página de modo de manutenção temporário |
| `/404` | `src/pages/404.astro` | Página de rota não encontrada personalizada com botão de retorno |

---

## 6. 🛠️ Fluxo de Trabalho & Comandos de Desenvolvimento

### Iniciar Servidor de Desenvolvimento
Conforme definido em `AGENTS.md`, execute o servidor de desenvolvimento em modo background:
```powershell
astro dev --background
```
Gerenciamento do servidor:
- `astro dev status`
- `astro dev logs`
- `astro dev stop`

### Validar Build de Produção
Antes de finalizar qualquer entrega de código, valide a integridade estática:
```powershell
npm run build
```

---

## 7. 📜 Histórico de Alterações Importantes (Changelog)

### [07/09/2026] — Implementação do Marquee Infinito Editorial na Home
1. **Novo Componente `InfiniteMarquee.astro`:**
   - Criada faixa contínua infinita com as mensagens: *"Produção artesanal"*, *"Sem corantes artificiais"*, *"Garrafas reutilizadas"* e *"Pequenos lotes"*.
   - Tipografia serifada em alta escala (`Cormorant Garamond`), tracking amplo (`tracking-[0.2em]`), cor dourada suave (`--gold-soft`), separadores com glifo místico dourado com halo (`✦`).
   - Efeito de fade nas bordas com gradientes transparentes e pausa interativa em `:hover`.
   - Substituição da antiga grade estática de 4 ícones em `src/pages/index.astro`.

### [03/09/2026] — Implementação da Dobra "Rituais de Degustação" & Refinamentos Visuais
1. **Nova Dobra `RituaisDegustacao.astro`:**
   - Criada e inserida na Home entre *Poções em Destaque* e o *Banner de Kits*.
   - Composição editorial assimétrica: Canvas fotográfico à esquerda + Lista de 4 rituais à direita.
   - Crossfade cinematográfico sem flash de renderização entre as 4 fotografias em `public/assets/rituals/`.
   - Fundo 100% transparente permitindo visualização das partículas de fundo.
   - Integração com dados reais do catálogo e abertura de `ProductModal`.
2. **Tipografia do Header Atualizada:**
   - Aplicada a família `'Century Gothic', 'Questrial', 'Outfit'` com peso fino (`font-weight: 300`) e `letter-spacing: 0.22em`.
   - Importadas as fontes Google `Questrial` e `Outfit` em `Layout.astro`.
3. **WhatsApp Flutuante Refatorado (`WhatsAppFAB.astro`):**
   - Removido fundo circular sólido; apenas ícone dourado com `drop-shadow`.
   - Stacking order calibrada em `z-index: 20` (coberto pelo Hero vídeo, visível sobre o restante).
4. **Sistema de Partículas em 3 Camadas (`BackgroundParticles.astro`):**
   - Reestruturado em Foreground (orbes bokeh lentos), Midground (fagulhas nítidas) e Background (poeira tênue).
   - Mouse reaction calibrada com inércia individual por camada.
5. **Ajuste de Lettering no Hero:**
   - "ALQUIMIA" ajustado para "Alquimia" mantendo consistência com "Antigamente.".

---

*Nota: Ao realizar futuras mudanças de código, adicione uma nova entrada na seção 7 deste arquivo e atualize as seções correspondentes.*
