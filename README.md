# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/0f2329e5-71cc-4ed7-b9ad-7622f15b75de

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0f2329e5-71cc-4ed7-b9ad-7622f15b75de) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Why aren't my leads or contacts showing up in Supabase?

Leads, bonus signups, and analytics events are now routed through a dedicated
data capture endpoint before falling back to direct Supabase writes. This makes
it possible to use Bolt New (or any other backend) to capture submissions and
hydrate your Supabase tables server-side.

Here's the order of operations:

1. **Backend endpoint (`VITE_DATA_CAPTURE_ENDPOINT`)** – If configured, every
   submission is posted to this URL first. The endpoint is expected to relay the
   payload to Supabase (or any other persistence layer) and return the stored
   record. This is the recommended way to integrate with Bolt New backend
   functions.
2. **Direct Supabase client** – If the backend endpoint is unavailable and the
   browser has a valid Supabase configuration, the app falls back to writing
   directly with the Supabase JavaScript client.
3. **Other transports** – Google Sheets, webhooks, Formspree, Netlify forms,
   and finally localStorage remain as additional fallbacks so no submission is
   lost.

### Required environment variables

Add the following entries to your `.env` file (or hosting provider):

```bash
# Primary Bolt New / custom backend endpoint
VITE_DATA_CAPTURE_ENDPOINT=https://your-bolt-new-function-url

# Direct Supabase access (used as fallback)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

With these values in place the app can persist leads and contacts through your
Bolt New backend functions while still retaining the enhanced client-side
fallbacks.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0f2329e5-71cc-4ed7-b9ad-7622f15b75de) and click on Share -> Publish.

**Important**: The project includes a `.env.production` file and `netlify.toml` configuration that ensures Supabase environment variables are included in production builds. These files ensure that data capture works correctly in deployed environments, not just in the Lovable preview.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
