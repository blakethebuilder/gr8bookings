# Escape Room Booking System - Project Status

## Repository
- **GitHub:** https://github.com/blakethebuilder/gr8bookings.git
- **Live:** https://gr8bookings.smartintegrate.co.za
- **Website:** https://gr8.smartintegrate.co.za

## Architecture & Stack
- **Backend:** PocketBase v0.25.8 (SQLite + REST/Realtime SSE)
- **Frontend:** React 18 + Vite 6 + Tailwind CSS 3 + Lucide Icons + FullCalendar
- **Payment:** Payfast (South Africa) — HTML Form POST + ITN webhook
- **Deployment:** Docker (Alpine + nginx + PocketBase + Node.js)

## PocketBase Collections
| Collection | Purpose | Auth |
|---|---|---|
| rooms | Escape rooms with pricing, timing | Public |
| time_slots | Availability grid (auto-generated 30 days) | Public |
| bookings | Customer bookings + payment + waiver | Public |
| gm_blocks | Game Master manual time blocks | Public |
| settings | Key-value config (Payfast, WhatsApp) | Public |
| waivers | Player indemnity waivers with signatures | Public |
| staff | Game Masters + Grandmaster accounts | Public |
| game_hosts | Links staff to bookings | Public |

## Routes
| Route | Access | Page |
|-------|--------|------|
| `/login` | Public | Staff login (PIN-based) |
| `/availability` | Public | Live calendar with slots |
| `/book` | Public | Customer booking flow |
| `/book?room=<slug>` | Public | Pre-select room from website |
| `/book/confirm/:ref` | Public | Booking confirmation + waiver link |
| `/waiver/:id` | Public | Player indemnity waiver signing |
| `/grandmaster` | Grandmaster | Admin dashboard (revenue, stats) |
| `/calendar` | Both roles | FullCalendar with bookings |
| `/gm` | Both roles | Game Master hosting dashboard |
| `/rooms` | Grandmaster | Room management |
| `/bookings` | Grandmaster | Booking list + GM assignment |
| `/staff` | Grandmaster | Staff management |
| `/settings` | Grandmaster | App configuration |

## Staff Credentials
| Name | Role | Email | PIN |
|------|------|-------|-----|
| Niki | Grandmaster | niki@gr8escape.co.za | 1234 |
| Thabo | Game Master | thabo@gr8escape.co.za | 5678 |
| Zanele | Game Master | zanele@gr8escape.co.za | 9012 |
| Ryan | Game Master | ryan@gr8escape.co.za | 3456 |

## Business Rules
- **Rooms:** 6 escape rooms (5 indoor + 1 outdoor)
- **Pricing:** R320/pp (deposit: R640 for 2 tickets, rest on arrival)
- **Hours:** Mon-Thu 09:30-18:30, Fri-Sat 09:30-20:00, Sun 09:30-18:30
- **Slots:** Auto-generated 30 days ahead, replenish daily

## Completed Phases
- [x] Phase 1: PocketBase Schema (8 collections, seeded data)
- [x] Phase 2: React + Vite + Tailwind frontend
- [x] Phase 3: Game Master HQ (FullCalendar + realtime SSE)
- [x] Phase 4: Public booking + Payfast integration
- [x] Phase 5: E-Waiver system with canvas signature
- [x] Phase 6: Role-based auth + dashboards
- [x] Phase 7: Docker deployment + auto-seed
- [x] Phase 8: Mobile responsive + PWA
- [x] Phase 9: Deposit vs full payment options
- [x] Phase 10: Auto slot generation + daily cron

## Known Issues
See `KNOWN_ISSUES.md` for security, feature gaps, and polish items.

## Deployment
- **Docker:** Single container (Alpine + nginx + PocketBase + Node.js)
- **Port:** 80 (nginx) → proxies to PocketBase on 8090
- **Auto-seed:** Collections + rooms + staff + settings + 30 days of slots
- **Auto-slots:** Replenishes daily via cron job
