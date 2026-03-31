# FlexiCare Mobile Web

Frontend Vue 3 + Tailwind CSS pour la plateforme FlexiCare, avec deux parcours:

- Prestataire
- Client

## Stack

- Vue 3
- Vue Router 4
- Pinia
- Axios
- Tailwind CSS
- Heroicons

## Démarrage

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Architecture

- `src/layouts/ProviderLayout.vue`
- `src/layouts/ClientLayout.vue`
- `src/pages/provider/*`
- `src/pages/client/*`
- `src/components/*`
- `src/stores/*`
- `src/services/*`

## API branchée

- `GET /api/provider/missions`
- `POST /api/missions/{id}/start`
- `POST /api/missions/{id}/complete`
- `POST /api/provider/status`
- `POST /api/missions`
- `POST /api/reviews`

## Matching contract

See [docs/api-matching-contract.md](./docs/api-matching-contract.md) for the full mission matching flow, candidate ranking, tracking, and provider availability contract.
