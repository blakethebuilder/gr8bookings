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
| staff | pbc_2301119865 | Staff accounts (Grandmasters + Game Masters) |
| game_hosts | pbc_340668326 | Links staff to bookings (game hosting assignments) |

## Roles
| Role | Access | Description |
|------|--------|-------------|
| **Grandmaster** | /grandmaster, /gm, /rooms, /bookings, /staff, /settings | Admin — full access, revenue stats, staff mgmt |
| **Game Master** | /gm only | Staff — sees assigned games, hosting dashboard |

## Business Rules
- **Room Lockout:** 100% Private per booking. Booking a slot locks the entire room block (`time_slots.status = 'full'`).
- **Pricing:** Per-person (`total_amount = player_count * price_per_player`).
- **Timings:** 60-minute games + configurable reset buffer (default 15 mins).

## Credentials (dev only)
- **PocketBase Admin:** `admin@gr8escape.co.za` / `admin123456`
- **Frontend URL:** http://localhost:5173
- **PocketBase URL:** http://localhost:8090
- **Webhook Server:** http://localhost:3001

### Staff Login (PIN-based)
| Name | Role | Email | PIN |
|------|------|-------|-----|
| Niki | Grandmaster | niki@gr8escape.co.za | 1234 |
| Thabo | Game Master | thabo@gr8escape.co.za | 5678 |
| Zanele | Game Master | zanele@gr8escape.co.za | 9012 |
| Ryan | Game Master | ryan@gr8escape.co.za | 3456 |

## Routes
| Route | Access | Page |
|-------|--------|------|
| `/` | Grandmaster | Dashboard |
| `/login` | Public | Staff login |
| `/book` | Public | Customer booking flow |
| `/book/confirm/:ref` | Public | Booking confirmation + waiver share link |
| `/waiver/:id` | Public | Player indemnity waiver signing |
| `/grandmaster` | Grandmaster | Admin stats (revenue, GM perf, occupancy) |
| `/gm` | Both roles | Game Master HQ (FullCalendar + hosting) |
| `/rooms` | Grandmaster | Room management |
| `/bookings` | Grandmaster | Booking list + GM assignment |
| `/staff` | Grandmaster | Staff management |
| `/settings` | Grandmaster | App configuration |

## Active Roadmap & Task Matrix
- [x] Phase 1: Environment & PocketBase Schema Setup
- [x] Phase 2: Core React Frontend & Tailwind Setup
- [x] Phase 3: Game Master HQ (FullCalendar Grid + Realtime SSE)
- [x] Phase 4: Public Booking Widget & Payfast ITN Integration
- [x] Phase 5: Indemnity / E-Waiver System (`/waiver/:id`)
- [x] Phase 6: Role-Based Auth + Grandmaster/GM Dashboards
- [ ] Phase 7: Evolution API WhatsApp Integration & Cron Reminders
- [ ] Phase 8: UI Polish (responsive, toasts, error boundaries)
- [ ] Phase 9: Docker + Deployment

## Change Log & Recent Actions
- **Session start:** Initialized project, cloned demo site, extracted assets.
- **Phase 1-2:** PocketBase schema (6 collections), React+Vite+Tailwind frontend, seeded 6 rooms.
- **Phase 3:** Game Master HQ — FullCalendar week/day views, realtime SSE, slot generator, GM block creator.
- **Phase 4:** Public booking flow (/book) — room→date→slot→details→Payfast. ITN webhook on port 3001.
- **Phase 5:** E-waiver system (/waiver/:id) — canvas signature, minor/guardian, shareable link on confirmation.
- **Critical fixes:** Calendar uses time_slot dates, event detail modal, realtime indicator fixed.
- **Phase 6:** Role-based auth — login page, AuthGate, Grandmaster dashboard (revenue/GM stats/occupancy), GM dashboard (hosting view with game flow), Staff management page, Assign GM from bookings table.
- **Seeded staff:** Niki (Grandmaster), Thabo/Zanele/Ryan (Game Masters).
- **Pushed to GitHub:** https://github.com/blakethebuilder/gr8bookings.git
