# Privacy and Security Principles

## Current prototype

The current studio runs in the browser. Saving an appearance exports a JSON file locally; this branch does not add accounts, a database, analytics, or a server-side avatar store.

## Future data handling

- Treat avatar appearance and identity preferences as user-controlled personal data.
- Collect only data required for a clearly stated feature.
- Explain what is stored, why, for how long, and how users can export or delete it.
- Require explicit consent before cloud synchronization or sharing.
- Do not infer sensitive traits, ethnicity, religion, or other identity attributes from a character.
- Do not use user-created avatars or edits for model training without separate, informed opt-in.
- Provide versioned export and deletion paths.

## Server-side requirements before launch

- Authenticate and authorize every private avatar read/write.
- Validate schema, size, asset identifiers, and ownership server-side.
- Rate-limit uploads and prevent arbitrary remote asset URLs.
- Scan and constrain uploaded files; never serve user uploads as executable content.
- Apply least-privilege storage policies and audit privileged actions.
- Define retention, backup, deletion, and incident-response procedures.

## Security boundary

Client-side validation improves user experience but is not a security boundary. Any future API must repeat validation and authorization on the server.
