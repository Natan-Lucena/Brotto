# Primeira onda de telas — onboarding até a entrada no app

## Objetivo

Entregar a menor fatia vertical funcional do Brotto: uma pessoa abre o app pela
primeira vez, percorre o onboarding linear, responde ao quiz, vê o impacto,
conhece a planta, passa pela explicação de permissões e pelo paywall, escolhe as
primeiras distrações e chega à Home. As telas compõem somente os componentes
existentes (ondas 1 e 2) e os serviços mockados da fundação. Nenhum backend,
API nova ou integração nativa é criado.

Este documento é um contrato: define o que construir, não implementa nada.

## Fontes e precedência

1. `src/theme/tokens.ts`, `src/lib/constants.ts` e `src/features/streak/rules.ts`
   (comportamento já implementado e testado).
2. `DOCUMENTACAO_PRODUTO.md` (especificação funcional e decisões aprovadas, §18).
3. `PRODUCT.md` (restrições e compromissos de marca).
4. `docs/CONTEXTO-SESSAO.md` e os contratos `etapa-1-fundacao.md`,
   `componentes-ui-onda-1.md` e `componentes-ui-onda-2.md`.
5. `brotto-fluxo.html`: mapa do protótipo Figma Make `8TBAmKMgwqfV2x8R9fPeNg`.
   Serve para estrutura de telas, ordem e microcopy; **não** prevalece sobre as
   fontes acima quando divergir. O próprio mapa lista o que não copiar.

Limitação: o Figma remoto não foi consultado nesta tarefa. Nenhum valor visual
novo é inventado aqui; medidas e cores vêm dos tokens e dos componentes.

## Estado atual do código (ponto de partida)

- `src/app/index.tsx` sempre redireciona para `/(onboarding)/splash`.
- `src/app/(onboarding)/` já contém as rotas `splash`, `boas-vindas`,
  `quiz/[step]`, `impacto`, `conheca`, `prova-social`, `permissoes`, `paywall` e
  `setup`, todas placeholders (o `paywall` lista os planos como botões sem
  ação). Não existe rota `calculando`.
- `src/app/(tabs)/` possui as cinco abas; só `index` (Home) tem conteúdo
  provisório. `bloqueios`, `foco`, `agenda` e `voce` são placeholders.
- `src/app/_layout.tsx` usa `Stack` sem grupos protegidos; `AppProviders` já
  oferece React Query, SafeArea, gestos e `ThemeProvider` (NativeWind).
- `src/features/onboarding/index.ts` define a ordem `onboardingSteps`.
- `paymentProvider` é `MockPaymentProvider`; `getEntitlement()` retorna `active`
  conforme `EXPO_PUBLIC_DEV_ACTIVE_ENTITLEMENT`. `EntitlementGuard` redireciona
  ao paywall.
- `blockingService` é `MockBlockingService`: `getPermissionStatus()` e
  `requestPermissions()` retornam `'unavailable'`; `selectApps()` devolve lista
  vazia.
- SQLite (`brotto.db`) tem as tabelas `app_state`, `blocked_apps`, `day_log`,
  `focus_sessions`, `schedules`, `releases`; só existem repositórios de
  `blocked_apps`, `schedules` e `focus_sessions`.

## Escopo

### Dentro

1. **Fluxo de onboarding completo, exceto Prova social** (ver D-01):
   Splash → Boas-vindas → Quiz P1–P5 → Calculando → Impacto → Conheça seu
   Brotto → Permissões → Paywall → Setup pós-compra → Home.
2. **Quiz** com cinco perguntas, voltar, validação e persistência local das
   respostas.
3. **Cálculo de impacto** puro e testado, a partir da P1 e da frase da P3.
4. **Permissões**: tela explicativa por plataforma, chamando apenas
   `blockingService`; recusar, indisponibilidade ou erro nunca impedem avançar.
5. **Paywall** consumindo `paymentProvider` (`getPlans`, `getEntitlement`,
   `startCheckout`, `restore`) e a rota de fechar.
6. **Setup pós-compra**: seleção inicial de distrações e ativação do primeiro
   bloqueio via `blockingService` + `blockedAppsRepository`.
7. **Home em dois estados**: _primeiro dia_ (assinante) e _demonstrativa_ (sem
   assinatura), com saudação por horário, planta, indicadores zerados, barra de
   água 0/25 e o botão de bloqueio geral.
8. **Roteamento inicial**: `app/index.tsx` decide entre onboarding e abas
   conforme o estado persistido; guards de retorno ao paywall nas ações pagas
   da Home.
9. **Tema e acessibilidade** nas telas acima (seções próprias).
10. **Persistência local** mínima em `app_state` e `blocked_apps`.
11. Testes de domínio, de tela e de rota (matriz abaixo).

### Fora de escopo

- Tela **Prova social** com conteúdo (precisa de nota e depoimentos reais).
- Abas Bloqueios, Foco, Agenda e Você além do placeholder atual; sessão de
  foco, Pomodoro, pós-foco, celebração, streak quebrado, tela de bloqueio,
  "Liberar por hoje".
- Estatísticas, gráficos, configurações, alternância manual de tema, lembretes e
  notificações (inclusive o pedido de permissão de notificação).
- Bloqueio real (Screen Time, Family Controls, Android Accessibility), compra
  real (StoreKit, Play Billing, Pix), backend, analytics, restauração real.
- Painel de demonstração, duplo clique/toque longo no logo e qualquer atalho de
  QA do protótipo em produção.
- Busca, categorias e bloqueio de sites; ícones reais de aplicativos;
  ilustração final do Brotto; confete e animações complexas.
- Novos componentes de UI reutilizáveis além dos listados em "Componentes".
- Build nativo, emulador, servidor Expo e validação visual em aparelho (só com
  autorização explícita, conforme `CONTEXTO-SESSAO.md`).

## Decisões resolvidas (base canônica clara)

| ID   | Divergência                                                        | Decisão                                                                                                                                                                                                             | Base                                                     |
| ---- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| R-01 | Meta diária: protótipo 2 h; spec 25 min                            | 25 min fixos, via `DAILY_FOCUS_GOAL_MINUTES`.                                                                                                                                                                       | Doc §18.2; `constants.ts`                                |
| R-02 | Saudação com nome ("Ana"), seção Conta                             | Saudação sem nome; nenhum campo de nome.                                                                                                                                                                            | Doc §4, §18.10; `PRODUCT.md`                             |
| R-03 | Toggle manual de trial (ligado por padrão) no paywall do protótipo | Não existe toggle de trial.                                                                                                                                                                                         | Doc §10 e §18.7                                          |
| R-04 | Pós-compra pré-seleciona lista fixa; P2 era ignorada               | A seleção da P2 pré-marca o Setup; sem escolha, TikTok e Instagram.                                                                                                                                                 | Doc §10 "Configuração pós-compra"                        |
| R-05 | Fechar o paywall libera tudo no protótipo                          | Fechar leva à Home **demonstrativa**; qualquer ação prática reabre o paywall.                                                                                                                                       | Doc §10 e §13                                            |
| R-06 | Numeração/nomes dos estágios (protótipo "Muda" aos 7 dias)         | Estágios por `getStageForDays`: 0 Semente, 1 Muda (1–6), 2 Planta jovem (7), 3 Planta cheia (30), 4 Florida (60), 5 Pequena árvore (100). O tour usa os estágios 0, 2, 3, 4 e 5, com os nomes e limiares do doc §8. | `rules.ts`; Doc §8                                       |
| R-07 | Fonte de verdade dos tokens                                        | `src/theme/tokens.ts`. Valores do CSS do mapa não são copiados (ver D-05 para o contraste).                                                                                                                         | `CONTEXTO-SESSAO.md`                                     |
| R-08 | Splash "1,5 s" e "toque longo no logo"                             | Auto-avanço em 1,5 s; sem gesto de demo.                                                                                                                                                                            | Mapa (tempo); painel de demo "não deve ir para produção" |
| R-09 | Dados fixos do protótipo (12 dias, 8h 40min, WaterBar 50 %)        | Home lê somente dados locais reais; sem registros, exibe zeros.                                                                                                                                                     | Mapa "Dados fixos que precisam virar reais"; Doc §17     |
| R-10 | Emoji nos textos                                                   | Os textos aprovados da especificação podem manter o emoji de copy (ex.: "Seu Brotto nasceu! 🌱"); emoji nunca substitui ícone ou ilustração.                                                                        | Doc §5/§10 (textos); `CONTEXTO-SESSAO.md`                |
| R-11 | Impacto: "perdido" vs "recuperado"                                 | Linguagem sempre de ganho ("dias por ano que você pode recuperar"); nunca "você perdeu".                                                                                                                            | Doc §2, §15                                              |

## Decisões pendentes (não resolver sem o responsável de produto)

| ID   | Questão                                                                                                                                                                                                                                                                                   | Padrão provisório desta onda                                                                                                                                                                        |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-01 | **Prova social.** A spec pede avaliações e depoimentos _reais_; não há nota, textos nem autorização. Pular a etapa contraria a ordem "Impacto → Prova social → Permissões" do doc §10.                                                                                                    | Passo omitido do fluxo por uma constante (`SOCIAL_PROOF_ENABLED = false`); rota mantida como placeholder; `Conheça` leva direto a `Permissões`. Reativar quando houver conteúdo real. Confirmar.    |
| D-02 | **Meio de pagamento.** Doc §10/§13: App Store e Google Play. `PRODUCT.md` e a fundação: primeira integração real é Pix por backend próprio; o mock já retorna `CheckoutSession` com QR Pix.                                                                                               | Não afirmar App Store, Google Play nem Pix na UI. Usar só `paymentProvider`. O rodapé de pagamento fica ausente até a decisão.                                                                      |
| D-03 | **Trial.** Exige confirmação de elegibilidade pela loja; `Plan.trialDays` não é elegibilidade e não há fonte real dela.                                                                                                                                                                   | Nenhuma oferta de trial nem data de primeira cobrança na UI desta onda.                                                                                                                             |
| D-04 | **Fluxo do botão de assinar sem compra real.** O mock só retorna entitlement ativo com a flag de desenvolvimento.                                                                                                                                                                         | CTA chama `startCheckout`, depois reconsulta `getEntitlement()`. Ativo → Setup. Inativo → estado de erro recuperável (sem avançar). Quem avalia o app sem a flag usa "Fechar" (Home demonstrativa). |
| D-05 | **Contraste em tema escuro e texto secundário.** `tokens.dark` repete `primary`, `primarySoft`, `ctaSoft` e `border` do claro (`primary` #2F6B4F sobre `bg` #16201B ≈ 2,7:1); `textMuted` #8A958C sobre #FBF7F0 ≈ 2,9:1. O mapa afirma que `#758077` "passa 4,5:1", mas calcula ≈ 3,85:1. | Não alterar tokens nesta tarefa. A implementação executa a auditoria de contraste e, se falhar, propõe os valores e espera aprovação (ver AC-12).                                                   |
| D-06 | **Catálogo da P2 e das opções P1–P5.** O doc dá só os rótulos da P1 e da P3 (via mapa); P2, P4 e P5 não têm lista final de opções.                                                                                                                                                        | Usar os rótulos do mapa para P1 e P3 e uma lista estática de redes sociais/vídeo para P2 aprovada por produto antes da implementação. P4 e P5 são coletadas e não usadas.                           |
| D-07 | **Lista de distrações no Setup.** No iOS os apps são tokens opacos (FamilyActivityPicker); no Android há nomes. `selectApps()` do mock retorna vazio.                                                                                                                                     | O Setup usa o catálogo estático da D-06 (id e label), sem ícones reais; persiste em `blocked_apps` com `platform_ref` provisório. Substituir quando o serviço nativo existir.                       |
| D-08 | **Honestidade do "Bloqueio ativo".** Com o mock, nada é de fato bloqueado.                                                                                                                                                                                                                | A UI reflete o estado local; a tela e o PR deixam explícito que o bloqueio real não existe. Texto do toast/estado a confirmar com produto.                                                          |
| D-09 | **Mensagem de erro do Setup** ("Não consegui ativar o bloqueio agora…") aparece truncada no mapa.                                                                                                                                                                                         | Redigir no tom do doc §15 e submeter a produto.                                                                                                                                                     |
| D-10 | **Retomada do onboarding** após fechar o app no meio.                                                                                                                                                                                                                                     | Recomeça em Splash/Boas-vindas, mas as respostas já salvas do quiz pré-preenchem as perguntas. Confirmar se deve retomar na tela exata.                                                             |
| D-11 | **Título do paywall de conversão.** O mapa descreve o conteúdo (comparação "Sem o Brotto" × "Com o Brotto", benefícios), mas não traz o texto do título; "Volte a cuidar do seu Brotto" é a copy da assinatura inativa (doc §11).                                                         | Redigir título no tom do doc §15 e submeter a produto; não reutilizar a copy de assinatura inativa.                                                                                                 |
| D-12 | **Falha de leitura do SQLite na abertura.** Sem decisão sobre mensagem ao usuário.                                                                                                                                                                                                        | Falha equivale a "onboarding não concluído" e segue ao onboarding, sem mensagem técnica.                                                                                                            |

## Rotas e navegação

Todas as rotas usam Expo Router em `src/app`. Textos de interface em
português; nomes de rota em português, como já existem.

| Rota                         | Arquivo                   | Observação                                                               |
| ---------------------------- | ------------------------- | ------------------------------------------------------------------------ |
| `/`                          | `app/index.tsx`           | Decide o destino (abaixo). Sem UI além do splash nativo retido.          |
| `/(onboarding)/splash`       | `splash.tsx`              | Auto-avança em 1,5 s para `boas-vindas`.                                 |
| `/(onboarding)/boas-vindas`  | `boas-vindas.tsx`         | "Começar" → `quiz/1`. Sem pular.                                         |
| `/(onboarding)/quiz/[step]`  | `quiz/[step].tsx`         | `step` ∈ 1…5; valor inválido redireciona para `quiz/1`.                  |
| `/(onboarding)/calculando`   | **novo** `calculando.tsx` | Transição de 1,5 s para `impacto`. Única rota nova.                      |
| `/(onboarding)/impacto`      | `impacto.tsx`             | "Quero recuperar meu tempo" → `conheca`.                                 |
| `/(onboarding)/conheca`      | `conheca.tsx`             | "Cuidar do meu Brotto" → `permissoes` (ou `prova-social` se D-01 mudar). |
| `/(onboarding)/prova-social` | `prova-social.tsx`        | Fora da onda (placeholder mantido).                                      |
| `/(onboarding)/permissoes`   | `permissoes.tsx`          | Qualquer desfecho → `paywall`.                                           |
| `/(onboarding)/paywall`      | `paywall.tsx`             | Assinatura ativa → `setup`; Fechar → `/(tabs)` demonstrativa.            |
| `/(onboarding)/setup`        | `setup.tsx`               | "Bloquear e começar" → `/(tabs)`.                                        |
| `/(tabs)` (Início)           | `(tabs)/index.tsx`        | Destino final da onda.                                                   |

### Decisão de entrada (`app/index.tsx`)

1. Carrega `app_state['onboarding.completed']`. Enquanto lê, mantém o splash
   nativo (já retido por `SplashScreen.preventAutoHideAsync`) ou renderiza nada.
2. `'true'` → `Redirect` para `/(tabs)`; qualquer outro valor, ausência ou erro
   de leitura → `/(onboarding)/splash`.
3. `onboarding.completed` é gravado como `'true'` ao tocar em "Bloquear e
   começar" com sucesso **ou** ao fechar o paywall (Home demonstrativa). Quem
   concluiu o onboarding nunca revê o splash.

Observação: o protótipo manda assinante direto do Splash para a Home. Aqui o
Splash roteia por `onboarding.completed`, não por assinatura, porque a
assinatura vem do `paymentProvider` (com cache/consulta assíncrona) e o doc §13
pede Home demonstrativa para quem não assina.

### Regras de navegação

- Onboarding é linear. Voltar existe a partir de `quiz/1` (que volta a
  `boas-vindas`) até `impacto`; o botão voltar do sistema segue o mesmo
  caminho. De `calculando` não há voltar (transição). `conheca`, `permissoes`,
  `paywall` e `setup` não oferecem voltar visível; o gesto/botão do sistema do
  Android em `setup` e na entrada das abas **não** retorna ao onboarding
  (usar `router.replace`).
- Ao entrar nas abas, o histórico do onboarding é descartado com
  `router.replace('/(tabs)')`.
- Navegar com `replace` a partir de `splash`, `calculando`, `paywall` (sucesso) e
  `setup`, para que voltar não retorne a telas transitórias.
- `onboardingSteps` em `features/onboarding/index.ts` passa a incluir
  `calculando` e o passo `prova-social` fica condicionado à constante da D-01;
  a ordem é a única fonte para "próximo passo" (sem strings de rota espalhadas).

## Telas

Convenção de estados: **C**onteúdo, **E**stados, **S**aídas. Componentes:
`Screen`, `Button`, `Card`, `Chip`, `Toggle`, `SegmentedControl`, `Stepper`,
`Toast`, `BottomSheet`, `StatCard`, `ProgressLeaves`, `WaterBar`, `BrottoPlant`.

### 1. Splash

- C: `BrottoPlant` estágio 0, humor `happy`, tamanho `lg`; logo "brotto"
  (Nunito 800); "Seu foco. Seu tempo. Sua planta."
- E: único. Sem animação de nascimento nesta onda (só spec); sem gesto de demo.
- S: 1,5 s → `boas-vindas` (`replace`). Timer limpo ao desmontar.

### 2. Boas-vindas

- C: planta estágio 0/`happy`/`lg`; "Menos scroll. Mais você."; proposta "sem
  culpa"; botão "Começar" (`variant="cta"`, `fullWidth`).
- S: "Começar" → `quiz/1`. Sem opção de pular.

### 3. Quiz (P1–P5)

- Estado do passo vem do parâmetro de rota; as respostas ficam em um store local
  do onboarding (zustand já é dependência) e são gravadas em `app_state` a cada
  confirmação.
- C: `ProgressLeaves` (`current` = passo, `total` = 5); título da pergunta;
  opções; "Continuar" e voltar.
- Tipos: P1 única (tempo diário no celular); P2 múltipla, opcional (apps que mais
  prendem); P3 única (objetivo); P4 única (período de maior distração); P5 única
  (quanto tempo proteger). Opções únicas e múltiplas usam `Chip`
  (`selected`); nenhuma opção tem estado oculto.
- E:
  - P1, P3, P4, P5 sem resposta: "Continuar" desabilitado e microcopy "Escolhe
    uma pra eu te conhecer".
  - P2: "Continuar" habilitado com 0 itens; contador "Selecionados: N"; link
    "Pular essa" (equivale a continuar com 0).
  - Resposta já salva (voltar ou D-10): opções pré-selecionadas.
  - Falha ao gravar em `app_state`: o fluxo continua em memória; sem bloquear
    nem mostrar erro técnico.
- S: Continuar → próximo passo; P5 → `calculando`. Voltar → passo anterior; P1 →
  `boas-vindas`.
- Dados: P4 e P5 são coletadas e persistidas, **sem uso** nesta onda.

### 4. Calculando

- C: planta estágio 0 com indicador de carregamento acessível; "Calculando seu
  tempo...".
- S: 1,5 s → `impacto` (`replace`).

### 5. Impacto

- Cálculo (função pura, ex. `features/onboarding/impact.ts`): horas por faixa da
  P1 = 0,75 · 2 · 4 · 6 (para "Menos de 1h", "1 a 3h", "3 a 5h", "5h ou mais");
  `dias = Math.round(horas × 365 / 24)` → 11 · 30 · 61 · 91. Sem resposta, usa o
  padrão de 4 h (61 dias). Fonte dos números: mapa do protótipo, único lugar
  onde a fórmula aparece; o doc §10 só diz "estimativa positiva". Revalidar
  com produto se a P1 mudar (D-06).
- C: `StatCard` `size="hero"` com tag e "~N dias por ano"; frase de ganho
  conforme a P3 (Estudar, Trabalhar, Dormir, Tempo livre); botão "Quero
  recuperar meu tempo".
- E: a contagem animada 0→N em 1,2 s é só spec e fica de fora; com "reduzir
  movimento" o valor já aparece final (de qualquer modo, nesta onda é estático).
- S: botão → `conheca`. Voltar → `quiz/5`.

### 6. Conheça seu Brotto

- C: carrossel de 5 fases: Semente (Dia 1, estágio 0) · Planta jovem (7 dias,
  estágio 2) · Planta cheia (30, 3) · Florida (60, 4) · Pequena árvore (100, 5);
  cada fase com `BrottoPlant` do estágio; dots de paginação.
- Navegação por botões "Anterior/Próximo" com alvos de 48 dp; swipe é opcional
  (o mapa lista como lacuna) e não é requisito.
- E: índice 0 inicial; dots anunciam "Fase N de 5".
- S: "Cuidar do meu Brotto" → `permissoes` (D-01).

### 7. Permissões

- C: copy por plataforma via `Platform.OS`: iOS "Deixa eu bloquear por você"
  (Tempo de Uso); Android "Só mais um passo" (Acesso de uso e Acessibilidade,
  explicadas separadamente). Três benefícios com ícone de check (`@expo/vector-icons`,
  sem emoji) e `Card` "Seus dados ficam no seu aparelho". Ações: "Permitir"
  (`variant="cta"`) e "Ativar depois" (`ghost`).
- O estado **sempre** vem de `blockingService.getPermissionStatus()` (nunca de
  cache local): `not-determined`, `granted`, `denied`, `unavailable`.
- E:
  - `not-determined` / `unavailable` (estado do mock): mostra a explicação; "Permitir"
    chama `requestPermissions()` e segue ao paywall com qualquer retorno.
  - `granted`: confirmação curta (sem animação obrigatória) e botão
    "Continuar"; avanço automático em 800 ms é só spec e não é requisito.
  - `denied`: `Card` de aviso acolhedor ("dá pra ativar depois em Você"),
    botão "Tentar novamente" e "Continuar mesmo assim".
  - Erro ao solicitar: tratado como `denied`; nunca bloqueia o avanço.
  - Mock do diálogo nativo do protótipo **não** é reproduzido.
- Fora: link "Por que preciso disso?" expansível, passo 2/2 do Android parcial,
  pedido de permissão de notificações.
- S: qualquer desfecho → `paywall` (`replace`).

### 8. Paywall

- C: título de conversão (D-11); comparação "Sem o Brotto" × "Com o Brotto" e 4
  benefícios, conforme o mapa. Planos vindos de `paymentProvider.getPlans()`:
  Semanal R$ 9,90, Mensal R$ 19,90, Anual R$ 99,90 (≈ R$ 8,32/mês, selo "MELHOR
  PREÇO", pré-selecionado). Cada plano é um `Card` interativo com semântica de
  seleção (radio). CTA `Button` `variant="cta"` e `size="large"`. Botão fechar
  (alvo 48 dp) e "Restaurar compra".
- Formatação de moeda por `src/lib/format.ts` (BRL); nenhum preço literal fora
  de `plans`. O valor mensal do anual é derivado (`99,90 / 12`).
- E:
  - Carregando planos: skeleton simples; falha ao carregar: mensagem acolhedora e
    "Tentar de novo".
  - Seleção: anual pré-selecionado; trocar de plano não perde a seleção em erro.
  - Processando: `Button loading` com `loadingLabel` "Preparando..."; demais
    ações desabilitadas.
  - Sucesso (entitlement ativo): → `setup`.
  - Erro/inativo após `startCheckout` (D-04): `Toast` `tone="error"` com ação
    "Tentar de novo"; a seleção é mantida.
  - Restaurar: `restore()`; ativo → `setup`; inativo → `Toast` "Não encontramos
    uma compra ativa."; falha de rede → `Toast` de erro. (A mensagem de sucesso
    da restauração é só spec; vai direto ao Setup.)
  - Sem toggle de trial e sem texto de trial (R-03, D-03); sem rodapé de loja
    (D-02).
- S: assinar/restaurar com sucesso → `setup` (`replace`); Fechar →
  `onboarding.completed = true` e `/(tabs)` com `Toast` "Escolha um plano pra
  liberar todos os recursos." (texto do protótipo; ajustar a "pra" do tom se
  produto quiser).

### 9. Setup pós-compra

- Acesso: só com entitlement ativo; sem ele, redireciona ao paywall
  (`EntitlementGuard`).
- C: "Seu Brotto nasceu! 🌱"; lista do catálogo da D-07 com `Toggle` por item; os
  itens da P2 vêm marcados; se P2 vazia, marcados TikTok e Instagram (R-04);
  botão "Bloquear e começar" (`variant="cta"`).
- E:
  - Nenhum item marcado: botão desabilitado com ajuda "Marca pelo menos um pra
    começar" (o doc exige lista central não vazia para o bloqueio; ajustar se
    produto preferir permitir vazio).
  - Ativando: `Button loading`.
  - Erro (D-09): `Toast error`; seleção preservada; tentar de novo.
- S: sucesso → grava `blocked_apps` (`blockedAppsRepository.replace`), chama
  `blockingService.blockNow`, grava `block.active = 'true'` e
  `onboarding.completed = 'true'` → `Toast` de sucesso (D-08) e `/(tabs)`
  (`replace`). A ordem é: serviço, depois persistência; se a persistência falhar
  após o serviço, desfaz com `unblock()` e mostra o erro.
- Confete e haptics: fora.

### 10. Início (Home)

Dados lidos localmente: `app_state` (`block.active`), `day_log` do dia local
(`localDayKey`) e streak via `features/streak`. Sem registros: zeros.

- C: saudação por horário local (Bom dia < 12 h, Boa tarde < 18 h, senão Boa
  noite; sem nome); `BrottoPlant` no estágio e humor atuais; `StatCard` de
  sequência (dias regando) e de tempo protegido (formatado por `lib/format.ts`);
  `WaterBar` com `value` = minutos do dia e `total` = `DAILY_FOCUS_GOAL_MINUTES`;
  botão "Bloquear agora"/"Bloqueio ativo · Desativar".
- Estados desta onda:
  - **Primeiro dia (assinante)**: estágio 0, humor `happy` (sem atividade, ainda
    não murcha), números zerados, convite "Dá o primeiro passo hoje".
  - **Demonstrativa (sem assinatura)**: mesmo layout com zeros; faixa discreta
    "Escolha um plano pra liberar todos os recursos" que abre o paywall.
  - **Carregando**: skeleton enquanto `app_state`/`day_log` resolvem.
  - **Bloqueio ativo/pausado**: reflete `block.active`.
  - Fora da onda: meta cumprida, streak quebrado, permissão revogada.
- Ações:
  - "Bloquear agora": sem assinatura → paywall (mensagem relacionada, R-05); com
    assinatura → `blockingService.blockNow(seleção de blocked_apps)` /
    `unblock()` e atualiza `block.active`. Lista `blocked_apps` vazia →
    `Toast` orientando a escolher distrações (a aba Bloqueios é futura).
  - "Iniciar foco": navega para a aba Foco (placeholder); sem assinatura →
    paywall.
- O gatilho "Regar agora" e os atalhos para Pós-foco/Celebração não existem.

## Persistência local

Usa apenas o SQLite existente (`expo-sqlite`, migrations versionadas). Não há
migration nova: `app_state` (chave/valor TEXT) e `blocked_apps` bastam.

Novo módulo permitido (sem nova tabela): `appStateRepository` em
`src/services/db/repositories.ts` com `get(key)` e `set(key, value)` sobre
`app_state`, mais testes.

| Chave `app_state`      | Valor                                                         | Escrita                    |
| ---------------------- | ------------------------------------------------------------- | -------------------------- |
| `onboarding.answers`   | JSON `{ dailyUsage, apps[], goal, worstTime, recoverTarget }` | A cada confirmação do quiz |
| `onboarding.completed` | `'true'`                                                      | Setup OK ou Fechar paywall |
| `block.active`         | `'true'` / `'false'`                                          | Setup OK e Home            |

Regras:

- Valores com JSON inválido ou formato inesperado são descartados (tratados como
  ausentes) por validação com `zod` (já dependência) antes de uso.
- Nada de assinatura é gravado: o entitlement é sempre pedido ao
  `paymentProvider` (React Query `['entitlement']`).
- Permissão nunca é cacheada (consulta ao `blockingService`).
- A escolha de tema **não** é persistida nesta onda (ver Tema); a chave
  `preferences.theme` fica reservada para a aba Você.
- Dados do quiz e lista de bloqueios nunca saem do aparelho; nenhum analytics.
- O fuso e a virada do dia usam `lib/date.ts` / `features/streak/rules.ts`; a
  Home não calcula virada própria.

## Tema

- Modo inicial: sistema (`useColorScheme` do NativeWind via `ThemeProvider`),
  como em `README.md`. A tela não oferece alternância nesta onda; ela chega com a
  aba Você.
- Todas as telas e estados respondem a claro e escuro usando as classes de token
  existentes (`bg-bg dark:bg-dark-bg`, etc.), sem cores literais novas.
- Mudar o tema do sistema com o app aberto reflete imediatamente, inclusive em
  telas com timers (Splash, Calculando).
- Ilustrações (`BrottoPlant`) usam os tokens; ícones usam `tokens` por tema.
- Contraste em escuro tem pendência (D-05) e critério de aceite próprio.

## Acessibilidade

- Alvo mínimo de 48 dp em todos os controles (já garantido pelos componentes;
  novos elementos interativos de tela, como setas do carrossel e fechar do
  paywall, seguem a regra).
- Cada tela tem um título (`accessibilityRole="header"`) e ordem de foco
  coerente com a leitura visual.
- Estados falados: `Chip` e `Toggle` anunciam seleção/valor; `ProgressLeaves`
  anuncia o progresso do quiz; botões em carregamento expõem `busy`; `Toast`
  usa região viva; planos do paywall usam papel `radio` com `selected`.
- Reduzir movimento: respeitar `AccessibilityInfo.isReduceMotionEnabled`;
  nesta onda não há animações obrigatórias, e qualquer transição opcional
  (ex.: carrossel) fica sem animação com a preferência ligada.
- Temporizadores automáticos (Splash e Calculando, 1,5 s) não podem perder
  conteúdo: o texto de cada uma é lido por leitores de tela ao montar.
- Linguagem acolhedora em recusa, erro e demonstrativa; nenhum vermelho/erro
  para "dia sem meta" (fora da onda) e nenhuma culpa no paywall.
- Recusar ou revogar permissão suspende só a função afetada e oferece caminho
  de correção compreensível (texto da tela de permissões e da Home).
- Emoji presente apenas em copy aprovada; nenhum controle depende de emoji.
- Teclado de hardware/focus web: não há requisito (app nativo).

## Componentes existentes a reutilizar

| Necessidade                         | Componente / módulo                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| Casca de tela com safe area         | `Screen` (todas as telas); `PlaceholderScreen` só nas rotas fora da onda       |
| Ações primárias/secundárias         | `Button` (`cta`, `primary`, `ghost`, `loading`, `loadingLabel`, `fullWidth`)   |
| Opções do quiz                      | `Chip` (`selected`)                                                            |
| Itens de planos e blocos de texto   | `Card` (`interactive`, `outlined`, `soft`)                                     |
| Distrações no Setup e bloqueio Home | `Toggle`                                                                       |
| Feedback de erro/sucesso            | `Toast` (`tone`, `actionLabel`/`onAction`)                                     |
| Progresso do quiz                   | `ProgressLeaves`                                                               |
| Meta do dia na Home                 | `WaterBar`                                                                     |
| Impacto e indicadores da Home       | `StatCard` (`hero` / `compact`)                                                |
| Planta em todas as telas            | `BrottoPlant` (`stage` 0–5, `mood`, `size`)                                    |
| Tema e preferências                 | `useTheme` / `ThemeProvider`                                                   |
| Domínio                             | `features/streak/rules.ts`, `lib/constants.ts`, `lib/date.ts`, `lib/format.ts` |
| Serviços                            | `paymentProvider`, `blockingService`, `blockedAppsRepository`, `getDatabase`   |

Não criar: `SegmentedControl`, `Stepper`, `BottomSheet` não são necessários
nesta onda (nenhuma tela os usa). Composições **locais** de tela (ex.: opção de
plano, linha de aplicativo, dots do carrossel) ficam dentro de
`src/features/onboarding` e `src/features/paywall`, sem entrar em
`components/ui` até serem reutilizadas por uma segunda tela.

## Estrutura de código esperada

- `src/features/onboarding/`: `steps.ts` (ordem e próximo passo), `quiz.ts`
  (perguntas, opções, validação zod), `impact.ts` (cálculo), `store.ts`
  (estado do quiz), hooks de leitura/escrita de `app_state`.
- `src/features/paywall/`: `PlanOption`, `usePlans`, mutação de assinatura.
- `src/features/blocking/`: seleção do Setup e ação de bloqueio da Home (somente
  composição de `blockingService` e `blockedAppsRepository`).
- `src/app/(onboarding)/*` e `src/app/(tabs)/index.tsx`: telas finas que compõem
  os módulos acima.
- Nenhuma nova dependência de produção.

## Critérios de aceite

- AC-01: com banco vazio, abrir o app leva ao Splash, depois a Boas-vindas em
  1,5 s; com `onboarding.completed = 'true'`, abre a Home sem passar pelo
  onboarding; falha de leitura cai no onboarding.
- AC-02: o fluxo completo funciona na ordem Splash → Boas-vindas → Quiz 1–5 →
  Calculando → Impacto → Conheça → Permissões → Paywall → Setup → Home, sem
  Prova social (D-01), e o botão voltar do sistema não retorna a telas
  transitórias nem ao onboarding a partir da Home.
- AC-03: no quiz, P1/P3/P4/P5 só avançam com resposta; P2 avança com zero
  seleções; voltar preserva respostas; respostas persistem e pré-preenchem após
  reabrir; `quiz/[step]` inválido vai para `quiz/1`.
- AC-04: o impacto retorna 11, 30, 61 e 91 dias para as quatro faixas e 61 sem
  resposta; arredondamento e valores fora do esperado não geram `NaN`.
- AC-05: Permissões nunca bloqueia o avanço (concedida, negada, indisponível,
  erro) e o estado exibido vem do serviço, não de cache.
- AC-06: o paywall mostra os três planos de `getPlans()` com preços formatados
  em BRL, anual pré-selecionado e com selo, sem toggle nem oferta de trial,
  sem texto de loja ou Pix.
- AC-07: assinar com entitlement ativo (flag de desenvolvimento) leva ao Setup;
  sem entitlement mostra erro recuperável mantendo o plano; Restaurar trata
  sucesso, ausência e falha; Fechar leva à Home demonstrativa.
- AC-08: Setup pré-marca respostas da P2 ou TikTok e Instagram; "Bloquear e
  começar" persiste `blocked_apps`, ativa `blockNow`, grava `block.active` e
  `onboarding.completed` e abre a Home; erro preserva a seleção e permite nova
  tentativa; sem entitlement o Setup redireciona ao paywall.
- AC-09: a Home exibe saudação sem nome conforme o horário, zeros reais (sem
  números fixos), `WaterBar` 0/25 e reflete `block.active`; sem assinatura, as
  ações práticas abrem o paywall.
- AC-10: nenhum texto culpabilizante; nenhuma estimativa de "tempo perdido"; as
  cores de erro não representam dias sem meta.
- AC-11: todas as telas e estados são legíveis e funcionais em claro e escuro e
  seguem o tema do sistema na abertura.
- AC-12: auditoria de contraste (WCAG AA, 4,5:1 texto normal / 3:1 texto grande
  e componentes) dos pares usados nas telas em claro e escuro está registrada;
  falhas viram proposta de ajuste de token aguardando decisão D-05, sem alterar
  `tokens.ts` por conta própria.
- AC-13: alvos de 48 dp, papéis/estados acessíveis e foco de leitura corretos
  (matriz de testes), com reduzir movimento respeitado.
- AC-14: nenhum backend, API ou campo novo; nenhuma tabela ou migration nova;
  nenhuma dependência de produção nova; sem emoji substituindo ícones.
- AC-15: `pnpm run test`, `pnpm run typecheck`, `pnpm run lint` e Prettier nos
  arquivos alterados passam, sem iniciar Expo, emulador ou build nativo.

## Matriz de testes

Ferramentas: Vitest + React Native Testing Library (mock `vitest-native`), como
nas ondas anteriores. Escrever o teste vermelho antes da implementação. Os testes
não comprovam renderização em aparelho (ver "Não validado").

| Camada             | Alvo                                                         | Casos principais                                                                                                                                                                          | AC                  |
| ------------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Unidade            | `impact.ts`                                                  | 4 faixas, padrão sem resposta, arredondamento, entrada inválida; frase por objetivo                                                                                                       | AC-04               |
| Unidade            | `steps.ts` / `onboardingSteps`                               | ordem, próximo/anterior, Prova social omitida (D-01), `calculando` presente                                                                                                               | AC-02               |
| Unidade            | `quiz.ts`                                                    | validação por pergunta, múltipla opcional, parse zod de respostas salvas inválidas                                                                                                        | AC-03               |
| Unidade            | `appStateRepository`                                         | get/set, ausente → `null`, sobrescrita, valor inválido descartado                                                                                                                         | AC-01, AC-03        |
| Unidade            | helpers de saudação e formatação                             | limites 11:59/12:00/17:59/18:00, BRL, minutos                                                                                                                                             | AC-09, AC-06        |
| Tela               | Splash                                                       | auto-avança em 1,5 s (timers falsos), limpa o timer ao desmontar                                                                                                                          | AC-01               |
| Tela               | Boas-vindas                                                  | "Começar" leva a `quiz/1`; sem controle de pular                                                                                                                                          | AC-02               |
| Tela               | Quiz                                                         | continuar desabilitado sem resposta (P1,P3–P5); P2 vazia avança; voltar; pré-preenchimento; `step` inválido; microcopy; contador "Selecionados: N"; falha de gravação não interrompe      | AC-03               |
| Tela               | Calculando / Impacto                                         | transição em 1,5 s; valor de dias e frase por P3 a partir das respostas gravadas; botão leva a Conheça                                                                                    | AC-02, AC-04        |
| Tela               | Conheça                                                      | 5 fases com estágios 0,2,3,4,5; botões e dots anunciam posição; fim leva a Permissões                                                                                                     | AC-02, AC-13        |
| Tela               | Permissões                                                   | copy iOS vs Android; `granted`, `denied`, `unavailable`, erro; "Tentar novamente"; todos os caminhos chegam ao paywall                                                                    | AC-05               |
| Tela               | Paywall                                                      | três planos, anual selecionado com selo, ausência de trial/loja/Pix; trocar plano; loading; erro recuperável mantém plano; restaurar (ativo, inativo, falha); fechar → Home demonstrativa | AC-06, AC-07        |
| Tela               | Setup                                                        | pré-seleção por P2 e padrão; botão desabilitado sem itens; sucesso grava e navega; erro de serviço e de persistência preservam seleção e fazem `unblock`; guard sem entitlement           | AC-08               |
| Tela               | Home                                                         | saudação por horário (relógio falso); zeros e WaterBar 0/25; estado demonstrativo vs primeiro dia; skeleton; alternar bloqueio; ação sem assinatura abre paywall; lista vazia → aviso     | AC-09               |
| Roteamento         | `app/index.tsx`                                              | completed → tabs; ausente → splash; leitura com erro → splash                                                                                                                             | AC-01               |
| Fluxo (integração) | onboarding ponta a ponta com mocks                           | percurso completo com flag de entitlement ativa; percurso com flag inativa e Fechar; histórico não volta a telas transitórias                                                             | AC-02, AC-07        |
| Tema               | todas as telas                                               | classes `dark:` nos elementos de fundo/texto/ação; troca de `colorScheme` re-renderiza                                                                                                    | AC-11               |
| Acessibilidade     | todas as telas                                               | `accessibilityRole`/`State` de Chip, Toggle, plano (radio), header de cada tela, `busy` do botão; reduzir movimento mockado; alvos mínimos de 48 dp                                       | AC-13               |
| Conteúdo           | todas as telas                                               | ausência de "perdeu", "falhou" e de vermelho para dias sem meta; ausência de emoji como ícone; nenhum preço fora de `plans`                                                               | AC-06, AC-10, AC-14 |
| Auditoria          | contraste dos tokens                                         | script ou teste que calcula a razão dos pares usados, claro e escuro; resultado registrado                                                                                                | AC-12               |
| Regressão          | suíte atual (125 testes) e `src/services/contracts.test.tsx` | continuam passando; nenhum contrato de serviço mudou                                                                                                                                      | AC-14, AC-15        |

## Não validado nesta onda (e fora da automação)

- Renderização em aparelho, emulador ou simulador; Expo Router em runtime.
- Comportamento de permissões, bloqueio e compra reais (todos mocks).
- Fidelidade visual contra o Figma remoto.
- Comportamento do splash nativo em dispositivos lentos e do teclado do sistema.

## Riscos e observações

- O Setup e a Home dizem "bloqueio ativo" mesmo com bloqueio mockado (D-08);
  evitar copy que prometa proteção real até existir o serviço nativo.
- Sem a flag `EXPO_PUBLIC_DEV_ACTIVE_ENTITLEMENT=true`, o onboarding termina na
  Home demonstrativa; é o comportamento correto do produto sem compra real e
  deve ser dito a quem avaliar a onda.
- A omissão da Prova social altera a ordem do funil documentada; precisa de
  confirmação antes de qualquer métrica de conversão (D-01).
- Divergências do mapa que **não** devem ser copiadas: meta de 2 h, nome "Ana",
  números fixos, trial manual, paywall fechado liberando tudo, lista fixa de
  apps no Setup, duplo clique de demo.

## Histórico

- 2026-10-12: contrato criado a partir de PRODUCT.md, DOCUMENTACAO_PRODUTO.md,
  README.md, `docs/CONTEXTO-SESSAO.md`, contratos existentes, `brotto-fluxo.html`
  e do código em `src/`. Nenhuma tela foi implementada.
