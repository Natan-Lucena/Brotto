# Contexto da Sessao

Atualizado em 2026-10-06. Este arquivo e o ponto de partida para retomar o
desenvolvimento do Brotto Mobile sem depender do historico da conversa.

## Estado canonico

- Repositorio: `https://github.com/Natan-Lucena/Brotto.git`.
- Branch principal: `main`.
- Ultimo commit funcional integrado: `4394e1f`, merge por squash do PR #1.
- PR entregue: `https://github.com/Natan-Lucena/Brotto/pull/1`.
- Stack confirmada: Expo SDK 57, React Native 0.86, React 19.2,
  TypeScript 6, NativeWind 4, Vitest 5, pnpm 11 e Node.js 22.13 ou superior.
- O projeto usa development builds e nao deve ser tratado como compativel com
  Expo Go.
- A arvore estava limpa e sincronizada com `origin/main` antes da criacao da
  branch exclusivamente documental `docs/session-handoff`.

## O que foi entregue

### Fundacao

O commit `183f5bc` criou a base Expo Router, tema, providers, rotas placeholder,
servicos mockados, persistencia SQLite, regras de dominio e testes. O contrato
completo esta em `docs/contracts/etapa-1-fundacao.md`.

### Componentes UI - onda 1

O commit `327312f` adicionou os primitivos acessiveis:

- `Button`
- `Card`
- `Chip`
- `Toggle`
- `Stepper`
- `SegmentedControl`

O contrato e as limitacoes estao em
`docs/contracts/componentes-ui-onda-1.md`. Essa onda foi baseada nas fontes
locais e ainda merece uma auditoria visual direta contra o Figma remoto.

### Componentes UI - onda 2

O commit integrado `4394e1f` adicionou:

- `Toast`, com tons default/success/error, anuncio acessivel e acao opcional.
- `BottomSheet`, nas variantes sheet/dialog, com backdrop, fechamento nativo e
  icone SVG responsivo ao tema.
- `StatCard`, nos tamanhos hero/compact.
- `ProgressLeaves`, com folhas SVG e semantica de progressbar.
- `WaterBar`, com normalizacao de limites e semantica de progressbar.
- `BrottoPlant`, com estagios 0 a 5, sete humores, tres tamanhos nomeados,
  tamanho numerico proporcional e fallback para valores invalidos.

O contrato detalhado, as APIs e a evidencia do Figma estao em
`docs/contracts/componentes-ui-onda-2.md`. A dependencia
`react-native-svg@15.15.4` foi adicionada pelo fluxo recomendado do Expo.

## Decisoes de implementacao importantes

- `src/theme/tokens.ts` continua sendo a fonte de verdade visual.
- Componentes devem oferecer dark mode, alvos de toque de pelo menos 48 dp e
  semantica nativa para leitores de tela.
- Emoji nao deve substituir icones ou ilustracoes.
- O `Toast` so renderiza uma acao quando `actionLabel` e `onAction` existem.
- O icone de fechar do `BottomSheet` usa `useColorScheme` do React Native e
  tokens explicitos. A tentativa de importar `cssInterop` diretamente no
  componente fez o Vitest resolver o runtime web do NativeWind e foi
  descartada.
- `BrottoPlant` aceita tamanho numerico apenas quando finito e maior que zero;
  valores invalidos usam o tamanho `md` de 140x158.
- O lockfile e gerado pelo pnpm 11.8.0. Se uma instalacao compactar seu YAML,
  execute Prettier no lockfile antes do commit para evitar ruido no diff.
- `.prettierignore` ignora apenas `.claude/`, que contem configuracao local e
  nao pertence ao produto.
- Nesta maquina, o Git de sistema usa `core.autocrlf=true`. Um checkout limpo
  converte arquivos para CRLF e o Prettier 3 pode sinalizar o repositorio mesmo
  quando `git status` esta limpo. Nao reformate todos os arquivos apenas para
  ocultar esse efeito; formate e valide os arquivos editados ou trate a politica
  de line endings em uma tarefa dedicada com `.gitattributes`.

## Fonte de design

- Figma Make: `8TBAmKMgwqfV2x8R9fPeNg`, no `nodeId=0:1`.
- Recursos consultados: `src/App.tsx`, `src/index.css` e
  `src/imports/brotto-prompt-figma-make.md`.
- O acesso ao Figma funciona no Claude Code. O OpenCode nao possuia conector
  Figma configurado nesta sessao.
- O MCP `pencil` apontava para um executavel inexistente e nao foi usado.
- Um token pessoal do Figma apareceu durante diagnostico de terminal. Nenhum
  token foi registrado no repositorio; revogue-o e gere outro caso isso ainda
  nao tenha sido feito.

## Evidencias de qualidade

No estado integrado do PR #1:

- `pnpm run test`: 6 arquivos e 125 testes aprovados.
- `pnpm run typecheck`: aprovado.
- `pnpm run lint`: aprovado.
- `pnpm exec prettier --check --ignore-unknown .`: aprovado.
- `pnpm install --frozen-lockfile --lockfile-only`: lockfile consistente.
- `npx expo-doctor`: 21 de 21 verificacoes aprovadas.
- Compilacao do Tailwind CLI: aprovada.
- `git diff --check`: aprovado.
- Revisao independente final: nenhum achado.

Os testes usam uma reimplementacao mock de React Native, cruzada pelo
`vitest-native`; eles nao comprovam renderizacao em aparelho.

## Nao validado

- Nenhum servidor Expo foi iniciado.
- Nenhum emulador, simulador ou dispositivo foi usado.
- Nenhum build nativo Android ou iOS foi executado.
- Nao houve validacao visual final das telas em runtime.
- A onda 1 nao recebeu auditoria visual direta completa contra o Figma remoto.
- Bloqueio nativo, extensoes iOS, servicos Android, backend e pagamento real
  continuam fora do escopo implementado.

## Proximo passo recomendado

1. Ler `PRODUCT.md`, `DOCUMENTACAO_PRODUTO.md`, este arquivo e os tres contratos
   antes de planejar novas mudancas.
2. Auditar visualmente a onda 1 contra o Figma Make e registrar somente
   divergencias comprovadas.
3. Definir um contrato para a primeira onda de telas finais, compondo os
   componentes existentes sem criar novas APIs ou campos de backend por
   conveniencia.
4. Escrever testes de estados e interacoes das telas antes da implementacao.
5. Executar validacao visual e nativa somente com autorizacao explicita do
   usuario e com a maquina preparada para isso.

## Comandos seguros de retomada

```text
pnpm install --frozen-lockfile
pnpm run test
pnpm run typecheck
pnpm run lint
pnpm run format:check
npx expo-doctor
```

`pnpm start`, comandos EAS, emuladores e builds nativos exigem autorizacao no
momento da execucao. No Windows atual, considere a observacao sobre CRLF antes
de interpretar uma falha global de `format:check`.

## Orquestracao encerrada

A execucao Orca `run_603c3753f11c` foi concluida. Duas tasks antigas encerraram
com falha de processo depois que o mesmo trabalho ja havia sido substituido,
validado e integrado. Elas foram marcadas como concluidas por substituicao, os
dispatches foram liberados e a caixa da orquestracao ficou sem mensagens
pendentes. Nao redisparar essas tasks.
