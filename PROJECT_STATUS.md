# Escape Room Booking System - Project Status

## Repository
- **GitHub:** https://github.com/blakethebuilder/gr8bookings.git

## Architecture & Stack
- **Backend:** PocketBase v0.25.8 (SQLite + REST/Realtime SSE + Auth)
- **Frontend:** React 18 + Vite 6 + Tailwind CSS 3 + Lucide Icons + FullCalendar + TanStack Table
- **Payment Gateway:** Payfast (South Africa) — HTML Form POST redirect + ITN webhook handler
- **WhatsApp Engine:** Evolution API (EVO API) — transactional messaging (confirmations, e-waivers, 3-hour pre-game reminders)
- **Deployment:** Single-container Docker / Dokploy

## PocketBase Collections
| Collection | ID | Purpose |
|---|---|---|
| rooms | pbc_3085411453 | Escape rooms with pricing, difficulty, timing |
| time_slots | pbc_1941365820 | Availability grid per room per date |
| bookings | pbc_986407980 | Customer bookings with payment + waiver status |
| gm_blocks | pbc_1534854836 | Game Master manual time blocks |
| settings | pbc_2769025244 | Key-value config (Payfast, WhatsApp, etc.) |
| waivers | pbc_2788641419 | Player indemnity waivers with signatures |

## Business Rules
- **Room Lockout:** 100% Private per booking. Booking a slot locks the entire room block (`time_slots.status = 'full'`).
- **Pricing:** Per-person (`total_amount = player_count * price_per_player`).
- **Timings:** 60-minute games + configurable reset buffer (default 15 mins).

## Credentials (dev only)
- **PocketBase Admin:** `admin@gr8escape.co.za` / `admin123456`
- **Frontend URL:** http://localhost:5173
- **PocketBase URL:** http://localhost:8090
- **Webhook Server:** http://localhost:3001

## Active Roadmap & Task Matrix
- [x] Phase 1: Environment & PocketBase Schema Setup
- [x] Phase 2: Core React Frontend & Tailwind Setup
- [x] Phase 3: Game Master HQ (FullCalendar Grid + Realtime SSE)
- [x] Phase 4: Public Booking Widget & Payfast ITN Integration
- [x] Phase 5: Indemnity / E-Waiver System (`/waiver/:id`)
- [ ] Phase 6: Evolution API WhatsApp Integration & Cron Reminders

## Change Log & Recent Actions
- Initialized project directory. Created PROJECT_STATUS.md baseline.
- Cloned demo site (gr8escape-demo), extracted assets: logos (nav/main/dark), 5 room images, hero-bg, bg-pattern.
- PocketBase v0.25.8 installed. Collections created via API: `rooms`, `time_slots`, `bookings`, `gm_blocks`, `settings`.
- Seeded 6 rooms (Asylum, Trapped, Hunted, Nightmare, Basement, Witch's Curse) + 14 default settings.
- React + Vite + Tailwind frontend scaffolded. Layout with sidebar nav, Dashboard, Rooms, Bookings, Settings pages.
- Phase 1 & 2 complete. Frontend running at localhost:5173, PocketBase admin at localhost:8090/_/.
- Phase 3 complete. Game Master HQ at /gm with FullCalendar (week/day views), realtime SSE subscriptions, slot generator (auto-fills Thu-Sun 11:00-18:00), GM block creator.
- Phase 4 complete. Public booking flow at /book: room selector → date picker → slot picker → details form → Payfast redirect. Confirmation page at /book/confirm/:reference. Payfast ITN webhook server on port 3001.
- Phase 5 complete. E-waiver page at /waiver/:id with canvas signature, auto-fill from booking, minor/guardian support. Shareable waiver link on confirmation page. Waivers collection tracking signatures.
- Critical fixes: calendar now uses time_slot dates (not booking.created), event detail modal replaces alert(), realtime indicator fixed.
