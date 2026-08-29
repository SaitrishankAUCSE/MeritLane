# Permanent Engineering Rule: No Fabricated Data

**Rule:**
"Production UI must display only real application data or clearly identified static explanatory content. It must never fabricate people, companies, candidate records, verification results, hiring outcomes, statistics, testimonials, GitHub activity, or other business data."

## Mandatory Checks Before Completing Any Feature:

1. Search the changed files for hardcoded example data.
2. Search for realistic names or company names that aren't fetched from the database.
3. Search for fake numerical statistics.
4. Search for mock records accidentally used in production.
5. Verify empty states exist instead of falling back to fabrication.
6. Confirm API responses are based on real, persisted data.
