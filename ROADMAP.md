# FlyFoil Formosa - Project Roadmap

## Project Overview
FlyFoil Formosa is a premium eFoil (electric hydrofoil) booking and management platform based in Ria Formosa, Portugal. The application serves as a landing page for customers to book experiences, a user dashboard for pre-flight safety checklists, and an admin portal for managing reservations.

## Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion
- **Backend/Database:** Firebase (Firestore, Authentication)
- **Mapping:** React Leaflet
- **Icons:** Lucide React

## Phase 1: MVP (Completed)
- [x] Landing page with hero, experience details, and pricing.
- [x] Booking form integrated with Firestore (`reservations` collection).
- [x] Interactive location map using Leaflet.
- [x] Admin portal (`/admin`) with Google Authentication.
- [x] Admin Role-Based Access Control (RBAC) restricted to `flyfoilformosa@gmail.com`.
- [x] User dashboard with safety checklists and waiver status.
- [x] Social media (Instagram, YouTube) and WhatsApp integration.
- [x] UI Polish (Dark theme dropdowns, responsive layouts, custom favicon).

## Phase 2: Core Integrations (Up Next)
- [ ] **Authentication:** Fully implement Magic Link (Email/Phone) login for customers on the `/login` page.
- [ ] **Payments:** Integrate a payment gateway (e.g., Stripe) for deposit or full payment collection during the booking process.
- [ ] **Notifications:** Set up automated email/SMS confirmations for users and admins when a booking is created (e.g., using Firebase Extensions or SendGrid).
- [ ] **Scheduling:** Implement a calendar/availability system to prevent double-booking of time slots and manage instructor availability.

## Phase 3: Advanced Features (Future)
- [ ] Multi-language support (English, Portuguese, Spanish).
- [ ] Inventory management (tracking available eFoils, battery levels, and maintenance schedules).
- [ ] Customer reviews and testimonials integration.
- [ ] Automated waiver signing via built-in canvas signature or third-party API (e.g., DocuSign).
