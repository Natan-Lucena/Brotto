# Auditoria de contraste — primeira onda de telas (AC-12)

Gerada por `src/theme/contrast.ts` (WCAG 2.x, luminância relativa) e travada pelo
teste `src/theme/contrast.test.ts`: o teste falha se um par novo falhar ou se um
par registrado como falha passar a passar. `src/theme/tokens.ts` **não** foi
alterado (D-05).

Limiares: 4,5:1 para texto normal; 3:1 para texto grande e componentes de UI.

## Pares que passam

| Tema   | Uso                                                         | Razão       |
| ------ | ----------------------------------------------------------- | ----------- |
| claro  | texto sobre fundo / card / card suave                       | ≥ 7         |
| claro  | botão primário, botão CTA, botão secundário, tag StatCard   | ≥ 4,5       |
| claro  | borda do plano selecionado (`primary` sobre `surface`)      | ≥ 3         |
| claro  | toast de erro e de sucesso (texto escuro `dark.bg`)         | ≥ 4,5       |
| escuro | texto, botões, chip selecionado, tag StatCard (`secondary`) | ≥ 4,5       |
| escuro | indicador de carregamento (`secondary` sobre `bg`)          | ≥ 3         |
| escuro | borda de plano não selecionado, toasts                      | ≥ 3 / ≥ 4,5 |

(Valores exatos: execute `auditContrast()`.)

## Pares que falham (aguardam decisão do responsável de produto — D-05)

| Tema   | Uso                                                               | Razão | Mínimo         | Mitigação nesta onda                                                                                                               | Proposta de token                                                                   |
| ------ | ----------------------------------------------------------------- | ----- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| claro  | `textMuted` (#8A958C) sobre `bg` #FBF7F0                          | ≈ 2,9 | 4,5            | Telas usam `text` em todo texto informativo; `textMuted` só vem de `Toggle` (descrição, não usada no Setup) e `StatCard` (legenda) | `textMuted` claro → `#667168` (4,76 sobre `bg`) ou `#6A756C` (4,50)                 |
| claro  | `textMuted` sobre `surface` #FFFFFF                               | ≈ 3,2 | 4,5            | idem                                                                                                                               | mesmo valor acima                                                                   |
| claro  | borda de plano não selecionado (`border` #E8E2D6) sobre `surface` | ≈ 1,3 | 3 (componente) | O plano é identificado também por texto, preço e papel `radio` com estado                                                          | borda de plano → `#8F8A7E` (3,44) ou fundo/realce adicional                         |
| escuro | `primary` #2F6B4F como cor de ícone/texto sobre `bg` #16201B      | ≈ 2,7 | 3              | Telas não usam `primary` como cor de texto/ícone no escuro (usam `secondary` ou `text`)                                            | `dark.primary` → `#4F9A73` (4,94 sobre `bg`; o texto escuro sobre ele também passa) |

`dark.primarySoft`, `dark.ctaSoft` e `dark.border` repetem o tema claro e não são
usados como fundo de texto no escuro nesta onda.

## Observação sobre o StatCard

O `StatCard` (componente existente) usa `text-textMuted` na legenda. As telas da
onda usam a legenda de forma informativa na Home ("regando seu Brotto", "hoje");
ela herdará a correção quando o token for aprovado.
