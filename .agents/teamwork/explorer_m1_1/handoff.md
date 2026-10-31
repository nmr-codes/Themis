# Milestone 1 Technical Investigation Report: Build Stability, Linting & Route Protection

**Agent**: Explorer M1_1  
**Milestone**: Milestone 1 (Foundation, Build Stability & Editorial Design System)  
**Target Files**:
- `src/lib/supabase/middleware.ts`
- `.eslintrc.json` (root)
- `src/app/layout.tsx` (secondary font warning)

---

## 1. Observation

### Observation 1.1: `src/lib/supabase/middleware.ts:40` Compile Error
- **Exact File Path**: `c:\Users\Bro\Desktop\Themis\src\lib\supabase\middleware.ts`
- **Original Code Snippet** (lines 35-41):
  ```typescript
  remove(name: string, options: CookieOptions) {
    request.cookies.set({ name, value: "", ...options });
    response = NextResponse.next({
      request: { headers: request.headers },
    });
    response.cookies.set({ name, value, ...options });
  },
  ```
- **Verbatim Error** during `npm run build`:
  ```
  ./src/lib/supabase/middleware.ts:40:40
  Type error: No value exists in scope for the shorthand property 'value'. Either declare one or provide an initializer.

    38 |             request: { headers: request.headers },
    39 |           });
  > 40 |           response.cookies.set({ name, value, ...options });
       |                                        ^
    41 |         },
  ```
- **Context**: The `remove` method of `@supabase/ssr` has signature `remove(name: string, options: CookieOptions)`. Line 36 explicitly assigns `value: ""`, but line 40 erroneously used the shorthand object property `{ name, value, ...options }` referencing an undeclared `value` variable.
- **Current State**: Line 40 currently contains `response.cookies.set({ name, value: "", ...options });`. With this in place, `npx tsc --noEmit` exits with code 0.

### Observation 1.2: Fallback Condition Mismatch with `.env.local`
- **Exact File Path**: `c:\Users\Bro\Desktop\Themis\src\lib\supabase\middleware.ts` (lines 9-20)
- **Current Code**:
  ```typescript
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Graceful fallback for local development / demo mode when Supabase is unconfigured
  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl.includes("your-project") ||
    supabaseKey.includes("your-anon-key")
  ) {
    return response;
  }
  ```
- **Values in `c:\Users\Bro\Desktop\Themis\.env.local`** (lines 1-2):
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://placeholder-domain.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key
  ```
- **Default fallbacks in `src/lib/supabase/client.ts:4-5` and `src/lib/supabase/server.ts:6-7`**:
  ```typescript
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-domain.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  ```
- **Discrepancy**: Neither `"https://placeholder-domain.supabase.co"` nor `"placeholder-anon-key"` contains `"your-project"` or `"your-anon-key"`. Both variables are non-empty strings. Consequently, the fallback condition evaluates to `false`, and execution bypasses the intended early return.

### Observation 1.3: Unauthenticated Visitor Route Lockout on `/specialists`
- **Exact File Path**: `c:\Users\Bro\Desktop\Themis\src\lib\supabase\middleware.ts` (lines 45-59)
- **Current Code**:
  ```typescript
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");
  const isPublicPage =
    request.nextUrl.pathname === "/" || isAuthPage;

  if (!user && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  ```
- **Execution Trace on `/specialists` & `/specialists/[id]`**:
  - `request.nextUrl.pathname` = `"/specialists"`
  - `isAuthPage` = `false`
  - `isPublicPage` = `false` (only `/` and `/login`, `/register` are treated as public)
  - With mock/placeholder credentials, `supabase.auth.getUser()` yields `user === null`.
  - Condition `!user && !isPublicPage` evaluates to `true`.
  - Next.js issues HTTP 307 Redirect to `/login`.
- **PROJECT.md Architecture Specification**:
  Line 12: `Public routes: /, /specialists, /specialists/[id], /login, /register`
  Line 16: `API routes: /api/ai/chat`
  Under current middleware logic, public citizens cannot view the specialist catalog, individual attorney profiles, or make landing page triage API requests without being redirected to `/login`.

### Observation 1.4: `npm run lint` Interactive Blocking
- **Command Output from `npm run lint`**:
  ```
  > themis@0.1.0 lint
  > next lint

  ? How would you like to configure ESLint? https://nextjs.org/docs/basic-features/eslint
  ❯  Strict (recommended)
     Base
     Cancel ⚠ If you set up ESLint yourself, we recommend adding the Next.js ESLint plugin. See https://nextjs.org/docs/basic-features/eslint#migrating-existing-config
  ```
  Exited with code 1 due to non-interactive environment (no TTY input).
- **Inspection of Next.js Lint Engine** (`node_modules/next/dist/lib/eslint/hasEslintConfiguration.js`):
  Next.js checks for the existence and non-emptiness of `.eslintrc.*` (or `package.json.eslintConfig`). In the absence of an ESLint configuration file, it prompts interactively.
- **Verification with Test Config**:
  When tested against:
  ```json
  {
    "extends": "next/core-web-vitals"
  }
  ```
  ESLint runs non-interactively across all files in `src/`.
  Result: **0 errors, 1 warning** (`@next/next/no-page-custom-font` on `src/app/layout.tsx:24:9` due to Google Fonts `<link>` tag).

---

## 2. Logic Chain

1. **Compile Error Resolution (Observation 1.1)**:
   - TypeScript strictly checks object literal assignments.
   - In `remove(name: string, options: CookieOptions)`, `{ name, value, ...options }` assumes an in-scope variable `value`. Because the function arguments are only `name` and `options`, `value` is undefined in scope.
   - For HTTP cookie removal in Next.js response headers, setting `value: ""` with expired/zero-maxAge options or identical attributes tells the client to clear the cookie.
   - Explicitly providing `value: ""` resolves the compilation error while matching line 36 (`request.cookies.set({ name, value: "", ...options })`).

2. **Supabase Unconfigured Fallback (Observation 1.2)**:
   - When developing locally without a live remote Supabase instance, or running automated offline suites, the application relies on mock data and local storage auth (`themis_demo_user`).
   - `.env.local` contains placeholder strings starting with `placeholder-`.
   - The existing guard check only looks for `"your-project"` and `"your-anon-key"` (the placeholders in `.env.local.example`), failing to recognize `.env.local`'s `"placeholder-domain"` and `"placeholder-anon-key"`.
   - Adding `supabaseUrl.includes("placeholder") || supabaseKey.includes("placeholder")` ensures the middleware skips remote network authentication calls when running in offline/demo mode, preventing unexpected network latency, DNS resolution timeouts, and unauthenticated redirects.

3. **Public Route Access Fix (Observation 1.3)**:
   - A core value proposition of Themis is public discovery: citizens of Uzbekistan must freely search verified advocates, view judicial experience, and inspect consultation fee structures without prior account registration.
   - Restricting `isPublicPage` to `pathname === "/"` contradicts `PROJECT.md` §Routing Architecture and locks out visitors from `/specialists` and `/specialists/[id]`.
   - Furthermore, client-side triage on `/` issues asynchronous POST requests to `/api/ai/chat`. Redirecting API requests to `/login` HTML breaks the AI triage widget.
   - Expanding `isPublicPage` to include `pathname.startsWith("/specialists")` and `pathname.startsWith("/api")` restores expected public catalog browsing and API availability, while strictly preserving authentication gates on `/dashboard`, `/profile`, `/consultations`, `/specialist`, and `/admin`.

4. **Linting Configuration (Observation 1.4)**:
   - Adding `.eslintrc.json` with `"extends": "next/core-web-vitals"` satisfies Next.js's configuration check, immediately making `npm run lint` automated and non-interactive.
   - The existing 1 warning (`@next/next/no-page-custom-font`) is a non-breaking warning that does not cause `npm run lint` or `npm run build` to fail. As part of Milestone 1 Feature 35 (Bespoke Editorial Design System), migrating Google fonts to `next/font/google` in `layout.tsx` will eliminate even this warning.

---

## 3. Caveats

1. **Authentication in Pure Offline Mode**:
   - When `isUnconfigured` triggers, middleware returns `response` without validating Supabase JWT tokens. In this state, route protection for `/dashboard`, `/profile`, `/specialist/*`, and `/admin/*` relies on client-side layout guards (`themis_demo_user` checks in `src/app/(dashboard)/layout.tsx`, `src/app/(specialist)/specialist/layout.tsx`, and `src/app/(admin)/admin/layout.tsx`).
   - If a production Supabase instance is later hooked up via real `.env.local` keys, the middleware will automatically transition to enforcing server-side session checks via `supabase.auth.getUser()`.
2. **Font Warning in `layout.tsx`**:
   - The warning `@next/next/no-page-custom-font` on line 24 of `layout.tsx` will remain until Milestone 1 Implementer converts font loading from raw `<link>` to `next/font/google`. If desired, implementers can either ignore it (exit code is 0) or add `"@next/next/no-page-custom-font": "off"` to `.eslintrc.json` rules during transition.
3. **App Router Route Link Normalization**:
   - Internal links currently prefixed with `/dashboard/specialists` or `/dashboard/ai-chat` will be addressed in Milestone 2 Link Normalization as specified in `PROJECT.md`. The middleware fix ensures that direct visits to `/specialists` are cleanly served.

---

## 4. Conclusion & Proposed Code Implementation

The following concrete modifications are recommended for immediate implementation in Milestone 1:

### Proposed Change 1: `src/lib/supabase/middleware.ts`
Replace `src/lib/supabase/middleware.ts` with the hardened implementation below:

```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Graceful fallback for local development / demo mode when Supabase is unconfigured
  const isUnconfigured =
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl.includes("your-project") ||
    supabaseUrl.includes("placeholder") ||
    supabaseKey.includes("your-anon-key") ||
    supabaseKey.includes("placeholder");

  if (isUnconfigured) {
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isAuthPage =
      pathname.startsWith("/login") ||
      pathname.startsWith("/register");
    const isPublicPage =
      pathname === "/" ||
      pathname.startsWith("/specialists") ||
      pathname.startsWith("/api") ||
      isAuthPage;

    if (!user && !isPublicPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (user && isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  } catch (err) {
    // If auth session fails, allow continuing
    return response;
  }

  return response;
}
```

### Proposed Change 2: `.eslintrc.json` (Create in Root)
Create `c:\Users\Bro\Desktop\Themis\.eslintrc.json`:

```json
{
  "extends": "next/core-web-vitals"
}
```

---

## 5. Verification Method

To independently verify these conclusions and validate the fixes once applied:

### Step 1: Verify Non-Interactive Linting
Run the project lint command:
```powershell
npm run lint
```
- **Expected Result**: Exits with return code 0. No interactive prompts or aborts.

### Step 2: Verify TypeScript Compilation
Run the TypeScript compiler type-check:
```powershell
npx tsc --noEmit
```
- **Expected Result**: Exits with return code 0 and zero type errors.

### Step 3: Verify Production Next.js Build
Run the production Next.js build:
```powershell
npm run build
```
- **Expected Result**: Exits with return code 0. All 24 static and dynamic routes compiled and generated into `.next`.

### Step 4: Verify Public Specialist Route Accessibility
Start the development or production server and test public access to `/specialists`:
```powershell
# In PowerShell:
Invoke-WebRequest -Uri "http://localhost:3000/specialists" -MaximumRedirection 0 -SkipHttpErrorCheck
```
- **Expected Result**: HTTP status 200 OK (not 307 Redirect to `/login`).

### Invalidation Conditions
This report's conclusions are invalidated if:
1. Supabase SSR alters its cookie signature in breaking minor versions (currently `@supabase/ssr` is `0.5.0` which supports both `get/set/remove` and `getAll/setAll`).
2. Next.js App Router route group architecture is changed such that `/specialists` is moved under an authenticated route group.
