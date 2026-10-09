# Architecture and technical decisions

## Request flow

1. Browser sends a request to `/api/v1/...`.
2. `EncodingFilter` sets UTF-8; `RequestIdFilter` attaches an ID to response and SLF4J MDC; `AuthFilter` protects cart/order/review paths.
3. `ApiServlet` parses request JSON, checks session/role and writes the versioned response envelope.
4. Service layer validates input and applies business rules.
5. DAO layer owns SQL and uses `PreparedStatement` plus try-with-resources.
6. `AppContextListener` creates one HikariCP pool, runs migrations and provisions the seeded admin.
7. H2 stores persistent marketplace records.

## Design patterns

- **MVC / Front Controller:** `ApiServlet` dispatches the `/api/v1/*` API while UI pages remain HTML/CSS/JS.
- **DAO:** `UserDAO`, `ProductDAO`, `MarketplaceDAO` isolate JDBC and SQL. `ProductService`, `CartService`, `OrderService` and `AuthService` validate/orchestrate use cases.
- **Singleton lifecycle:** one application-scoped HikariCP `DataSource` is created and closed by `AppContextListener`.
- **Factory:** `ChatProviderFactory` selects `mock` or `gemini` from server configuration.
- **Strategy:** `ChatProvider` allows the chatbot provider to be swapped without changing the chat orchestration.
- **Builder:** request/response JSON and DTOs are assembled separately from database entities; complex builder usage can be introduced as response contracts expand.
- **Mock payment channel:** order checkout records a mock confirmation; no real payment gateway is invoked.

## Important limitations to close before a public production deployment

- This is an academic demo and not a production payment application.
- CSRF token protections, HTTPS-secure cookies, a stricter CSP, externalized persistent DB operations and public-host hardening need a deployment review.
- H2 schema scripts use idempotent `IF NOT EXISTS` statements. For larger future changes, add migration tracking/version checks.
- Load test and public URL verification must be performed on the target host; this workspace cannot certify those outcomes.
