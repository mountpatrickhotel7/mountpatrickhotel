# Additional Real-World Hotel Use Cases and Requirements

## FR-21 Flexible Payment Options

The system shall support multiple payment methods and booking workflows.

### Payment Option A: Pay Now

Guest:

* Selects room
* Pays online immediately
* Booking automatically confirmed

Status Flow:

Pending → Paid → Confirmed

---

### Payment Option B: Pay on Arrival

Guest:

* Selects room
* Chooses "Pay at Hotel"
* Booking reserved

Status Flow:

Reserved → Checked-In → Paid

The hotel may define:

* Reservation expiry period
* Required deposit amount

---

### Payment Option C: Partial Deposit

Guest pays only a percentage.

Example:

* Total Cost: GHS 2,000
* Deposit: GHS 500
* Balance Due: GHS 1,500

Status Flow:

Deposit Paid → Confirmed → Balance Due

---

### Payment Option D: Corporate Invoice

Corporate clients may:

* Book rooms
* Receive invoice
* Pay later

Status Flow:

Booked → Invoiced → Paid

---

## FR-22 Walk-In Guest Management

Receptionists shall:

* Create reservations without online booking
* Assign rooms immediately
* Record payment
* Generate receipt

Required Information:

* Guest Name
* Phone Number
* Identification Type
* Identification Number
* Room Assigned
* Payment Method

---

## FR-23 Group Booking Management

The system shall support:

* Family bookings
* Tour groups
* Corporate bookings

Features:

* Multiple rooms under one reservation
* Group discount support
* Single invoice generation

Example:

Booking Reference: GB12345

Rooms:

* Room 101
* Room 102
* Room 103

Single payment record.

---

## FR-24 Reservation Hold System

Guests may reserve rooms temporarily before payment.

Example:

* Hold room for 2 hours
* Await payment

If payment is not completed:

* Reservation automatically expires
* Room returns to available inventory

---

## FR-25 No-Show Management

The system shall identify guests who fail to arrive.

Status:

Confirmed → No Show

Owner dashboard shall display:

* Number of no-shows
* Revenue impact

Hotel may define:

* No-show fee
* Automatic cancellation rules

---

## FR-26 Reservation Cancellation

Guests may cancel reservations.

Cancellation policies:

### Flexible

Full refund.

### Moderate

Partial refund.

### Strict

No refund.

Cancellation rules shall be configurable by management.

---

## FR-27 Refund Management

Administrators shall:

* Initiate refunds
* Record refund reason
* Track refund status

Refund statuses:

* Requested
* Approved
* Rejected
* Completed

---

## FR-28 Room Upgrade Management

Receptionists shall be able to:

* Upgrade guests to larger rooms
* Move guests between rooms

Reasons:

* VIP guest
* Maintenance issue
* Customer request

System shall:

* Recalculate room rates
* Maintain audit trail

---

## FR-29 Stay Extension Management

Guests may extend their stay.

System shall:

* Check room availability
* Calculate additional charges
* Update reservation

Example:

Original Checkout:

10 July

Extended Checkout:

13 July

Additional nights automatically billed.

---

## FR-30 Early Check-In and Late Check-Out

The system shall support:

### Early Check-In

Example:

Standard Check-In: 2 PM

Guest Arrives: 9 AM

Optional fee may apply.

### Late Check-Out

Example:

Standard Check-Out: 12 PM

Guest Leaves: 5 PM

Optional fee may apply.

---

## FR-31 Guest Identification Verification

Reception shall record:

* National ID
* Passport
* Driver's License

Optional upload:

* ID image
* Passport image

Stored securely.

---

## FR-32 Multi-Payment Support

Single booking may be paid using multiple methods.

Example:

GHS 1,000 Booking

* GHS 500 MoMo
* GHS 300 Card
* GHS 200 Cash

System shall maintain payment breakdown.

---

## FR-33 Receipt and Invoice Generation

System shall generate:

### Guest Receipt

Contains:

* Booking Reference
* Guest Name
* Payment Details
* Amount Paid

### Hotel Invoice

Contains:

* Charges
* Taxes
* Discounts
* Outstanding Balance

Downloadable as PDF.

---

## FR-34 Discount and Promotion Management

Administrators shall create:

* Promo Codes
* Seasonal Discounts
* Corporate Discounts
* Long Stay Discounts

Examples:

SUMMER20

20% Off

---

## FR-35 Loyalty and Returning Guest Tracking

The system shall identify:

* Returning Guests
* Total Visits
* Lifetime Spending

Owners may:

* Offer discounts
* Reward frequent guests

---

## FR-36 Branch Management (Future Ready)

The system shall support multiple hotel branches.

Each branch shall maintain:

* Rooms
* Staff
* Revenue
* Reports

Separately.

Owners can view consolidated analytics.

---

## FR-37 Emergency Room Blocking

Administrators shall temporarily block rooms due to:

* Maintenance
* Renovation
* Pest Control
* Safety Concerns

Blocked rooms shall not appear in search results.

---

## FR-38 Lost and Found Management

Receptionists shall record:

* Item Name
* Description
* Found Date
* Location Found
* Claim Status

---

## FR-39 Housekeeping Task Assignment

Managers shall assign tasks.

Example:

Cleaner A:

* Room 101
* Room 103

Cleaner B:

* Room 105
* Room 106

Task completion shall be tracked.

---

## FR-40 Internal Messaging

Staff shall receive notifications for:

* New bookings
* Check-ins
* Check-outs
* Cleaning requests
* Maintenance requests

---

## FR-41 Guest Feedback and Ratings

Guests shall rate:

* Room Quality
* Cleanliness
* Staff Service

Ratings shall appear on management dashboards.

---

## FR-42 Revenue Forecasting

Owner dashboard shall estimate:

* Expected occupancy
* Expected revenue
* Upcoming reservations

Based on historical data.

---

## FR-43 Backup and Disaster Recovery

The system shall:

* Perform daily backups
* Support restoration
* Maintain audit history

Recovery objective:

Less than 1 hour.

---

## FR-44 Offline Reception Mode (Future Enhancement)

If internet connectivity fails:

* Reception can continue check-ins
* Data synchronizes once internet returns

Useful for areas with unstable connectivity.
