# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

Aplicativo React Native com Expo SDK 57, Expo Router, React 19.2, React Native
0.86, TypeScript 6, pnpm 11 e Node.js 22.13 ou superior. O produto usa
development builds porque as etapas futuras dependem de código nativo que não
roda no Expo Go.

## Users

Pessoas brasileiras, principalmente entre 16 e 35 anos, que querem reduzir o
uso impulsivo de redes sociais e outras distrações para estudar, trabalhar,
dormir melhor ou recuperar tempo livre.

## Product Purpose

O Brotto combina bloqueio de aplicativos, sessões de foco, agendamentos e uma
planta virtual que torna a consistência visível. O resultado principal é o
"tempo protegido": minutos efetivamente concluídos em sessões de foco.

## Positioning

Menos scroll. Mais você. O produto ajuda a recuperar atenção sem culpa e mostra
o que foi conquistado, em vez de enfatizar tempo perdido ou falhas.

## Operating Context

O aplicativo funciona em iOS e Android. Dados de uso, listas de bloqueio,
agendamentos e progresso permanecem no aparelho sempre que possível. O MVP não
possui login. A navegação principal tem Início, Bloqueios, Foco, Agenda e Você.

## Capabilities and Constraints

- O bloqueio real exigirá extensões de Screen Time no iOS e serviços nativos no
  Android; eles não fazem parte da primeira etapa.
- A primeira integração real de pagamento será um endpoint do backend próprio
  para checkout Pix. Nesta etapa, o provedor é apenas uma interface com mock.
- Bloqueio, foco, agenda e estatísticas completas dependem de assinatura ativa.
- O dia fecha à meia-noite no fuso registrado no início dele.
- O estágio máximo da planta e a maior sequência nunca regridem.
- Dependências precisam ser compatíveis com Expo SDK 57 e development builds.

## Brand Commitments

Nome: Brotto. Tom jovem, brasileiro, curto e acolhedor. A linguagem pode usar
"bora", "tá" e "pra" quando natural. A planta representa crescimento, nunca
punição; ela pode murchar, mas não morre. A identidade usa Nunito para títulos,
Inter para interface e a paleta verde, âmbar e creme definida no briefing.

## Evidence on Hand

- `DOCUMENTACAO_PRODUTO.md`: especificação funcional consolidada.
- `brotto-fluxo.html`: mapa local do protótipo e divergências conhecidas.
- Figma Make `8TBAmKMgwqfV2x8R9fPeNg`.
- Não há depoimentos, nota de loja, ícones finais de aplicativos nem ilustração
  final da planta; esses elementos não devem ser inventados.

## Product Principles

1. Acolher sem culpar.
2. Mostrar ganhos reais, não estimativas de perda.
3. Reduzir decisões repetidas com uma lista central de distrações.
4. Preservar privacidade e processamento local.
5. Gamificar de forma simples, sem moedas, inventário ou ameaças.

## Accessibility & Inclusion

Controles precisam respeitar alvos de toque, leitores de tela, contraste e a
preferência de reduzir movimento. Recusar ou revogar uma permissão suspende
somente a função afetada e sempre oferece um caminho compreensível de correção.
