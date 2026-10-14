SHIVANK SINGH — ENHANCED PORTFOLIO

Files:
- index.html: page structure and portfolio content
- styles.css: existing design plus enhanced motion and visualization styles
- script.js: navigation, reveal animations, scroll progress, animated charts, particle canvas, contact config
- data/site-config.json: email and LinkedIn profile settings
- assets/profile-placeholder.svg: fallback portrait illustration

To use:
1. Extract this folder into your portfolio repository.
2. Keep the folder structure unchanged.
3. Add your real portrait as assets/profile.png (or change the image path in index.html).
4. Confirm internship dates, education details, and all project claims before publishing.
5. Run a local static server (for example: python -m http.server 8000) and open http://localhost:8000.
   Fetching site-config.json may not work when opening index.html directly via file://.
6. Deploy the folder to GitHub Pages or another static host.

Notes:
- The graph bars are labelled as focus areas, not measured proficiency scores.
- The particle background respects prefers-reduced-motion and is disabled on small screens.
