# Campus Resource Hub — Product Requirements Document

## Objective
Deliver a centralized, self-service hub where students, staff, and administrators at Kelley School of Business can discover, evaluate, and reserve campus resources with confidence. The product should eliminate manual booking workflows (emails, spreadsheets, phone calls), surface real-time availability, and provide transparent oversight so resource owners can safely share spaces, equipment, and event venues.

## Stakeholders
- **Students (Primary Users):** Need quick discovery, availability transparency, frictionless booking, and timely confirmations or denials for study rooms, equipment, and event spaces.
- **Staff Resource Owners:** Require tooling to publish resources, manage availability rules, approve or decline requests, message requesters, and monitor utilization.
- **Campus Administrators:** Oversee policy enforcement, user moderation, auditing, and reporting on utilization and satisfaction.
- **IT / Platform Operations:** Maintain authentication, data security, integrations (Google OAuth/Calendar), and uptime.
- **Course Faculty & Program Coordinators:** Depend on reliable scheduling data to align academic programming, allocate equipment, and prevent conflicts with events.

## Non-Goals
- **General-Purpose Facility Management:** The app will not handle maintenance work orders, custodial routing, or capital project planning.
- **External Community Bookings:** Access is limited to authenticated campus accounts; no guest checkout or payment processing is planned.
- **Custom Workflow Builder:** Approval flows remain role-based and opinionated rather than offering arbitrary, multi-step workflow designers.
- **Full Email Service Replacement:** Only transactional notifications (e.g., booking updates, flag alerts) are supported; marketing or mass email campaigns are out of scope.
- **Native Mobile Apps:** Responsive web experience covers mobile needs for this release.

## Core Features
1. **Role-Aware Authentication & Security**
   - Secure registration/login, bcrypt hashing, CSRF protection, and three roles (Student, Staff, Admin) with tailored permissions.
   - Admin controls for suspending accounts and enforcing policy.

2. **Resource Catalog Management**
   - Rich metadata (category, location, capacity, equipment, lifecycle status).
   - Availability rules with recurring patterns and restricted access flags.
   - Draft → publish → archive workflow for safe iterations.

3. **Discovery & Planning**
   - Advanced search and filtering (keyword, category, location, capacity, availability window, sort controls).
   - Live availability calendar embedded in search results to reduce dead-end clicks.
   - Ratings, review aggregates, and “most booked/top rated” badges for social proof.

4. **Booking & Approval Flow**
   - Calendar-based booking form with conflict detection and recurrence support.
   - Role-aware approvals with recorded decisions, simulated email notifications, and downloadable iCal files.
   - Automated Google Calendar sync via OAuth for users who connect accounts.

5. **Post-Booking Engagement**
   - Threaded messaging between requester and resource owner tied to each booking.
   - Post-booking reviews/ratings gated to completed reservations, plus moderation controls for flagged content.

6. **Admin & Compliance Console**
   - Dashboards for users, resources, bookings, reviews, and flag queues.
   - Audit logging for moderation activity and status changes.

## Success Metrics
- **Adoption:** 80% of target student organizations and faculty-led programs active within one semester; ≥500 unique monthly users.
- **Booking Efficiency:** 60% reduction in manual email/phone requests compared to baseline; <2 minutes median time from search to submitted request.
- **Utilization:** ≥70% average occupancy for high-demand resources during peak weeks, tracked via booking vs. availability hours.
- **Satisfaction:** Average review rating ≥4.3/5 and <5% of bookings escalated due to conflicts or policy violations.
- **Operational Load:** Admin moderation queue resolved within 2 business days 95% of the time; <1% of bookings require IT intervention.

## Release Criteria
- End-to-end tests covering authentication, booking conflicts, and calendar sync pass in CI.
- Data model migrations applied successfully to baseline `campus_hub.db`.
- Accessibility smoke test (keyboard navigation, contrast) scores AA or better.
- Security checklist items in `SECURITY_COMPLIANCE_REPORT.md` completed with no open high-severity findings.
