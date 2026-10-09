# ZoroMart — Java Servlet Marketplace

A black-and-gold multi-seller e-commerce capstone project aligned to the supplied R2025 Semester 3 specification. The app uses Java 17, Tomcat 9 (`javax.servlet`), Maven, JDBC, H2, HikariCP, Gson, BCrypt and vanilla JavaScript.

> **Honest project status:** source code and local run instructions are included. A live public deployment has not been created from this workspace. Before submission, build/test it on your machine, deploy the WAR to your college-approved Tomcat/cloud host, verify every journey, and add the real URL/screenshots here.

## Features included

- Buyer/Seller registration and login; Admin is provisioned as a seed account (no admin signup).
- BCrypt password hashing, `HttpSession`, session ID renewal on login, 30-minute timeout.
- Product listing create/edit/delete for the owning seller; buyer search and category filter.
- JDBC/H2 persistence for products, users, carts, orders, order items and reviews.
- Quantity updates/removal, server-side total calculation, mock checkout transaction and stock decrement.
- Buyer order history; seller incoming-order list; admin user/order views, listing moderation and order status changes.
- Reviews/rating submission only when the order status is `DELIVERED`.
- Floating product FAQ chatbot; default mock provider works offline; optional Gemini provider reads `GEMINI_API_KEY` only from the server environment, has an 8-second request timeout, per-session 10-message/minute limit, 500-character input limit, and cached repeated questions.
- `/api/v1/health`, JSON response envelopes, request ID logging, HikariCP lifecycle listener, parameterized SQL.
- JUnit 5 tests, CI workflow, migrations, issue templates, diagrams, test checklist and demo script.

## Requirements

- JDK 17
- Maven 3.9+
- Apache Tomcat 9.0.x
- Browser (Chrome/Firefox/Edge)

## Run locally

1. Install JDK 17 and Maven. Confirm with `java -version` and `mvn -version`.
2. Extract/clone the project and open the folder that contains `pom.xml` in VS Code.
3. Copy `.env.example` to `.env` for reference. Environment variables are not automatically loaded from `.env` by Java; set them in your terminal/IDE/Tomcat environment. At minimum set `ZOROMART_ADMIN_PASSWORD` to a strong password before first startup.
4. Build and test:

   ```bash
   mvn -B clean verify
   ```

5. Deploy `target/ZoroMart.war` to Tomcat 9 `webapps/` and start Tomcat. The app context will usually be `/ZoroMart`.
6. Open `http://localhost:8080/ZoroMart/` (adjust port/context if your Tomcat differs).
7. Check `http://localhost:8080/ZoroMart/api/v1/health`. Expected JSON: `{"success":true,"data":{"status":"UP","db":"UP"},"error":null}`.

The default local database URL is `jdbc:h2:./data/zoromart;AUTO_SERVER=TRUE`. Override it with `ZOROMART_JDBC_URL` for a different path or H2 server-mode URL. H2 tables/migrations are initialized by the application listener.

## First login

- Seeded admin email defaults to `admin@zoromart.in`.
- Seeded admin password defaults to `ChangeMe@123` **only if no environment override is set**. Set `ZOROMART_ADMIN_PASSWORD` before the first run; after an admin row is created, changing the environment value does not reset the existing hash.
- Register Buyer and Seller accounts from the signup page. Admin signup is blocked.
- Change all demo credentials before using the app outside a local demonstration.

## Architecture

`Browser (HTML/CSS/vanilla JS)` → `EncodingFilter + RequestIdFilter + AuthFilter` → `ApiServlet (/api/v1/*)` → `Service` → `DAO` → `HikariCP` → `H2`.

- Controllers handle HTTP/session/JSON only.
- Services validate input and coordinate business rules.
- DAO classes own SQL; all statements use `PreparedStatement` except schema setup and test fixtures.
- `AppContextListener` owns the shared connection pool and startup migrations.
- The API response envelope is `{ "success": true, "data": ..., "error": null }` or `{ "success": false, "data": null, "error": { "code": ..., "message": ... } }`.

See `docs/architecture.md`, `docs/api.md`, `docs/deployment.md`, `docs/security-checklist.md`, `docs/diagrams/`, and `docs/test-cases.md`.

## API quick reference

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Create Buyer/Seller |
| POST | `/api/v1/auth/login` | Public | Create server session |
| POST | `/api/v1/auth/logout` | Signed in | End session |
| GET | `/api/v1/products?q=&category=` | Public | Search/filter listings |
| POST | `/api/v1/products` | Seller | Add listing |
| PUT/DELETE | `/api/v1/products/{id}` | Owner Seller/Admin delete | Update/remove listing |
| GET | `/api/v1/seller/products` | Seller | Own listings |
| GET/POST | `/api/v1/cart/items` | Buyer session | Read/add cart item |
| PUT/DELETE | `/api/v1/cart/items/{id}` | Buyer session | Update/remove cart item |
| POST | `/api/v1/orders` | Buyer | Mock checkout |
| GET | `/api/v1/orders` | Buyer/Admin | Order history/all orders for admin |
| GET | `/api/v1/orders/{id}/items` | Buyer owner | Items in order |
| GET | `/api/v1/seller/orders` | Seller | Incoming orders |
| POST | `/api/v1/reviews` | Buyer | Review a delivered order item |
| GET | `/api/v1/products/{id}/reviews` | Public | Product reviews |
| GET | `/api/v1/admin/users` | Admin | User list |
| GET | `/api/v1/admin/orders` | Admin | All orders |
| PUT | `/api/v1/admin/orders/{id}/status` | Admin | Change order status |
| POST | `/api/v1/chat` | Public session | Product FAQ chatbot |
| GET | `/api/v1/health` | Public | App/database health |

## Security notes

- No real payment provider is connected; checkout is a mock confirmation.
- Never commit `.env`, database files, API keys, passwords or production data.
- The optional Gemini key is server-only. `ZOROMART_CHAT_PROVIDER=mock` is the safe default.
- For HTTPS deployment set secure cookies at the proxy/Tomcat layer and review CSRF protections, CSP, rate limits, backups and credential management before production use.
- H2 embedded/AUTO_SERVER is suitable for this student project/demo; confirm the deployment's persistence and H2 server-mode configuration before public hosting.

## Submission checklist

- [ ] `mvn -B clean verify` passes on JDK 17.
- [ ] Deploy the WAR to Tomcat 9 and test using the deployed URL.
- [ ] Run every case in `docs/test-cases.md`; capture screenshots.
- [ ] Complete the 10-user/60-second load test and save the report.
- [ ] Set a strong admin password and verify Buyer/Seller/Admin access controls.
- [ ] Add the live URL and screenshots to this README.
- [ ] Maintain real Git commits/issues/PRs; do not fabricate historical commits.
