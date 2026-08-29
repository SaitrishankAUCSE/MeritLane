# Flow Validation Report

## Overview
This report validates the end-to-end user journeys for both Candidates and Employers within the MeritLane platform. The system has been deeply tested for proper authentication routing, correct UI rendering states (loading, empty, populated), data integrity, and strict route-based authorization.

---

## 1. Public Browsing & Authentication Gateway
**Flow Validated:** 
1. The public visitor lands on `/` and clicks **Sign In**.
2. The user is presented with the `AuthModal` (`components/ui/auth-switch.tsx`). 
3. If they attempt to access protected routes like `/candidate/dashboard` directly while unauthenticated, `ProtectedRoute.tsx` intercepts the navigation and prompts the modal.
4. **Sign Up (New Candidate):** Selecting the Candidate role and creating an account triggers Firebase Auth and creates a Firestore profile.
5. **Sign Up (New Employer):** Selecting the Employer role successfully provisions the employer profile.
6. **Post-Auth Smart Routing:** Upon successful authentication, the user is redirected to `/dashboard`. `app/dashboard/page.tsx` checks `userProfile.role` and redirects to `/candidate/profile` (if empty profile), `/candidate/dashboard`, or `/employer/dashboard`.

**Validation Result:** 🟢 PASS
*Notes: The `ProtectedRoute` component successfully handles unauthorized access, ensuring no unauthorized flashes of content occur.*

---

## 2. Candidate Onboarding & Verification Flow
**Flow Validated:** 
1. **Profile Completion:** A new candidate arriving at `/candidate/profile` with missing data triggers `setIsEditing(true)`, forcing the user to complete their identity parameters (Name, College, Branch, Skills). 
2. **Dashboard Empty State:** Once completed, the candidate navigates to `/candidate/dashboard`. If no verification assessments have been taken, the UI correctly displays the empty state: *"Verification pending."* and offers a **Verify** button.
3. **Assessment Routing:** Clicking Verify takes the user to `/candidate/assessment?skill=...`. The system successfully prevents the user from starting if a 14-day cooldown is active, checked securely via `api/start-assessment/route.ts`.
4. **Post-Assessment State:** Upon successful test completion, the frontend generates a client-side verification result screen. The candidate can then navigate to `/candidate/provenance` or `/candidate/dashboard`.

**Validation Result:** 🟢 PASS
*Notes: Empty states and error boundary checks within the assessment flow behave as intended, enforcing strict server-side logic.*

---

## 3. Employer Discovery & Shortlist Flow
**Flow Validated:**
1. **Accessing the Dashboard:** An employer logs in and is routed to `/employer/dashboard`. If a candidate attempts to access this route, `ProtectedRoute` intercepts them and redirects back to `/candidate/dashboard`. If they attempt to bypass via the API directly (`/api/employer/discover`), the backend returns a `403 Forbidden` response.
2. **Discovery Empty States:** If the database contains no candidates with `verificationStatus === 'verified'` matching the employer's search criteria, the dashboard correctly renders the empty state: *"No verified candidates found"*.
3. **Dossier Viewing:** Clicking on a candidate correctly loads `/employer/candidate/[id]`. This page correctly strips all internal system data (e.g., failed attempts) before serialization, showing only the public-safe, verified skills.
4. **Shortlisting:** The floating `EmployerDossierActions` allows the employer to shortlist the candidate. This fires a POST to `/api/employer/shortlist`, saving the candidate UID to the employer's profile. 
5. **Shortlist Pipeline:** Navigating to `/employer/shortlist` loads all shortlisted candidates. The page includes an empty state *"Your shortlist is empty"* if no candidates are saved.
6. **Messaging:** In the Shortlist view, the employer clicks **Message**. A modal opens, the employer inputs text, and hits Send. This atomically writes a message to `/api/messages`.

**Validation Result:** 🟢 PASS
*Notes: The employer flow enforces strict boundaries. Employers cannot view unverified candidates, and candidates cannot access the employer pipeline.*

---

## 4. Candidate Inbox Flow
**Flow Validated:**
1. A candidate logs in and navigates to `/candidate/inbox`.
2. The page fetches `/api/messages`. 
3. If no messages exist, it correctly renders the empty state: *"No messages yet. When employers review your verified proof... their direct outreach will appear here."*
4. If a message exists (from the Employer flow), it correctly parses the timestamp, renders the sender's name, and displays the content seamlessly.

**Validation Result:** 🟢 PASS

---

## Conclusion
The MeritLane platform is highly structurally sound. 
- All Empty States are correctly implemented.
- Route Protection is airtight (enforced both client-side via `ProtectedRoute.tsx` and server-side via `adminAuth`).
- Redirect logic efficiently funnels users from `/dashboard` to their proper workspace.
- There are no severe architectural UX blockages. 

The application is functionally complete and production-ready for these user journeys.
