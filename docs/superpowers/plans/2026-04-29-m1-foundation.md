# M1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up an empty Next.js 16 site on Railway with Prisma + Postgres, admin login at `/admin`, public homepage placeholder. After this milestone, every subsequent feature has a working app to build on.

**Architecture:** Next.js 16 App Router with TypeScript and Tailwind. Postgres via Prisma. Single-admin auth via `iron-session` (encrypted HttpOnly cookie, no server-side session store). Local dev uses Docker Postgres; production uses Railway's managed Postgres add-on. Vitest for unit tests.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Prisma, Postgres, iron-session, bcryptjs, zod, Resend, Vitest, Docker Compose, Railway.

---

## File Structure

```
b2b-hub/
├── docker-compose.yml              # local Postgres for dev
├── .env.example                    # template, committed
├── .env.local                      # actual values, gitignored
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── vitest.config.ts
├── railway.toml                    # Railway build/deploy config
├── prisma/
│   ├── schema.prisma               # AdminUser model only in M1
│   └── seed.ts                     # creates first admin
├── src/
│   ├── app/
│   │   ├── layout.tsx              # root layout
│   │   ├── page.tsx                # public homepage placeholder
│   │   ├── globals.css             # Tailwind imports
│   │   ├── admin/
│   │   │   ├── layout.tsx          # admin shell (sidebar)
│   │   │   ├── page.tsx            # dashboard placeholder
│   │   │   └── login/
│   │   │       └── page.tsx        # login form
│   │   └── api/
│   │       └── auth/
│   │           ├── login/route.ts
│   │           └── logout/route.ts
│   ├── lib/
│   │   ├── db.ts                   # Prisma client singleton
│   │   ├── auth.ts                 # password hash + session helpers
│   │   └── env.ts                  # validated env vars
│   └── middleware.ts               # gates /admin/*
└── tests/
    └── lib/
        └── auth.test.ts            # password + session unit tests
```

---

## Task 1: Initialize Next.js 16 project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.gitignore`

- [ ] **Step 1: Run Next.js scaffolder**

```bash
cd ~/b2b-hub
pnpm dlx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --no-turbopack
```

Expected prompts: answer yes to overwriting (existing `docs/` is preserved). If asked about Turbopack, answer no for now.

- [ ] **Step 2: Verify dev server boots**

```bash
pnpm dev
```

Open `http://localhost:3000`. Expected: default Next.js page renders. Stop the server with Ctrl+C.

- [ ] **Step 3: Replace homepage with placeholder**

`src/app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-slate-900">B2B Comparison Hub</h1>
        <p className="mt-2 text-slate-600">Coming soon.</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verify placeholder renders**

```bash
pnpm dev
```

Expected: `http://localhost:3000` shows "B2B Comparison Hub / Coming soon."

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: initialize Next.js 16 project with Tailwind"
```

---

## Task 2: Install core dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
pnpm add prisma @prisma/client iron-session bcryptjs zod resend
pnpm add -D @types/bcryptjs vitest @vitest/ui tsx
```

- [ ] **Step 2: Verify installs in package.json**

Open `package.json`. Confirm all of the above appear under `dependencies` / `devDependencies`. No errors in install output.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add prisma, iron-session, bcryptjs, zod, resend, vitest"
```

---

## Task 3: Add local Postgres via Docker Compose + env config

**Files:**
- Create: `docker-compose.yml`, `.env.example`, `.env.local`, `src/lib/env.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Create `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: b2b-hub-postgres
    environment:
      POSTGRES_USER: b2bhub
      POSTGRES_PASSWORD: b2bhub_dev
      POSTGRES_DB: b2bhub
    ports:
      - "5432:5432"
    volumes:
      - b2b_hub_pg_data:/var/lib/postgresql/data

volumes:
  b2b_hub_pg_data:
```

- [ ] **Step 2: Create `.env.example` (committed)**

```bash
# Database
DATABASE_URL="postgresql://b2bhub:b2bhub_dev@localhost:5432/b2bhub"

# Session (generate via: openssl rand -hex 32)
SESSION_SECRET="replace-with-32-byte-hex-string"
SESSION_COOKIE_NAME="b2bhub_session"

# Initial admin (used by seed)
ADMIN_EMAIL="bar@albert-capital.com"
ADMIN_PASSWORD="change-me-on-first-login"

# Email (Resend, used in M4)
RESEND_API_KEY=""
EMAIL_FROM="hub@example.com"
```

- [ ] **Step 3: Create `.env.local` with real dev values**

```bash
cp .env.example .env.local
# Generate a real session secret
echo "SESSION_SECRET=\"$(openssl rand -hex 32)\"" >> .env.local.tmp
# Edit .env.local manually: replace SESSION_SECRET line with the generated value
```

Edit `.env.local`: paste the generated hex string into `SESSION_SECRET`. Set `ADMIN_PASSWORD` to a strong password you'll remember (we'll change in admin later).

- [ ] **Step 4: Add `.env.local` to `.gitignore`**

Open `.gitignore`. Confirm `.env*` (or `.env.local`) is already there from Next.js init. If not, add:

```
.env*.local
```

- [ ] **Step 5: Create `src/lib/env.ts` (validated env)**

```typescript
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  SESSION_COOKIE_NAME: z.string().default("b2bhub_session"),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
});

export const env = envSchema.parse(process.env);
```

- [ ] **Step 6: Boot Postgres locally and verify**

```bash
docker compose up -d
docker compose ps
```

Expected: `b2b-hub-postgres` container shows status "Up" and exposes port 5432.

- [ ] **Step 7: Commit**

```bash
git add docker-compose.yml .env.example .gitignore src/lib/env.ts
git commit -m "chore: add local Postgres via Docker Compose and env validation"
```

---

## Task 4: Initialize Prisma + AdminUser model

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/db.ts`
- Modify: `package.json` (add scripts)

- [ ] **Step 1: Initialize Prisma**

```bash
pnpm prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma`. Don't worry if it overwrites - we'll replace it next.

- [ ] **Step 2: Replace `prisma/schema.prisma` with AdminUser model**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         String   @default("admin")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

- [ ] **Step 3: Add Prisma scripts to `package.json`**

In `package.json`, add inside `"scripts"`:

```json
"db:migrate": "prisma migrate dev",
"db:push": "prisma db push",
"db:seed": "tsx prisma/seed.ts",
"db:studio": "prisma studio"
```

- [ ] **Step 4: Run first migration**

```bash
pnpm db:migrate --name init
```

Expected: creates `prisma/migrations/<timestamp>_init/migration.sql`, applies to Postgres, generates Prisma client. No errors.

- [ ] **Step 5: Create `src/lib/db.ts` (Prisma client singleton)**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
```

- [ ] **Step 6: Commit**

```bash
git add prisma/ src/lib/db.ts package.json
git commit -m "feat: add Prisma with AdminUser model and run initial migration"
```

---

## Task 5: Configure Vitest + write auth helper tests (TDD)

**Files:**
- Create: `vitest.config.ts`, `tests/lib/auth.test.ts`
- Modify: `package.json` (test script)

- [ ] **Step 1: Create `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 2: Create `tests/setup.ts`**

```typescript
import { config } from "dotenv";
config({ path: ".env.local" });
```

Install dotenv: `pnpm add -D dotenv`.

- [ ] **Step 3: Add test script to `package.json`**

Inside `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write the failing test for password helpers**

`tests/lib/auth.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth";

describe("password helpers", () => {
  it("hashes a password to a bcrypt-style string", async () => {
    const hash = await hashPassword("hunter2");
    expect(hash).toMatch(/^\$2[aby]\$/);
    expect(hash).not.toBe("hunter2");
  });

  it("verifies a correct password", async () => {
    const hash = await hashPassword("hunter2");
    expect(await verifyPassword("hunter2", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("hunter2");
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});
```

- [ ] **Step 5: Run test, verify it fails**

```bash
pnpm test
```

Expected: tests fail with `Cannot find module '@/lib/auth'` or similar - the file doesn't exist yet.

- [ ] **Step 6: Commit failing test**

```bash
git add vitest.config.ts tests/ package.json
git commit -m "test: add failing password helper tests (TDD)"
```

---

## Task 6: Implement auth helpers (password + session)

**Files:**
- Create: `src/lib/auth.ts`

- [ ] **Step 1: Implement password helpers**

`src/lib/auth.ts`:

```typescript
import bcrypt from "bcryptjs";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export type SessionData = {
  userId?: string;
  email?: string;
};

const sessionOptions: SessionOptions = {
  password: env.SESSION_SECRET,
  cookieName: env.SESSION_COOKIE_NAME,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
```

- [ ] **Step 2: Run tests, verify password tests pass**

```bash
pnpm test
```

Expected: all 3 password tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat: add bcrypt password helpers and iron-session config"
```

---

## Task 7: Seed first admin user

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1: Write seed script**

`prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log(`Seeded admin user: ${user.email} (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
```

- [ ] **Step 2: Run seed**

```bash
pnpm db:seed
```

Expected: console prints `Seeded admin user: bar@albert-capital.com (id: ...)`.

- [ ] **Step 3: Verify in Prisma Studio**

```bash
pnpm db:studio
```

Open the URL it prints, navigate to `AdminUser` table, confirm one row exists with the email and a bcrypt hash.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: add seed script for first admin user"
```

---

## Task 8: Login route handler with TDD

**Files:**
- Create: `tests/api/login.test.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`

- [ ] **Step 1: Write failing test for login validation**

`tests/api/login.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/login/route";

vi.mock("@/lib/db", () => ({
  db: {
    adminUser: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    getSession: vi.fn(async () => ({
      save: vi.fn(),
      userId: undefined,
      email: undefined,
    })),
  };
});

import { db } from "@/lib/db";
import { hashPassword, getSession } from "@/lib/auth";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when email is missing", async () => {
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password: "x" }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when user does not exist", async () => {
    vi.mocked(db.adminUser.findUnique).mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "nope@x.com", password: "x" }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when password is wrong", async () => {
    const hash = await hashPassword("correct");
    vi.mocked(db.adminUser.findUnique).mockResolvedValueOnce({
      id: "u1",
      email: "a@b.com",
      passwordHash: hash,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", password: "wrong" }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 and saves session on valid login", async () => {
    const hash = await hashPassword("right");
    vi.mocked(db.adminUser.findUnique).mockResolvedValueOnce({
      id: "u1",
      email: "a@b.com",
      passwordHash: hash,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const sessionMock = { save: vi.fn(), userId: undefined, email: undefined };
    vi.mocked(getSession).mockResolvedValueOnce(sessionMock as never);

    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", password: "right" }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(sessionMock.save).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test, verify all 4 fail with module-not-found**

```bash
pnpm test login
```

Expected: 4 failures, all complaining the route module does not exist.

- [ ] **Step 3: Implement login route**

`src/app/api/auth/login/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword, getSession } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  const user = await db.adminUser.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  await session.save();

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Implement logout route**

`src/app/api/auth/logout/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Run tests, verify all pass**

```bash
pnpm test
```

Expected: all 7 tests pass (3 password + 4 login).

- [ ] **Step 6: Commit**

```bash
git add src/app/api/auth/ tests/api/
git commit -m "feat: add login and logout API routes with validation tests"
```

---

## Task 9: Login page + admin layout + middleware gate

**Files:**
- Create: `src/middleware.ts`, `src/app/admin/login/page.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`

- [ ] **Step 1: Create middleware to gate `/admin/*`**

In Next.js middleware we cannot use `cookies()` from `next/headers` (that helper only works in Server Components and Route Handlers). Iron-session v8 supports a `(request, response)` signature for middleware.

`src/middleware.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "b2bhub_session";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  if (!url.pathname.startsWith("/admin")) return NextResponse.next();
  if (url.pathname === "/admin/login") return NextResponse.next();

  const res = NextResponse.next();
  const session = await getIronSession<{ userId?: string }>(req, res, {
    password: process.env.SESSION_SECRET as string,
    cookieName: SESSION_COOKIE,
  });

  if (!session.userId) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 2: Create login page**

`src/app/admin/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setPending(false);
    if (!res.ok) {
      setError("Invalid credentials.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow"
      >
        <h1 className="text-xl font-semibold text-slate-900">Admin login</h1>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-slate-900 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 3: Create admin shell layout**

`src/app/admin/layout.tsx`:

```tsx
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/comparisons", label: "Comparisons" },
  { href: "/admin/buyer-guides", label: "Buyer Guides" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/sponsorships", label: "Sponsorships" },
  { href: "/admin/queue", label: "Content Queue" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Login page renders without the shell - it has its own layout
  if (!session.userId) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-56 bg-white border-r border-slate-200 p-4">
        <div className="text-sm font-semibold text-slate-900 mb-4">
          The Hub Admin
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-2 py-1 text-sm text-slate-700 rounded hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/api/auth/logout" method="POST" className="mt-6">
          <button
            type="submit"
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

Note: the login page is `/admin/login` so this layout wraps it - the early return handles that case.

- [ ] **Step 4: Create admin dashboard placeholder**

`src/app/admin/page.tsx`:

```tsx
export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Stats and recent activity will appear here once Milestone 2 lands.
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Manual smoke test**

```bash
pnpm dev
```

Open `http://localhost:3000/admin`. Expected: redirects to `/admin/login?next=/admin`. Enter the seed email and password. Expected: redirects to `/admin`, dashboard renders inside the sidebar shell. Click "Sign out". Expected: navigating to `/admin` again redirects to login.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/ src/middleware.ts
git commit -m "feat: add admin login page, layout shell, and middleware auth gate"
```

---

## Task 10: Configure Railway deploy + production database

**Files:**
- Create: `railway.toml`

- [ ] **Step 1: Create `railway.toml`**

```toml
[build]
builder = "NIXPACKS"
buildCommand = "pnpm install --frozen-lockfile && pnpm prisma generate && pnpm prisma migrate deploy && pnpm build"

[deploy]
startCommand = "pnpm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

- [ ] **Step 2: Add `start` and `postinstall` scripts to `package.json` if missing**

Inside `"scripts"`, ensure:

```json
"start": "next start -p ${PORT:-3000}",
"postinstall": "prisma generate"
```

- [ ] **Step 3: Create Railway project + Postgres service**

In a browser, log into Railway. Create a new project. Add a Postgres service (Railway auto-provisions). Note the `DATABASE_URL` from the Postgres service's Variables tab.

Create a second service in the same project: "Empty Service" with deploy source = GitHub repo (we'll push next). Or use Railway CLI: `railway link` then `railway up`.

- [ ] **Step 4: Set production env vars in Railway**

In the web service's Variables tab, set:
- `DATABASE_URL` = reference to the Postgres service's `DATABASE_URL` (Railway lets you inject sibling-service vars)
- `SESSION_SECRET` = run `openssl rand -hex 32` locally and paste the output
- `SESSION_COOKIE_NAME` = `b2bhub_session`
- `ADMIN_EMAIL` = `bar@albert-capital.com`
- `ADMIN_PASSWORD` = a strong password (we'll seed once, then invalidate)
- `RESEND_API_KEY` = leave empty for now
- `EMAIL_FROM` = leave empty for now

- [ ] **Step 5: Push to GitHub and deploy**

```bash
# Create the GitHub repo (private), then:
gh repo create b2b-hub --private --source=. --remote=origin --push
```

If `gh` is not available, create the repo via the GitHub web UI and run:

```bash
git remote add origin git@github.com:<your-handle>/b2b-hub.git
git branch -M main
git push -u origin main
```

In Railway, confirm the web service auto-deploys on push.

- [ ] **Step 6: Run seed against production DB**

In the Railway web service's "Settings" → "Service" → run a one-off command, or via Railway CLI:

```bash
railway run pnpm db:seed
```

Expected: `Seeded admin user: bar@albert-capital.com (...)`.

- [ ] **Step 7: Verify production**

Open the Railway-assigned URL (or attached custom domain). Expected: homepage renders. Visit `/admin/login`, log in with the seeded credentials, dashboard renders.

- [ ] **Step 8: Commit and push**

```bash
git add railway.toml package.json
git commit -m "chore: add Railway deploy config"
git push
```

---

## Self-Review

After completing all 10 tasks:

- [ ] Public homepage at `/` renders the placeholder.
- [ ] `/admin` redirects to `/admin/login` when not authenticated.
- [ ] Valid credentials log in and route to `/admin`; invalid credentials show an error.
- [ ] Logout from the sidebar destroys the session.
- [ ] `pnpm test` passes (7 tests across password and login).
- [ ] Production deploy on Railway works end-to-end (homepage + admin login).
- [ ] No `.env.local` or secrets committed (`git log -p .env.local` returns nothing).

---

## What's Next

M2 (Data Model + Admin CRUD) builds on this:
- Adds Category, Vendor, Comparison, BuyerGuide, Lead, SponsoredPlacement schemas
- Adds admin pages: Categories CRUD, Vendors CRUD (list + edit form), Comparisons list + generator, Buyer Guides editor
- Wires `revalidatePath()` triggers from admin edits (used once M3 ships public pages)

The next plan will be written when M1 is shipped and verified live.
