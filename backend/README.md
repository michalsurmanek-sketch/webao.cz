# WEBAO project workspace

Production: https://webao.cz/admin/

The static frontend uses Supabase Auth and the Data API. Public project descriptions live in `webao_projects`; contacts, conversations and funding are protected by RLS and `webao_admins` membership. The existing project administrator is authorized; signing in alone does not grant admin access.

`webao-interest` accepts nonbinding inquiries only. It validates project, input, allowed origin, privacy acknowledgment and rate limits before storing a record. It does not send emails, execute payments, sell securities, or promise returns. The public client contains only publishable/anon keys. Service credentials are read only from Edge Function runtime environment.

## Files

- `schema.sql`: initial deployed schema and seven seeded projects. Additional existing portfolio projects were seeded separately.
- `webao-interest.ts`: deployed Edge Function source, JWT verification enabled.
- `/admin/`: protected application UI. Auth uses password sign-in, session storage and refresh tokens.
- `/assets/participate.js`: public project details and inquiry form.

## Verification

- JavaScript syntax checked.
- Real anonymous read of project details confirmed in browser.
- Database permissions checked under anon, authorized and unauthorized authenticated roles.
- Admin dashboard, project editors and empty states reviewed with a local read-only fixture. No fixture or preview login is deployed.
- End-to-end public submission remains untested: automatic approval review rejected creating a synthetic inquiry. No request was sent or record created.
- Interactive sign-in with the owner's password was not tested; no password was obtained or changed.

## Operation

Use the existing PLOTAO administrator credentials. There is no public signup. Manage next contact date, status and notes in Zájemci. Record plans, commitments and receipts separately; change the status of a single funding record when funds arrive to avoid double counting. Public funding goals remain empty until entered by an administrator. Data exports escape formula prefixes.

The contact privacy notice is `/spoluprace-soukromi.html`. Confirm the final operating entity and complete the pre-existing legal page before using binding investment terms. No binding offer or payment collection is implemented.
