# 📜 Handoff do Projeto — Alquimista Licores

> **Documento Oficial de Transição e Continuidade Técnica.**  
> Este arquivo deve ser **sempre atualizado** a cada nova funcionalidade, refatoração estrutural, ajuste de design system ou adição de novas dobras/componentes.

---

## 1. 🏛️ Visão Geral & Stack Tecnológica

- **Framework:** [Astro 5](https://astro.build/) (Static Site Generation / Hybrid Rendering)
- **Estilização:** Tailwind CSS v4 + Vanilla CSS Tokens (Custom Properties)
- **Tipografia:** Google Fonts (`Cinzel`, `Cinzel Decorative`, `Cormorant Garamond`, `Inter`, `JetBrains Mono`, `Lato`, `Manrope`, `Playfair Display`, `Syncopate`, `Bebas Neue`) com preconnect, display=swap e fallbacks locais.
- **Banco de Dados / Backend:** Supabase (Projeto `crsjmyrkbpawxqgvfmrv`) com fallback local resiliente em `src/lib/data.ts`
- **Integrações:** WhatsApp Checkout, GerenciApp (Sincronização de estoque e pedidos), OpenStreetMap/OSRM (Cálculo de frete)
- **Hospedagem & Build:** Node.js / Vite Static Build (`dist/`)

---

## 2. 🎨 Design System 2.0 & Identidade Visual Alquímica

O projeto segue uma estética de **Dark Luxury Artesanal**, inspirada em boticas antigas, grimórios e alquimia clássica.  
Consulte o catálogo interativo vivo em: [design_system_atual.html](file:///d:/projetos%20antigravity/site_alquimista/treino%20antigravity/resultados/design_system_atual.html).

### 🎨 Tokens de Cores Principais
- `--gold`: `#C8A97E` (Dourado alquímico principal)
- `--gold-hover`: `#D4B23A` (Dourado radiante para pontos focais e hover)
- `--gold-soft`: `#E8D5BC` (Dourado pergaminho suave)
- `--background`: `#080605` (Anexo 3 pure dark obsidian velvet)
- `--surface`: `#100d0b` / `--surface-elevated`: `#181411`
- `--foreground` / `--cream`: `#F3EBD8` (Texto creme luminoso)
- `--text-soft`: `#B8A690` / `--text-faded`: `#6E6052`
- `--wine`: `#6B1D2F` / `--amber-warm`: `#D97706`

### ✍️ Matriz Tipográfica Design System 2.0
| Token | Família | Papel Semântico | Exemplo de Aplicação |
|---|---|---|---|
| `--font-display` | `'Cinzel', 'Cinzel Decorative', 'Cormorant Garamond', serif` | H2 Seções Mestras, H3 Cards/Módulos | Vitrine de Poções, Títulos de Seção |
| `--font-decorative` | `'Cinzel Decorative', 'Cinzel', serif` | Numerais Romanos, Glifos & Acentos | I, II, III, IV em Rituais e brasões |
| `--font-serif` | `'Cormorant Garamond', Georgia, serif` | H1 Monumental, H4 Subtítulo Nobre, body-lg Citações | Hero, subtítulos em itálico |
| `--font-classic` | `'Playfair Display', Georgia, serif` | Clássico Editorial Nobre | Blocos de leitura e manifestos |
| `--font-sans` | `'Inter', -apple-system, sans-serif` | UI Neutro, Botões de Ação, Helpers | CTAs, controles de filtro, formulários |
| `--font-body` | `'Lato', 'Manrope', sans-serif` | Corpo de Texto Principal, Descrições | Parágrafos de leitura contínua |
| `--font-mono` | `'JetBrains Mono', monospace` | H6 Labels de Botica, Badges, Brix & GL | Metadados técnicos, graduação alcoólica |
| `--font-sync` | `'Syncopate', sans-serif` | H5 Blocos de Metadados / Tickers | Tags de categoria, opus headers |
| `--font-bebas` | `'Bebas Neue', Impact, sans-serif` | Impacto & Posters | Banners de promoção e números de destaque |

### ⚡ Estratégia de Carregamento Ultrarrápido
1. `<link rel="preconnect" href="https://fonts.googleapis.com">` e `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` injetados no `<head>` do `Layout.astro`.
2. Parâmetro `&display=swap` em todas as fontes para renderização imediata com texto visível sem FOIT (Flash of Invisible Text).
3. Fallbacks de sistema e fontes locais em `@font-face` (`public/fonts/CinzelDecorative-Bold.otf`).

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
- **`InfiniteMarquee.astro`**: Marquee infinito nobre com tipografia refinada, símbolos dos quatro elementos alquímicos (`🜃`, `🜁`, `🜄`, `🜂`), animação contínua e fade gradiente nas bordas. Posicionado logo abaixo da dobra Hero.
- **`Header.astro`**: Barra superior fixa com tipografia geométrica arredondada fina, linha dourada indicadora de rota ativa e botão do Caldeirão de compras.
- **`WhatsAppFAB.astro`**: Ícone do WhatsApp transparente (sem fundo circular sólido), renderizado com cor dourada e filtro de sombra suave.
- **`RituaisDegustacao.astro`**: Dobra assimétrica estilo *Grimório de Servir*, posicionada imediatamente após *Poções em Destaque*. Apresenta 4 rituais (I — Puro & Gelado, II — Sobre Gelo, III — À Mesa, IV — Em Alquimia) com crossfade cinematográfico contínuo entre imagens dedicadas e links para produtos recomendados.
- **`Button.astro`**: Componente polimórfico de botão/link do Design System com suporte a 6 variantes visuais (`primary`, `outline`, `shimmer`, `liquid`, `ghost`, `icon`).
- **`Badge.astro`**: Emblemas e pills alquímicas (`badge-pill-gold`, `badge-pill-dark`, `badge-pill-ember`) com suporte a ícones/glifos, tooltips contextuais (`data-tooltip`) e tamanhos (`sm`, `md`).
- **`Toast.astro`**: Sistema de notificação toast flutuante nobre com ícone circular dourado, tipografia mono (`JetBrains Mono`), animação fluida e integração global a eventos `show-toast` e `add-to-cart`.
- **`ProductCard.astro`**: Card de produto na vitrine com bordas suavemente arredondadas (`rounded-md`), efeito de parallax 3D interativo ao movimento do mouse no desktop (com inclinação em perspectiva, deslocamento da garrafa e foco de luz/glare dourado) e badge de preparação.
- **`ProductModal.astro`**: Modal detalhado com animação de expansão morfológica fluida (efeito *React Bits modal-cards-tw* / FLIP transition direta a partir da posição do card clicado), ficha técnica completa (graduação °GL, Brix, notas aromáticas, sugestões de harmonização, alerta de maceração e adição ao caldeirão). Suporta fechamento por clique fora, botão e tecla Escape com recolhimento reverso.
- **`CartDrawer.astro`**: Gaveta lateral do caldeirão com suporte a itens avulsos e kits personalizados.
- **`CauldronIcon.astro`**: Ícone SVG alquímico do caldeirão com suporte a `viewBox="0 0 52.84 57.18"`, `fill="currentColor"`, classes utilitárias e dimensões responsivas. Utilizado no Header, botões de ação rápida e telas de manutenção.

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

### [07/09/2026] — Sincronização Oficial de Dados do Catálogo e Rituais de Degustação
1. **Catálogo & Base de Dados 100% Alinhados:**
   - Atualizado [`src/lib/data.ts`](file:///d:/projetos%20antigravity/site_alquimista/src/lib/data.ts) com as 12 poções reais, volumes oficiais (750ml), graduações (°GL), densidade (Brix), ingredientes, notas aromáticas, sugestões completas de consumo e os 10 depoimentos autênticos.
2. **Refinamento dos Rituais de Degustação ([`RituaisDegustacao.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/RituaisDegustacao.astro)):**
   - **Ritual I (Puro & Gelado):** Alinhado às temperaturas de 10–15°C e doses digestivas em cálice para *Poção da Prosperidade (Ouro)*, *Poção Néctar Místico (Butiá)* e *Poção Silvestre (Jabuticaba)*.
   - **Ritual II (Sobre Gelo):** Focado na oxigenação e notas cítricas para *Poção Tropical (Abacaxi)*, *Poção da Serenidade (Maracujá)* e *Poção da Conexão (Figo)*.
   - **Ritual III (À Mesa & Harmonização):** Conexão gastronômica com queijos de cabra/ricota, sobremesas de café, chocolate amargo e caldas sobre sorvete com *Poção do Doce Deleite (Doce de Leite)*, *Poção do Desejo (Chocolate)* e *Poção da Alegria (Banana)*.
   - **Ritual IV (Em Alquimia & Mixologia):** Mixologia e drinks clássicos adaptados (Espresso Martini, Piña Colada, Margarita, Canela Sour) com *Poção da Inspiração (Café & Laranja)*, *Poção do Aconchego (Canela)* e *Poção do Doce Sossego (Maracujá Cremoso)*.
3. **Efeito Dinâmico e Reativo no Header ([`Header.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/Header.astro)):**
   - **No topo (`scrollY === 0`):** 100% transparente (`bg-transparent border-transparent`), integrando-se organicamente com o topo da página e o vídeo hero.
   - **Ao rolar a página (`scrollY > 15`):** Transição suave para fundo escuro translúcido acetinado (`rgba(10, 10, 10, 0.80)`) com desfoque de vidro profundo (`backdrop-blur-xl`), borda inferior e sombra sutil.
   - **Ao passar o mouse (`:hover` com cursor tracking):** Efeito *spotlight* em tempo real: o fundo e a borda inferior dourada clareiam e brilham suavemente ao redor da posição exata do cursor.

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

### [07/09/2026] — Remoção das Bordas e Ajuste Proporcional dos Depoimentos
- Removidas as caixas retangulares e bordas douradas (`border border-[var(--gold)]/15`, `bg-[var(--surface-elevated)]/30`) dos cards do carrossel infinito de depoimentos em [`src/pages/index.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/index.astro) e [`src/styles/global.css`](file:///d:/projetos%20antigravity/site_alquimista/src/styles/global.css).
- **Redução Proporcional de 20%:** Largura dos itens (`flex-basis: 264px` / `350px`), fontes das aspas, corpo do comentário (`text-sm md:text-[15px]`), estrelas e autor foram reduzidos em 20%, mantendo a dinâmica de magnificação central proporcional (`scale(1.22)`).
- As avaliações fluem com máxima harmonia visual e foco central.

### [07/09/2026] — Calibração do Sistema de Partículas de Fundo & Onda de Choque
- **Densidade Ampliada:** Total de partículas elevado de 76 para **130** (desktop) e de 38 para **65** (mobile) em [`src/components/BackgroundParticles.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/BackgroundParticles.astro).
- **Preservação do Bokeh:** A quantidade de partículas grandes e desfocadas do primeiro plano (Layer 1) foi mantida estritamente fixa (15 desktop / 8 mobile), evitando poluição visual.
- **Onda Invisível com Efeito Pairar e Impulso Ultrassuave:** Ao clicar no fundo, a onda gera apenas uma leve brisa sutil (força reduzida para `1.35`). As fagulhas deslizam suavemente sem solavancos (`damping: 0.968`), pairam com leveza e retomam o fluxo ascendente com máxima elegância.

### [07/09/2026] — Parallax 3D Suave no Scroll no Banner de Kits
- Implementado sistema de parallax 3D suave acionado pelo scroll da página (sem interferência de hover) em [`src/pages/index.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/index.astro):
  - **Fundo (Caixa do Kit):** Profundidade traseira (`translateZ: -15px`, `scale: 1.15`) com deslocamento suave (`offset * 0.08`).
  - **Texto Poético:** Profundidade intermediária (`translateZ: 15px`) subindo de forma delicada (`offset * -0.05`).
  - **Botão Dourado ("Explorar Kits"):** Primeiro plano 3D (`translateZ: 30px`) subindo ligeiramente mais rápido (`offset * -0.10`), conferindo uma tridimensionalidade refinada, leve e elegante durante a rolagem.

### [07/09/2026] — Aprofundamento dos Rituais de Degustação
- Atualizado [`src/components/RituaisDegustacao.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/RituaisDegustacao.astro) integrando receitas e técnicas do catálogo oficial:
  1. **Ritual I (Puro & Gelado):** Digestivo solo a 10–15°C para poções com especiarias e cálices resfriados para frutas nativas (Butiá, Jabuticaba).
  2. **Ritual II (Sobre Gelo):** Oxigenação em copo Old Fashioned para aberturas aromáticas de Abacaxi com cravo, Maracujá e folhas de Figo.
  3. **Ritual III (À Mesa & Harmonização):** Harmonizações com tábuas de queijos nobres (cabra, ricota), sobremesas caramelizadas (Doce de Leite como calda sobre sorvetes/pudim) e Chocolate 50% com café.
  4. **Ritual IV (Em Alquimia & Mixologia):** Receitas de coquetelaria autoral (Espresso Martini com Poção de Café & Laranja, Canela Sour com limão e anis estrelado, e Velvet Tropical Batida com Maracujá Cremoso).
- Cards expandidos agora exibem badges de temperatura recomendada, caixas de destaque metodológico e chips interativos de poções com sabor e link direto para o `ProductModal`.

### [14/09/2026] — Criação do Master Design System (`treino antigravity/resultados/design_system_master.html`)
- **Novo Arquivo Criado Sem Substituição:** Conforme solicitado pelo usuário, os arquivos anteriores (`design_system.html`, `design_system0.html`, `design_system_old.html`) foram integralmente preservados e intactos. O novo master foi publicado em [`treino antigravity/resultados/design_system_master.html`](file:///d:/projetos%20antigravity/site_alquimista/treino%20antigravity/resultados/design_system_master.html).
- **Fusão Criativa Definitiva:** Desenvolvido o novo arquivo mestre consolidando as melhores referências e sistemas:
  1. **Dobra 1 (Hero Cinematográfico):** Idêntica à [`src/pages/index.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/index.astro) e [`HeroCinematic.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/HeroCinematic.astro) com vídeo de fundo `video2.mp4` vinculado a scroll scrub contínuo via GSAP ScrollTrigger e Lenis Smooth Scroll, brackets de canto decorativos, status pill com pulso luminoso, título "A ARTE DA TRANSMUTAÇÃO" em ouro líquido e CTA dual.
  2. **Dobra 2 (Showcase de Capacidades):** Marquee infinito bidirecional com glifos sagrados (🜂, 🜄, 🜁, 🜃, 🜚, 🜛, ⚗), vitrine 3D de poção centralizada com órbitas em rotação e satélites de metadados ("18% ABV", "Infusão Café & Baunilha", "Selo Real Lote 001/2026"), contadores métricos de alta legibilidade e deck de cartões 3D em camadas de profundidade.
  3. **Tipografia:** Tabela analítica completa (Cinzel Decorative, Playfair Display, Cormorant Garamond, Bebas Neue, Syncopate, Inter, JetBrains Mono) com font-weight numérico, fluid clamp, line-height, letter-spacing e text-transform, além de playground interativo em tempo real para digitação livre.
  4. **Sistema de Cores:** Espectros Dourado (#C8A97E, #E5C396, #D4AF37, #9A7B4F, #F3E5AB), Obsidiana (#070709, #0E0E12, #1A1A20) e Brasas/Botânica (#A83232, #235438, #4B286D) em Hex, RGB e HSL, índices WCAG AA/AAA e funcionalidade de cópia instantânea com toast flutuante.
  5. **Componentes de UI:** Botões com sweep dourado (`btn-primary`), hairline (`btn-outline`), transmutação líquida (`btn-liquid`) e vitrificado (`glass-cta-button`), formulários temáticos, stepper numérico interativo, cards de poções com imagens reais em alta resolução, badges com tooltips e modal interativo de fórmula com backdrop-blur.
  6. **Física de Partículas:** Motor em Canvas 2D contínuo com 60 fagulhas alquímicas douradas e rubras ascendentes e resposta interativa com repulsão ao ponteiro do mouse.

### [15/09/2026] — Criação do Master Design System 2.0 (`treino antigravity/resultados/design_system2.html`)
- **Arquivo Criado:** Publicado o [`treino antigravity/resultados/design_system2.html`](file:///d:/projetos%20antigravity/site_alquimista/treino%20antigravity/resultados/design_system2.html) com consolidação de tokens e componentes vivos.

### [15/09/2026] — Criação do Master Design System 3.0 (`treino antigravity/resultados/design_system3.html`)
- **Novo Arquivo Criado:** Criado e validado o [`treino antigravity/resultados/design_system3.html`](file:///d:/projetos%20antigravity/site_alquimista/treino%20antigravity/resultados/design_system3.html) como a versão mais avançada, autônoma e interativa do Design System.

- **Fusão Criativa das Referências Solicitadas:**
  1. **1ª Dobra (Hero Cinematográfica):** Idêntica a `src/pages/index.astro` e `HeroCinematic.astro`, com cantoneiras clássicas (`corner-bracket`), vídeo `/video2.mp4` ou fallback de alta definição, auroras escuras, coreografia de desfoque/translação das tipografias (*"LICORES ARTESANAIS FEITOS COMO Antigamente."* e *"DEGUSTE NOSSA Alquimia"*), botão glassmórfico e indicador sutil de scroll.
  2. **2ª Dobra em Diante (Hero de Demonstração Viva):**
     - Infinite Marquee com glifos dourados (`✦`, `🜂`, `🜄`, `🜁`, `🜃`, `☉`).
     - Cards de poções em 3D com inclinação giroscópica ao mover o mouse (`[data-tilt]`), garrafas reais em alta resolução, badges de teor alcoólico e preços.
     - Grimório Transparente interativo de Rituais de Degustação (4 abas: *O Despertar*, *A Temperatura*, *O Cálice*, *Harmonização*) com troca instantânea de receitas, passos cerimoniais e fotos dedicadas.
     - Banner Parallax 3D de Kits artesanais com profundidade no eixo Z (fundo, texto poético e botão com velocidades de scroll independentes).
     - Carrossel de Depoimentos com magnificação proporcional em curva cosseno e iluminação dourada no centro.
  3. **Especificações Técnicas Completas do Design System:**
     - **Tipografia:** Tabela completa de escala (h1 a h6, body-lg, body, caption/mono) com métricas de font-family, peso, rem/px, line-height e letter-spacing, acompanhada do Testador Interativo ao Vivo (seletores de família, tamanho e tracking com atualização em tempo real).
     - **Sistema de Cores:** Paleta completa com valores HEX, RGB e HSL, índices de conformidade WCAG 2.1 (AAA e AA), matriz de gradientes, variantes de opacidade e clique para copiar instantâneo com notificação toast.
     - **Componentes UI:** Botões (Dourado, Outline, Vinho Imperial, Ghost, Disabled), formulários e inputs com estados de validação visual (sucesso/erro), switches luminosos, badges, tooltips posicionais e modais funcionais (Age Gate e Quickview da Poção).
     - **Ícones & Glifos:** Catálogo interativo com 12 símbolos alquímicos e botânicos com clique para cópia.
     - **Animações (Motion Playground):** Keyframes puros para flutuação suave, pulso luminescente, rotação alquímica e varredura de luz (shimmer sweep).
  4. **Atmosfera Contínua em Todas as Dobras:**
     - Canvas 2D em 3 camadas de profundidade com repulsão ao ponteiro e ondas de choque expansivas ao clicar no fundo.
     - Auroras boreais escuras em tons de ouro e vinho, textura de ruído/filme granulado e cursores dourados vetoriais personalizados.
  5. **Validação:** 0 erros no console JavaScript, 100% responsivo (desktop a mobile 375px com menu hamburger).

### [15/09/2026] — Criação do Master Design System 4.0 (`treino antigravity/resultados/design_system4.html`)
- **Novo Arquivo Criado:** Criado e validado o [`treino antigravity/resultados/design_system4.html`](file:///d:/projetos%20antigravity/site_alquimista/treino%20antigravity/resultados/design_system4.html) consolidando o ápice das versões anteriores (`design_system2.html`, `design_system3.html`) com o Card Stack 3D Parallax de `parallax-clean`, os contadores de métricas artesanais de `barbershop`, e a vitrine de poções de `alquimistalicores.lovable.app`.
- **Destaques da Versão 4.0:**
  1. **1ª Dobra (Hero Cinematográfica):** Pinned stage de 350vh com cantoneiras clássicas, vídeo `/video2.mp4` ou canvas fallback, coreografia em 2 fases das tipografias e CTA glassmórfico.
  2. **2ª Dobra em Diante (Showcase Vivo de Capacidades):**
     - Infinite Marquee com glifos alquímicos (`✦`, `🜂`, `🜄`, `🜁`, `🜃`, `☉`).
     - Botica de Poções com inclinação giroscópica 3D (`[data-tilt]`) ao mover o cursor.
     - **Card Stack 3D Parallax ("O Tríptico da Criação"):** Metodologia secular em 3 cards empilhados (*01. A Maceração Silenciosa*, *02. A Harmonia da Calda*, *03. O Envase & Selo Nobre*).
     - **Painel de Métricas & Stats Artesanais:** 4 contadores (`7+ Anos`, `15K+ Garrafas`, `12 Poções`, `100% Artesanal`).
     - **Grimório Transparente dos 4 Elementos:** 4 abas interativas (*Ar 🜁*, *Água 🜄*, *Fogo 🜂*, *Terra 🜃*) com receitas e passos cerimoniais.
     - Banner Parallax 3D de Kits artesanais e Carrossel de Depoimentos com curva cosseno de magnificação central.
  3. **Especificações Técnicas Completas:**
     - **Tipografia:** Tabela analítica completa (h1 a h6, body-lg, body, caption/mono) e Testador Interativo ao Vivo com seletores de fontes, tamanho e espaçamento.
     - **Sistema de Cores:** Paleta completa (Hex, RGB, HSL), índices WCAG AAA/AA, matriz de gradientes, variantes de opacidade e clique para cópia com toast flutuante.
     - **Componentes UI:** Botões com microinterações, formulários com validação visual (sucesso/erro), switches luminosos, badges, tooltips posicionais e 2 modais funcionais (Age Gate e Quickview).
     - **Ícones & Glifos:** Catálogo com 12 símbolos alquímicos vetoriais com cópia imediata.
     - **Animações (Motion Playground):** Keyframes puros para flutuação, pulso, rotação e varredura de luz (shimmer).
  4. **Atmosfera Contínua:** Canvas 2D em 3 camadas com repulsão ao mouse e ondas de choque ao clique, auroras boreais escuras, textura de ruído e cursores dourados vetoriais.
  5. **Validação no Navegador:** 0 erros no console JavaScript, 100% responsivo.

### [15/09/2026] — Revisão e Padronização da Hierarquia de Títulos (H1, H2, H3)
- **Hierarquia Semântica e SEO Consolidada em 100% das Páginas:**
  1. **Apenas UM `<h1>` por página:**
     - `src/pages/index.astro`: Título principal exclusivo no Hero Cinematográfico (*"Licores artesanais feitos como antigamente."*).
     - `src/pages/pocoes.astro`, `src/pages/kits.astro`, `src/pages/sobre.astro`, `src/pages/contato.astro`, `src/pages/monte-seu-kit.astro`: Centralizado via `PageHeader.astro` (`<h1>`). Em `monte-seu-kit.astro`, o título do wizard foi ajustado para `<h2>` para evitar duplicidade de `<h1>` no DOM.
     - `src/pages/404.astro`: `<h1>Poção não encontrada</h1>`.
     - `src/pages/manutencao.astro`: `<h1>Alquimia em Pausa</h1>`.
  2. **`<h2>` para Seções Principais:**
     - Todas as seções e blocos primários (Story quote, Poções em destaque, Rituais de Degustação, Banner de Kits, Depoimentos, Jornada/História, Kits Degustação/Presenteável, Perguntas Frequentes, Canais de Atendimento) utilizam `<h2>`.
  3. **`<h3>` para Subitens e Cards:**
     - Nomes de poções nos cards (`ProductCard.astro`), títulos individuais dos rituais (`RituaisDegustacao.astro`), autores de depoimentos (`index.astro`), canais de contato e perguntas de FAQ (`contato.astro`), e opções/itens de seleção no wizard de montagem (`monte-seu-kit.astro`) foram padronizados como `<h3>`.
  4. **Preservação Visual 100% Intacta:** Todas as classes CSS, tipografias e utilitários visuais foram rigorosamente mantidos sem nenhuma alteração no layout.
  5. **Validação:** `npm run build` executado e aprovado com sucesso para todas as 8 rotas estáticas.

### [15/09/2026] — Padronização Tipográfica do Header e Refinamento do Footer
1. **Header ([`src/components/Header.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/Header.astro)):**
   - Atualizados os links de navegação (`.header-nav-link`) para a fonte `Lato` (com fallback para `var(--font-body)`), `text-transform: uppercase`, `letter-spacing: 0.22em`, `font-weight: 500` e tamanho `0.75rem`.
   - Limpeza de classes conflitantes do Tailwind no template.
2. **Footer ([`src/components/Footer.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/Footer.astro)):**
   - Trocada a posição dos links: "Contato" agora antecede "Jornada".
   - Ajustado layout do footer no desktop para exibir todos os links de navegação em uma única linha (`md:flex-nowrap whitespace-nowrap`).

### [15/09/2026] — Refinamento e Otimização da Dobra "Rituais de Degustação"
- **Simplificação de Cópia & UX Mais Escaneável ([`src/components/RituaisDegustacao.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/RituaisDegustacao.astro)):**
  1. **Preservação Visual 100% da Área da Imagem:** Mantida a moldura fotográfica com cantoneiras clássicas, aspecto proporcional, crossfade suave e paralaxe em mousemove.
  2. **Estrutura de Accordion Mais Limpa & Objetiva:**
     - **Estado Recolhido:** Título direto + numeral romano + glifo alquímico + descrição curta e poética em itálico.
     - **Estado Aberto:** Selo/linha prática em badge mono (`✦ Servir gelado · Taça pequena`), parágrafo principal conciso, bloco auxiliar de destaque (*Dica do Ritual* ou *Inspirações*) e chips interativos das poções indicadas com links diretos para o modal de produto.
  3. **Títulos e Nomenclaturas Oficiais:**
     - *Ritual I — PURO & GELADO*
     - *Ritual II — COM GELO*
     - *Ritual III — COM SOBREMESAS* (com a inclusão da *Poção da Alegria*)
     - *Ritual IV — EM COQUETÉIS*
  4. **Sincronização do Selo Dourado:** Badge flutuante sobre a imagem dinâmica sincronizada com os 4 novos títulos.
  5. **Validação:** Build estático aprovado com sucesso (`astro build` executado em 5.42s).

---

*Nota: Ao realizar futuras mudanças de código, adicione uma nova entrada na seção 7 deste arquivo e atualize as seções correspondentes.*
