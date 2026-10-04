# Brotto Mobile

Base do Brotto em Expo SDK 57, preparada somente para **development builds**. O app nao roda no Expo Go: as futuras integracoes nativas exigem um cliente de desenvolvimento instalado. Rode `pnpm install` e copie `.env.example` para `.env` antes de trabalhar no app.

## Development builds

1. Crie um build de desenvolvimento para o destino desejado:
   - iOS Simulator: `eas build --profile development-simulator --platform ios`
   - iOS device: `eas build --profile development-device --platform ios`
   - Android device: `eas build --profile development-device --platform android`
2. Instale o artefato resultante no simulador ou dispositivo.
3. Com o development build instalado, inicie o Metro com `pnpm start` e abra o projeto no cliente de desenvolvimento.

Os comandos acima descrevem o fluxo esperado; o build nativo ainda nao foi validado neste repositorio.

## Estrutura

`src/components` reúne UI e o placeholder do Brotto; `src/services` contém contratos/mocks de bloqueio, pagamentos, SQLite e notificações; `src/features` organiza os domínios; e `src/app` contém as rotas Expo Router.

## Decisoes atuais

- O tema usa o mecanismo de `colorScheme` do NativeWind, mantendo a escolha inicial do sistema e permitindo a alternancia tipada entre claro e escuro.
- A planta usa regras puras de streak, rega, estagios, virada do dia e tempo protegido, cobertas por testes.
- Bloqueio nativo, extensoes, backend e pagamentos reais continuam fora desta etapa; checkout Pix e servicos permanecem mocks locais.

## Proximos passos

- Validar development builds em iOS e Android antes de ativar integracoes nativas.
- Implementar os servicos nativos de bloqueio e as extensoes de plataforma.
- Conectar o fluxo de pagamento a um backend proprio para checkout Pix.

Validacao local: `pnpm test`, `pnpm typecheck`, `pnpm lint` e `pnpm format:check`.
