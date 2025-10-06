# Deployment Guide - Netlify Configuration

## Critical: Environment Variables Setup

Your application requires environment variables to be configured in Netlify for data capture to work on your live website.

### Step 1: Access Netlify Environment Variables

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site/project
3. Navigate to **Site configuration** → **Environment variables** (or **Build & deploy** → **Environment variables**)
4. Click **Add a variable** or **Add environment variables**

### Step 2: Add Required Variables

Add the following environment variables **EXACTLY** as shown:

#### Variable 1: VITE_SUPABASE_URL
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://0ec90b57d6e95fcbda19832f.supabase.co`
- **Scopes**: All (Production, Deploy Previews, Branch deploys)

#### Variable 2: VITE_SUPABASE_ANON_KEY
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw`
- **Scopes**: All (Production, Deploy Previews, Branch deploys)

#### Variable 3: VITE_GOOGLE_SHEETS_URL (Optional - for fallback)
- **Key**: `VITE_GOOGLE_SHEETS_URL`
- **Value**: Your Google Apps Script Web App URL (when configured)
- **Scopes**: All (Production, Deploy Previews, Branch deploys)

### Step 3: Trigger a Redeploy

After adding the environment variables:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the build to complete (usually 2-5 minutes)

OR

1. Make a small change to your code
2. Commit and push to trigger automatic deployment

### Step 4: Verify the Deployment

After deployment completes:

1. Visit your live site from a phone or external browser
2. Submit a test form (package order or bonus signup)
3. Check your Supabase database to verify the data was saved
4. Visit `/analytics` on your live site to see the data

## Troubleshooting

### Issue: Forms submit but data doesn't save

**Solution**: Environment variables not configured in Netlify
- Follow Step 1-3 above to add the variables
- Make sure to redeploy after adding variables

### Issue: "Database Not Configured" error

**Solution**: Environment variables have typos or incorrect values
- Double-check the variable names start with `VITE_`
- Verify the values match exactly (no extra spaces)
- Redeploy after fixing

### Issue: Build succeeds but site doesn't work

**Solution**: Clear cache and redeploy
1. Go to **Site configuration** → **Build & deploy**
2. Click **Clear cache and retry deploy**
3. Wait for fresh build to complete

### Issue: Works locally but not on live site

**Solution**: This confirms environment variables are missing from Netlify
- Local development reads from `.env` file
- Production must read from Netlify environment variables
- Add the variables as described in Step 2

## Verifying Environment Variables Are Loaded

To verify your environment variables are properly configured:

1. Visit your live site
2. Open browser console (F12)
3. Type: `import.meta.env.VITE_SUPABASE_URL`
4. Should show: `https://0ec90b57d6e95fcbda19832f.supabase.co`
5. If it shows `undefined`, the variables aren't configured in Netlify

## Alternative: Using netlify.toml (Not Recommended)

You can also configure environment variables in `netlify.toml`, but this is NOT recommended because:
- Environment variables in code are visible in your repository
- Less secure than Netlify dashboard configuration
- Can't easily change without code commits

If you still want to use netlify.toml:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  VITE_SUPABASE_URL = "https://0ec90b57d6e95fcbda19832f.supabase.co"
  VITE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Important Notes

### About VITE_ Prefix
- Vite only exposes environment variables that start with `VITE_`
- Variables without this prefix won't be available in your app
- Never remove the `VITE_` prefix

### Security
- The `ANON_KEY` is safe to expose publicly (it's an anonymous key with limited permissions)
- Row Level Security (RLS) policies protect your data
- Users can only INSERT data, not DELETE or modify existing data

### Google Sheets Fallback
- Google Sheets integration is optional but recommended
- Follow `GOOGLE_SHEETS_SETUP.md` for configuration
- Add `VITE_GOOGLE_SHEETS_URL` to Netlify after setup

## Deployment Checklist

Before going live, verify:

- [ ] Environment variables added to Netlify dashboard
- [ ] Site redeployed after adding variables
- [ ] Test form submission from external device/browser
- [ ] Data appears in Supabase database
- [ ] Analytics dashboard displays data at `/analytics`
- [ ] No console errors on live site
- [ ] Forms show success message after submission

## Getting Help

If you're still having issues after following this guide:

1. Check Netlify build logs for errors
2. Verify environment variables are spelled correctly
3. Test Supabase connection directly
4. Check browser console for error messages
5. Verify RLS policies allow anonymous inserts

## Next Steps After Deployment

1. Configure Google Sheets fallback (optional)
2. Set up monitoring/alerts for form submissions
3. Regularly check Analytics dashboard
4. Export data periodically for backup
