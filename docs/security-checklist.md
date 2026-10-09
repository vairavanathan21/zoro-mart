# Security checklist

- [x] SQL in DAO layer uses `PreparedStatement`; schema initialization uses DDL statements only.
- [x] BCrypt password hashing; raw passwords are not logged or returned.
- [x] Session-based login and invalidation/regeneration on successful login; 30-minute inactivity timeout.
- [x] AuthFilter protects cart/order/review URL groups; API role checks protect Buyer/Seller/Admin operations.
- [x] JSON responses omit password hashes; browser adapter escapes user-controlled strings before HTML insertion.
- [x] Generic 500 responses; request ID in response header and logs.
- [x] `.env`, H2 DB files and config files ignored by Git.
- [x] Gemini API key is server environment only; mock provider is default; timeout and degraded fallback exist.
- [ ] Run live SQL injection and XSS checks against the deployed URL and record evidence.
- [ ] Configure HTTPS and secure cookies for public hosting; current `secure=false` is for local Tomcat HTTP testing.
- [ ] Add CSRF token protection before production deployment.
- [ ] Rotate the seeded admin password before any public demo.
- [ ] Verify error pages, dependency/static analysis output and backup/restore process.
