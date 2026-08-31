# 23 — Admin System
**Purpose:** Document admin capabilities  
**Audience:** Admin Developers / Organizers  
**Last Generated:** 2026-08-31  
**Source of Truth:** `src/app/(admin)/`, `src/app/api/admin/`
---
## Admin Capabilities
| Feature | Endpoint | UI Page |
|---------|----------|---------|
| Start/Pause/End round | `PUT /api/admin/rounds/{id}/status` | /admin/rounds |
| Create/edit rounds | `POST/PUT /api/admin/rounds` | /admin/rounds |
| Create/edit problems | `POST/PUT /api/admin/problems` | /admin/rounds |
| View all teams | `GET /api/admin/teams` | /admin/teams |
| View all participants | `GET /api/admin/participants` | /admin/participants |
| Manage event settings | `GET/PUT /api/admin/events` | /admin |
| View AI telemetry | `GET /api/admin/ai` | /admin/ai |
| Create announcements | `POST /api/admin/announcements` | /admin/announcements |
| View dashboard stats | `GET /api/admin/stats` | /admin |
| View leaderboard | `GET /api/leaderboard/*` | /admin/leaderboard |
## Admin Operations Flow
```
1. Login as admin@byteverse.dev / admin2026
2. Navigate to /admin
3. View dashboard stats
4. Go to /admin/rounds → Start Round 1
5. Monitor violations via Redis alerts
6. End Round 1 → Start Round 2
7. Repeat for all 5 rounds
8. View final leaderboard at /admin/leaderboard
```
## Role Requirements
- ORGANIZER+ can manage rounds, teams, participants, announcements
- ADMIN+ can manage events, view AI telemetry
- SUPER_ADMIN has all permissions
## Admin Navbar
`src/components/admin/AdminNavbar.tsx` — sidebar navigation with links to all admin pages.
## Files
- `src/app/(admin)/` — All admin pages
- `src/app/api/admin/` — All admin API routes
- `src/components/admin/AdminNavbar.tsx` — Navigation
