# TanStack DB with Cloudflare D1 Demo

This project demonstrates how to integrate [TanStack DB](https://tanstack.com/db/latest/docs/overview) with [Cloudflare D1](https://developers.cloudflare.com/d1/) to build a modern, typesafe, and efficient data layer for your applications, all running on [Cloudflare Workers](https://developers.cloudflare.com/workers/frameworks/framework-guides/tanstack/).

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/harshil1712/tanstack-db-d1-demo)

## Overview

This demo showcases:
- Setting up and configuring a Cloudflare D1 database.
- Using TanStack DB to directly query and mutate data in the D1 database in a typesafe manner from your Cloudflare Worker.
- A simple frontend to display and manage data, interacting with server functions powered by TanStack DB and D1.

## Key Technologies

- **[TanStack DB](https://tanstack.com/db/latest/docs/overview):** For typesafe database querying and mutations.
- **[Cloudflare D1](https://developers.cloudflare.com/d1/):** A serverless SQL database provided by Cloudflare.
- **[Cloudflare Workers](https://workers.cloudflare.com/):** For running serverless functions that interact with D1.

## Prerequisites

Before you begin, ensure you have the following:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- A package manager: `npm`, `pnpm`, or `yarn`.
- A [Cloudflare account](https://dash.cloudflare.com/sign-up).
- It's recommended to have the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and configured (`wrangler login`) if you plan to manage your D1 database or deploy Cloudflare Workers.

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/harshil1712/tanstack-db-d1-demo 
    cd tanstack-db-d1-demo
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    ```

3.  **Configure Cloudflare D1 Database:**
    *   If you don't have an existing D1 database for this demo, you can create one using the Wrangler CLI. Give it a name (e.g., `tanstack-d1-demo-db`).
        ```bash
        npx wrangler d1 create tanstack-d1-demo-db
        ```
    *   Wrangler will output the `database_name` and `database_id`. You'll need to ensure your `wrangler.jsonc` file is configured to bind this D1 database to your Worker. A typical D1 binding configuration in `wrangler.jsonc` looks like this:
        ```jsonc
        // Example snippet for wrangler.jsonc
        {
          // ... other configurations
          "d1_databases": [
            {
              "binding": "DB", // This is how your Worker code will access the database (e.g., env.DB)
              "database_name": "your-d1-database-name",
              "database_id": "<your-actual-database-id>",
              "preview_database_id": "<your-preview-database-id>" // For local development with `wrangler dev`
            }
          ]
          // ... other configurations
        }
        ```
        Replace `"your-d1-database-name"`, `"<your-actual-database-id>"`, and `"<your-preview-database-id>"` with your actual D1 database details.

4. **Create a todos table:**
```bash
npx wrangler d1 execute DB --file=./db/schema.sql --local
```

## Development

**Start the development server:**
This command usually starts your frontend application and the Cloudflare Workers development environment.
```bash
npm run dev
# or
pnpm run dev
# or
yarn run dev
```
Your application should then be available locally (e.g., at `http://localhost:5173` or another port specified by your development script).

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/harshil1712/tanstack-db-d1-demo/issues).
