# LinkScope

**Edge-native URL shortener with global analytics**

LinkScope is a distributed URL shortening platform built on the Cloudflare edge network.
It provides fast global redirects, real-time analytics, and a modern SaaS dashboard.

Unlike traditional URL shorteners that rely on centralized servers, LinkScope runs entirely on the edge using Cloudflare Workers, enabling low latency and high scalability.

---

## Features

- **Global Edge Redirects**
  Short links resolve from the nearest Cloudflare edge location.

- **Real-Time Analytics**
  Track link clicks, devices, and geolocation in real time.

- **Secure Authentication**
  User authentication powered by Clerk.

- **Durable Analytics Pipeline**
  Uses Durable Objects to coordinate analytics writes.

- **User Dashboard**
  Manage links and view analytics from a modern SaaS UI.

- **Link Expiration**
  Optional expiry support for temporary links.

- **Device Detection**
  Tracks desktop, mobile, and bot traffic.

---

## 🏗 Architecture

```
                 ┌───────────────┐
                 │   Next.js UI  │
                 │  (Dashboard)  │
                 └───────┬───────┘
                         │
                         │ JWT Auth
                         ▼
              ┌─────────────────────┐
              │ Cloudflare Workers  │
              │   (Hono API)        │
              └─────────┬───────────┘
                        │
             ┌──────────▼───────────┐
             │  Durable Objects     │
             │  Analytics Engine    │
             └──────────┬───────────┘
                        │
                 ┌──────▼───────┐
                 │ Cloudflare D1│
                 │  SQL Database│
                 └──────────────┘
```

### Request Flow

1. User creates a short link via the dashboard.
2. The request is authenticated with Clerk.
3. Cloudflare Worker stores the link in D1.
4. When a short link is accessed:
   - The Worker retrieves the target URL.
   - Analytics are recorded via a Durable Object.
   - The user is redirected to the original URL.

---

## Tech Stack

### Frontend

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- shadcn/ui components
- Clerk authentication

### Backend

- Cloudflare Workers
- Hono framework
- Durable Objects
- Cloudflare D1 database

### Infrastructure

- Cloudflare Edge Network
- Wrangler CLI

---

## Project Structure

```
linkscope/
│
├─ apps/
│   ├─ api/      # Cloudflare Worker backend
│   │
│   └─ web/      # Next.js SaaS dashboard
│
├─ README.md
└─ .gitignore
```

---

## Local Development

### 1. Clone the repository

```
git clone https://github.com/yourusername/edgelink.git
cd linkscope
```

---

### 2. Run the API (Cloudflare Worker)

```
cd apps/api
npx wrangler dev
```

Worker runs at:

```
http://localhost:8787
```

---

### 3. Run the Dashboard

```
cd apps/web
npm run dev
```

Dashboard runs at:

```
http://localhost:3000
```

---

## Authentication

LinkScope uses Clerk for authentication.

The frontend obtains a JWT session token and sends it with API requests:

```
Authorization: Bearer <JWT>
```

The Cloudflare Worker verifies the token using Clerk’s backend SDK before processing requests.

---

## Analytics Pipeline

Click analytics are processed using Durable Objects:

1. Redirect request hits the Worker.
2. The Worker forwards analytics events to a Durable Object.
3. The Durable Object batches and writes events to D1.
4. The dashboard queries aggregated analytics.

This design prevents race conditions and supports high concurrency.

---

## Why Edge Architecture?

Traditional URL shorteners rely on centralized servers, which increases latency for global users.

LinkScope instead runs on Cloudflare’s edge network, allowing:

- Global low-latency redirects
- Automatic scaling
- Reduced infrastructure management

---

## Future Improvements

- Global caching for faster link resolution
- Rate limiting at the edge
- QR code generation for links
- Aggregated analytics dashboards
- Custom domains for short links

## Author

Built by **Shriyansh Sharma**
