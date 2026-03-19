Region auto-detection and locking rules for UAE vs Sierra Leone users.

- IP geolocation via ipapi.co detects country on first visit
- UAE users (country_code AE) are locked to AED — no region toggle shown
- SL users keep the region toggle in profile and header
- isRegionLocked flag stored in localStorage and exposed via RegionContext
- Signup country selector hidden for UAE-locked users (defaults to "dubai")
