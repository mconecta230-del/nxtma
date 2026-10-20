# Meu Espaço — Central de Produtividade, Notas, Tarefas e Planejamento de Conteúdo

Recriação completa e aprimorada do aplicativo **Meu Espaço**, projetado para organizar notas rápidas (estilo post-it), tarefas diárias com foco Pomodoro, agenda editorial e planejamento de conteúdo em quadro Kanban para múltiplos clientes e projetos — agora com Assistente de IA funcionando diretamente no navegador e suporte nativo a instalação local no notebook via PWA.

## Revisão do Usuário & Decisões Confirmadas

> [!IMPORTANT]
> As escolhas abaixo foram confirmadas e guiarão toda a construção da nova versão do **Meu Espaço**:

- **Persistência Local + Backup JSON + PWA Instalável**: Todos os dados (notas, tarefas, publicações, clientes, lixeira e configurações) são salvos instantaneamente no armazenamento local do navegador (`localStorage`), com exportação/importação de arquivo `.json` completo e suporte a instalação como aplicativo desktop/notebook (Progressive Web App com funcionamento offline e botão de instalação integrado).
- **Assistente de IA Direto no Navegador (Sem Configuração de Chave)**: Ao contrário da versão anterior que exibia um aviso de limitação fora do app instalado, todas as ferramentas de IA (resumir nota, organizar em tópicos, corrigir texto, extrair checklist/tarefas, gerar ideias de postagens, criar legendas e sugerir hashtags) funcionarão imediatamente através de rotas de servidor integradas com o modelo `gemini-3.8-flash`.
- **Melhorias Visuais e Novas Funcionalidades Priorizadas**:
  1. **Post-its Flutuantes e Widget de Tarefas na Tela**: Qualquer nota marcada com *"Fixar na área de trabalho"* ou o botão *"Tarefas de hoje na área de trabalho"* abre janelas flutuantes arrastáveis e minimizáveis que permanecem visíveis sobre qualquer aba do aplicativo.
  2. **Quadro Kanban Completo no Planejamento**: Layout responsivo de 4 colunas (*Ideias*, *Em criação*, *Pronto para publicar*, *Publicado*) visíveis simultaneamente em telas desktop sem cortar cartões, com suporte a arrastar e soltar (drag-and-drop) fluido e botões de avanço rápido.
  3. **Agenda Mensal Ampla com Painel Lateral Detalhado**: Grade de calendário espaçosa onde os dias não ficam espremidos, exibindo indicadores claros de tarefas e publicações por rede social, acompanhada de um painel lateral completo para o dia selecionado.
  4. **Timer Pomodoro e Modo Foco Integrado**: Cronômetro de foco (25 min foco / 5 min pausa) integrado à tela de Tarefas e ao cabeçalho, permitindo vincular uma tarefa específica do dia para trabalhar com concentração total.

---

## 1. Visão Geral & Conceito Principal

- **O Que Faz**: Centraliza em um único espaço de trabalho a captura rápida de ideias, notas coloridas estilo post-it com checklists e anexos, gestão de tarefas com prioridades e interpretação de linguagem natural (ex.: *"Ligar para cliente amanhã 15h !alta"*), calendário integrado e um fluxo Kanban para planejar publicações de redes sociais por cliente.
- **Público-Alvo / Persona**: Profissionais de marketing digital, gestores de tráfego/conteúdo, freelancers e criadores que gerenciam múltiplos clientes (como *PRIME Excelência em Trânsito*, *Connect Marketing* e *Projetos Pessoais*) e precisam de agilidade no computador.
- **Valor Principal**: Elimina a necessidade de alternar entre vários aplicativos ao unir notas rápidas, tarefas diárias, calendário e cronograma de postagens com assistência de IA em um clique e atalhos rápidos de teclado (`Ctrl+K`, `Ctrl+N`, `Ctrl+T`).

---

## 2. Experiência do Usuário & Design Visual

### Fluxos Principais do Usuário
1. **Início (Visão do Dia)**: Saudação contextual conforme o horário (*Bom dia / Boa tarde / Boa noite*), resumo dinâmico de tarefas para hoje e publicações da semana, barra de captura rápida (salvar como nota ou criar tarefa instantaneamente), progresso das tarefas de hoje e lista das próximas publicações.
2. **Notas e Post-its**: Mural de notas dividido entre *Fixadas no topo* e *Outras*, filtro por 7 cores (*Amarelo*, *Azul*, *Verde*, *Lavanda*, *Coral*, *Grafite*, *Branco*), busca em tempo real, ordenação e suporte a colar imagens (`Ctrl+V`) ou arrastar arquivos. Ao abrir uma nota, o usuário edita título, texto, itens de checklist, links, etiquetas, anexos, executa ações do **Assistente de IA** ou destaca a nota como um **Post-it flutuante arrastável** na tela.
3. **Tarefas & Foco Pomodoro**: Abas *Hoje*, *Amanhã*, *Pendentes* e *Concluídas*, filtro por projeto/cliente, barra de progresso percentual, entrada rápida inteligente (reconhece datas como `hoje`/`amanhã`, horários como `15h` e prioridades `!alta`, `!media`, `!baixa`), painel lateral de detalhes completos da tarefa (data, hora, lembrete, repetição, prioridade, cliente, descrição e conversão em nota) e **Timer Pomodoro** integrado.
4. **Agenda Editorial e de Tarefas**: Calendário mensal amplo em duas colunas equilibradas — à esquerda, a grade mensal completa com indicadores de tarefas e redes sociais; à direita, a programação detalhada do dia selecionado com criação rápida de tarefa ou publicação para aquela data.
5. **Planejamento de Conteúdo (Kanban)**: Filtros por cliente/projeto e rede social (*Instagram*, *Facebook*, *WhatsApp*, *LinkedIn*, *TikTok*, *Blog*, *Outra*), gerador de **Ideias com IA** por cliente, e 4 colunas Kanban bem distribuídas (*Ideias*, *Em criação*, *Pronto para publicar*, *Publicado*). O modal de detalhes da publicação conta com **Escrever legenda com IA**, **Sugerir hashtags com IA**, cópia rápida de legenda, upload/colagem de artes e links de referência.
6. **Paleta de Comandos (`Ctrl+K`), Arquivo/Lixeira e Configurações**: Busca global instantânea que permite criar notas/tarefas direto da barra de pesquisa ou executar qualquer comando; gestão de itens arquivados e excluídos (com restauração ou exclusão permanente); e modal de Configurações com abas *Aparência* (Claro, Escuro, Sistema, Menu recolhido), *Modo Área de Trabalho / PWA*, *Notificações* (com disparo de notificação de teste real no navegador), *Assistente de IA*, *Clientes e projetos*, *Backup e dados* e *Atalhos*.

### Identidade Visual & Tema
- **Direção Estética**: Utilitário moderno de alta precisão (*SaaS Workspace*), combinando superfícies limpas com o calor visual dos post-its coloridos e acentos em âmbar/ouro característicos do **Meu Espaço**.
- **Paleta de Cores (Regra 60-30-10)**:
  - *60% Canvas Neutro Dominante*: Modo Claro em cinza-gelo suave (`#F4F5F7`) com cartões brancos (`#FFFFFF`); Modo Escuro em ardósia profunda (`#0F172A`) com superfícies estruturais (`#1E293B`).
  - *30% Superfícies Estruturais e Notas*: Bordas sutis de `1px` (`#E2E8F0` no claro / `#334155` no escuro), tipografia principal de alto contraste (`#111827` / `#F8FAFC`) e paleta fiel para os 7 tons de notas (Amarelo `#FEF08A`, Azul `#BFDBFE`, Verde `#BBF7D0`, Lavanda `#DDD6FE`, Coral `#FECDD3`, Grafite `#E2E8F0`, Branco `#FFFFFF`, com variantes calibradas para modo escuro).
  - *10% Orçamento de Acento*: Amarelo-ouro vibrante (`#FACC15` / `#EAB308`) nos botões de ação primária (*+ Criar*, *+ Nova nota*, *+ Nova publicação*), verde esmeralda (`#16A34A`) para barras de conclusão e vermelho (`#DC2626`) para prioridade alta e ações destrutivas.
- **Tipografia & Hierarquia**:
  - *Display & Títulos*: `Plus Jakarta Sans` (SemiBold/Bold 600–700) para cabeçalhos de seção (`clamp(1.75rem, 2.5vw, 2.25rem)`) e títulos de cartões.
  - *Corpo & Interface*: `DM Sans` (Regular 400 / Medium 500) para leitura confortável em notas, tarefas e legendas.
  - *Dados & Métricas*: `JetBrains Mono` com `tabular-nums` para contadores, datas, porcentagens de conclusão e cronômetro Pomodoro.
- **Layout & Composição Espacial**:
  - Barra superior enxuta e funcional com busca global (`Ctrl+K`), botão de criação rápida, alternador de Post-its flutuantes, botão de instalação PWA e alternador de tema Claro/Escuro.
  - Menu lateral expansível (`260px`) ou recolhido (`68px` apenas ícones com tooltips), exibindo contadores alinhados e lista de clientes com indicadores cromáticos.

---

## 3. Decisões de Produto & Trade-Offs

- **Decisão 1: Assistente de IA Server-Side Transparente (`gemini-3.8-flash`)**
  - *Abordagem Escolhida*: Servidor Express integrado que processa as solicitações de IA usando o SDK oficial `@google/genai` e a variável de ambiente segura do servidor, entregando resumos, tópicos, checklists, legendas e hashtags em segundos.
  - *Por Quê*: Resolve a limitação das capturas de tela originais (onde o assistente exibia aviso de indisponibilidade no navegador) sem exigir que o usuário configure chaves manualmente.
- **Decisão 2: Janelas Flutuantes de Post-its e Widget de Tarefas ("Área de Trabalho" dentro do App)**
  - *Abordagem Escolhida*: Camada de sobreposição interativa (`DesktopOverlayLayer`) onde notas fixadas e o widget de tarefas de hoje flutuam livremente, podendo ser arrastados para qualquer canto da tela, editados em tempo real e recolhidos.
  - *Por Quê*: Permite manter lembretes urgentes e a lista do dia sempre à vista enquanto o usuário navega pelo Planejamento ou pela Agenda, além de permitir abrir post-its em janela dedicada quando instalado via PWA.
- **Decisão 3: Instalação Local como PWA + Armazenamento Resiliente**
  - *Abordagem Escolhida*: Configuração de Web App Manifest e Service Worker via `vite-plugin-pwa`, aliada à persistência automática no `localStorage` com dados iniciais fiéis às capturas de tela do usuário (*PRIME Excelência em Trânsito*, *Connect Marketing*, *Projetos Pessoais*) e exportação/importação JSON em um clique.
  - *Por Quê*: Permite instalar o **Meu Espaço** diretamente na barra de tarefas e área de trabalho do Windows/notebook com ícone próprio e carregamento instantâneo offline.

---

## 4. Arquitetura Técnica & Estratégia de Dados

### Diagrama de Arquitetura e Componentes

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        MEU ESPAÇO 2.0 (Aplicação Web / PWA)                │
├───────────────────┬────────────────────────────────────────────────────────┤
│  Menu Lateral     │  Barra Superior: Busca (Ctrl+K) | + Criar | PWA | Tema │
│  (Expansível)     ├────────────────────────────────────────────────────────┤
│                   │  Área Principal de Visualização (Views)                │
│  • Início         │  ┌──────────────────────────────────────────────────┐  │
│  • Notas          │  │ 1. Início: Saudação, Captura Rápida, Hoje, Posts │  │
│  • Tarefas        │  │ 2. Notas: Mural por Cores, Busca, Drag & Drop    │  │
│  • Agenda         │  │ 3. Tarefas: Abas, Parser Natural, Pomodoro Timer │  │
│  • Planejamento   │  │ 4. Agenda: Calendário Mensal Amplo + Painel Dia  │  │
│                   │  │ 5. Planejamento: Quadro Kanban 4 Colunas + Filtros│ │
│  Clientes:        │  │ 6. Arquivo & Lixeira: Restauração e Limpeza      │  │
│  • PRIME...       │  └──────────────────────────────────────────────────┘  │
│  • Connect Mkt    ├────────────────────────────────────────────────────────┤
│  • Pessoais       │  Camada Flutuante ("Na Área de Trabalho"):             │
│                   │  • Post-its Flutuantes Arrastáveis                     │
│  • Arquivo/Lixeira│  • Widget Flutuante de Tarefas de Hoje + Foco Pomodoro │
│  • Configurações  │  • Modais: Editor de Nota, Detalhes Tarefa, Publicação │
└─────────┬─────────┴───────────────────────────┬────────────────────────────┘
          │                                     │
          ▼                                     ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────────┐
│ Store Local (React State +      │   │ Servidor Express (/api/ai/*)         │
│ localStorage + Export/Import    │   │ • POST /api/ai/note-assist           │
│ JSON + Notificações Web API)    │   │ • POST /api/ai/publication-assist    │
└─────────────────────────────────┘   │ SDK @google/genai (gemini-3.8-flash) │
                                      └──────────────────────────────────────┘
```

### Modelo de Dados & Estado Principal
- **`Note` (Nota)**: `id`, `title`, `content`, `color` (`yellow` | `blue` | `green` | `lavender` | `coral` | `graphite` | `white`), `pinned` (fixada no mural), `floating` (fixada como post-it flutuante na tela com coordenadas `x, y`), `checklist` (lista de itens com `id, text, completed`), `links`, `tags`, `attachments` (imagens/arquivos em base64), `clientId`, `archived`, `deletedAt`, `updatedAt`.
- **`Task` (Tarefa)**: `id`, `title`, `description`, `list` (`today` | `tomorrow` | `pending`), `dueDate` (`YYYY-MM-DD`), `dueTime` (`HH:mm`), `reminder`, `repeat`, `priority` (`low` | `medium` | `high`), `clientId`, `completed`, `completedAt`, `pomodorosCompleted`, `deletedAt`, `createdAt`.
- **`Publication` (Publicação)**: `id`, `title`, `clientId`, `date` (`YYYY-MM-DD`), `time` (`HH:mm`), `network` (`Instagram` | `Facebook` | `WhatsApp` | `LinkedIn` | `TikTok` | `Blog` | `Outra`), `stage` (`idea` | `creating` | `ready` | `published`), `caption`, `hashtags`, `notes`, `attachments`, `referenceLinks`, `deletedAt`.
- **`ClientProject` (Cliente / Projeto)**: `id`, `name`, `color`. Inicializado com os projetos das imagens (*PRIME Excelência em Trânsito*, *Connect Marketing* e *Projetos Pessoais*).
- **`AppSettings` (Configurações)**: `theme` (`light` | `dark` | `system`), `sidebarCollapsed`, `showFloatingTasksWidget`, `hideFloatingPostIts`, `notificationsEnabled`, `dailySummaryEnabled`.

### Mapeamento de Interações e Fluxos Completos
- **Parser de Tarefas Rápidas**: Ao digitar no campo de nova tarefa ou na paleta `Ctrl+K` (ex.: `"Reunião com cliente amanhã 15h !alta"`), o sistema extrai automaticamente a data (`amanhã`), o horário (`15:00`) e a prioridade (`Alta`), limpando o título da tarefa.
- **Assistente de IA nas Notas (`/api/ai/note-assist`)**:
  - *Resumir*: Gera um quadro de resumo conciso anexado na própria nota (como visto na captura 25).
  - *Organizar em tópicos* e *Corrigir e melhorar o texto*: Atualiza ou anexa a versão estruturada do conteúdo da nota.
  - *Criar checklist a partir do texto*: Extrai itens acionáveis do texto da nota e popula a seção de Checklist da nota automaticamente.
  - *Encontrar tarefas na nota*: Identifica ações no texto e cria tarefas reais na aba *Tarefas* com confirmação visual.
- **Assistente de IA no Planejamento (`/api/ai/publication-assist`)**:
  - *Ideias com IA*: Gera sugestões de pautas personalizadas para o cliente selecionado e permite adicioná-las direto na coluna *Ideias* do Kanban.
  - *Escrever com IA* e *Sugerir com IA (Hashtags)*: Preenche automaticamente a legenda persuasiva e as hashtags no modal de edição da publicação com base no título, cliente e rede social escolhida.
