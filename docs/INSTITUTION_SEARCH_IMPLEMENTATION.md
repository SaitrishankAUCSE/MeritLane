# Institution Search Implementation

## Overview
This document details the implementation of the University/College search functionality on the MeritLane candidate profile page. It addresses a UX flaw where an empty input would display "No matches found" and required at least 2 characters to initiate a search.

## Current Problem & Previous Behavior
- The search required at least 2 characters to trigger.
- An empty search input inappropriately displayed "No matches found."
- If the API call failed, there was no clear feedback to the user.
- The `app/api/colleges/route.ts` API route had been inadvertently removed during previous commits, completely disconnecting the dataset.

## New Behavior
- The autocomplete component now properly handles an empty query, showing an instructional empty state: "Start typing to search colleges and universities."
- Searches execute after **1 character** is typed.
- Zero results trigger a precise fallback message: "No institutions found", alongside a subtle "Try a different spelling or search term."
- Loading states indicate "Searching...".
- API errors are caught and display "Unable to load institutions right now. Please try again."

## Institution Data Provider & Source
The underlying data source is a static, local massive JSON array sourced from a consolidated list of Indian institutions, saved within `lib/data/colleges.json` (approx. 6.5MB) containing over 38,000+ real records.
It uses a fallback to `lib/indian_colleges.json` if the primary comprehensive dataset is missing.

## Geographic Coverage
The dataset is comprehensively focused on **India**. It contains thousands of colleges, institutes, and universities across various districts and states in India. It does *not* claim to have global coverage, nor does it guarantee 100% complete coverage of every single local college, but it covers the vast majority of institutions recognized by AICTE, UGC, and other bodies in India.

## Search Behavior
The API `/api/colleges` receives the query and processes it via a lightweight, in-memory custom scoring algorithm:
1. Exact match (Score: 100)
2. Starts with query (Score: 50)
3. Contains query (Score: 10)
Results are filtered, sorted by score and then alphabetically, capped at 50 results to preserve performance.

### One-character Search Behavior
A single character triggers the search. For example, typing "A" will match and display institutions starting with "A". 

### Empty State
When the user has not typed anything, the API is not called. The autocomplete shows: "Start typing to search colleges and universities."

### Loading State
A spinner icon or a "Searching..." message is displayed while the fetch request (debounced to 250ms) resolves.

### Zero-Result State
If the API returns an empty array, the dropdown displays "No institutions found" and "Try a different spelling or search term."

### Error State
If the API returns a non-200 status or fails entirely, the component catches it and displays "Unable to load institutions right now. Please try again."

## Caching / Debouncing Strategy
- **API Cache**: The massive JSON file is loaded into memory in Node.js upon the first request. Subsequent requests across the same lambda execution hit the in-memory array (`cachedColleges`), granting near 0ms execution times.
- **Client Debounce**: The client-side input triggers a `250ms` debounce in `fetchOptions` to prevent spamming the endpoint while typing.

## Security Considerations
- The API is fully public and read-only.
- No secret API keys or credentials are required since the dataset is served statically from the repository's files.
- Firebase Auth / Rules and business logic remain strictly untouched.

## Mobile/Accessibility Handling
- The dropdown handles scrolling gracefully.
- ARIA tags are maintained (`role="combobox"`, `role="listbox"`, `role="option"`).
- Keyboard accessibility remains robust.
- The UI retains MeritLane's established styling with no massive DOM restructuring.

## Files Modified
1. `app/api/colleges/route.ts` - Restored and updated the API route to serve data and score results, permitting 1-character minimums.
2. `components/ui/Autocomplete.tsx` - Expanded the component to accept customized empty, error, and no-result messages, and to accurately catch and render error states.
3. `app/candidate/profile/page.tsx` - Integrated the updated `Autocomplete` props and bound `fetchOptions` accurately.

## Known Limitations
- The dataset is static. Any new colleges established after the compilation of the JSON file will not appear automatically unless the dataset is manually updated.
- Results are capped at 50. If a very common letter like "A" is typed, the user will only see the top 50, but typing more specific characters narrows it down properly.

## Manual Institution Fallback
- **Why it exists**: While the 38k+ dataset is massive, some candidates might still legitimately attend new or unlisted institutions. A strict requirement forcing them to select from the dataset might block perfectly valid users.
- **How "Other" works**: If a user searches and fails to find their institution, a fallback option "Other — My institution isn't listed" is available at the bottom of the list. Clicking it seamlessly transitions the component into manual-entry mode.
- **How manual values are saved**: The manually entered value overrides the dataset-search string. The Autocomplete component uses the exact same onChange event handlers, ensuring the underlying form state and Firebase persistence mechanisms operate transparently.
- **Distinction between dataset institutions and candidate-entered institutions**: Because the database saves the string natively, we do not fabricate metadata. Manual entries are not marked as UGC Verified or Officially Recognized automatically—they remain simply candidate-provided strings.
- **Validation behavior**: The component strictly binds to standard whitespace trimming (trimStart()) while allowing standard punctuation and character combinations for Indian institutions.
- **Limitations**: Since there is no distinction field (like source: manual vs source: dataset) in the current schema, all saved institutions are loaded exactly as string values upon revisiting the profile.

