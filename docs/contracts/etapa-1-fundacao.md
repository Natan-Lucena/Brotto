# Etapa 1 - Fundação do Brotto Mobile

## Objetivo

Criar a base tipada e testada do aplicativo Brotto em Expo SDK 57, pronta para
development builds e para receber as implementações nativas e de pagamento nas
próximas etapas.

## Escopo

- Configuração do Expo Router em `src/app`, NativeWind, TypeScript strict,
  ESLint, Prettier, Husky, lint-staged e Vitest.
- Configuração de development builds e perfis EAS.
- Tokens compartilhados entre TypeScript e Tailwind, fontes Nunito e Inter e
  splash retido até o carregamento.
- Rotas placeholder navegáveis e componentes com API pública inicial.
- Interfaces e mocks de bloqueio e pagamento.
- SQLite com migrations versionadas para as sete tabelas solicitadas.
- Regras puras de streak, rega, estágio, virada do dia e tempo protegido.

## Não objetivos

- Telas finais ou reprodução visual completa do protótipo.
- Bloqueio nativo, extensões iOS ou serviços Android.
- Checkout real, backend, AbacatePay ou compras em loja.
- Build nativo, submissão EAS ou configuração de credenciais.

## Decisões

1. A raiz de rotas será `src/app`, suportada pelo Expo Router.
2. `src/theme/tokens.ts` é a fonte de verdade; o Tailwind importa os valores
   compiláveis desse módulo sem duplicar literais de design.
3. O pagamento começa com mock sem assinatura; a implementação real posterior
   chama um backend próprio para checkout Pix.
4. Recursos pagos usam um guard reutilizável que redireciona para o paywall.
5. Comentários em `app.config.ts` documentam integrações nativas futuras sem
   declarar permissões ou entitlements prematuramente.
6. Nenhum build nativo ou emulador faz parte da validação desta etapa.

## Critérios de aceite

- AC-01: dependências e versões são compatíveis com Expo SDK 57 e não incluem
  os pacotes explicitamente removidos.
- AC-02: `app.config.ts` e `eas.json` representam os identificadores, splash e
  perfis solicitados, sem permissões nativas futuras ativas.
- AC-03: todas as rotas solicitadas existem como placeholders e as cinco abas
  estão configuradas.
- AC-04: tokens, fontes, tema claro/escuro e providers são tipados.
- AC-05: BlockingService e PaymentProvider possuem interfaces, tipos e mocks;
  o mock de entitlement alterna por flag pública de desenvolvimento.
- AC-06: migrations criam todas as tabelas e índices necessários de forma
  versionada e idempotente.
- AC-07: testes cobrem soma mínima das sessões, critério dos agendamentos,
  limites dos estágios, não regressão, quebra de streak, fuso e remoção de
  sobreposição no tempo protegido.
- AC-08: `pnpm run test`, `pnpm run typecheck` e `pnpm run lint` terminam com
  código zero.

## Verificação

```text
pnpm run test
pnpm run typecheck
pnpm run lint
pnpm exec prettier --check .
npx expo-doctor
```

O build nativo e a validação visual ficam deliberadamente pendentes.
