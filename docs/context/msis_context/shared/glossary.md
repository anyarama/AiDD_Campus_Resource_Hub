# Glossary of Terms
## Campus Resource Hub

### Core Concepts

**Resource**: Any campus asset available for booking (study rooms, equipment, lab instruments, event spaces, tutoring slots)

**Resource Owner**: The user who created/manages a resource listing (usually staff or department)

**Requester**: A user who requests to book a resource

**Booking**: A reservation for a specific resource during a defined time period

**Conflict Detection**: Algorithm that prevents overlapping bookings for the same resource

---

### User Roles

**Student**: Basic user role with permissions to browse/book resources and create personal listings

**Staff**: Enhanced role with permissions to approve restricted resource bookings

**Admin**: Full system access including user management, moderation, and analytics

---

### Booking Statuses

**Pending**: Booking requested but not yet approved  
**Approved**: Booking confirmed, time slot reserved  
**Rejected**: Booking request denied by owner/staff  
**Cancelled**: Previously approved booking cancelled by requester or admin  
**Completed**: Booking time has passed, eligible for review

---

### Resource Statuses

**Draft**: Resource created but not published (owner-only visible)  
**Published**: Resource active and searchable by all users  
**Archived**: Resource deactivated (admin-only visible, not bookable)

---

### Technical Terms

**CSRF**: Cross-Site Request Forgery protection (security measure)  
**bcrypt**: Password hashing algorithm (12 rounds minimum)  
**DAL**: Data Access Layer (repository pattern for database operations)  
**ORM**: Object-Relational Mapping (SQLAlchemy)  
**MVC**: Model-View-Controller architecture pattern

---

### Business Terms

**Approval Workflow**: Process where resource owner/staff must approve booking requests

**Capacity**: Maximum number of users a resource can accommodate

**Availability Rules**: JSON object defining when resource can be booked (recurring schedules)

**Aggregate Rating**: Average of all reviews for a resource (1-5 stars)

---

**Last Updated**: November 4, 2025
