# GitHub Pages Deployment Diagnosis

## Executive Summary

After thorough analysis of the codebase, build configuration, and deployment setup, I've identified the **most likely root causes** of any GitHub Pages issues. The build configuration appears correct, but there are critical external dependencies (Supabase settings, GitHub secrets) that must be properly configured.

---

## ✅ Confirmed Working Components

### 1. Build Configuration
**Status**: ✅ **CORRECT**

The build process correctly generates a GitHub Pages-ready SPA:

```bash
# Build output verification:
- All assets prefixed with /PriorityMatrix/
- basename set to "/PriorityMatrix/" in window context
- 404.html correctly copied to build/client/
- index.html has correct modulepreload paths
```

**Evidence from build**:
```html
<link rel="modulepreload" href="/PriorityMatrix/assets/manifest-98f3ed31.js"/>
<script>window.__reactRouterContext = {"basename":"/PriorityMatrix/", ...}
```

### 2. Vite Configuration
**Status**: ✅ **CORRECT**

`vite.config.ts` properly reads `VITE_APP_BASE_PATH`:
```typescript
base: env.VITE_APP_BASE_PATH || '/',  // ✅ Correctly set to /PriorityMatrix/
```

### 3. React Router Configuration
**Status**: ✅ **CORRECT**

`react-router.config.ts` properly configures SPA mode:
```typescript
ssr: false,  // ✅ Static SPA
basename: process.env.VITE_APP_BASE_PATH || '/',  // ✅ Reads from env
```

### 4. SPA Redirect Mechanism
**Status**: ✅ **CORRECT**

The 404.html redirect logic:
```javascript
// Example: /PriorityMatrix/todos → /PriorityMatrix/?redirect=/todos
var segments = l.pathname.split("/").filter(Boolean);  // ["PriorityMatrix", "todos"]
var pathSegmentsToKeep = segments.length > 1 ? 1 : 0;  // 1
var repoPrefix = segments.slice(0, 1).join("/");       // "PriorityMatrix"
```

The `GitHubPagesRedirect` component in `root.tsx` correctly handles the redirect.

---

## 🔴 Critical Issues to Check

### Issue #1: Supabase Redirect URL Not Whitelisted
**Likelihood**: 🔥 **VERY HIGH**
**Impact**: Authentication will completely fail

#### Problem
The magic link email contains a redirect URL that must be whitelisted in Supabase. Currently, the code constructs:

```typescript
// From app/routes/login.tsx (lines 62-63)
const baseUrl = new URL(import.meta.env.BASE_URL || "/", window.location.origin);
baseUrl.pathname = `${baseUrl.pathname.replace(/\/$/, "")}/auth/callback`;
// Result: https://username.github.io/PriorityMatrix/auth/callback
```

#### Solution
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Add to **Redirect URLs**:
   ```
   https://<username>.github.io/PriorityMatrix/auth/callback
   ```
   Replace `<username>` with your GitHub username (e.g., `NickKasten`)

5. **Also add** (for testing):
   ```
   http://localhost:5173/auth/callback
   ```

#### How to Verify
- Check Supabase logs after attempting login
- Look for "redirect_uri not whitelisted" errors

---

### Issue #2: GitHub Repository Secrets Not Configured
**Likelihood**: 🔥 **HIGH**
**Impact**: App will not connect to Supabase

#### Problem
The GitHub Actions workflow requires these secrets:
```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

If not set, the build will succeed but the app won't be able to connect to Supabase.

#### Solution
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add both secrets:

   **Secret 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: Your Supabase project URL (e.g., `https://xxxxxxxxxxxxx.supabase.co`)

   **Secret 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: Your Supabase anon/public key (from Supabase Dashboard → Settings → API)

#### How to Verify
- Go to **Actions** tab → Select latest workflow run
- Expand the "Build static site" step
- The build should complete without "Missing Supabase environment variables" errors
- After deployment, open browser DevTools → Console
- You should NOT see: "Missing Supabase environment variables"

---

### Issue #3: Supabase Site URL Configuration
**Likelihood**: 🟡 **MEDIUM**
**Impact**: Email links may point to wrong domain

#### Problem
Supabase uses a "Site URL" setting that affects magic link generation.

#### Solution
1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to:
   ```
   https://<username>.github.io/PriorityMatrix
   ```
3. Ensure the URL does NOT have a trailing slash unless your code expects it

#### How to Verify
- Request a magic link
- Check your email
- The link should point to your GitHub Pages domain

---

### Issue #4: GitHub Pages Not Enabled or Misconfigured
**Likelihood**: 🟡 **MEDIUM**
**Impact**: Site won't be accessible

#### Problem
GitHub Pages must be configured to use GitHub Actions as the deployment source.

#### Solution
1. Go to repository **Settings** → **Pages**
2. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions**
   - **Branch**: Should show "Using GitHub Actions"
3. If you see "Your site is ready to be published at...", wait a few minutes

#### How to Verify
- Visit: `https://<username>.github.io/PriorityMatrix/`
- You should see the app (not a 404)

---

### Issue #5: CORS Configuration in Supabase
**Likelihood**: 🟢 **LOW**
**Impact**: API requests will be blocked

#### Problem
Supabase might not allow requests from the GitHub Pages domain.

#### Solution
Usually auto-configured, but verify:
1. Go to Supabase Dashboard → **Settings** → **API**
2. Check if your GitHub Pages domain is in the allowed origins
3. If not, you may need to contact Supabase support or check project settings

#### How to Verify
- Open browser DevTools → Network tab
- Attempt to login
- Look for CORS errors in console
- API requests should have `Access-Control-Allow-Origin` headers

---

## 📊 Diagnostic Checklist

Use this checklist to systematically identify the issue:

### Pre-Deployment Checks
- [ ] **GitHub Secrets**: Both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- [ ] **Supabase Redirect URLs**: GitHub Pages callback URL is whitelisted
- [ ] **Supabase Site URL**: Set to GitHub Pages domain
- [ ] **GitHub Pages**: Enabled with "GitHub Actions" as source

### Post-Deployment Checks
- [ ] **Site Loads**: Visit `https://<username>.github.io/PriorityMatrix/`
- [ ] **Assets Load**: Check Network tab - all CSS/JS files load (not 404)
- [ ] **No Console Errors**: Check for "Missing Supabase environment variables"
- [ ] **Routing Works**: Navigate to `/todos` and verify it doesn't 404
- [ ] **Auth Works**: Try to login and receive magic link email

### Debugging Steps

#### Step 1: Check if the site loads at all
```
Visit: https://nickkasten.github.io/PriorityMatrix/
```
- ✅ **Site loads** → Go to Step 2
- ❌ **404 or blank page** → Check GitHub Pages settings and workflow status

#### Step 2: Check browser console
```
Press F12 → Console tab
```
- ✅ **No errors** → Go to Step 3
- ❌ **"Missing Supabase environment variables"** → Fix GitHub Secrets (Issue #2)
- ❌ **Asset 404 errors** → Rebuild with correct `VITE_APP_BASE_PATH`

#### Step 3: Test routing
```
Navigate to: https://nickkasten.github.io/PriorityMatrix/todos
```
- ✅ **Redirects to home or shows login** → Go to Step 4
- ❌ **Shows 404** → Check 404.html is in build output

#### Step 4: Test authentication
```
Go to /login and enter email
```
- ✅ **"Check your email" message** → Check email and Step 5
- ❌ **Error message** → Check Supabase connectivity and capacity

#### Step 5: Test magic link
```
Click link in email
```
- ✅ **Redirects to app and logs in** → ✨ Everything works!
- ❌ **"redirect_uri not allowed"** → Fix Supabase redirect URL (Issue #1)
- ❌ **Other error** → Check browser console and Supabase logs

---

## 🔬 Advanced Debugging

### View Workflow Logs
1. Go to **Actions** tab in GitHub
2. Click the latest workflow run
3. Expand each step to see detailed logs
4. Look for:
   - Build errors
   - Missing environment variables
   - Deployment failures

### Test Build Locally
```bash
# Set environment variables
export VITE_APP_BASE_PATH=/PriorityMatrix/
export VITE_SUPABASE_URL=your_url
export VITE_SUPABASE_ANON_KEY=your_key

# Build
npm run build -- --mode production

# Serve locally (simulates GitHub Pages)
npx serve build/client --single

# Visit http://localhost:3000/PriorityMatrix/
```

### Check Supabase Auth Logs
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Logs**
3. Look for failed auth attempts
4. Check error messages

### Inspect Network Traffic
1. Open DevTools → Network tab
2. Attempt to login
3. Look for:
   - Failed API requests (status 400/401/403/500)
   - CORS errors
   - Wrong URLs being called

---

## 🚀 Recommended Fix Order

Based on likelihood and impact, fix issues in this order:

1. **First**: Verify GitHub Secrets are set (Issue #2)
2. **Second**: Add GitHub Pages URL to Supabase redirect URLs (Issue #1)
3. **Third**: Set Supabase Site URL (Issue #3)
4. **Fourth**: Verify GitHub Pages is enabled (Issue #4)
5. **Last**: Check CORS if still failing (Issue #5)

---

## 📝 Quick Smoke Test

After making changes, run this quick test:

```bash
# 1. Trigger a new deployment
git commit --allow-empty -m "Trigger deployment"
git push

# 2. Wait for deployment (check Actions tab)

# 3. Visit the site
# Navigate to: https://<username>.github.io/PriorityMatrix/

# 4. Check DevTools console for errors

# 5. Try to login

# 6. Check email for magic link

# 7. Click link and verify login works
```

---

## 🎯 Most Likely Root Cause

Based on the codebase analysis, the **#1 most likely issue** is:

### 🔥 Supabase Redirect URL Not Whitelisted (Issue #1)

**Why**: The build configuration is correct, but Supabase has strict security around redirect URLs. If the exact GitHub Pages callback URL isn't whitelisted, authentication will silently fail or show a "redirect_uri not allowed" error.

**Fix**: Add `https://nickkasten.github.io/PriorityMatrix/auth/callback` to Supabase allowed redirect URLs.

---

## 📚 Additional Resources

- [Supabase Auth Deep Dive](https://supabase.com/docs/guides/auth)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [React Router GitHub Pages Guide](https://reactrouter.com/en/main/guides/github-pages)

---

## 💬 Need More Help?

If issues persist after following this guide:

1. Check the browser console for specific error messages
2. Review Supabase Auth logs for failed attempts
3. Verify all environment variables are correctly set
4. Test locally with the same environment variables

**Common "gotchas"**:
- Trailing slashes in URLs (be consistent)
- Copy/paste errors in environment variables
- Cached DNS/CDN issues (try incognito mode)
- Case sensitivity in URLs
