# Deployment guide — Tomcat 9 + H2

A public cloud URL cannot be provisioned from this code-generation workspace. Use a college-approved server or a VM that supports JDK 17, Tomcat 9 and persistent disk, then record the real URL in `README.md`.

## Local Tomcat

1. Install JDK 17, Maven and Tomcat 9.
2. Run `mvn -B clean verify`.
3. Copy `target/ZoroMart.war` to Tomcat's `webapps/` directory.
4. Set `ZOROMART_ADMIN_PASSWORD` before first startup.
5. Start Tomcat and check `/ZoroMart/api/v1/health`.

## H2 server-mode deployment

1. Install a matching H2 JAR on the server and create a persistent data directory such as `/opt/zoromart/data`.
2. Start H2 TCP server under a dedicated OS account. Restrict TCP access to the application host/firewall; do not expose port 9092 publicly.
3. Configure the Tomcat service environment with a JDBC URL similar to `jdbc:h2:tcp://localhost:9092/./data/zoromart`, plus `ZOROMART_DB_USER` and `ZOROMART_DB_PASSWORD`.
4. Ensure the H2 server's base directory and the URL point to the same persistent database path. Verify after a restart that users/products/orders remain present.
5. Deploy the WAR and test the complete Buyer/Seller/Admin journeys on the public URL.
6. Enable HTTPS, configure secure cookies and reverse-proxy headers, rotate admin credentials, back up the H2 data file and add uptime monitoring.

## Deployment acceptance

- [ ] Public URL is reachable throughout review window.
- [ ] Tomcat serves the WAR and `/api/v1/health` returns DB UP.
- [ ] Data persists after Tomcat/H2 restart.
- [ ] Buyer/Seller/Admin access control tested on deployed URL.
- [ ] Backup/restore tested and a 2–3 minute screen recording saved.
