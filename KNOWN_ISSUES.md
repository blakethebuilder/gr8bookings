# Known Issues & Gaps

## Security

| Issue | Severity | Status |
|-------|----------|--------|
| Collection rules public | High | ⚠️ Open — staff collection has public read. Recommend: migrate staff to PocketBase auth collection (requires recreating collection). Until then, PIN codes are hashed on creation (future) and masked in UI. |
| Payfast secrets on client | Medium | ✅ Fixed — server-side signature |
| No input validation | Low | ✅ Fixed — name/email validation |
| Auto-confirm bypass | Medium | ✅ Fixed — removed |
| No rate limiting | Low | ✅ Fixed — 10 req/min |

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

## Architecture Notes

### Staff Authentication Migration Path
The current PIN-based auth uses a regular PocketBase collection (`staff`) rather than PocketBase's built-in auth system. This means collection rules must remain public for login to work. Recommended migration:
1. Create a proper PocketBase auth collection for staff
2. Migrate staff records to the auth collection
3. Update the frontend to use `pb.collection('staff').authWithPassword()` instead of PIN comparison
4. Then lock down collection rules to authenticated only
