# Service icons (discovery/marketing surfaces only)

The catalog (`src/lib/requester/services.ts`) expects the 12 glossy 3D PNGs
here, at these **exact** filenames (transparent, square, ~1024px):

| Service           | Family    | Filename                  |
|-------------------|-----------|---------------------------|
| Plumbing          | water     | `water-plumbing.png`      |
| Electrical        | power     | `power-electrical.png`    |
| Heating & Cooling | climate   | `climate-heating.png`     |
| Handyman          | structure | `structure-handyman.png`  |
| Roofing           | structure | `structure-roofing.png`   |
| Painting          | surfaces  | `surfaces-paint.png`      |
| Window Cleaning   | surfaces  | `surfaces-window.png`     |
| Flooring          | surfaces  | `surfaces-flooring.png`   |
| Yard & Landscaping| grounds   | `grounds-yard.png`        |
| Snow Removal      | grounds   | `grounds-snow.png`        |
| Home Care         | care      | `care-homecare.png`       |
| Appliances        | fixtures  | `fixtures-appliance.png`  |

**Two-tier icon rule:** these PNGs are for discovery/marketing surfaces only
(home service tiles, Services grid, campaign cards). Functional product UI (job
lists, tracking, nav, status) keeps the existing line glyphs — a 3D render at
16px turns to mud.
