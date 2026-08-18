# Mount Patrick Hotel — Architecture Decision Record

Project: Mount Patrick Hotel booking and hotel-operations system  
Date: 18 August 2026  
Status convention: `Accepted` means the decision is approved for the current MVP phase.

## ADR-001: Use Next.js App Router as the frontend framework

**Status:** Accepted

**Context:** The product needs a public booking experience, authenticated guest pages, and staff dashboards in one deployable application. The team is already working in a Next.js 16 repository and the current codebase uses the App Router.

**Decision:** Use Next.js 16 with the App Router, TypeScript, React 19, and Tailwind CSS for the frontend. Use Server Components by default and Client Components only for interactive controls.

**Consequences:** Shared layouts, route-level loading/error boundaries, server-side data access, and one deployment are straightforward. The team must follow Next.js 16 conventions, including `proxy.ts` instead of the deprecated `middleware.ts` convention, and must be deliberate about client/server boundaries.

## ADR-002: Use Next.js Route Handlers and Server Actions for the backend

**Status:** Accepted

**Context:** The MVP needs authenticated mutations, payment callbacks, a webhook, report downloads, and a small public API surface. A separate backend would add deployment, authentication, and coordination overhead for the current team and scope.

**Decision:** Use Next.js Server Actions for form-driven mutations inside the application and Next.js Route Handlers under `src/app/api` for HTTP integrations, downloads, webhooks, and callback endpoints. Validate external input at the boundary with Zod and keep provider secrets server-only.

**Consequences:** Frontend and backend contracts live in one repository and can share TypeScript types. Route Handlers must remain stateless and secure, payment webhooks must be idempotent, and long-running or high-volume jobs are deferred beyond this MVP.

## ADR-003: Use Supabase PostgreSQL as the primary database

**Status:** Accepted

**Context:** The system has relational hotel data: rooms, bookings, payments, profiles, reports, and audit logs. It also needs authentication, row-level authorization, file storage, and a low-cost hosted development environment.

**Decision:** Use Supabase PostgreSQL for application data, Supabase Auth for identity, Supabase Storage for room and identification images, SQL migrations for schema changes, and Row-Level Security for database-level access control.

**Consequences:** Relational constraints, transactions, indexes, SQL reporting, and RLS provide strong consistency and security. The team must apply migrations in order, avoid exposing the service-role key, and test policies with representative roles. The project is coupled to Supabase APIs for Auth and Storage.

## ADR-004: Use Supabase Auth with role-based authorization

**Status:** Accepted

**Context:** Guests need phone OTP and Google sign-in, while receptionists, administrators, owners, and housekeepers need different access levels. The database already models these roles in `profiles.role` and the application already uses server-side session checks.

**Decision:** Use Supabase Auth for phone OTP and Google OAuth. Create a `profiles` row from the Auth trigger, store the application role in the profile, enforce page/action guards in server code, refresh sessions through `src/proxy.ts`, and enforce data access with Supabase RLS policies.

**Consequences:** Identity and session handling are delegated to a managed service and the app can support multiple login methods. Role changes require protected admin paths and database safeguards. Proxy checks are only an optimistic first gate; authorization must still be enforced in server actions, Route Handlers, and RLS.

## ADR-005: Deploy the MVP on Vercel

**Status:** Accepted

**Context:** The application is a Next.js project with Route Handlers and a scheduled keep-alive endpoint. The team needs preview deployments for review and a simple production deployment path connected to the GitHub repository.

**Decision:** Deploy the web application to Vercel, connect the GitHub repository, configure production and preview environment variables, and use `vercel.json` for the scheduled keep-alive route. Supabase remains the managed data/Auth/Storage platform.

**Consequences:** Preview URLs, Git-based deployments, and native Next.js hosting reduce operational work. The team must configure secrets separately for each environment, verify webhook URLs after deployment, and keep serverless execution limits in mind for report generation. Large background processing and advanced observability remain future work.

## Decision summary

| Area | Decision | Current implementation |
| --- | --- | --- |
| Frontend | Next.js 16 App Router | `src/app`, React 19, Tailwind v4 |
| Backend | Route Handlers + Server Actions | `src/app/api`, feature `actions.ts` files |
| Database | Supabase PostgreSQL | `supabase/migrations`, typed client |
| Authentication | Supabase Auth + profile roles + RLS | `src/lib/auth.ts`, `src/proxy.ts` |
| Deployment | Vercel | `vercel.json`, Git-based deployment |
