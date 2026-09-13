# Data Schema

**Project:** Dormitory Management System
**Version:** 1.2
**Database:** MongoDB (Mongoose ODM)
**Audience:** Developers (new hires + AI coding assistants)

> This document defines **collections, fields, relationships, and business rules** at the data layer. Pair with `ARCHITECTURE.md` (folder structure) and `API.md` (endpoints). Every schema below maps to one `modules/<feature>/<entity>.model.js` file.
>
> Business rules are stated here at data level. Their full Vietnamese explanation, state machines and process flows live in `03-PHAN-TICH-NGHIEP-VU.md`.

---

## 1. Conventions

- **Primary key:** MongoDB default `_id` (ObjectId). Never expose custom IDs unless required by a business rule (e.g., student ID number is a separate field, not `_id`).
- **References:** store as `mongoose.Schema.Types.ObjectId` with `ref: '<Model>'`. Populate explicitly in the service layer — never `.populate()` blindly in controllers.
- **Timestamps:** every schema uses `{ timestamps: true }` → adds `createdAt` / `updatedAt` automatically. Do not hand-roll these fields.
- **Soft delete:** entities that must preserve history (Student, Contract, Invoice, Payment) use an `isActive: Boolean` or `status` field instead of hard deletes. Deactivation ≠ removal.
- **Enums:** defined once in `shared/constants/enums.js` and imported into schemas — never hardcode string literals in multiple files (avoids typos like `"Occupied"` vs `"occupied"`). **All enum values are lowercase.**
- **Money fields:** stored as **integers** (VND, smallest unit — no decimals in this currency), never floats.
- **Audit trail:** any status-changing action should be traceable via `createdAt`/`updatedAt` + the actor reference (`createdBy`/`updatedBy` where noted).

---

## 2. Entity Relationship Overview

```
User ──1:1── Student (optional link, only when role = student)
Building ──1:N── Room ──1:N── Bed
RoomType ──1:N── Room                   (tier × capacity → price, deposit, amenities)
Room ──1:N── UtilityReading             (one per room per billing period)
Student ──1:N── Application             (đơn đăng ký — asks for a room)
Application ──1:1── Contract            (created on approval)
Student ──1:N── Residency ──N:1── Bed   (only one ACTIVE residency per bed)
Residency ──1:1── Contract
Contract ──1:N── Request                (renewal/checkout)
Student ──1:N── Invoice ──1:N── Payment
FeeType ──N:M── Invoice                 (via invoice line items)
SupplyItem ──N:M── RoomType             (items issued free with that room type)
Student ──1:N── SupplyOrder ──1:1── Invoice
```

> ⭐ **Students register for a room, never a bed.** The room's type decides price, deposit and what is issued with it. When staff approve the application, the system assigns the **lowest-numbered free bed** in that room by itself. Beds still exist in the data because occupancy counts, the utility split and the no-double-booking guarantee are all counted per bed — they are simply never chosen by a person.

- A **Bed** can have many historical Residencies, but only **one active Residency** at a time (atomic claim + partial unique index).
- A **Contract** always belongs to exactly one Residency and one Application (1:1 each).
- An **Invoice** can receive multiple **Payments** (partial payments supported).

**16 collections:** `User`, `Student`, `Building`, `RoomType`, `Room`, `Bed`, `Application`, `Residency`, `Contract`, `FeeType`, `UtilityReading`, `Invoice`, `Payment`, `Request`, `SupplyItem`, `SupplyOrder`.

> Section numbers below keep their v1.1 positions so existing cross-references stay valid. The four collections added in v1.2 are §3.13–§3.16.

---

## 3. Collections

### 3.1 `User` — `modules/auth/user.model.js`

Authentication identity. Every login (staff or student) is a `User`; `Student` profile is a separate collection linked via `userId`.

| Field | Type | Notes |
|---|---|---|
| `email` | String | unique, required, lowercase |
| `passwordHash` | String | required, bcrypt hash — never store plaintext |
| `fullName` | String | required, display name |
| `role` | String (enum) | `admin`, `staff`, `student`, `viewer` |
| `isActive` | Boolean | default `true`; disables login without deleting record |
| `mustChangePassword` | Boolean | default `false`; set `true` after a staff-issued password reset (`FR-09`) |
| `lastLoginAt` | Date | updated on successful login |

```js
const ROLES = ['admin', 'staff', 'student', 'viewer'];
```

**Indexes:** `{ email: 1 }` unique.
**Rule:** a `student`-role `User` must have exactly one corresponding `Student` document (`Student.userId` points back).

---

### 3.2 `Student` — `modules/students/student.model.js`

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId ref `User` | unique sparse — set only when the student has a self-service account |
| `fullName` | String | required |
| `studentCode` | String | unique, required (school/enrollment ID, not `_id`) |
| `phone` | String | required |
| `email` | String | contact email (can differ from login email) |
| `dob` | Date | |
| `gender` | String (enum) | `male`, `female` — **required**, used by the room-gender check (A1) |
| `className` | String | |
| `faculty` | String | |
| `emergencyContact.name` | String | |
| `emergencyContact.phone` | String | |
| `emergencyContact.relationship` | String | |
| `status` | String (enum) | `active`, `inactive` (soft delete) |

**Indexes:** `{ studentCode: 1 }` unique, `{ fullName: 'text' }` for search.
**Rule:** cannot set `status: 'inactive'` while the student has an `active` Contract, a `pending` Application, or any unpaid Invoice.

---

### 3.3 `Building` — `modules/rooms/building.model.js`

| Field | Type | Notes |
|---|---|---|
| `code` | String | unique, required, e.g. `"A"` |
| `name` | String | required, e.g. `"Building A"` |
| `address` | String | |
| `description` | String | |
| `isActive` | Boolean | default `true` |

---

### 3.4 `Room` — `modules/rooms/room.model.js`

| Field | Type | Notes |
|---|---|---|
| `buildingId` | ObjectId ref `Building` | required |
| `roomTypeId` | ObjectId ref `RoomType` | **required.** Decides capacity, price, deposit and what is issued *(v1.2)* |
| `roomNumber` | String | required, e.g. `"203"` |
| `floor` | Number | required — used by the floor map |
| `gender` | String (enum) | **`male` / `female` — required.** *(PRD §2.9 A1.)* A student may only be placed in a room whose `gender` matches theirs |
| `capacity` | Number | **copied from `RoomType.capacity` when the room is created — never typed in by hand.** Kept on the room so occupancy queries need no join |
| `status` | String (enum) | `active`, `inactive` |

```js
const ROOM_STATUS = ['active', 'inactive'];
```

**Indexes:** `{ buildingId: 1, roomNumber: 1 }` unique compound, `{ roomTypeId: 1, gender: 1 }` (availability query).

**Rules:**
- Creating a room **generates `capacity` beds automatically** (`B203-01` … `B203-06`) in `room.service.js`. There is no endpoint to add or delete individual beds.
- ⚠️ **Price is not stored on the room.** Read it from `RoomType.pricePerMonth`; at approval it is frozen into `Contract.monthlyPrice`.
- `roomTypeId` and `gender` may only change while the room has **no active Residency** (`422 ROOM_HAS_OCCUPANTS`). Changing `roomTypeId` makes the service delete the old beds and regenerate them for the new capacity.
- A room with `status: 'inactive'` is hidden from applications; it cannot be set inactive while occupied.

---

### 3.5 `Bed` — `modules/rooms/bed.model.js`

| Field | Type | Notes |
|---|---|---|
| `roomId` | ObjectId ref `Room` | required |
| `bedNumber` | Number | required, `1..capacity` — **the order in which beds are assigned** *(v1.2)* |
| `bedCode` | String | required, e.g. `"B203-01"` (human-readable, for display) |
| `status` | String (enum) | `available`, `occupied`, `maintenance` |
| `note` | String | maintenance note |

```js
const BED_STATUS = ['available', 'occupied', 'maintenance'];
```

**Indexes:** `{ roomId: 1, bedNumber: 1 }` unique compound.

**Rules:**
- Beds are created and numbered by the system. Staff only toggle `available` ⇄ `maintenance`.
- ⭐ On application approval the system claims **the lowest-numbered available bed of the room** with one atomic conditional update (`ARCHITECTURE.md` §3.5):
  ```js
  const bed = await Bed.findOneAndUpdate(
    { roomId, status: 'available' },
    { $set: { status: 'occupied' } },
    { sort: { bedNumber: 1 }, new: true }
  );
  if (!bed) throw new ApiError(409, 'ROOM_FULL', 'Phòng đã hết chỗ, vui lòng chọn phòng khác cùng loại');
  ```
  Two staff approving the last slot at the same moment: MongoDB hands the bed to exactly one of them; the other gets `null` → `ROOM_FULL`. No read-then-write, no transaction.
- A bed with `status: 'occupied'` cannot be switched to `maintenance` — the occupant must check out first.
- ⚠️ **Available slots of a room = number of beds with `status: 'available'`.** Never compute it as `capacity − occupants`: that counts beds under maintenance as free.

---

### 3.6 `Residency` — `modules/residencies/residency.model.js`

Represents "student X occupies bed Y," independent of contract paperwork. **Created only by approving an Application** (§3.14) — there is no direct create endpoint.

| Field | Type | Notes |
|---|---|---|
| `studentId` | ObjectId ref `Student` | required |
| `bedId` | ObjectId ref `Bed` | required — assigned by the system |
| `applicationId` | ObjectId ref `Application` | required *(v1.2)* |
| `startDate` | Date | required |
| `endDate` | Date | null while active |
| `status` | String (enum) | `active`, `closed` |
| `createdBy` | ObjectId ref `User` | staff who approved the application |

**Indexes:** partial unique index — enforces one active occupant per bed at the DB level:
```js
residencySchema.index(
  { bedId: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);
```

**Rule:** closing a Residency (checkout approved) sets `status: 'closed'`, `endDate: now`, and triggers `bedService.markBedAvailable(bedId)`.

---

### 3.7 `Contract` — `modules/contracts/contract.model.js`

| Field | Type | Notes |
|---|---|---|
| `contractCode` | String | unique, auto-generated `HD-YYYY-XXXXX` |
| `applicationId` | ObjectId ref `Application` | required, unique (1:1) *(v1.2)* |
| `residencyId` | ObjectId ref `Residency` | required, unique (1:1) |
| `studentId` | ObjectId ref `Student` | denormalized for query convenience |
| `bedId` | ObjectId ref `Bed` | denormalized for query convenience |
| `roomTypeId` | ObjectId ref `RoomType` | denormalized — lets the contract list filter by room type *(v1.2)* |
| `startDate` | Date | required |
| `endDate` | Date | required |
| `monthlyPrice` | Number | VND, **frozen from `RoomType.pricePerMonth` at approval** — later price changes must not alter existing contracts |
| `depositAmount` | Number | VND, **frozen from `RoomType.depositAmount` at approval**. Used by A3 settlement |
| `depositRefunded` | Number | VND, default `0` — amount actually paid back at checkout *(PRD §2.9 A3)* |
| `terms` | String | free text or file reference |
| `status` | String (enum) | `active`, `expired`, `terminated` |
| `terminationReason` | String | filled when terminated early |

```js
const CONTRACT_STATUS = ['active', 'expired', 'terminated'];
```

> **v1.2:** `pending` was removed. The waiting stage now lives in `Application` — a contract only comes into existence once a bed has actually been assigned, so there is no "contract without a bed" state to handle.

**Indexes:** `{ studentId: 1, status: 1 }`, `{ endDate: 1 }` (expiry-flag query), `{ residencyId: 1 }` unique, `{ applicationId: 1 }` unique.

**Rules:**
- A student may have at most **one** `active` contract at a time.
- A scheduled query flags contracts where `endDate - now <= 30 days AND status === 'active'` for the dashboard — no notification is sent (out of scope), only surfaced in-app.
- Deposit is charged **once** at approval; renewing does not charge it again.

---

### 3.8 `FeeType` — `modules/fees/fee-type.model.js`

| Field | Type | Notes |
|---|---|---|
| `code` | String | unique, e.g. `rent`, `electricity`, `water`, `deposit`, `supplies`, `other` |
| `name` | String | required, Vietnamese display name, e.g. `"Tiền phòng"` |
| `unit` | String | e.g. `"tháng"`, `"kWh"`, `"m3"`, `"lần"` |
| `defaultAmount` | Number | VND — unit price used when generating invoices |
| `isRecurring` | Boolean | true for rent/utilities, false for one-off deposit |
| `isActive` | Boolean | default `true` |

**Seed values:** `rent`, `electricity` (2 500 đ/kWh), `water` (12 000 đ/m³), `deposit`, `supplies`, `other`.

> ⚠️ **Only `electricity` and `water` read `defaultAmount` as a unit price.** `rent`, `deposit` and `supplies` are line-item categories: their amounts come from `Contract.monthlyPrice`, `Contract.depositAmount` and `SupplyOrder` respectively. Do not bill rent from `FeeType`.

---

### 3.9 `UtilityReading` — `modules/fees/utility-reading.model.js`

*(Added 12/09/2026, PRD §2.9 A2.)* Meter readings per room per billing period. Without this collection there is no way to know how much electricity/water to charge.

| Field | Type | Notes |
|---|---|---|
| `roomId` | ObjectId ref `Room` | required |
| `billingPeriod` | String | required, e.g. `"2026-10"` |
| `electricityStart` | Number | meter reading at period start |
| `electricityEnd` | Number | must be `>= electricityStart` |
| `waterStart` | Number | |
| `waterEnd` | Number | must be `>= waterStart` |
| `electricityUnitPrice` | Number | VND/kWh — **frozen here**, copied from FeeType at entry time so later price changes do not alter past invoices |
| `waterUnitPrice` | Number | VND/m³ — same reasoning |
| `isInvoiced` | Boolean | default `false`; blocks editing once invoices are generated |
| `recordedBy` | ObjectId ref `User` | |

**Indexes:** `{ roomId: 1, billingPeriod: 1 }` unique compound.

**Rules:**
- End reading must be ≥ start reading — validated in the service and by a schema validator.
- Start reading of a period should default to the previous period's end reading.
- Cannot edit once `isInvoiced: true`.
- ⭐ **Even split with exact remainder** — the sum of per-student shares must equal the room total to the đồng:
  ```js
  // n = number of students with an active Residency in this room during the period
  const roomTotal = (electricityEnd - electricityStart) * electricityUnitPrice;
  const base = Math.floor(roomTotal / n);          // NOT Math.round — that overshoots
  const remainder = roomTotal - base * n;
  // the student with the smallest studentCode absorbs the remainder
  shares[0] = base + remainder;
  ```
  Example: 576 000 đ ÷ 7 → six students pay 82 285 đ, one pays 82 290 đ. Total = 576 000 đ exactly.
- If no student resides in the room during the period, skip it — generate no utility charge.

---

### 3.10 `Invoice` — `modules/fees/invoice.model.js`

| Field | Type | Notes |
|---|---|---|
| `invoiceCode` | String | unique, auto-generated `INV-YYYYMM-XXXXX` |
| `studentId` | ObjectId ref `Student` | required |
| `contractId` | ObjectId ref `Contract` | required — ties invoice to the residency period |
| `type` | String (enum) | `deposit`, `monthly`, `settlement`, `supplies`, `other` |
| `billingPeriod` | String | e.g. `"2026-10"`; `null` for `deposit`/`settlement`/`supplies` |
| `lineItems` | Array<`{ feeTypeId, description, quantity, unitPrice, amount }`> | required, min 1 |
| `totalAmount` | Number | sum of `lineItems.amount`, computed on save |
| `paidAmount` | Number | default `0`; **always recomputed** from successful Payments, never incremented blindly |
| `dueDate` | Date | required |
| `status` | String (enum) | `unpaid`, `partial`, `paid`, `overdue`, `cancelled` |

```js
const INVOICE_STATUS = ['unpaid', 'partial', 'paid', 'overdue', 'cancelled'];
const INVOICE_TYPE = ['deposit', 'monthly', 'settlement', 'supplies', 'other'];
```

**Indexes:**
- `{ studentId: 1, billingPeriod: 1 }`, `{ status: 1, dueDate: 1 }` (overdue sweep)
- `{ invoiceCode: 1 }` unique
- Anti-duplicate, partial:
  ```js
  invoiceSchema.index(
    { studentId: 1, type: 1, billingPeriod: 1 },
    { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' }, billingPeriod: { $type: 'string' } } }
  );
  ```

**Rules:**
- `status` is derived, never set by clients — recomputed from `paidAmount` vs `totalAmount` on every Payment write; a scheduled check flips `unpaid → overdue` once `dueDate` passes.
- Cancelling is only allowed when no successful Payment exists.
- ⚠️ **Do not merge the deposit into the first monthly invoice.** Issue **two** invoices when an application is approved: one `type: 'deposit'` (`billingPeriod: null`) and one `type: 'monthly'`. Merging them makes the invoice occupy the `(student, monthly, period)` unique slot, so the end-of-period bulk generation skips that student entirely and **their electricity and water for that period are never billed**.
- When bulk generation finds an existing `monthly` invoice for the period, it **adds the missing line items** (electricity, water) to that invoice rather than skipping the student.
- A `supplies` invoice is created only by `SupplyOrder` (§3.16), one invoice per order, `dueDate` = order date + 3 days.

---

### 3.11 `Payment` — `modules/payments/payment.model.js`

| Field | Type | Notes |
|---|---|---|
| `transactionRef` | String | unique — our own reference, sent to the gateway |
| `invoiceId` | ObjectId ref `Invoice` | required |
| `studentId` | ObjectId ref `Student` | denormalized |
| `amount` | Number | required, VND, `> 0`. **Negative is not allowed** — refunds use `type: 'refund'` |
| `type` | String (enum) | `payment`, `refund` — `refund` used for deposit payout *(Added 12/09/2026, A3)* |
| `method` | String (enum) | `cash`, `bank_transfer`, `vnpay`, `zalopay` |
| `gatewayTransactionId` | String | required when `method` is `vnpay`/`zalopay`; null for offline |
| `gatewayRawResponse` | Mixed | raw webhook payload, stored for audit/reconciliation |
| `status` | String (enum) | `pending`, `success`, `failed`, `expired` |
| `paidAt` | Date | set when `status` becomes `success` |
| `recordedBy` | ObjectId ref `User` | staff who recorded it; null for online self-service payments |
| `note` | String | |

```js
const PAYMENT_METHOD = ['cash', 'bank_transfer', 'vnpay', 'zalopay'];
const PAYMENT_STATUS = ['pending', 'success', 'failed', 'expired'];
const PAYMENT_TYPE   = ['payment', 'refund'];
```

**Indexes:** `{ transactionRef: 1 }` unique, `{ gatewayTransactionId: 1 }` unique sparse (dedupe webhook retries), `{ invoiceId: 1 }`, `{ paidAt: 1 }`.

**Rules:**
- For gateway payments a `pending` Payment is created when checkout starts; the webhook flips it to `success`/`failed`. Only a `success` write triggers the `Invoice.paidAmount` recompute.
- **Idempotency:** before processing a webhook, check whether the Payment is already `success` — if so, acknowledge and do nothing. The unique index on `gatewayTransactionId` is the backstop.
- Payment amount may not exceed the invoice's outstanding balance.
- When an invoice with `type: 'supplies'` becomes `paid`, `payment.service.js` calls `supplyOrderService.markReady(invoiceId)` (§3.16). This covers both online and offline payments.

---

### 3.12 `Request` — `modules/requests/request.model.js`

Renewal or checkout requests submitted by students.

| Field | Type | Notes |
|---|---|---|
| `studentId` | ObjectId ref `Student` | required |
| `contractId` | ObjectId ref `Contract` | required |
| `type` | String (enum) | `renewal`, `checkout` |
| `reason` | String | student-provided free text |
| `requestedEndDate` | Date | new end date (renewal) or move-out date (checkout) |
| `status` | String (enum) | `pending`, `approved`, `rejected`, `cancelled` |
| `reviewedBy` | ObjectId ref `User` | staff who approved/rejected |
| `reviewNote` | String | required when rejecting |
| `reviewedAt` | Date | |

```js
const REQUEST_TYPE = ['renewal', 'checkout'];
const REQUEST_STATUS = ['pending', 'approved', 'rejected', 'cancelled'];
```

**Indexes:**
- `{ status: 1, type: 1 }` (staff queue query)
- One open request of each type per contract, partial:
  ```js
  requestSchema.index(
    { contractId: 1, type: 1 },
    { unique: true, partialFilterExpression: { status: 'pending' } }
  );
  ```

**Rules on approval:**
- `renewal` → `Contract.endDate` extended; monthly invoices generated for the new periods; **deposit is not charged again**.
- `checkout` → cancel the student's `pending_payment` supply orders (§3.16), then `Contract.status = 'terminated'`, `Residency.status = 'closed'`, `Bed.status = 'available'`, plus **deposit settlement** (§4).

---

### 3.13 `RoomType` — `modules/rooms/room-type.model.js` *(v1.2)*

A room category: **tier × capacity**. One document per combination, e.g. "Tiêu chuẩn · 6 người".

| Field | Type | Notes |
|---|---|---|
| `tier` | String (enum) | `standard` (Tiêu chuẩn), `premium` (Chất lượng cao) — required |
| `capacity` | Number (enum) | `3`, `4`, `6`, `8` — required |
| `name` | String | generated from tier + capacity, e.g. `"Tiêu chuẩn · 6 người"` |
| `pricePerMonth` | Number | VND **per student per month** — required |
| `depositAmount` | Number | VND, collected once at move-in — required |
| `amenities` | [String] | fixed equipment that comes with the room and is **never sold**, e.g. `"Giường tầng"`, `"Điều hòa"`, `"WC riêng"` |
| `description` | String | |
| `isActive` | Boolean | default `true`; `false` hides the type from new applications — existing rooms and contracts are unaffected |

```js
const ROOM_TIER = ['standard', 'premium'];
const ROOM_CAPACITY = [3, 4, 6, 8];
```

**Indexes:** `{ tier: 1, capacity: 1 }` unique — one price per combination.

**Rules:**
- `tier` and `capacity` are **locked once any Room uses the type** (`422 ROOM_TYPE_IN_USE`). Changing capacity under existing rooms would make their bed count wrong. Create a new type instead.
- `pricePerMonth` and `depositAmount` may change at any time. Contracts already approved keep their frozen values.
- "Cấp sẵn trong phòng" shown to students = `amenities` **plus** the names of `SupplyItem`s whose `includedInRoomTypes` contains this type. ⚠️ Do not also type those supply items into `amenities` — the two lists would drift apart.

---

### 3.14 `Application` — `modules/residencies/application.model.js` *(v1.2)*

Đơn đăng ký lưu trú — the waiting stage before any contract exists.

| Field | Type | Notes |
|---|---|---|
| `applicationCode` | String | unique, auto-generated `DK-YYYY-XXXXX` |
| `studentId` | ObjectId ref `Student` | required |
| `roomTypeId` | ObjectId ref `RoomType` | required |
| `requestedRoomId` | ObjectId ref `Room` | required — the room the student picked; must belong to `roomTypeId` |
| `startDate` | Date | required |
| `endDate` | Date | required, `> startDate` |
| `note` | String | optional message from the student |
| `status` | String (enum) | `pending`, `approved`, `rejected`, `cancelled` |
| `submittedBy` | ObjectId ref `User` | the student, or staff filing for a walk-in student |
| `assignedRoomId` | ObjectId ref `Room` | set on approval — may differ from `requestedRoomId`, **same room type only** |
| `assignedBedId` | ObjectId ref `Bed` | set on approval, **chosen by the system** |
| `contractId` | ObjectId ref `Contract` | set on approval |
| `reviewedBy` | ObjectId ref `User` | |
| `reviewNote` | String | required when rejecting, min 10 characters |
| `reviewedAt` | Date | |

```js
const APPLICATION_STATUS = ['pending', 'approved', 'rejected', 'cancelled'];
```

**Indexes:**
- `{ status: 1, createdAt: 1 }` — staff queue, oldest first
- One pending application per student, partial:
  ```js
  applicationSchema.index(
    { studentId: 1 },
    { unique: true, partialFilterExpression: { status: 'pending' } }
  );
  ```

**Rules on submit:**
- Student is `active`, has no `active` Contract (`422 STUDENT_HAS_ACTIVE_CONTRACT`) and no other pending application (`409 DUPLICATE_PENDING_APPLICATION`).
- `Room.gender === Student.gender` (`422 GENDER_MISMATCH`).
- The room has at least one available bed **at submit time** (`409 ROOM_FULL`). ⚠️ **Submitting does not reserve the bed.** Several students may apply for the same last slot; whichever application is approved first gets it. Do not add a reservation — expiring stale reservations is exactly the kind of logic v1 avoids.

**Rules on approval — the order matters** (`ARCHITECTURE.md` §3.5, option 3: riskiest write first):
1. Validate: application is `pending` (`422 APPLICATION_NOT_PENDING`). If staff pass a different `roomId`, it must have the same `roomTypeId` (`422 ROOM_TYPE_MISMATCH`) and a matching gender.
2. **Claim a bed atomically** (§3.5). `null` → `409 ROOM_FULL`, and nothing else has been written.
3. Create the `Residency` (`active`).
4. Create the `Contract` (`active`), freezing `monthlyPrice` and `depositAmount` from the RoomType.
5. Create **two** invoices: `deposit` and `monthly` (§3.10).
6. Set the application `approved` with `assignedRoomId`, `assignedBedId`, `contractId`.

If steps 3–6 throw, call `bedService.markBedAvailable(bedId)` before re-throwing, so a failed approval never leaves a bed marked occupied by nobody.

**Reject / cancel:** reject requires `reviewNote`; a student may cancel their own application while `pending`. Neither touches beds.

---

### 3.15 `SupplyItem` — `modules/supplies/supply-item.model.js` *(v1.2)*

Nhu yếu phẩm — items students can buy (mattress, mattress cover, pillow…).

| Field | Type | Notes |
|---|---|---|
| `name` | String | required, e.g. `"Vỏ đệm 90x190cm"` |
| `category` | String (enum) | `bedding` (Chăn ga gối đệm), `personal` (Đồ dùng cá nhân), `electrical` (Điện) |
| `unit` | String | e.g. `"cái"`, `"bộ"` |
| `price` | Number | VND — required |
| `imageUrl` | String | optional link. **v1 has no file upload** — paste an image URL |
| `description` | String | |
| `includedInRoomTypes` | [ObjectId ref `RoomType`] | room types that receive this item **free** — it is hidden from the shop for students living in them |
| `isActive` | Boolean | default `true`; `false` = "Ngừng bán", hidden from the shop, past orders unaffected |

```js
const SUPPLY_CATEGORY = ['bedding', 'personal', 'electrical'];
```

**Rules:**
- **No stock tracking in v1** (PRD §3). Items are always orderable while `isActive`.
- Price changes never alter past orders — `SupplyOrder.items` keeps its own copy.

---

### 3.16 `SupplyOrder` — `modules/supplies/supply-order.model.js` *(v1.2)*

| Field | Type | Notes |
|---|---|---|
| `orderCode` | String | unique, auto-generated `DH-YYYY-XXXXX` |
| `studentId` | ObjectId ref `Student` | required |
| `contractId` | ObjectId ref `Contract` | required — only students with an `active` contract can order |
| `items` | Array<`{ supplyItemId, name, unitPrice, quantity, amount }`> | min 1. `name` and `unitPrice` are **copied at order time** |
| `totalAmount` | Number | ⚠️ **computed on the server from current `SupplyItem.price`** — never from a price the client sends |
| `invoiceId` | ObjectId ref `Invoice` | required, unique — created together with the order |
| `status` | String (enum) | `pending_payment`, `ready`, `delivered`, `cancelled` |
| `deliveredAt` / `deliveredBy` | Date / ObjectId ref `User` | |
| `cancelledAt` / `cancelledBy` | Date / ObjectId ref `User` | `cancelledBy: null` means cancelled by the daily job |
| `cancelReason` | String | |

```js
const SUPPLY_ORDER_STATUS = ['pending_payment', 'ready', 'delivered', 'cancelled'];
```

```
pending_payment ──(invoice paid)──────────▶ ready ──(staff hands it over)──▶ delivered
       │
       └──(student/staff cancels, or invoice past due)──▶ cancelled
```

**Indexes:** `{ studentId: 1, createdAt: -1 }`, `{ status: 1 }`, `{ invoiceId: 1 }` unique.

**Rules:**
- **On create:** each item is `isActive` (`422 SUPPLY_ITEM_INACTIVE`) and is **not** included in the student's current room type (`422 SUPPLY_ALREADY_INCLUDED`); quantity 1–5 per item. Create an Invoice `type: 'supplies'`, `billingPeriod: null`, `dueDate` = today + 3 days, one line item per order item.
- **`pending_payment → ready`** happens in `payment.service.js` right after a `supplies` invoice becomes `paid`, through `supplyOrderService.markReady(invoiceId)`. Use a conditional update so gateway webhook retries cannot run it twice:
  ```js
  await SupplyOrder.findOneAndUpdate(
    { invoiceId, status: 'pending_payment' },
    { $set: { status: 'ready' } }
  );
  ```
- **`ready → delivered`:** staff only, conditional update on `status: 'ready'`; otherwise `422 INVALID_ORDER_STATUS`.
- **Cancel:** only while `pending_payment` **and** the invoice has no successful payment (`422 ORDER_NOT_CANCELLABLE`). Cancelling also sets the invoice to `cancelled`.
- ⚠️ **Unpaid orders are cancelled automatically.** The daily job cancels `pending_payment` orders whose invoice is past `dueDate` with no payment, and cancels that invoice. The same happens at checkout approval. Without this, an order the student abandoned stays on the books as debt and **is deducted from their deposit at checkout — for goods they never received.**

---

## 4. Deposit Settlement on Checkout *(Added 12/09/2026, PRD §2.9 A3)*

When a checkout request is approved, the system closes out the contract financially.

**Step 0 (v1.2):** cancel the student's `pending_payment` supply orders and their invoices (§3.16). They are goods never handed over and must not be counted as debt.

```
outstandingDebt = Σ (totalAmount − paidAmount) of the student's invoices
                  with status ∈ {unpaid, partial, overdue}

refund = depositAmount − outstandingDebt
```

| Result | What happens |
|---|---|
| `refund > 0` | Create a `settlement` Invoice summarising the closeout, and a `Payment` with `type: 'refund'`, `status: 'success'`, `amount: refund`, recording who paid it back and when. Set `Contract.depositRefunded = refund`. |
| `refund <= 0` | The deposit is fully consumed. Create a `settlement` Invoice for the remaining `|refund|` the student still owes. `Contract.depositRefunded = 0`. |

⚠️ Computing the number is not enough — the **payout must be recorded** as a `Payment` document. Otherwise there is no way to answer "did we actually give this student their deposit back?"

---

## 5. Cross-Entity Business Rules Summary

| Rule | Enforced in |
|---|---|
| No double-booking a bed | atomic `findOneAndUpdate` on the lowest free bed (`bedService.claimBedInRoom`) + partial unique index on `Residency.bedId` |
| Beds are never chosen by a person *(v1.2)* | no bed id in any application/approval request body |
| No mixed-gender room *(A1)* | `application.service.js` — on submit **and** on approval |
| Room capacity = bed count | `room.service.js` generates beds from `RoomType.capacity`; no manual bed create/delete |
| Room type shape locked once used *(v1.2)* | `room-type.service.js` — `ROOM_TYPE_IN_USE` |
| One pending application per student *(v1.2)* | partial unique index on `Application.studentId` |
| Staff may only switch to a room of the same type *(v1.2)* | `application.service.js` — `ROOM_TYPE_MISMATCH` |
| One active contract per student | `application.service.js` pre-check |
| Contract 1:1 Residency, 1:1 Application | unique indexes on `Contract.residencyId`, `Contract.applicationId` |
| Price and deposit frozen at approval | `application.service.js` copies them from `RoomType` into `Contract` |
| Invoice status derived, not client-set | `invoice.service.js`, recomputed on every Payment write |
| Deposit invoice separate from monthly | `application.service.js` on approval — two invoices, never one |
| Utility split sums exactly *(A2)* | `invoice.service.js` — `Math.floor` + remainder to the smallest `studentCode` |
| Deposit settled at checkout *(A3)* | `request.service.js` on checkout approval |
| Supply order total computed on the server *(v1.2)* | `supply-order.service.js` |
| Included items cannot be ordered *(v1.2)* | `supply-order.service.js` — `SUPPLY_ALREADY_INCLUDED` |
| Paid supply order becomes `ready` exactly once *(v1.2)* | `payment.service.js` → `supplyOrderService.markReady` (conditional update) |
| Unpaid supply orders never reach the deposit *(v1.2)* | daily job + checkout approval cancel `pending_payment` orders |
| Gateway webhook idempotency | status pre-check + unique sparse index on `Payment.gatewayTransactionId` |
| One pending request per type per contract | partial unique index on `Request` |

---

## 6. Example: Full Mongoose Schema Skeleton

Use this shape for every new entity — see `ARCHITECTURE.md` §3.2 for file placement.

```js
// modules/rooms/bed.model.js
const mongoose = require('mongoose');
const { BED_STATUS } = require('../../shared/constants/enums');

const bedSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    bedNumber: { type: Number, required: true, min: 1 },
    bedCode: { type: String, required: true, trim: true },
    status: { type: String, enum: BED_STATUS, default: 'available' },
    note: { type: String },
  },
  { timestamps: true }
);

bedSchema.index({ roomId: 1, bedNumber: 1 }, { unique: true });

module.exports = mongoose.model('Bed', bedSchema);
```

---

## 7. Change Log

| Version | Date | Change |
|---|---|---|
| 1.0 | 12/09/2026 | Initial schema, 9 collections |
| **1.2** | **13/09/2026** | **Register by room, not bed.** Added `RoomType` (§3.13: tier × capacity, price, deposit, amenities), `Application` (§3.14: student applications, approval assigns the lowest free bed atomically), `SupplyItem` + `SupplyOrder` (§3.15–3.16: supplies shop billed through a `supplies` invoice, auto-cancel when unpaid). `Room` loses `pricePerBed`, gains `roomTypeId` + `floor`, beds are generated automatically; `Bed` gains `bedNumber`. `Contract` loses `pending`, gains `applicationId` + `roomTypeId`, price and deposit frozen from the room type. Checkout cancels unpaid supply orders before settlement. 16 collections. |
| 1.1 | 12/09/2026 | Added `Room.gender` (A1), `UtilityReading` collection (A2), `Contract.depositRefunded` + `Payment.type` + §4 settlement (A3). Added `invoiceCode`/`contractCode`/`transactionRef`, invoice `type` and `cancelled` status, `User.fullName`/`mustChangePassword`. Documented the deposit-invoice separation trap, the atomic bed claim, and concrete `partialFilterExpression` index definitions. |
