# Quality Gates

## Pull request checks

- Dependency installation succeeds on the supported Node version.
- Avatar configuration unit tests pass.
- Vite production build completes.
- The generated static output is uploaded as a pull-request artifact.
- No production deployment occurs from a pull request.

## Manual release checks

- Arabic RTL layout and keyboard navigation.
- Touch interactions, drag rotation, zoom bounds, and small-screen layout.
- WebGL unavailable / reduced capability fallback behavior.
- Mobile frame time, memory, initial download size, and asset loading.
- Garment clipping and animation deformation.
- Asset licensing, provenance, and cultural review.
- Export/import compatibility for each supported schema version.

## Current limitations

The built-in procedural blockout now binds its generated body parts to a stable humanoid skeleton with normalized two-bone weights, and the procedural face/nose surfaces expose runtime morph targets. This is an engineering foundation, not a production-quality sculpted base mesh: production topology, animation deformation QA, authored facial shapes, cloth simulation, authentic garment geometry, automated visual regression, and browser-level E2E tests remain planned work.
