# @clickguard/ui

The design system the prototype is built from, consumed as a workspace package. Storybook at
the repository root documents these same source files; the prototype in `src/app` imports
them by name:

```ts
import { DecisionSummary, ThreatTable } from '@clickguard/ui';
import '@clickguard/ui/styles.css';
```

- `src/tokens/` the token files. The only place a raw hex or pixel value may appear.
- `src/styles.css` the single CSS entry.
- `src/<Name>/` one component per folder: `Name.tsx`, `Name.module.css`, `Name.stories.tsx`.
- `src/index.ts` the public entry point. Nothing outside this package imports a component file directly.
