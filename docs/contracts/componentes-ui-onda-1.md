# Componentes UI - Onda 1

## Objetivo

Transformar os primitivos provisórios do Brotto em componentes reutilizáveis,
tipados, acessíveis e coerentes com os tokens e fluxos extraídos do Figma Make.

## Fontes

1. `PRODUCT.md` e `DOCUMENTACAO_PRODUTO.md` para comportamento e linguagem.
2. `brotto-fluxo.html`, gerado a partir do Figma Make
   `8TBAmKMgwqfV2x8R9fPeNg`, para usos, estados e hierarquia.
3. `src/theme/tokens.ts` para cores, tipografia, raios e espaçamento.

Durante a implementação inicial, o Figma não estava exposto às ferramentas do
OpenCode. O acesso ao Make foi validado depois via Claude Code, mas esta onda
ainda não passou por auditoria visual direta contra o arquivo remoto. Nenhum
detalhe ausente das fontes locais foi inventado.

## Escopo

- `Button`: variantes `primary`, `cta`, `secondary` e `ghost`; tamanhos,
  largura total, loading, disabled e ícones opcionais.
- `Card`: variantes `surface`, `soft` e `outlined`, além de opção interativa.
- `Chip`: seleção, disabled e semântica acessível.
- `Toggle`: rótulo, descrição, estado e alvo de toque próprios.
- `Stepper`: limites, passo, unidade, estados disabled e anúncio do valor.
- `SegmentedControl`: opções com `label` e `value`, seleção e disabled.

## Não objetivos

- Telas finais, navegação ou stores de feature.
- `Toast`, `BottomSheet`, indicadores e ilustração final do Brotto.
- Novas dependências, build nativo ou alteração dos tokens aprovados.

## Critérios de aceite

- AC-01: todos os controles têm alvo mínimo de 48 dp e estado acessível.
- AC-02: loading e disabled impedem ações no `Button`.
- AC-03: `Chip` e `SegmentedControl` anunciam a seleção.
- AC-04: `Toggle` possui rótulo acessível e descrição opcional.
- AC-05: `Stepper` nunca ultrapassa limites, rejeita passo inválido e anuncia
  valor e unidade.
- AC-06: os componentes usam tokens/classes sem cores literais próprias.
- AC-07: tema escuro mantém superfícies e texto legíveis.
- AC-08: testes, typecheck, lint e Prettier passam.

## Plano de testes

- Testes de componente com React Native Testing Library.
- Primeiro vermelho por APIs/estados ainda ausentes.
- Casos de interação, bloqueio de ação e propriedades de acessibilidade.
- Validação integrada sem abrir servidor, emulador ou build nativo.
