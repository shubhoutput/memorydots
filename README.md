# memorydots

memorydots is a two-player memory and focus game. The game rules and product
decisions live in [GAME_SPEC.md](./GAME_SPEC.md), the source of truth for
implementation.

## Apps

- `apps/web`: Next.js client
- `apps/game-server`: Colyseus server for future Remote and Random modes

The current code is a clean app foundation; gameplay is not implemented yet.
Build order is Local, Remote, Random, then Bot, using the shared rules engine
described in the spec.

## Development

Run each app from the repository root in a separate terminal:

```sh
npm --prefix apps/web run dev
npm --prefix apps/game-server run dev
```

See each app's README for its local setup and commands.
