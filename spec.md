# PSC Promotion Forecast

## Current State
- Backend has a minimal Motoko actor with only a `ping()` function.
- Frontend visit counter uses `localStorage` -- each browser/device tracks its own count independently.
- Visit count is displayed with an Eye icon on the search page.

## Requested Changes (Diff)

### Add
- Backend: `incrementVisits()` update function that increments a stable counter and returns the new total.
- Backend: `getVisits()` query function that returns the current total visit count.

### Modify
- Frontend SearchPage: Replace localStorage visit counter logic with calls to the backend `incrementVisits()` on mount, and display the value returned from the backend.

### Remove
- Frontend: `localStorage.getItem/setItem` visit count logic.

## Implementation Plan
1. Add `var visitCount : Nat = 0` stable variable to backend.
2. Add `incrementVisits()` update call returning `Nat`.
3. Add `getVisits()` query call returning `Nat`.
4. In SearchPage, on mount call `backend.incrementVisits()` and set returned value as `visitCount` state.
5. Remove all localStorage visit counter code.
