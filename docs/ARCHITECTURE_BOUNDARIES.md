# Architecture Boundaries

## 1. Architectural intent

ArCode Persona is an independent product and should remain decoupled from any single ArCode application. Its internal implementation may evolve without forcing consuming platforms to adopt the same frontend, rendering runtime, or persistence implementation.

## 2. Logical areas

The following are conceptual boundaries, not a commitment to a particular framework or deployment topology.

### Persona Experience
Owns the user-facing creation and customization workflow, preview, and presentation controls.

### Character Definition
Owns the canonical, versioned description of a persona: selected features, customization values, and references to compatible assets. The exact schema remains to be designed.

### Asset Catalog
Owns metadata and compatibility rules for face components, hair, eyes, clothing, accessories, materials, and other approved assets.

### Rendering Adapter
Translates a canonical persona definition into a visual representation. The rendering implementation must remain replaceable behind a defined boundary.

### Persona Service
Owns authorized operations for creating, retrieving, updating, and deleting persona records, subject to the eventual account and data model.

### Integration Contract
Defines the stable interface through which external ArCode platforms request persona data or presentation outputs. It should be versioned and documented.

## 3. Dependency direction

- The core persona model must not depend on Darija-LexReview.
- Consuming platforms must not need direct access to internal storage.
- Platform-specific identity and session details should be translated at an integration boundary.
- Rendering technology details should not leak into the canonical persona schema unless a capability genuinely requires it.
- Asset identifiers and schema versions must be explicit and validated.

## 4. Data and user control

The future design must specify:
- Ownership and authorization for every persona record.
- Visibility and sharing controls.
- Data export and deletion behavior.
- Validation of asset references and customization values.
- Safe handling of uploaded or user-provided assets, if that capability is approved.

No production data model or policy is established by this planning document.

## 5. Compatibility and evolution

- Version the canonical persona schema.
- Version external API contracts independently where practical.
- Define migration and compatibility behavior before changing persisted formats.
- Reject unknown or incompatible asset references safely.
- Keep integration examples and contract tests alongside the interface specification.

## 6. Quality gates before integration

An integration should not be enabled until the project has:
1. A reviewed and versioned persona schema.
2. Authentication and authorization rules.
3. Documented API/SDK contracts.
4. Compatibility and contract tests.
5. Performance and security review for the target environment.
6. Explicit approval to connect the consuming platform.

## 7. Explicitly undecided

This document does not select a frontend framework, 3D engine, asset format, database, hosting provider, API protocol, or authentication provider. Those choices require target-platform and product requirements first.
