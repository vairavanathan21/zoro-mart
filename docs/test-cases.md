# Manual validation sheet

Run against the deployed Tomcat URL before the review. Record actual result/date and attach screenshots. Do not mark a case passed until executed.

| ID | Journey / input | Expected result | Actual / evidence |
|---|---|---|---|
| T01 | Register Buyer with valid name/email/password | 201; user stored with BCrypt hash; no password hash in response | Pending |
| T02 | Register Seller | 201; role is SELLER | Pending |
| T03 | Attempt public ADMIN registration | 400; no admin account created | Pending |
| T04 | Login with wrong password | 401; generic message; no session | Pending |
| T05 | Login with valid Buyer | Session renewed; buyer role returned; can view cart | Pending |
| T06 | Access cart without login | 401 JSON envelope | Pending |
| T07 | Search product keyword and category | Only matching DB listings returned | Pending |
| T08 | Seller creates listing | Listing persisted and visible in public search | Pending |
| T09 | Seller edits own listing | Listing updates in DB | Pending |
| T10 | Seller edits another seller's listing | 404; no unauthorized change | Pending |
| T11 | Add/update/remove cart item | Cart and total reflect JDBC state | Pending |
| T12 | Checkout empty cart | 400; no order created | Pending |
| T13 | Checkout cart with stock available | 201 mock confirmation; order/items stored; stock decremented; cart cleared | Pending |
| T14 | Checkout quantity exceeding stock | 400; transaction rolled back | Pending |
| T15 | Buyer views order history | Only own orders visible | Pending |
| T16 | Seller views incoming orders | Only orders containing seller's products | Pending |
| T17 | Admin views users/orders | All records visible without password hashes | Pending |
| T18 | Non-admin calls admin endpoint | 403 | Pending |
| T19 | Review before Delivered | Rejected | Pending |
| T20 | Review own Delivered order product | 201; rating stored | Pending |
| T21 | SQL injection-like search text | Treated as data; no SQL execution | Pending |
| T22 | XSS-like product text | Browser adapter escapes output in listing cards | Pending |
| T23 | Chat asks FAQ | Relevant FAQ answer returned | Pending |
| T24 | Chat >500 characters / >10 requests per minute | Validation/rate-limit response | Pending |
| T25 | GET `/api/v1/health` | DB and app status UP | Pending |
| T26 | 10 concurrent users for 60 seconds | Run JMeter/ab; attach report, inspect errors/latency | Pending |

## API smoke tests (curl)

Replace `BASE` with your deployed context URL.

```bash
BASE=http://localhost:8080/ZoroMart
curl -i "$BASE/api/v1/health"
curl -i -X POST "$BASE/api/v1/auth/register" -H 'Content-Type: application/json' -d '{"name":"Buyer Demo","email":"buyer@example.test","password":"StrongPass123","role":"BUYER"}'
curl -i -c cookies.txt -X POST "$BASE/api/v1/auth/login" -H 'Content-Type: application/json' -d '{"email":"buyer@example.test","password":"StrongPass123"}'
curl -i -b cookies.txt "$BASE/api/v1/cart/items"
```
