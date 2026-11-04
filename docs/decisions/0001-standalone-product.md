# ADR 0001: ArCode Persona as a Standalone Product

- **Status:** Accepted
- **Date:** 2026-11-04
- **Decision owners:** ArCode Persona project stakeholders

## Context

ArCode Persona is intended to provide reusable, high-quality customizable digital characters. It is expected to serve Darija-LexReview and other future ArCode platforms. Building it inside one consuming platform would create unnecessary coupling and make reuse harder.

## Decision

Develop ArCode Persona as an independent product and repository.

The core persona model, customization system, asset catalog, rendering boundary, and future integration contract belong to this product. Consuming platforms should integrate through documented, versioned interfaces.

## Consequences

### Positive
- One persona system can serve multiple platforms.
- The core can evolve independently of consuming applications.
- Integration boundaries can be tested and versioned.
- Platform-specific UI and identity concerns can remain outside the core.

### Trade-offs
- The project must define and maintain stable contracts.
- Authentication, authorization, and account mapping need explicit design.
- Compatibility and versioning require ongoing discipline.

## Constraints

This decision does not select implementation technologies and does not authorize integration with any existing platform. Those decisions require separate review and approval.
