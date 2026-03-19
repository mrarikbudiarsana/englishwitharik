# TOEFL ITP Test Catalog Refactor

Implemented in the repo on top of the original event-based TOEFL ITP flow.

## What changed

- Added `toefl_test_sets` and `toefl_test_set_sections`
- Added `test_set_id` to `toefl_attempts`
- Added public catalog routes:
  - `/toefl-itp-test`
  - `/toefl-itp-test/sets/[slug]`
  - `/toefl-itp-test/sets/[slug]/[section]`
- Kept attempt runtime route:
  - `/toefl-itp-test/[attemptId]`
- Switched start and submit APIs to use test-set scoped sections
- Refactored admin dashboard to manage dynamic test sets
- Added admin metadata editor and section JSON editor
- Added blog CTA component:
  - `components/public/blog/ToeflTestCtaCard.tsx`

## Main implementation files

### Database
- `supabase/migrations/20260320000000_create_toefl_test_catalog.sql`

### Shared logic
- `lib/toefl/types.ts`
- `lib/toefl/catalog.ts`

### Public
- `app/toefl-itp-test/page.tsx`
- `app/toefl-itp-test/sets/[slug]/page.tsx`
- `app/toefl-itp-test/sets/[slug]/[section]/page.tsx`
- `components/toefl/StartTestForm.tsx`
- `app/toefl-itp-test/[testId]/page.tsx`

### APIs
- `app/api/toefl-itp/start/route.ts`
- `app/api/toefl-itp/submit/route.ts`
- `app/api/admin/toefl/test-sets/route.ts`
- `app/api/admin/toefl/test-sets/[id]/route.ts`
- `app/api/admin/toefl/test-sets/[id]/sections/[section]/route.ts`

### Admin
- `app/admin/toefl/page.tsx`
- `components/admin/ToeflAttemptsTable.tsx`
- `components/admin/ToeflTestSetEditor.tsx`
- `app/admin/toefl/test-sets/new/page.tsx`
- `app/admin/toefl/test-sets/[id]/page.tsx`
- `app/admin/toefl/test-sets/[id]/sections/[section]/edit/page.tsx`

### Blog CTA
- `components/public/blog/ToeflTestCtaCard.tsx`

## Remaining follow-up

- Run the new migration in Supabase before using the new UI
- Optionally retire the old `toefl_templates` runtime dependency after the migrated default set is verified
- Optionally integrate `ToeflTestCtaCard` into specific blog pages or MDX content
