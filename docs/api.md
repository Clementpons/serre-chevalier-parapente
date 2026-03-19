# API Reference

The backoffice exposes a REST API via Hono, mounted at `/api`. All responses follow the format:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "Error message" }
```

## Authentication

| Method | Header | Used by |
|--------|--------|---------|
| Session cookie | `auth_session` (httpOnly) | Admin dashboard |
| API key | `x-api-key: <PUBLIC_API_KEY>` | apps/front |
| Session ID | `x-session-id: <uuid>` | Cart operations (anonymous) |

---

## Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Email + password login |
| POST | `/api/auth/register` | — | Create account |
| GET | `/api/auth/current` | Session | Get current user |
| POST | `/api/auth/logout` | Session | Clear session |

---

## Cart — `/api/cart`

All cart routes require `x-api-key` + `x-session-id`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cart/items` | List cart items (auto-removes expired) |
| POST | `/api/cart/add` | Add item (creates TemporaryReservation) |
| PUT | `/api/cart/update/:id` | Replace full item |
| PATCH | `/api/cart/update/:id` | Merge participant data |
| DELETE | `/api/cart/remove/:id` | Remove item + release reservation |
| DELETE | `/api/cart/clear` | Clear entire cart |

---

## Availability — `/api/availability`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/availability/periods` | API key | Available periods for stages + baptêmes |

---

## Stages — `/api/stages`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/stages/getAll` | API key | List all stages |
| GET | `/api/stages/:id` | Session | Stage detail |
| POST | `/api/stages` | Admin | Create stage |
| PUT | `/api/stages/:id` | Admin | Update stage |
| DELETE | `/api/stages/:id` | Admin | Delete stage |

---

## Baptêmes — `/api/baptemes`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/baptemes/getAll` | API key | List all baptêmes |
| GET | `/api/baptemes/:id` | Session | Baptême detail |
| POST | `/api/baptemes` | Admin | Create baptême |
| PUT | `/api/baptemes/:id` | Admin | Update baptême |
| DELETE | `/api/baptemes/:id` | Admin | Delete baptême |

---

## Orders — `/api/orders`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/orders/create` | API key | Create order from cart |
| GET | `/api/orders/getById/:id` | API key | Get order by ID |
| GET | `/api/orders/getAll` | Admin | List all orders |
| GET | `/api/orders/search` | Admin | Search orders |
| PUT | `/api/orders/updateStatus` | Admin | Update order status |
| POST | `/api/orders/confirmFinalPayment/:orderItemId` | Admin | Record final on-site payment |

---

## Gift Vouchers — `/api/giftvouchers`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/giftvouchers` | Admin | List all vouchers |
| GET | `/api/giftvouchers/:id` | Admin | Voucher detail |
| POST | `/api/giftvouchers` | Admin | Create voucher (admin gift) |
| PATCH | `/api/giftvouchers/:id` | Admin | Update voucher |
| POST | `/api/giftvouchers/validate` | API key | Validate a voucher code |
| POST | `/api/giftvouchers/reserve` | API key | Lock voucher during checkout |
| POST | `/api/giftvouchers/release` | API key | Release locked voucher |
| GET | `/api/giftvouchers/price/:productType/:category` | API key | Get voucher price |

---

## Promo Codes — `/api/promocodes`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/promocodes` | Admin | List all codes |
| GET | `/api/promocodes/:id` | Admin | Code detail with usage |
| POST | `/api/promocodes` | Admin | Create code |
| PUT | `/api/promocodes/:id` | Admin | Update code |
| DELETE | `/api/promocodes/:id` | Admin | Delete code |
| POST | `/api/promocodes/validate` | API key | Validate code + return discount |

---

## Pricing — `/api/tarifs`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tarifs` | API key | All pricing tables |
| GET | `/api/tarifs/:category` | API key | Prices for a category |
| POST | `/api/tarifs` | Admin | Create price entry |
| PUT | `/api/tarifs/:id` | Admin | Update price |

---

## Clients — `/api/clients`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/clients` | Admin | List clients |
| POST | `/api/clients` | Admin | Create client |

---

## Payments — `/api/payments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/payments/getAll` | Admin | List all payments with allocations |

---

## Dashboard — `/api/dashboard`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard` | Admin | Stats and KPIs |

---

## Content — `/api/content`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/content/topbar` | API key | Get topbar content |
| PUT | `/api/content/topbar` | Admin | Update topbar content |

---

## Campaigns (SMS) — `/api/campaigns`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/campaigns` | Admin | List campaigns |
| POST | `/api/campaigns` | Admin | Create campaign |
| PUT | `/api/campaigns/:id` | Admin | Update campaign |
| DELETE | `/api/campaigns/:id` | Admin | Delete campaign |
| POST | `/api/campaigns/:id/send` | Admin | Send campaign |

---

## Audiences — `/api/audiences`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/audiences` | Admin | List audiences |
| POST | `/api/audiences` | Admin | Create audience |
| PUT | `/api/audiences/:id` | Admin | Update audience |
| DELETE | `/api/audiences/:id` | Admin | Delete audience |

---

## Webhooks

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/webhooks/stripe` | Stripe event handler (outside Hono, signature-verified) |
