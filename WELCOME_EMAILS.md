# Automatic welcome emails

New first email confirmations enqueue exactly one message per auth user. The AFTER UPDATE trigger only observes email_confirmed_at changing from NULL to a timestamp. Existing confirmed accounts are not backfilled, and subsequent sign-ins, password resets or email updates do not create another message. Already-confirmed inserts (e.g. social sign-in or admin-created accounts) intentionally do not trigger this email-confirmation flow.

The template is selected from the server-maintained private.provider_accounts mapping. All other eligible users receive the customer template. Employees and anonymous accounts are excluded. This routing grants no permissions and never changes provider approval status.

The pg_cron job `sponti-welcome-emails` checks for work every minute and invokes the worker only when work is due. The outbox is private with RLS; public RPC wrappers are invoker functions granted only to service_role. The worker has its own 256-bit invocation credential in Vault (`welcome_worker_token`); its non-secret SHA-256 digest is in worker-config.ts. Therefore the function uses verify_jwt=false and verifies that scoped bearer credential itself before any database access.

The Resend sending-only credential is restricted to sponti-switzerland.ch and stored encrypted in Vault as `welcome_resend_api_key`. The worker retrieves it with a service-role-only RPC. Never commit or display the credential. To deploy to another project, provision new Vault secrets, update the project URL in dispatch_welcome_emails and regenerate worker-config.ts with only the token digest.

Messages use immutable v1 templates (mail.ts), the confirmed email snapshot and deterministic Resend idempotency keys. Preserve the v1 payload while its jobs are retrying; future template revisions should introduce a separately versioned payload/key. Claims are atomic with SKIP LOCKED and a three-minute lease. At most five messages are processed per invocation, with 600 ms between sends. Transient failures retry with exponential delays. Eight attempts or a 20-hour retry window stop further automatic attempts, keeping uncertain retries inside Resend's 24-hour deduplication window. Failed/cancelled rows require review; never blindly reset an uncertain row after that window.

`sent` means Resend accepted the message, not proof of inbox delivery. `resend_id` permits delivery investigation in Resend. The worker rechecks the recipient's confirmed email and excludes changed/deleted/ineligible accounts before sending.

The old send-customer-welcome endpoint remains as a no-send compatibility response to prevent duplicate sends by older clients. Existing legacy log tables are preserved.

Validation:
- `supabase/tests/welcome_emails.sql`: transaction with rollback, tests confirmation routing, no pre-confirmation mail, employee exclusion, repeated login, old accounts, lease ownership, retry delay/window, and access grants. No mail is sent by this test. Run while the outbox is empty or against a development database.
- `node welcome-email.test.cjs`: mocked worker tests for both templates, worker authentication, recipient eligibility, retries/permanent failures and deterministic idempotency. Requires the repository's esbuild dependency.
- Production worker health checked through a signed Vault-backed request against an empty queue; no historical users were contacted.

Operational queries (database administrator only):
```sql
select kind,status,count(*) from private.welcome_email_outbox group by kind,status;
select user_id,kind,status,attempts,last_error,resend_id from private.welcome_email_outbox where status in ('failed','cancelled');
select status,return_message,start_time from cron.job_run_details where jobid=(select jobid from cron.job where jobname='sponti-welcome-emails') order by start_time desc limit 5;
```

Apply migrations in order and deploy both Edge Functions. Confirmation templates in Authentication → Emails remain separate from these post-confirmation welcome emails.
