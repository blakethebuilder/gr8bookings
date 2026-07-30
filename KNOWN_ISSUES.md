# Known Issues & Gaps

## Security

| Issue | Severity | Status |
|-------|----------|--------|
| Collection rules public | High | ✅ Fixed — staff collection uses `authWithPassword`, listRule/viewRule locked to `@request.auth.id != ""`. Seed.js now forces rule updates on every run (not just null). |
| Payfast secrets on client | Medium | ✅ Fixed — server-side signature |
| No input validation | Low | ✅ Fixed — name/email validation |
| Auto-confirm bypass | Medium | ✅ Fixed — removed |
| No rate limiting | Low | ✅ Fixed — 10 req/min |

## Feature Gaps

| Feature | Status | Notes |
|---------|--------|-------|
| WhatsApp reminders | Not started | Evolution API integration needed |
| Email notifications | Not started | Confirmation emails, reminders |
| Booking cancellation flow | ✅ Done | Customer self-service + admin cancel |
| Murder mystery bookings | Not started | Separate product line (R200/pp @ Doppio Zero) |
| Add-on packages | Not started | Birthday, Bachelor, Challenge Wheel |
| Deposit-only model | Partial | Dynamic deposit calculation implemented |
| Room images | Not uploaded | Asset files exist but not in PocketBase |
| Reset demo data | ✅ Done | Settings → Reset All Demo Data button |

## UI/UX Polish

| Item | Status |
|------|--------|
| Mobile responsive | ✅ Done — full responsive overhaul |
| PWA support | ✅ Done — SW cache busting on deploy |
| Error boundary | ✅ Done |
| Loading spinners | ✅ Done |
| Toast notifications | ✅ Done — ToastProvider + useToast hook |
| Dark/light theme toggle | Not needed (dark only) |
| Print/export bookings | ✅ Done — CSV export on Bookings page |
| Room emoji placeholders | ✅ Done |
| Settings collapsed sections | ✅ Done |
| PIN → Password | ✅ Done — renamed everywhere |
| Calendar mobile view | ✅ Done — day view on phone, compact toolbar |

## Testing

| Area | Status |
|------|--------|
| Manual booking flow | Tested |
| Payfast sandbox | Tested |
| Calendar + slot generation | Tested |
| GM dashboard | Tested |
| Staff management | Tested |
| Mobile responsive | Tested |
| Docker deployment | Tested |
| Unit tests | Not implemented |
| E2E tests | Not implemented |

## Cross-Domain Integration
The marketing site (gr8.smartintegrate.co.za) links to the booking app (gr8bookings.smartintegrate.co.za) via URL params (?room=slug). Options to improve:
- Reverse-proxy /book on the Astro site to the booking container
- Relax X-Frame-Options to allow iframe embedding
- Fetch PocketBase data at Astro build time to show live availability on the marketing site
