Module 1: Public Website
Features
Home Page
About Hotel
Room Listings
Room Details
Hotel Gallery
Contact Page
Hotel Map Location
Nearby Attractions
Directions to Hotel
Frequently Asked Questions
Interactive Map

Guests can:

View hotel location
Get directions
View nearby restaurants
View nearby hospitals
View nearby banks
View nearby fuel stations
View tourist attractions
View shopping centers
Module 2: Guest Portal
Authentication
Register
Login
OTP Verification via Arkesel
Password Reset
Profile Management
Booking
Search Rooms
Check Availability
Select Room
Create Reservation
Booking History
Reservation Cancellation
Booking Options
Pay at Hotel

Guest books and pays upon arrival.

MoMo Payment

Guest sends money to hotel merchant account.

Bank Transfer

Guest transfers funds manually.

Reservation Statuses
Pending
Awaiting Payment
Confirmed
Checked-In
Checked-Out
Cancelled
No Show
Module 3: QR Booking System
Booking QR Code

Generated after reservation.

Contains:

Booking Reference
Guest Name
Room Number
Check-In Date
Check-Out Date
Reception Scan

Reception can:

Scan QR
Verify Reservation
Verify Payment
Complete Check-In
Module 4: Reception Management System
Walk-In Guest Management

Reception can:

Register guest
Assign room
Record payment
Generate receipt
Guest Verification

Store:

Ghana Card
Passport
Driver's License

Optional:

Upload ID Image
Check-In

Reception can:

Confirm reservation
Verify guest
Assign room
Check guest in
Check-Out

Reception can:

Complete stay
Record additional charges
Generate invoice
Mark room available
Room Transfer

Reception can:

Move guest to another room
Upgrade room
Downgrade room
Module 5: Room Management
Room Creation

Fields:

Room Number
Room Type
Capacity
Description
Amenities
Price Per Night
Images
Room Types

Examples:

Standard
Deluxe
Executive
Suite
Presidential Suite
Room Images

Stored in Supabase Storage.

Module 6: Room Status Management
Statuses
Available
Reserved
Occupied
Cleaning
Maintenance
Out of Service
Automatic Status Updates

Example:

Booking Confirmed

↓

Reserved

↓

Guest Arrives

↓

Occupied

↓

Guest Leaves

↓

Cleaning

↓

Available

Module 7: Room Calendar View
Daily Calendar

Shows room occupancy for today.

Weekly Calendar

Shows occupancy for week.

Monthly Calendar

Shows occupancy for month.

Color Indicators

Available

Reserved

Occupied

Cleaning

Maintenance

This provides a bird's-eye operational view.

Module 8: Housekeeping Management
Task Assignment

Assign rooms to cleaners.

Cleaning Workflow
Pending Cleaning
Cleaning In Progress
Cleaned
Cleaning Records

Track:

Staff
Room
Time Started
Time Completed
Module 9: Maintenance Management
Maintenance Requests

Create requests for:

Plumbing
Electrical
Furniture
Air Conditioning
General Repairs
Maintenance Statuses
Open
In Progress
Completed

Affected rooms become unavailable.

Module 10: Notification System
SMS Notifications (Arkesel)
OTP

Login verification.

Booking Confirmation

Reservation successful.

Payment Confirmation

Reservation confirmed.

Check-In Reminder

24 hours before arrival.

Check-Out Reminder

24 hours before departure.

Reservation Expiry Reminder

For unpaid reservations.

Email Notifications (Resend)
Booking Confirmation
Reservation Receipt
Reports
Password Reset
Module 11: Reporting System
Daily Report

Includes:

Date
Room Number
Guest Name
Check-In Date
Check-Out Date
Amount Paid
Booking Status

Summary:

Total Bookings
Occupancy Rate
Revenue
Weekly Report

Aggregated weekly data.

Monthly Report

Aggregated monthly data.

Export Formats
PDF
CSV
Excel
Module 12: Owner Analytics Dashboard
Revenue Dashboard

Displays:

Daily Revenue
Weekly Revenue
Monthly Revenue
Annual Revenue
Booking Dashboard

Displays:

Total Bookings
Pending Bookings
Confirmed Bookings
Cancelled Bookings
No Shows
Occupancy Dashboard

Displays:

Occupancy Rate
Available Rooms
Reserved Rooms
Occupied Rooms
Rooms Under Cleaning
Customer Dashboard

Displays:

New Guests
Returning Guests
Repeat Visit Rate
Top Performing Rooms

Displays:

Most Booked Room
Highest Revenue Room
Least Utilized Room
Forecasting Dashboard

Estimates:

Future Occupancy
Future Revenue

based on existing reservations.

Module 13: Audit & Security System
Authentication
Supabase Auth
OTP Verification
Session Management
Authorization

Roles:

Guest
Receptionist
Housekeeper
Admin
Owner
Security Features
HTTPS
Secure Cookies
Row Level Security (RLS)
Password Hashing
Rate Limiting
Audit Logs
Audit Logging

Track:

Login Activity
Booking Changes
Room Changes
Check-In Activities
Check-Out Activities
Report Generation
Core Database Tables
Users
Rooms
RoomImages
Bookings
BookingPayments
HousekeepingTasks
MaintenanceRequests
Notifications
AuditLogs
RoomStatusHistory
HotelSettings
Reports
Recommended Final Stack
Frontend & Backend
Next.js 15
TypeScript
Tailwind CSS
shadcn/ui
Database
Supabase PostgreSQL
Authentication
Supabase Auth
Arkesel OTP
Storage
Supabase Storage
Maps
Google Maps API
SMS
Arkesel
Email
Resend
Reporting
PDFKit
ExcelJS
Hosting
Vercel