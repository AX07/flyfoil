# Development Log

This file tracks major changes, updates, and technical decisions made during the development of FlyFoil Formosa.

## [2026-03-24] - Security & Content Updates
- **Admin Security:** Updated `firestore.rules` and frontend `Admin.tsx` to strictly restrict admin access to `flyfoilformosa@gmail.com`. Added a clear "Access Denied" UI state for unauthorized users attempting to access the dashboard.
- **Social Media:** Replaced placeholder social links in the footer with actual Lucide React icons (`Instagram`, `Youtube`) linking to the official accounts.
- **Contact Info:** Updated global contact information to use `Flyfoilformosa@gmail.com` and `+34645349260`. Updated the floating WhatsApp button link to route to the correct phone number.
- **UI Fixes:** 
  - Fixed the dropdown menus (`<select>`) on the landing page booking form by adding `bg-navy text-white` to `<option>` tags for visibility on iOS/Safari.
  - Fixed the "Send Magic Link" button layout on the Login page and added a "Book a Session" fallback link.
  - Updated the favicon to `logo-dark.png`.
  - Updated safety checklist text in the User Dashboard regarding swimmer clearance (100m).
- **Documentation:** Added `ROADMAP.md` and `DEVLOG.md` to help onboard future developers and track project progress.

## [Previous] - Initial MVP Development
- Initialized React + Vite application with Tailwind CSS.
- Set up Firebase project, Firestore database, and Authentication.
- Built the Landing page with smooth scrolling and Framer Motion animations.
- Implemented the booking form that writes directly to the `reservations` Firestore collection.
- Created the Admin portal to view and filter incoming bookings.
- Created the User Dashboard for managing flight school progress and waivers.
