# Componentes UI - Onda 2

## Objetivo

Extrair do Figma Make os componentes reutilizáveis de feedback, progresso e
identidade do Brotto, substituindo os placeholders da fundação por APIs
tipadas e acessíveis para React Native.

## Fonte visual

O contexto foi lido diretamente do Figma Make `8TBAmKMgwqfV2x8R9fPeNg`, nó
`0:1`, por `get_design_context` e pelos recursos Make de `src/App.tsx`,
`src/index.css` e `src/imports/brotto-prompt-figma-make.md`.

## Escopo

- `Toast`: feedback transitório default, success e error, ação opcional,
  região viva e posicionamento acima da navegação.
- `BottomSheet`: sheet e dialog com backdrop, handle, cabeçalho, fechamento
  pelo backdrop e pelo botão voltar do Android.
- `StatCard`: tag, valor, legenda e tamanhos hero/compact.
- `ProgressLeaves`: cinco folhas vetoriais, preenchimento por progresso e
  semântica de progressbar.
- `WaterBar`: barra de 12 dp, valor limitado e anúncio do progresso.
- `BrottoPlant`: SVG vetorial com estágios 0 a 5, tamanhos sm/md/lg e humores
  normal, guarding, focused, waiting, watered, wilted e happy.

## Evidência do Figma

- Toast: margens laterais 20, base 102, raio 14, padding 14/16, fundo text e
  texto branco de 13/18.
- Sheet: raio superior 28, padding 12/20/36, handle 42x5 e altura máxima 88%.
- StatCard: raio 24, tag 11/14, valor hero 31 e compact 25, gaps de 5.
- ProgressLeaves: cinco folhas de 18, gap 11, cores secondary e border.
- WaterBar: altura 12, raio total, trilho primarySoft e preenchimento water.
- BrottoPlant: viewBox 160x180, vaso pot, folhas secondary com contorno
  primary, água water, terra e flores conforme as coordenadas do Make.

## Não objetivos

- Telas finais, navegação ou integração com stores.
- Host global ou fila de toasts.
- Gestos de arrastar o sheet, focus trap web ou notificações nativas.
- Assets PNG, textura `feTurbulence`, confete ou animações complexas.
- Emulador, development build ou validação visual nativa nesta etapa.

## Critérios de aceite

- AC-01: todos os componentes usam os tokens existentes e suportam dark mode.
- AC-02: Toast anuncia mensagens e ações possuem alvo mínimo de 48 dp.
- AC-03: BottomSheet fecha por backdrop e `onRequestClose`, preserva toques no
  conteúdo e anuncia modalidade e título.
- AC-04: StatCard compõe uma descrição acessível de tag, valor e legenda.
- AC-05: ProgressLeaves e WaterBar limitam valores e expõem progressbar.
- AC-06: as folhas preenchidas usam preenchimento vetorial, não emoji.
- AC-07: BrottoPlant respeita estágios, tamanhos, humores e label acessível.
- AC-08: nenhum componente usa emoji como substituto de ícone ou ilustração.
- AC-09: testes, typecheck, lint, Prettier, Expo Doctor e Tailwind passam.

## APIs aprovadas

- `ToastProps`: `message`, `visible?`, `tone?`, `actionLabel?`, `onAction?`.
- `BottomSheetProps`: `visible`, `onClose`, `variant?`, `title?`, `eyebrow?`,
  `showCloseButton?`, `children` e props compatíveis do Modal quando seguras.
- `StatCardProps`: `tag`, `value`, `caption?`, `size?`, `className?`.
- `ProgressLeavesProps`: `current`, `total?`, `accessibilityLabel?`.
- `WaterBarProps`: `value`, `total`, `label?`.
- `BrottoPlantProps`: `stage`, `mood?`, `size?`, `accessibilityLabel?`.

## Plano de testes

- Primeiro vermelho para APIs, estados e SVG ainda ausentes.
- Interações de Toast e BottomSheet com React Native Testing Library.
- Limites negativos, acima do total, total zero e valores não finitos.
- Quantidade, preenchimento e deslocamento das folhas por estágio/humor.
- Ausência de emoji e presença das classes dark relevantes.
- Regressão completa sem iniciar Expo ou qualquer alvo nativo.

## Evidências de conclusão

- `pnpm run test`: 6 arquivos e 125 testes aprovados.
- `pnpm run typecheck`, `pnpm run lint` e `pnpm exec prettier --check
--ignore-unknown .`: aprovados.
- `pnpm install --frozen-lockfile --lockfile-only`: lockfile consistente.
- `npx expo-doctor`: 21 de 21 verificações aprovadas.
- Tailwind CLI e `git diff --check`: aprovados.
- Revisão independente corrigiu ação de Toast sem callback, contraste do ícone
  de fechamento em dark mode e tamanhos numéricos inválidos da planta.
- Nenhum servidor Expo, emulador, dispositivo ou build nativo foi iniciado;
  validação visual e nativa permanece deliberadamente fora desta etapa.

## Histórico

- 2026-10-06: contrato criado a partir do Figma Make e implementado com testes
  antes da produção.
- 2026-10-06: validação integrada concluída após revisão independente e
  correções de robustez e acessibilidade.
