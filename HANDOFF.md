# 📜 Handoff do Projeto — Alquimista Licores

> **Documento Oficial de Transição e Continuidade Técnica.**  
> Este arquivo deve ser **sempre atualizado** a cada nova funcionalidade, refatoração estrutural, ajuste de design system ou adição de novas dobras/componentes.

---

## 1. 🏛️ Visão Geral & Stack Tecnológica

- **Framework:** [Astro 5](https://astro.build/) (Static Site Generation / Hybrid Rendering)
- **Estilização:** Tailwind CSS v4 + Vanilla CSS Tokens (Custom Properties)
- **Tipografia:** Google Fonts (`Cinzel`, `Cinzel Decorative`, `Cormorant Garamond`, `Inter`, `JetBrains Mono`, `Lato`, `Manrope`, `Playfair Display`, `Syncopate`, `Bebas Neue`) com preconnect, display=swap e fallbacks locais.
- **Banco de Dados / Backend:** Supabase (Projeto Oficial: `https://bktegbisdaqdhpqtxqxy.supabase.co` / ID: `bktegbisdaqdhpqtxqxy`) com fallback local resiliente em `src/lib/data.ts` e módulo cliente em `src/integrations/supabase/client.ts`
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
- **`Header.astro`**: Barra superior fixa com glassmorphism nobre (`backdrop-blur-md` ativo em nível de compositor GPU e preservado no build de produção), tipografia geométrica arredondada fina, linha dourada indicadora de rota ativa e botão do Caldeirão de compras.
- **`WhatsAppFAB.astro`**: Ícone do WhatsApp transparente (sem fundo circular sólido), renderizado com cor dourada e filtro de sombra suave.
- **`RituaisDegustacao.astro`**: Dobra assimétrica estilo *Grimório de Servir*, posicionada imediatamente após *Poções em Destaque*. Apresenta 4 rituais (I — Puro & Gelado, II — Sobre Gelo, III — À Mesa, IV — Em Alquimia) com crossfade cinematográfico contínuo entre imagens dedicadas e links para produtos recomendados.
- **`Button.astro`**: Componente polimórfico de botão/link do Design System com suporte a 6 variantes visuais (`primary`, `outline`, `shimmer`, `liquid`, `ghost`, `icon`).
- **`Badge.astro`**: Emblemas e pills alquímicas (`badge-pill-gold`, `badge-pill-dark`, `badge-pill-ember` em amarelo âmbar luminoso sem tons vermelhos) com suporte a ícones/glifos, tooltips contextuais (`data-tooltip`) e tamanhos (`sm`, `md`).
- **`Toast.astro`**: Sistema de notificação toast flutuante nobre com ícone circular dourado, tipografia mono (`JetBrains Mono`), animação fluida e integração global a eventos `show-toast` e `add-to-cart`.
- **`ProductCard.astro`**: Card de produto na vitrine com bordas suavemente arredondadas (`rounded-md`), efeito de parallax 3D interativo ao movimento do mouse no desktop (com inclinação em perspectiva, deslocamento da garrafa e foco de luz/glare dourado), badge de categoria limpo (sem ícone) à esquerda, badge `.badge-pill-ember` ("Sob Encomenda", sem ícone) à direita, tipografia do sabor ampliada em tom dourado nobre (`text-base text-[var(--gold-soft)]`) e overlay sutil de lote esgotado (sem ícone, com opacidade e blur refinados).
- **`ProductModal.astro`**: Modal detalhado com animação de expansão morfológica fluida (FLIP transition), galeria carrossel sequencial de fotos com navegação por setas (❮ ❯) e indicadores de sequência (dots) iniciando pela Foto de Capa, ficha técnica com 3 caixas informativas (Graduação °GL, Brix e Ingredientes com tooltip), aviso de maceração e alertas de reposição de estoque.
- **`CustomCursor.astro`**: Cursor customizado de alta precisão em `#B28C46` com ponto central sem latência, englobamento magnético (70px) para botões e inputs, efeito de contorno circular (9999px) para botões circulares, opacidade 50% para links simples do header/footer, opacidade 0% ao passar sobre cards de produtos/rituais, exclusão de botões/accordion de Perguntas Frequentes (FAQ), e isolamento de escopo quando modais ou a aba lateral do carrinho estão abertos.
- **`CartDrawer.astro`**: Gaveta lateral do caldeirão com suporte a itens avulsos e kits personalizados.
- **`CauldronIcon.astro`**: Ícone SVG alquímico do caldeirão com suporte a `viewBox="0 0 52.84 57.18"`, `fill="currentColor"`, classes utilitárias e dimensões responsivas. Utilizado no Header, botões de ação rápida e telas de manutenção.

---

## 5. 🗺️ Mapa de Páginas e Rotas

| Rota | Arquivo Fonte | Descrição |
|---|---|---|
| `/` | `src/pages/index.astro` | Home completa: Hero Vídeo → **Infinite Marquee** → Poções Destaque → **Rituais de Degustação** → Kits Banner → Depoimentos → **Story Quote ("Feito com (c)alma")** |
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
- **`Badge.astro`**: Emblemas e pills alquímicas (`badge-pill-gold`, `badge-pill-dark`, `badge-pill-ember` em amarelo âmbar luminoso sem tons vermelhos) com suporte a ícones/glifos, tooltips contextuais (`data-tooltip`) e tamanhos (`sm`, `md`).
- **`Toast.astro`**: Sistema de notificação toast flutuante nobre com ícone circular dourado, tipografia mono (`JetBrains Mono`), animação fluida e integração global a eventos `show-toast` e `add-to-cart`.
- **`ProductCard.astro`**: Card de produto na vitrine com bordas levemente arredondadas (`rounded-md`), proporção otimizada (`aspect-[4/5]`), altura ampliada da imagem (`70%`), preenchimento inferior compacto (`p-4 pt-2.5`) sem folgas entre a foto e o título, efeito de parallax 3D interativo ao movimento do mouse no desktop, badge de categoria limpo à esquerda, badge `.badge-pill-ember` ("Sob Encomenda") à direita, tipografia do sabor em tom dourado nobre (`text-sm text-[var(--gold-soft)]`) e overlay de lote esgotado.
- **`ProductModal.astro`**: Modal detalhado com animação de expansão morfológica fluida (efeito *React Bits modal-cards-tw* / FLIP transition direta a partir da posição do card clicado), cantos levemente arredondados (`rounded-xl`), altura contida responsiva (`md:h-[72vh] md:max-h-[640px]`), botão de fechar circular (`rounded-full`), ficha técnica com 3 caixas informativas essenciais (Graduação °GL, Brix e Ingredientes com tooltip contextual ao clicar ou passar o mouse, sem ocupar espaço extra no layout e perfeitamente contido no modal), aviso de maceração simplificado, badges alquímicas (`100% Orgânico`, `Maceração 40 Dias` e badge pill ember `Sob Encomenda` dinâmico para poções de preparo especial como Chocolate e Maracujá Cremoso), notas aromáticas, sugestões de harmonização e botões de quantidade com englobamento circular pelo cursor magnético.
- **`CustomCursor.astro`**: Cursor customizado de alta precisão em `#B28C46` com ponto central sem latência, englobamento magnético de 100px para botões e inputs, efeito de contorno circular (9999px) para botões de fechar modais (`✕`), quantidade (`+`, `-`), WhatsApp e Caldeirão, isolamento de escopo quando modais ou a aba lateral do carrinho estão abertos, e **isenção automática em rotas administrativas (`/admin*`)**, onde os cursores nativos do navegador (`auto`, `pointer`, `text`) são mantidos 100% restaurados.
- **`CartDrawer.astro`**: Gaveta lateral do caldeirão com suporte a itens avulsos e kits personalizados.
- **`CauldronIcon.astro`**: Ícone SVG alquímico do caldeirão com suporte a `viewBox="0 0 52.84 57.18"`, `fill="currentColor"`, classes utilitárias e dimensões responsivas. Utilizado no Header, botões de ação rápida e telas de manutenção.

---

## 5. 🗺️ Mapa de Páginas e Rotas

| Rota | Arquivo Fonte | Descrição |
|---|---|---|
| `/` | `src/pages/index.astro` | Home completa: Hero Vídeo → **Infinite Marquee** → Poções Destaque → **Rituais de Degustação** → Kits Banner → Depoimentos → **Story Quote ("Feito com (c)alma")** |
| `/pocoes` | `src/pages/pocoes.astro` | Catálogo de licores com filtros de categoria (Finos, Cremosos, Especiais) |
| `/kits` | `src/pages/kits.astro` | Página informativa de kits e opções de presente |
| `/monte-seu-kit` | `src/pages/monte-seu-kit.astro` | Wizard interativo para montagem de Kit Degustação (3 mini-poções 50ml) e Kit Presenteável |
| `/sobre` | `src/pages/sobre.astro` | História do Alquimista, manifesto e processo de produção artesanal |
| `/contato` | `src/pages/contato.astro` | Localização física em Criciúma/SC, formulário e links de atendimento |
| `/manutencao` | `src/pages/manutencao.astro` | Página de modo de manutenção temporário |
| `/404` | `src/pages/404.astro` | Página de rota não encontrada personalizada com botão de retorno |
| `/admin` | `src/pages/admin/index.astro` | Dashboard administrativo com métricas em tempo real, alertas de estoque e atalhos |
| `/admin/login` | `src/pages/admin/login.astro` | Entrada do Alquimista com Supabase Auth e verificação de permissão `admin` |
| `/admin/produtos` | `src/pages/admin/produtos.astro` | Gestão de catálogo, ficha técnica dos modais, Brix, °GL, fotos e estoque |
| `/admin/pedidos` | `src/pages/admin/pedidos.astro` | Gestão de pedidos (`site_orders`), pedidos manuais e exportação CSV |
| `/admin/kits` | `src/pages/admin/kits.astro` | Tabela de preços dinâmicos de kits degustação e presenteáveis (`kit_prices`) |
| `/admin/depoimentos` | `src/pages/admin/depoimentos.astro` | Gestão de depoimentos e avaliações de clientes (`testimonials`) |
| `/admin/destaques` | `src/pages/admin/destaques.astro` | Curadoria manual e automática das poções da vitrine (`featured_config`) |
| `/admin/backup` | `src/pages/admin/backup.astro` | Exportação em lote de dados em JSON e restauração |
| `/admin/jornada` | `src/pages/admin/jornada.astro` | Painel do Mestre da Jornada, código de runas e aprovação de conquistas |

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

### [16/09/2026] — Sincronização Dinâmica do Modal de Produto com o Painel Administrativo (`ProductModal`)
- **Dados 100% Dinâmicos no Modal:** Atualizado [`ProductModal.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/ProductModal.astro) para que todos os campos (foto principal, galeria, nome, sabor/subtítulo, categoria, preço, volume em ml `p.volume_ml`, °GL `p.graduacao_gl`, Brix `p.brix`, ingredientes, notas aromáticas, descrição, sugestões de consumo e quantidade/alerta de estoque) sejam renderizados dinamicamente a partir dos dados atualizados no banco do Supabase / Área Administrativa (`/admin/produtos`).

### [16/09/2026] — Resolução de Produtos no Modal por ID (`ProductModal` & `RituaisDegustacao`)
- **Abertura de Modal de Todos os Sabores:** Atualizado o manipulador do evento `open-product-modal` em [`ProductModal.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/ProductModal.astro) para incluir resolução dinâmica por ID através de fallback local (`FALLBACK_PRODUCTS`) e Supabase (`fetchProducts()`), mesmo quando a poção não possui card renderizado na grade principal.
- **Animação FLIP a partir dos Botões:** Atualizado [`RituaisDegustacao.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/RituaisDegustacao.astro) para passar `originElement: btn`, expandindo o modal suavemente a partir do botão de poção clicado nos rituais.

### [16/09/2026] — Ajuste no Cursor da Dobra Rituais de Degustação (`CustomCursor`)
- **Proteção para Elementos Recolhidos:** Atualizada a função `isTargetActuallyVisible()` em [`CustomCursor.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/CustomCursor.astro) para ignorar elementos dentro de rituais recolhidos (`.ritual-card:not(.is-active)`), além de checar a opacidade/visibilidade de todos os elementos pais. O círculo externo dourado engloba apenas os botões de poção do ritual ativamente expandido.

### [16/09/2026] — Efeito de Reflexo Diagonal no Logo (`Header` & `Footer`)
- **Reflexo Metálico em Hover:** Adicionada a classe `.logo-shimmer-wrapper` e o elemento `.logo-shimmer-sheen` em [`Header.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/Header.astro) e [`Footer.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/Footer.astro). Ao passar o mouse sobre a logo, uma faixa diagonal de luz luminosa dourada desliza da esquerda para a direita recortada com a máscara exata da logo (`-webkit-mask-image`).



### [16/09/2026] — Refinamento de Englobamento & Atração Magnética do Cursor (`CustomCursor`)
- **Atração Magnética & Englobamento Restaurados:** Corrigida a função `getActiveOverlayOrModal()` em [`CustomCursor.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/CustomCursor.astro). O seletor genérico anterior `[id^='modal-']` capturava falsos positivos de elementos internos do modal (como `#modal-title`, `#modal-img`, `#modal-description`) que não possuíam a classe `.hidden` individualmente, fazendo com que a checagem considerasse um modal ativo em tempo integral. A consulta foi restrita exclusivamente aos containers de modal reais (`#modal-produto`, `#modal-pedido`, `#modal-kit`, `#modal-depoimento`, `#cart-drawer-overlay`, `#product-modal-container`, `#age-gate`), restaurando 100% o englobamento e a atração magnética ("imã") de 70px para todos os botões, links e formulários do site.
- **Englobamento Moldado:** Elementos redondos (ícones WhatsApp/Instagram, botão do caldeirão, botões `✕` e `+`/`-`) são englobados como um anel circular perfeito. Botões retangulares, inputs, links e cards são englobados exatamente no contorno dos seus limites com raio de curvatura correspondente.

### [16/09/2026] — Estilização dos Campos Preenchíveis & Isolamento de Modais no Cursor
- **Campos Preenchíveis em Cinza Chumbo Profundo:** Adicionadas regras globais em [`global.css`](file:///d:/projetos%20antigravity/site_alquimista/src/styles/global.css) aplicando a cor `#1a1c23` (cinza chumbo profundo com borda dourada suave) para todos os `input`, `select` e `textarea`, garantindo excelente contraste com a página sem ser 100% preto.
- **Isolamento do Cursor nos Modais:** Refatorada a função `getActiveOverlayOrModal()` em [`CustomCursor.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/CustomCursor.astro) para verificar rigorosamente apenas overlays e modais abertos e visíveis (sem falsos positivos em elementos ocultos como `#cart-drawer-panel`). O englobamento magnético de botões e links voltou a funcionar em 100% da aplicação quando nenhum modal está aberto.

### [16/09/2026] — Ilustração do Alquimista Mestre no Carregamento da Área Administrativa (`/admin`)
- **Carregador Oficial:** Atualizada a tela de carregamento em [`AdminLayout.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/layouts/AdminLayout.astro) para utilizar a ilustração dourada do Alquimista Mestre (`public/assets/alquimista-mestre.png`) com pulso luminoso (`animate-pulse`) e anel de expansão.

### [16/09/2026] — Habilitação do Cursor Personalizado no Login e Área Administrativa
- **Cursor Unificado:** Removidas as exceções CSS e JS em [`CustomCursor.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/CustomCursor.astro). O cursor personalizado em tom dourado (`#B28C46`) agora opera perfeitamente em 100% das páginas do site, incluindo a rota de login (`/admin/login`) e todo o painel mestre (`/admin*`).

### [16/09/2026] — Atualização do Ícone de Entrada do Alquimista (`/admin/login`)
- **Ilustração Oficial do Alquimista Mestre:** Substituído o ícone padrão de alambique (`⚗`) na página de login (`src/pages/admin/login.astro`) pela ilustração artesanal dourada do Alquimista Mestre (`public/assets/alquimista-mestre.png`), com moldura circular, efeito hover e brilho dourado nobre.

### [16/09/2026] — Implementação da Suíte Administrativa Completa em Astro (`/admin`)
1. **Área Administrativa 100% em Astro & Supabase:**
   - Criado [`src/layouts/AdminLayout.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/layouts/AdminLayout.astro) com autenticação client-side no Supabase (`https://bktegbisdaqdhpqtxqxy.supabase.co`), validação de papel na tabela `user_roles`, carregamento com alambique girando e tela nobre de acesso negado.
   - Criado [`src/components/admin/AdminNav.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/admin/AdminNav.astro) com navegação lateral, glifos temáticos, destaque de rota ativa e encerramento de sessão imediato.
   - Criado [`src/components/admin/MetricCard.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/admin/MetricCard.astro) com cantoneiras sutis e tipografia display `Cinzel`.
2. **Rotas e Funcionalidades Administrativas:**
   - `/admin/login`: Entrada do Alquimista integrada ao Supabase Auth (`signInWithPassword`).
   - `/admin`: Dashboard consolidado com contadores em tempo real (poções ativas, estoque total, pedidos, depoimentos) e alerta destacado para produtos esgotados.
   - `/admin/produtos`: Central de controle dos cards e modais técnicos (`ProductModal.astro`), permitindo editar Brix, °GL, notas aromáticas, sugestões de consumo, ingredientes, controle de estoque (Manual vs GerenciApp) e fotos.
   - `/admin/pedidos`: Listagem de `site_orders` com busca rápida, filtros de status, lançamento manual de pedidos e exportação CSV.
   - `/admin/kits`: Gestão de preços de kits em `kit_prices`.
   - `/admin/depoimentos`: Cadastro, edição e visibilidade de avaliações em `testimonials`.
   - `/admin/destaques`: Curadoria manual e automática das poções da primeira dobra (`featured_config`).
   - `/admin/backup`: Exportação e download completo de dados em formato JSON com importador de restauração.
   - `/admin/jornada`: Painel do Mestre para validação de evidências fotográficas e configuração do código da runa em `app_config`.
3. **Instalação e Integração do Cliente Oficial:**
   - Instalado pacote `@supabase/supabase-js`.
   - Atualizado [`src/integrations/supabase/client.ts`](file:///d:/projetos%20antigravity/site_alquimista/src/integrations/supabase/client.ts) com a instância oficial configurada para `https://bktegbisdaqdhpqtxqxy.supabase.co`.
   - Garantida resiliência para modo de desenvolvimento com fallbacks oficiais em [`src/lib/data.ts`](file:///d:/projetos%20antigravity/site_alquimista/src/lib/data.ts).

### [16/09/2026] — Badge "Sob Encomenda" & Tooltip Alquímico em Monte seu Kit
- **Badge Proporcional no Canto Superior Direito:** Inserido o badge oficial `variant="ember"` (`.badge-pill-ember`, âmbar luminoso) nos mini-cards de poções que requerem maceração especial (`needsPrep(p)` para poções cremosas com maceração sob demanda) nas grades de escolha do Kit Degustação (`.deg-product-pick`) e do Kit Presenteável (`.pres-liquor-pick`) em [`src/pages/monte-seu-kit.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/monte-seu-kit.astro).
- **Tooltip Flutuante Interativo ao Hover:** Ao passar o mouse sobre o mini-card, um tooltip estilizado com tema ouro/obsidiana surge suavemente acima do card com o texto:
  > *"Preparado sob demanda (2 dias de maceração)"*

### [16/09/2026] — Padronização do Badge "Lote Esgotado" na Página Monte seu Kit
- **Unificação com o Catálogo de Poções:** Integrado o componente [`Badge.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/Badge.astro) com a variante oficial `variant="ember"` (`.badge-pill-ember`, com brilho âmbar luminoso, tipografia mono e borda dourada/âmbar) nas seleções de kit Degustação e Presenteável em [`src/pages/monte-seu-kit.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/monte-seu-kit.astro).
- **Proporcionalidade Perfeita nos Mini Cards:** Ajustada a escala (`size="sm"`, `!text-[10px]`, padding compacto `!py-0.5 !px-2` e `scale-95 sm:scale-100`) para que a etiqueta fique perfeitamente centralizada e proporcional aos mini-cards sem transbordar ou ocultar os detalhes de cada garrafa.

### [16/09/2026] — Remoção da Rota e Página `/kits`
- **Exclusão de Rota Redundante:** O arquivo `src/pages/kits.astro` foi removido em favor do fluxo interativo completo em [`src/pages/monte-seu-kit.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/monte-seu-kit.astro).
- **Atualização de Links Globais:**
  - Header ([`src/components/Header.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/Header.astro)): Removido item `/kits` do menu.
  - Footer ([`src/components/Footer.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/Footer.astro)): Substituído `/kits` por `/monte-seu-kit` ("Monte seu Kit").
  - Home ([`src/pages/index.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/index.astro)): Botão da dobra de revelação de kits atualizado para direcionar diretamente para `/monte-seu-kit`.

### [16/09/2026] — Padronização Visual das Bordas Levemente Arredondadas em Todos os Cards (`rounded-md`)
- **Harmonização Global de Bordas:** Todos os cards, blocos de produtos, mini-cards e caixas de seleção da aplicação foram unificados com a mesma curvatura sutil e nobre de `rounded-md` (`0.375rem` / `6px`), mantendo perfeita consistência com os `ProductCard.astro`, `kits.astro` e `RituaisDegustacao.astro`:
  - **Kits e Wizard ([`src/pages/monte-seu-kit.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/monte-seu-kit.astro)):** Padronizados os cards de escolha de modo (`.kit-mode-card`), mini-cards de poções (`.deg-product-pick`), cards do trio selecionado (`.deg-trio-card`), cards do licor central (`.pres-liquor-pick`), acompanhamentos (`.pres-acomp-pick`), caixas (`.pres-box-pick`), containers de resumo de etapas e container de CTA pós-adição.
  - **Contato ([`src/pages/contato.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/contato.astro)):** Cards de atendimento (WhatsApp, Instagram, Retirada).
  - **Sobre ([`src/pages/sobre.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/sobre.astro)):** Molduras de fotos da jornada e card de destaque (*"Feito com (c)alma"*).
  - **Manutenção & Age Gate ([`src/pages/manutencao.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/manutencao.astro), [`src/components/AgeGate.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/AgeGate.astro)):** Box central de citação e modal de confirmação de idade.

### [16/09/2026] — Animação de Seleção do Trio & Parallax 3D na Página Monte seu Kit
1. **Transição Dinâmica de Seleção no Kit Degustação ([`src/pages/monte-seu-kit.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/monte-seu-kit.astro)):**
   - **Ao escolher os 3 sabores:** O grid completo com todos os sabores se oculta através de uma animação suave e discreta (`opacity: 0, scale: 0.96`), dando lugar à exibição exclusiva das **3 mini-poções escolhidas** dispostas lado a lado em cards compactos (`max-w-lg mx-auto`).
   - **Botão "✕" de Remoção nos Cards:** Cada um dos 3 cards exibe um botão "✕" circular no canto superior direito (`absolute top-1.5 right-1.5`), permitindo desmarcar qualquer sabor individualmente.
   - **Retorno Imediato dos Sabores:** Ao remover qualquer um dos 3 sabores (passando a 2/3), a visualização dos 3 cards se recolhe suavemente e toda a grade de sabores reaparece no tamanho padrão com animação fluida e discreta.
   - **Suporte a Sabores Repetidos:** O assistente lida com repetições (ex: 2x Butiá + 1x Café), gerando os 3 slots com suas respectivas fotos e controles de exclusão.
2. **Parallax 3D Suave nos Cards de `/monte-seu-kit` ([`src/pages/monte-seu-kit.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/monte-seu-kit.astro)):**
   - **Cards de Modo Principal (`#pick-degustacao-btn`, `#pick-presenteavel-btn`):** Inclinação tridimensional sutil (`perspective(800px)`, rotação máxima de ~5° nos eixos X/Y, `translateY(-4px)`), sombra dourada dinâmica e deslocamento interno da fotografia (`translate3d` + `scale(1.05)`).
   - **Mini Cards de Produtos e Etapas (`.deg-product-pick`, `.deg-trio-card`, `.pres-liquor-pick`, `.pres-acomp-pick`, `.pres-box-pick`):** Efeito de inclinação proporcional e leve (`perspective(600px)`, rotação máxima de ~3.5°, `translateY(-2px)`), foco de sombra suave e micro-translação da imagem interna.
   - **Performance & Responsividade:** Ativo apenas em dispositivos com suporte a hover fino (`@media (hover: hover) and (pointer: fine)`), com desaceleração e amortecimento suave ao sair (`cubic-bezier(0.2, 0, 0.2, 1)`).
   - **Sincronização com o Cursor Customizado:** O contorno do `CustomCursor` acompanha dinamicamente a rotação e inclinação 3D de cada card ativo.
3. **Atualização de Textos e Preços dos Kits:**
   - Inseridas as descrições oficiais e valores para o *Kit Degustação* (R$ 20) e *Kit Presenteável* (a partir de R$ 110).
4. **Padronização Global do Cursor Customizado em Cards ([`src/components/CustomCursor.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/CustomCursor.astro)):**
   - O contorno externo do cursor agora fica 100% transparente (`opacity: 0`, `cursor-hidden`) de forma instantânea e unificada em **todos os cards do site** (`.product-card`, `.kit-mode-card`, `.deg-product-pick`, `.deg-trio-card`, `.pres-liquor-pick`, `.pres-acomp-pick`, `.pres-box-pick`), permitindo que a própria borda iluminada do card e o ponto central do cursor conduzam a interação com máxima elegância e sem sobreposição retangular externa. Ações pontuais dentro dos cards (como o botão circular "✕" de remoção) continuam sendo magneticamente englobadas com precisão.

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
   - **Ao passar o mouse (`:hover` com cursor tracking):** Efeito *spotlight* em tempo real (`.header-spotlight-bg` e `.header-spotlight-border`) com transição suave de opacidade (`transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)`): surge com fade-in suave na posição do mouse e desaparece com fade-out gradual na posição exata de saída ao retirar o cursor do Header (`mouseleave`).

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
  3. **Ritual III (À Mesa & Harmonização):** Harmonizações com tábuas de queijos nobres (cabra, ricota), sobremesas caramelizadas (Doce de Leite como calda sobre sorvete/pudim) e Chocolate 50% com café.
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

### [15/09/2026] — Reordenação de Seções na Home (Story Quote pós-Depoimentos)
- A dobra poética/manifesto *"Feito com (c)alma"* foi movida para o fechamento da página inicial ([`src/pages/index.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/index.astro)), posicionando-se logo abaixo do carrossel de avaliações dos clientes e servindo como um convite intimista para conhecer a história do Alquimista antes do rodapé.

### [15/09/2026] — Implementação da Seção "Fixed Background Reveal" para Kits
- Substituído o banner anterior de kits por uma experiência cinematográfica de **Fixed Background Reveal** (`[clip-path:inset(0)]` com viewport fixo) em [`src/pages/index.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/index.astro):
  1. **Divisória Nobre:** Linha fina dourada contínua de uma ponta à outra posicionada imediatamente após a seção de Rituais de Degustação.
  2. **Efeito Janela de Revelação:** A fotografia da caixa de kits (`/assets/caixa-premium.png`) permanece perfeitamente estática no viewport enquanto a dobra do site rola sobre ela, revelando-a organicamente sem distorção, sem zoom e sem cálculos pesados de parallax.
### [15/09/2026] — Refinamento do Manifesto Home e Padronização do Cursor Windows #B28C46
1. **Manifesto Home ([`src/pages/index.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/index.astro)):**
   - Atualizado texto com quebra de linha equilibrada em 3 linhas antes de *"pois aqui tudo é"*.
   - Tipografia da citação ajustada para `Lato` itálico com aspas discretas em cor de acento no início.
   - Espaçamento inferior reduzido para aproximar a frase do título *"FEITO COM (C)ALMA."*.
### [15/09/2026] — Refinamento das Regras de Interação e Atração Magnética do Custom Cursor (#B28C46)
- **Componente Dedicado ([`src/components/CustomCursor.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/CustomCursor.astro)) integrado globalmente em [`src/layouts/Layout.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/layouts/Layout.astro):**
  1. **Ponto Central (Dot):** Permanece 100% visível em todas as situações (inclusive durante o hover), rastreando a coordenada física do mouse instantaneamente com 0 lag. O cursor nativo do sistema operacional é estritamente ocultado (`cursor: none !important`), impedindo que a mãozinha padrão do navegador apareça.
  2. **Validação Estrita de Visibilidade & Accordions:** Elementos ocultos, recolhidos ou com dimensões zeradas **não são englobados**. Nos Rituais de Degustação, botões de poções dentro de rituais recolhidos são ignorados; apenas os botões do ritual atualmente **aberto e visível** (`.is-active`) acionam o englobamento magnético.
  3. **Atração Magnética de 100px (Magnetic Pull):** Ao aproximar o mouse a até 100px de distância de qualquer elemento visível e englobável (botões, cards de produto, poções abertas dos rituais, ícone do caldeirão ou WhatsApp), o anel externo é puxado magneticamente em direção ao elemento e se molda suavemente à sua borda. Ao afastar além de 100px, solta-se suavemente de volta ao anel circular livre.
  4. **Links e Logo do Header & Footer + Área de Rituais:** Ao passar sobre a logo, links do Header/Footer ou sobre a área/fundo dos cards de rituais, o círculo externo **não engloba** os elementos; ele permanece livre e transiciona suavemente para **50% de opacidade** com efeito de fade-in e retorna com fade-out.
  5. **Cards de Produto (Atração Magnética de 100px & Ocultação no Hover Direto):** O círculo externo comporta-se normalmente com cards de produto (`.product-card`): ao se aproximar a até 100px do card, o círculo é atraído magneticamente e engloba o card com **100% de opacidade** (contorno dourado visível sem transparência). Apenas no momento em que o ponto central **sobrepõe fisicamente o card** (hover direto), o círculo externo fica **instantaneamente com transparência 0%** (`opacity: 0 !important`), permitindo que apenas o ponto central acompanhe o mouse e que a própria borda do card (`#B28C46`) assuma o contorno iluminado junto ao efeito de paralaxe 3D e reflexo (*glare*). Ao sair do card (voltando à zona de 100px), o círculo reaparece englobando o card até o afastamento total.
  6. **Brilho do Mouse nos Cards (Glare Refinado):** A área de brilho radial (`.product-glare`) gerada pelo mouse nos cards foi reduzida para um raio conciso e elegante de 130px com queda suave e translúcida, mantendo o visual limpo sem ofuscar a arte do produto.
  7. **Ícones Circulares (WhatsApp FAB, Instagram Footer e Caldeirão):** O botão flutuante do WhatsApp, o botão do Instagram no footer (`a[aria-label="Instagram do Alquimista"]`) e o botão do Caldeirão no header são englobados de forma **perfeitamente redonda** (`border-radius: 9999px`).
  8. **Botão de CTA do Vídeo Hero ("Conheça as Poções"):** O botão `#glassCtaBtn` (`.glass-cta-button`) exibido sobre o vídeo cinematográfico da Home é plenamente reconhecido pelo cursor e englobado de forma rente à sua borda com atração magnética quando visível após o scroll.
  9. **Modais e Aba Lateral do Caldeirão (Isolamento Estrito):** Quando a aba lateral do carrinho (`#cart-drawer-panel`) ou qualquer modal (`#product-modal-card`, diálogos) estiver aberto, o cursor **engloba exclusivamente os elementos presentes dentro do modal/gaveta ativo**. Qualquer elemento da página de fundo é ignorado pela detecção e atração magnética.

### [15/09/2026] — Refinamento do Modal de Detalhes da Poção (`ProductModal.astro`)
- **Tipografia do Sabor Aumentada:** O texto do sabor (`#modal-product-sabor`) foi ampliado para `text-lg md:text-xl lg:text-2xl` em tom dourado suave (`var(--gold-soft)`), proporcionando leitura nobre e destaque imediato.
- **Remoção do Selo Real:** O badge *"Selo Real"* foi removido da barra de garantias alquímicas, mantendo apenas *"100% Orgânico"* e *"Maceração 40 Dias"*.
- **Eliminação de Scroll Horizontal:** O modal e suas colunas foram blindados com `overflow-x-hidden` e layout responsivo que impede qualquer overflow ou barra de rolagem lateral.
- **Caixas de Estatísticas Técnicas & Tooltips Explicativos:**
  - Inserido indicador discreto `(?)` em dourado no canto superior direito de cada caixa técnica.
  - **Graduação:** Tooltip informativo ao passar o mouse: *"Mede a intensidade do álcool no licor. Define o equilíbrio entre calor e sabor."*
  - **Brix (Açúcar):** Tooltip informativo ao passar o mouse: *"Indica o teor de açúcar da bebida: quanto maior o número, mais doce e encorpado é o licor."*
  - **Classificação:** Tooltip informativo: *"Categoria oficial baseada no teor de açúcar e densidade do licor."*

### [16/09/2026] — Correção do Contorno do Custom Cursor no Botão "Avise-me quando voltar" (`#modal-wa-btn`)
- **Correção da Morfologia do Cursor em Botões Retangulares:**
  1. O seletor de elementos redondos/circulares (`roundCircularSelector`) em [`src/components/CustomCursor.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/CustomCursor.astro) continha anteriormente seletores genéricos como `a[href*="whatsapp.com"]`, o que fazia com que o botão retangular de *"Avise-me quando voltar"* (`#modal-wa-btn`) dentro do modal de produto fosse erroneamente identificado como um ícone circular e transformado em um círculo gigante com `border-radius: 9999px`.
  2. O `roundCircularSelector` foi refinado para atingir estritamente os ícones circulares autênticos (`.whatsapp-fab`, `.btn-icon-round`, botões de fechar, seletores de quantidade `+/-`, caldeirão no header e redes sociais do footer).
  3. Adicionada salvaguarda explícita na verificação `isRound` para excluir qualquer botão retangular (`#modal-wa-btn`, `.btn-outline`, `.btn-primary`, etc.), garantindo que o anel externo do cursor se molde com precisão matemática ao contorno retangular e ao `border-radius` exato do botão.

### [16/09/2026] — Refinamento Tipográfico da Sugestão de Consumo (`ProductModal.astro`)
   - **Aumento de Escala & Legibilidade:**
  - O texto em itálico de sugestão de consumo (`#modal-sugestoes-text`) foi ampliado de `text-xs md:text-sm` para `text-sm md:text-base` com cor `var(--cream)` e preenchimento `p-3.5`, proporcionando maior conforto de leitura e destaque da tipografia `Cormorant Garamond` (serif itálico).

### [16/09/2026] — Implementação do Sistema "Avise-me quando voltar" (Alerta de Reposição de Estoque)
- **Integração de Cadastro de Contato e Alerta Alquímico:**
  1. **Frontend no Modal de Produto ([`src/components/ProductModal.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/ProductModal.astro)):**
     - Quando o produto estiver sem estoque (`estoque <= 0`), o botão *"Avise-me quando voltar"* aciona a abertura de um micro-formulário integrado sem recarregar a página.
     - Campos: **WhatsApp com DDD** (com máscara dinâmica automática `(XX) XXXXX-XXXX`) e **Nome** (opcional).
     - Estados de feedback: validação visual, estado de carregamento com spinner no botão e transição suave para card de confirmação com estética alquímica.
     - Link direto no card de sucesso caso o cliente decida encomendar a poção sob demanda pelo WhatsApp imediatamente.
  2. **Modelagem e API no Supabase ([`src/lib/data.ts`](file:///d:/projetos%20antigravity/site_alquimista/src/lib/data.ts)):**
     - Interface `StockAlert` e função assíncrona `createStockAlert()` integradas com a REST API do Supabase (`/rest/v1/stock_alerts`).
     - Tabela `stock_alerts` com suporte a `product_id`, `product_name`, `customer_name`, `customer_contact`, `contact_channel`, `status` (`pending` / `notified`) e `created_at`.

### [16/09/2026] — Isolamento Estrito do Custom Cursor sobre o Header (`CustomCursor.astro`)
- **Bloqueio de Englobamento do Corpo da Página quando no Header:**
  1. Adicionada a função `isMouseOverHeader(x, y)` para detectar com exatidão quando as coordenadas do ponto central (`dot`) do cursor estão sobre a área do cabeçalho fixo (`#site-header`).
  2. Quando o cursor estiver sobre o Header:
     - Elementos da página (cards de produto, botões, CTAs do Hero, filtros) são **estritamente ignorados** pela atração magnética de 100px (`findMagneticTarget`) e pelo englobamento direto (`onMouseMove`).
     - Se o cursor transicionar de um elemento do corpo diretamente para o Header, o anel externo libera imediatamente qualquer forma anterior, retornando ao círculo suave base.
     - Elementos nativos do próprio Header (como o ícone do Caldeirão `#cart-toggle-btn` e links de navegação com soft hover) continuam respondendo normalmente.

### [16/09/2026] — Iluminação Instantânea da Borda dos Cards de Produto no Hover (`ProductCard.astro`)
- **Remoção de Delay na Transição de Cor da Borda:**
  1. A transição de `border-color` dos cards de produto ([`src/components/ProductCard.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/ProductCard.astro)) foi ajustada para **0s** no estado `:hover` e `onMouseEnter`.
  2. No momento exato em que o ponto central do cursor sobrepõe o card no desktop, a borda dourada (`#B28C46`) e o efeito de glow (`box-shadow`) iluminam-se **instantaneamente sem qualquer delay perceptível**.
  3. No `onMouseLeave`, a transição de saída suave (`0.35s ease`) foi preservada para que o contorno apague de forma gradual e elegante ao afastar o ponteiro.

### [16/09/2026] — Atualização do Link Oficial do Instagram (`alquimista.licores`)
- **Atualização de URL e Identificador Social:**
  1. O link do Instagram no objeto global `SITE.instagram` em [`src/lib/data.ts`](file:///d:/projetos%20antigravity/site_alquimista/src/lib/data.ts) foi atualizado para `https://www.instagram.com/alquimista.licores`.
  2. Atualizados todos os pontos de contato, incluindo o botão de rede social do rodapé ([`src/components/Footer.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/Footer.astro)) e o canal oficial na página de atendimento ([`src/pages/contato.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/pages/contato.astro)).

### [16/09/2026] — Padronização das Interações de Cursor em Cards & Mini Cards (`CustomCursor.astro` & `monte-seu-kit.astro`)
- **Atração Magnética na Aproximação & Transparência Instantânea com Englobamento Contínuo:**
  1. **Aproximação (Zona de Proximidade 100px):** Ao se aproximar de qualquer card do site (vitrine de poções, os dois cards principais de modo `/monte-seu-kit` e os mini cards de sabores/acompanhamentos/caixas do montador de kits), o anel externo do cursor é atraído magneticamente e **engloba o card com precisão de borda** (`rounded-md` / `6px` de curvatura).
  2. **Hover Direto (Ponto Central sobre o Card):** No momento em que o ponto central (`dot`) entra na área física de qualquer card, o anel externo **continua englobando o card** em segundo plano (mantendo as dimensões, escala, proporção e rastreamento de inclinação 3D sincronizados), porém fica **100% transparente instantaneamente** (`opacity: 0 !important; visibility: hidden !important; transition: opacity 0s !important;`). Dessa forma, ao mover o mouse para fora do card de volta à zona de proximidade, o anel reaparece imediatamente na forma exata do card sem saltos (*jumps*) ou transições de redimensionamento indesejadas.
  3. **Ações Internas dos Cards:** Botões internos (como o botão `✕` para remover poções e links de sugestão) possuem prioridade máxima de englobamento; ao posicionar o cursor sobre o `✕`, o anel externo reaparece englobando o botão de forma redonda (`9999px`).
  4. **Mini Cards com Lote Esgotado:** Mini cards esgotados (`estoque <= 0`) são blindados como não clicáveis e não selecionáveis (`pointer-events-none`, `disabled`, `opacity-60`), não acionando atração magnética nem alteração no fluxo de montagem.

### [16/09/2026] — Bloqueio de Englobamento para Elementos Encobertos pelo Header (`CustomCursor.astro`)
- **Blindagem de Elementos Sob o Cabeçalho Fixo:**
  1. **Detecção de Oclusão pelo Header:** Adicionada regra em `isTargetActuallyVisible()` para verificar se o limite inferior do elemento (`rect.bottom`) está acima ou alinhado à base do cabeçalho (`rect.bottom <= headerRect.bottom + 2`).
  2. **Regra de Oclusão Total vs Parcial:** Elementos que tiverem rolado para **completamente debaixo do Header** são automaticamente desqualificados e **não são englobados** pelo cursor magnético.
  3. **Exposição Parcial Permitida:** Apenas quando pelo menos uma parte do elemento estiver **visível e exposta além da borda inferior do Header** (`rect.bottom > headerRect.bottom + 2`), o elemento torna-se elegível para englobamento e atração magnética.

### [16/09/2026] — Ocultação Universal Estrita do Cursor Nativo do Sistema (`global.css` & `CustomCursor.astro`)
- **Substituição Total de Qualquer Ponteiro Nativo:**
  1. Adicionada regra universal `@media (hover: hover) and (pointer: fine) { html, body, *, *::before, *::after { cursor: none !important; } }` em [`src/styles/global.css`](file:///d:/projetos%20antigravity/site_alquimista/src/styles/global.css) e no `<style is:global>` de [`src/components/CustomCursor.astro`](file:///d:/projetos%20antigravity/site_alquimista/src/components/CustomCursor.astro).
  2. Garante que em **todas as áreas interativas** (botões, links, áreas com tooltip `cursor: help`, elementos desativados `cursor: not-allowed`, seletores de quantidade, inputs e textos), nenhum ponteiro nativo do sistema operacional (seta, mãozinha de link, barra de texto I-beam, ícone de ajuda `?`, etc.) seja exibido, mantendo exclusivamente o **ponto central dourado e o círculo englobador** do cursor personalizado em 100% da experiência de navegação.

### [16/09/2026] — Refinamento da Página Sobre (`src/pages/sobre.astro`)
- **Atualização dos 4 Capítulos Oficiais & Novas Fotografias:**
  1. **Narrativa & Fotografia Oficial Alquímica em 4 Capítulos:**
     - **A ORIGEM:** Caderno de anotações com pena, vela e ingredientes botânicos (`/assets/sobre-origem.jpg`).
     - **A FILOSOFIA:** Rótulo nobre em close-up com selo dourado do Alquimista (`/assets/sobre-filosofia.jpg`).
     - **O PROCESSO:** Infusão artesanal de bananas e canela em maceração lenta (`/assets/sobre-processo.jpg`).
     - **O CICLO:** Oficina de botica com garrafas higienizadas para novo ciclo (`/assets/sobre-ciclo.jpg`).
  2. **Remoção de Badges & Linhas de Contorno das Imagens:** Removida a barra de badges (*100% Orgânico*, *Maceração 40 Dias*, *Selo Real*, *Serra Catarinense*) e eliminadas as bordas/linhas douradas externas (`border border-[var(--gold)]/20 gold-glow`) dos cards de imagem, deixando a fotografia pura com cantos suavemente arredondados (`rounded-md`).
  3. **Animações de Scroll (Fade In + Blur In):** Sistema de revelação progressiva (`.sobre-reveal`) acionado por `IntersectionObserver` compatível com View Transitions (`astro:page-load`). Conforme a página é rolada, cada bloco surge com transição cinematográfica combinando desfoque gradual (`filter: blur(14px) -> blur(0px)`), opacidade (`0 -> 1`) e deslocamento vertical (`translateY(32px)`).

---

## 8. 🗄️ Arquitetura de Banco de Dados Supabase (Loja & A Jornada do Alquimista)

Este guia consolida todas as conexões, variáveis, tabelas, regras de segurança e rotinas transacionais para referência técnica imediata e futuros desenvolvimentos de CRUD.

### 🌐 Endereços & Buckets Oficiais
- **Projeto Supabase:** `https://bktegbisdaqdhpqtxqxy.supabase.co` (ID do Projeto: `bktegbisdaqdhpqtxqxy`)
- **Bucket `product-images` (Público):** `https://bktegbisdaqdhpqtxqxy.supabase.co/storage/v1/object/public/product-images/`
- **Bucket `jornada-evidencias` (Privado):** Utilizado para upload de fotos comprobatórias de conquistas e missões da Jornada do Alquimista.

### 🔐 As Três Formas de Conexão com o Banco
1. **Navegador (Público / Client-side):**
   - Utiliza a chave pública `anon` (`PUBLIC_SUPABASE_ANON_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY`).
   - Respeita rigorosamente o **Row Level Security (RLS)**.
   - Usado para leitura do catálogo de poções, kit prices, depoimentos e escuta de eventos em tempo real (`site_orders` status).
   - Implementado em: [`src/lib/data.ts`](file:///d:/projetos%20antigravity/site_alquimista/src/lib/data.ts) e [`src/integrations/supabase/client.ts`](file:///d:/projetos%20antigravity/site_alquimista/src/integrations/supabase/client.ts).
2. **Servidor Privilegiado (Server-side / Service Role):**
   - Utiliza a chave secreta `SUPABASE_SERVICE_ROLE_KEY` (nunca exposta ao frontend).
   - Ignora RLS para recalcular preços oficiais de pedidos, registrar compras com idempotência (`request_id`), autenticar administradores e gerenciar 95% do motor da Jornada do Alquimista via sessões seguras por cookie.
3. **Banco Chamando o Site (Webhooks com `pg_net`):**
   - Gatilhos internos disparados pelo PostgreSQL via extensão `pg_net` (ex: alerta de estoque baixo/zerado chamando `POST /api/public/hooks/stock-zero` com validação de `STOCK_HOOK_SECRET`).

---

### 📊 Mapeamento Completo de Tabelas & CRUD

#### A. Tabelas do E-Commerce / Loja Oficial
| Tabela | Papel | Acesso / Permissões | Utilização no Código |
|---|---|---|---|
| `products` | Catálogo oficial de 12 poções, volumes, °GL, Brix e estoque | Leitura Pública; Escrita Admin | Vitrine (`/pocoes`), montador de kits (`/monte-seu-kit`), home e checkout |
| `kit_prices` | Tabela de preços dinâmicos para kits Degustação e Presenteável | Leitura Pública; Escrita Admin | `/monte-seu-kit` e recálculo transacional no servidor |
| `site_orders` | Registro central de pedidos com código de 6 dígitos único | Leitura Admin; Escrita Servidor | Criação de pedidos com idempotência e avanço na Jornada |
| `stock_alerts` | Fila de contatos ("Avise-me quando voltar") para produtos esgotados | Inserção Pública (anônimo); Leitura Admin | `ProductModal.astro` e `createStockAlert()` |
| `testimonials` | Depoimentos e avaliações autênticas dos clientes | Leitura Pública; Escrita Admin | Carrossel da Home |
| `featured_config` | Configuração de poções destacadas na primeira dobra | Leitura Pública; Escrita Admin | Vitrine de Destaques na Home |
| `app_config` | Parâmetros e segredos de sistema (webhooks, códigos de runa) | Acesso estrito por Servidor | Rotinas internas e missão Caçador de Runas |
| `push_subscriptions` | Inscrições de Web Push dos clientes | Por usuário / Sessão | Notificações push de volta de estoque |
| `user_roles` | Perfis de acesso administrativo (`admin`, `mestre`) | Consulta por `has_role()` | Painel administrativo e governança |

#### B. Tabelas da "Jornada do Alquimista" (Jogo & Fidelidade)
| Tabela | Papel | Detalhes Técnicos |
|---|---|---|
| `clientes` | Identificação de clientes pelo número de telefone | Chave por telefone (sem senha), XP total, nível alquímico e cenário atual |
| `progresso` | Histórico de avanço em cada passo da narrativa | Passo (0 a N), cenário concluído, data e detalhes transacionais |
| `bolsa` | Inventário de itens ganhos pelo cliente | Ingredientes, frascos, artefatos, pergaminhos e poções |
| `jornada_conquistas` | Catálogo de insígnias e conquistas disponíveis | Conquistas automáticas, fotos/evidências, runas e indicações |
| `conquistas_desbloqueadas` | Registro de conquistas obtidas por cliente | Data de desbloqueio e bônus de XP concedido |
| `receitas_fabricadas` | Livro de receitas alquímicas transmutadas | Registra as combinações de poções e itens concluídas |
| `recompensas_liberadas` | Brindes físicos e cupons desbloqueados | Status: `disponivel`, `solicitada`, `entregue` |
| `solicitacoes` / `jornada_solicitacoes` | Pedidos de avanço ou fotos de evidências | Fila de aprovação para o painel `/mestre` |
| `jornada_pedidos_processados` | Tabela de idempotência de pedidos | Garante que o mesmo pedido não gere avanço duas vezes |
| `eventos` | Trilha de auditoria e log de eventos da jornada | Registra marcos e transições do jogador |

---

### ⚙️ Procedimentos Armazenados (`SECURITY DEFINER`)
- `create_site_order_transactional`: Criação atômica de pedido com código de 6 dígitos único.
- `processar_avanco_pedido_v3`: Procedimento acionado na confirmação de pagamento do pedido que avança automaticamente passos, concede XP e distribui itens na bolsa do cliente.
- `increment_xp`: Incremento transacional seguro de experiência no perfil do cliente.
- `processar_solicitacao_conquista_v2`: Validação com upload de foto comprobatória no bucket privado `jornada-evidencias`.
- `validar_codigo_runa`: Procedimento para validação dinâmica do código secreto da missão "Caçador de Runas" via `app_config.codigo_runa_ativo`.
- `has_role`: Função de segurança para autorização de administradores e mestres da jornada.

---

### 📦 Módulos de Código Criados
- **Modelos TypeScript:** [`src/integrations/supabase/types.ts`](file:///d:/projetos%20antigravity/site_alquimista/src/integrations/supabase/types.ts)
- **Cliente Supabase REST:** [`src/integrations/supabase/client.ts`](file:///d:/projetos%20antigravity/site_alquimista/src/integrations/supabase/client.ts)
- **Camada de Dados do Site:** [`src/lib/data.ts`](file:///d:/projetos%20antigravity/site_alquimista/src/lib/data.ts)
- **Variáveis de Ambiente:** [`.env`](file:///d:/projetos%20antigravity/site_alquimista/.env) e [`.env.example`](file:///d:/projetos%20antigravity/site_alquimista/.env.example)

---

*Nota: Ao realizar futuras mudanças de código, adicione uma nova entrada na seção 7 deste arquivo e atualize as seções correspondentes.*

