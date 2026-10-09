# API contract — `/api/v1`

Every response uses `{ "success": boolean, "data": object|array|null, "error": object|null }`. Common status codes: 200 success, 201 created, 400 validation error, 401 unauthenticated, 403 forbidden, 404 missing route/record, 409 conflict, 500 generic server failure. Session cookie is required for protected endpoints.

## Authentication
- `POST /auth/register`: `{name,email,password,role}`; role must be `BUYER` or `SELLER`; password minimum 8 characters.
- `POST /auth/login`: `{email,password}`; creates/renews session and returns only id/name/email/role.
- `POST /auth/logout`; `GET /auth/me`.

## Products
- `GET /products?q=phone&category=Electronics`
- `POST /products`: `{name,description,price,stockQty,category,imageUrl}` (Seller)
- `PUT /products/{id}`: same fields (owner Seller)
- `DELETE /products/{id}` (owner Seller or Admin)
- `GET /seller/products` (Seller)
- `GET /products/{id}/reviews`

## Cart and orders
- `GET /cart/items`, `POST /cart/items` with `{productId,quantity}`
- `PUT /cart/items/{id}` with `{quantity}`, `DELETE /cart/items/{id}`
- `POST /orders`: creates a mock-paid order from the session buyer's cart, validates stock and decrements stock transactionally.
- `GET /orders`, `GET /orders/{id}/items`, `GET /seller/orders`
- `POST /reviews`: `{orderId,productId,rating,comment}`; requires order status Delivered.

## Admin and chatbot
- `GET /admin/users`, `GET /admin/orders`
- `PUT /admin/orders/{id}/status`: `{status}` where status is Pending/Confirmed/Shipped/Delivered/Cancelled (uppercase API values).
- `POST /chat`: `{message}`; 1–500 characters, max 10 accepted scoped messages/session/minute, cached repeated questions, provider failures fall back to the mock FAQ.
- `GET /health`: checks H2 connectivity.
