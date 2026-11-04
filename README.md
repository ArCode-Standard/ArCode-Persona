# ArCode Persona

ArCode Persona is an independent, reusable digital-persona platform within the ArCode ecosystem.

Its purpose is to let each person create and customize a high-quality avatar that reflects their real-world identity and personal style.

## Product direction

The intended customization areas include:

- Facial features and face shape
- Skin tone
- Hair style and color
- Eyes and other facial details
- Clothing
- Accessories

The experience should prioritize visual consistency, quality, expressive individuality, and meaningful user control.

## Long-term direction

ArCode Persona is being developed as a standalone product, with the intention of integrating it in the future into Darija-LexReview and other ArCode platforms.

Future integrations should be supported through stable, documented interfaces rather than platform-specific coupling.

## Project status

**Planning and architecture phase.** No production integration is enabled.

Implementation choices such as the 3D rendering stack, avatar asset pipeline, persistence model, and public SDK/API remain subject to explicit product decisions.

## Guiding principles

1. User expression and customization come first.
2. Keep the core product independent from consuming platforms.
3. Design for interoperability and versioned integration contracts.
4. Treat avatar data and user-created identity as user-controlled data.
5. Validate visual quality, accessibility, performance, and compatibility before release.

See the `docs/` directory for the product brief, architecture boundaries, and roadmap.
