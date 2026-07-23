# Known Issues & Gaps

## Security (Fix Before Production)

| Issue | Severity | Fix |
|-------|----------|-----|
| All collection rules are public | High | Switch to PocketBase auth (requires recreating staff collection with auth enabled) |
| Payfast passphrase on client | Medium | Move signature generation to server-side webhook |
| No input validation | Low | Add email/phone format validation on booking forms |
| Booking auto-confirms without ITN | Medium | Any user can visit `/book/confirm/ANYREF` to auto-confirm |
| No rate limiting on booking creation | Low | Add rate limit middleware |

## Feature Gaps

| Feature | Status | Notes |
|---------|--------|-------|
| WhatsApp reminders | Not started | Evolution API integration pending (Phase 6) |
| Email notifications | Not started | Confirmation emails, reminders |
| Booking cancellation flow | Not started | Customer self-service cancellation |
| Murder mystery bookings | Not started | Separate product line (R200/pp @ Doppio Zero) |
| Add-on packages | Not started | Birthday, Bachelor, Challenge Wheel |
| Deposit-only model | Partial | Shows deposit/full option but doesn't enforce R640 minimum for deposits |
| Room images | Not uploaded | Asset files exist but not in PocketBase |

## UI/UX Polish

| Item | Status |
|------|--------|
| Mobile responsive | Done |
| PWA support | Done |
| Error boundary | Done |
| Loading spinners | Done |
| Toast notifications | Not implemented |
| Dark/light theme toggle | Not needed (dark only) |
| Print/export bookings | Not implemented |

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
