# getMIPay API v1 — Reference

> Production Base URL: `https://getmipay.com/api/v1`
> Auth: JWT Bearer token (24h lifetime)

---

## Authentication

### POST `/action/auth` — Get Bearer Token
```json
// Request
{ "public_apikey": "gmp_pk_...", "private_secretkey": "gmp_sk_..." }
// Response
{ "success": true, "data": { "token": "JWT_TOKEN", "expires_at": "...", "token_type": "bearer" } }
```

### POST `/action/check-api-key` — Check API Key Status (public, no JWT)
```json
// Request
{ "secret_apikey": "gmp_sk_..." }
// Response: { success, data: { api_key: { status, is_active }, merchant: { id, business_name } } }
```

---

## Payments

### POST `/payins` — Collect Payment (Pay-In)
**Headers:** `Authorization: Bearer <jwt>`, `operation: "2"`, `service: "<id>"`, `otp: "<code>"` (optional)

| Service | ID | OTP Required |
|---------|-----|--------------|
| MTN Mobile Money CM | 1 | No |
| Orange Money CI | 3 | Yes (max 8 chars) |
| Orange Money SN | 4 | Yes |
| Orange Money BF | 5 | Yes |

```json
// Body
{
  "amount": 1000,       // min: 100
  "currency": "XAF",    // XAF | XOF
  "wallet": "690000000",
  "description": "Payment for Order #123",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "callback_url": "https://yourapp.com/webhooks/payment"
}
// Response
{
  "success": true,
  "data": {
    "transaction_reference": "MPAYIN_ABC123DEF456",
    "soleaspay_reference": "MLS690d472dd7ee7B",
    "amount": 1000,
    "fee_amount": 50,
    "net_amount": 950,
    "currency": "XAF",
    "status": "pending",
    "service_used": "3",
    "service_name": "OM CI",
    "otp_required": true,
    "payment_url": null,
    "webhook_urls": { "success": "...", "failure": "..." }
  }
}
```

### POST `/payouts` — Disburse Payment (Pay-Out)
**Headers:** `Authorization: Bearer <jwt>`, `operation: "4"`, `service: "<id>"`

```json
// Body
{
  "amount": 5000,            // min: 100
  "currency": "XAF",         // XAF | USD | EUR
  "wallet": "237690000000",
  "description": "Refund for Order #456",
  "customer_name": "Jane Smith"
}
// Response
{
  "success": true,
  "data": {
    "transaction_reference": "MPAYOUT_XYZ789GHI123",
    "soleaspay_reference": "MLS690d472dd7ee7C",
    "amount": 5000,
    "currency": "XAF",
    "status": "pending"
  }
}
```

### POST `/transaction-check` — Transaction Status Check
```json
// Body
{
  "order_id": "MPAYIN_ABC123DEF456",
  "pay_id": "MLS690d472dd7ee7B",
  "operation": "2",  // optional
  "service": "1"     // optional
}
// Response
{
  "success": true,
  "data": {
    "order_id": "MPAYIN_ABC123DEF456",
    "pay_id": "MLS690d472dd7ee7B",
    "status": "success",  // pending | success | failed | processing
    "amount": 1000,
    "currency": "XAF",
    "created_at": "2024-12-16T10:05:01Z"
  }
}
```

---

## Utils

### GET `/balance` — Get Merchant Balance
```json
// Response
{ "success": true, "data": { "balance": 150000, "currency": "XAF", "merchant_name": "My Business" } }
```

### GET `/services` — Get Available Services
Returns all active services grouped by: all_services, services_by_country, payin_services, payout_services.

Each service object:
```json
{
  "id": "1", "name": "MOMO CM", "description": "MTN MOBILE MONEY CM",
  "country_code": "CM", "country_name": "CAMEROON",
  "withdrawable": true, "depositable": true, "is_active": true,
  "currency": "XAF", "min_amount": 100, "max_amount": 1000000
}
```

### GET `/convert-currency` — Currency Converter
**Query params:** `amount`, `from` (XAF|XOF|USD|EUR), `to` (XAF|XOF|USD|EUR)
```json
// Response
{ "success": true, "data": { "amount": 10245, "currency": "XOF" } }
```

---

## Virtual Cards

### Card Users

#### POST `/virtual-cards/users` — Create Card User
```json
{
  "first_name": "John", "last_name": "Doe",
  "email": "john@gmail.com",
  "country_code": "+237", "contact": "697028808",
  "dob": "1985-05-15T18:36:57+00:00",
  "billing_address": "Logbessou", "billing_city": "Douala",
  "billing_country": "CM", "billing_state": "Littoral",
  "billing_postal_code": "1234",
  "id_number": "125464",
  "is_business": false, "business_name": null
}
// Response: { success, data: { id, merchant_id, reference: "SP6A9F21D0VC", ... } }
```

#### GET `/virtual-cards/users` — Get All Users
Returns `{ users: [...], total_count: 5 }`

#### GET `/virtual-cards/users/{reference}` — Get Card User

#### GET `/virtual-cards/users/{userReference}/details` — Get Card User Details

#### PUT `/virtual-cards/users/{userReference}` — Update Card User
Same body as Create.

### Cards

#### POST `/virtual-cards/users/{userId}/cards` — Create Card
```json
{
  "balance": 10,          // min: 0.01
  "currency": "USD",       // USD | EUR | XAF
  "card_type": "VISA",     // VISA | MASTERCARD
  "category": "PERSONAL",  // PERSONAL | BUSINESS
  "grade": "BASIC"         // BASIC | PREMIUM
}
// Response: { success, data: { card_id, user_id, card_number, expiry_date, cvv, balance, ... } }
```

#### GET `/virtual-cards` — List Virtual Cards

#### GET `/virtual-cards/{id}` — Get Card Details
Returns: card_id, user_id, card_number, expiry_date, cvv, balance, currency, card_type, status, created_at

#### GET `/virtual-cards/{cardId}/balance` — Get Card Balance
Returns: card_id, balance, currency

#### GET `/virtual-cards/{id}/transactions` — Get Card Transactions
Returns transaction history array

### Card Operations

#### POST `/virtual-cards/{cardId}/topup` — Top Up Card
```json
{ "amount": 50, "currency": "USD" }  // amount min: 0.01, currency: USD|EUR|XAF
```

#### POST `/virtual-cards/{cardId}/withdraw` — Withdraw from Card
```json
{ "amount": 20, "currency": "USD" }
```

#### POST `/virtual-cards/{cardId}/enable` — Enable Card
No body required.

#### POST `/virtual-cards/{cardId}/disable` — Disable Card
No body required.

#### DELETE `/virtual-cards/{cardId}` — Terminate Card (permanent)
No body required.

#### POST `/virtual-cards/{cardId}/operation` — Generic Card Operation
```json
{
  "action": "topup",  // topup | withdraw | enable | disable | get_balance | get_transactions
  "amount": 50,       // required for topup/withdraw
  "currency": "USD"   // required for topup/withdraw
}
```

All card operation responses return:
```json
{
  "success": true,
  "data": {
    "operation": "topup",
    "card_id": "CARD_123456",
    "new_balance": 20,
    "currency": "USD",
    "status": "success",
    "transactions": [{ "id": "TXN_123", "amount": 10, "currency": "USD", "type": "topup", "status": "completed", "created_at": "..." }]
  }
}
```

### Fee Configurations

#### GET `/virtual-cards/fees` — Get All Fee Configurations
Returns all active fee configs with `currencies_available`, `card_types_available`, `card_grades_available`.

#### GET `/virtual-cards/fees/calculate` — Calculate Card Creation Fees
**Query params:** `card_grade` (BASIC|PREMIUM), `card_type` (VISA|MASTERCARD), `initial_balance` (min: 1)
```json
{
  "success": true,
  "data": {
    "card_grade": "BASIC", "card_type": "VISA", "currency": "USD",
    "initial_balance": 100,
    "creation_fee": 3.5,
    "total_amount_required": 103.5,
    "other_fees": { "monthly_fee": 1.3, "top_up_fee": 1.2, "withdrawal_fee": 3.3, "reject_balance_fee": 1.1 },
    "funding_limits": { "min": 2, "max": 10000, "currency": "USD" }
  }
}
```

---

## Environment Variables

```env
GETMIPAY_PUBLIC_KEY=gmp_pk_...
GETMIPAY_PRIVATE_KEY=gmp_sk_...
GETMIPAY_MTN_SERVICE_ID=1          # optional, defaults to "1"
GETMIPAY_ORANGE_SERVICE_ID=3       # optional, defaults to "3"
```

## Wallet Format
- Sans `+` : `237690000000` (pas `+237...`)
- Minimum amount PayIn/PayOut : 100 XAF

## Error Codes (HTTP)
- 200: Success
- 400: Bad Request (validation)
- 401: Unauthorized (token expired/invalid)
- 403: Forbidden
- 404: Not Found
- 422: Unprocessable Entity
- 500: Server Error
