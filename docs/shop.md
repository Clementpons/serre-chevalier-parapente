# Shop & Business Logic

## Products

There are three distinct product types in the cart.

### Stage (training course)

Multi-day paragliding training courses, categorized by level:

| Type | Description |
|------|-------------|
| `INITIATION` | Beginner course |
| `PROGRESSION` | Intermediate course |
| `AUTONOMIE` | Advanced / solo-ready course |

**Payment model:** deposit paid online at booking, balance paid on-site before the course.

### Baptême (tandem flight)

Single tandem paragliding flights, categorized by experience type:

| Category | Price |
|----------|-------|
| `AVENTURE` | 110 € |
| `DUREE` | 150 € |
| `LONGUE_DUREE` | 185 € |
| `ENFANT` | 90 € |
| `HIVER` | 130 € |

Optional video recording: +25 €.

**Payment model:** full price paid online at booking (no remaining balance).

### Gift Voucher (bon cadeau)

A voucher that entitles the recipient to a free reservation of a specific stage type or baptême category. This is a **product**, not a discount code.

- Format: `GVSCP-XXXXXXXX-XXXX`
- Validity: 1 year from purchase
- Single use
- Product type: `STAGE` or `BAPTEME` (covers one specific activity)
- Price: the full retail price of the covered activity

When a customer uses a gift voucher code during booking, the item appears at 0 € in their cart.

## Cart

### Session

Cart is session-based (anonymous). The session UUID is stored in `localStorage` and sent as `x-session-id` header on every API call. A `CartSession` record is created in the database on first use, expiring after 24h.

### Item expiration

| Item type | Expiration |
|-----------|-----------|
| `STAGE` | 1 hour (holds a seat via `TemporaryReservation`) |
| `BAPTEME` | 1 hour (holds a seat via `TemporaryReservation`) |
| `GIFT_VOUCHER` | No expiration |

When a stage or baptême is added to the cart, a `TemporaryReservation` record is created to block that slot for other users. It is released when the item is removed or expires.

### Total calculation

```
cartSubtotal    = sum of all item prices (deposit prices for stages, full price for baptêmes and gift vouchers)
discountAmount  = promo code discount (if applied)
depositTotal    = amount charged today via Stripe
remainingTotal  = balance due on-site (stages only)
```

## Orders

### Creation (`POST /api/orders/create`)

1. Validate cart has items and is not expired
2. Calculate totals
3. **Branch: is the deposit total = 0?**
   - **Yes** (all items covered by gift vouchers): Create order with status `PAID`, finalize immediately (no Stripe)
   - **No**: Create order with status `PENDING`, create Stripe `PaymentIntent` for `depositTotal`, return `clientSecret` to frontend

### Status machine

```
PENDING → PAID (deposit = order total, no remaining)
PENDING → PARTIALLY_PAID (deposit paid, remaining balance exists)
PARTIALLY_PAID → FULLY_PAID (admin records final on-site payment)
* → CANCELLED (payment failed or admin action)
* → REFUNDED (admin action)
```

### Finalization (triggered by Stripe webhook `payment_intent.succeeded`)

1. Create `StageBooking` or `BaptemeBooking` records
2. Create or update `Stagiaire` (participant) record
3. Mark used gift voucher codes as `isUsed = true`
4. Send confirmation email to client (Resend)
5. Send notification email to admin
6. Send gift voucher email to recipient (if purchased)
7. Clear `CartItem` records for this session

## Payments

### Stripe deposit

The Stripe `PaymentIntent` is created for the `depositTotal` only. Metadata on the PaymentIntent includes the `orderId` so the webhook can find the order.

Webhook endpoint: `POST /api/webhooks/stripe` (outside Hono, verified with `STRIPE_WEBHOOK_SECRET`). Events are processed idempotently via the `ProcessedWebhookEvent` table.

### Final payment (remaining balance)

The remaining balance for stages is collected on-site by the monitor. An admin records it manually in the backoffice dashboard via the order detail view, which calls `POST /api/orders/confirmFinalPayment/:orderItemId`.

### Payment allocation

Every payment is linked to order items via `PaymentAllocation` records, enabling a full audit trail of which payment covered which item.

## Promo codes

> **Status:** Backend complete, frontend integration pending (Phase 3).

Admin creates codes in the backoffice. Each code has:
- `type`: `FIXED` (euros off) or `PERCENTAGE` (% off)
- `maxDiscount`: cap for percentage codes
- `minCartAmount`: minimum order value required
- `maxUsages`: total usage limit
- `expiresAt`: optional expiry date

Validation endpoint: `POST /api/promocodes/validate` — returns the discounted total if the code is valid.

## Availability

Availability is calculated dynamically:

```
available = capacity - (confirmed bookings) - (active temporary reservations)
```

There is no stored availability counter. The `AvailabilityService` queries current bookings and non-expired `TemporaryReservation` records on each request.

## Pricing

All prices are stored in the database (not hardcoded) and managed via the admin dashboard:
- `StageBasePrice` — base price per stage type
- `BaptemeCategoryPrice` — fixed price per baptême category
- `VideoOptionPrice` — cost of video recording (+25 € default)
- `BaptemeDepositPrice` — default deposit amount for baptêmes
