# Red Frontier — Mars One-Way Trip Agency

A playful, brochure-style registration page for a fictional one-way trip to Mars, inspired by *The Martian*. Mark Watney made it home; applicants should not expect the same deal.

## Features

- Responsive, cinematic landing page featuring Mark Watney.
- Registration form with text, email, date and date/time, number, radio, checkbox, range, file, color, select, and textarea controls.
- Accessible labels, required-field progress indicator, and a live candidate ID preview.
- GET application button and a separate POST-style Mayday button with its own `formaction`.
- A referral field outside the form, associated with it through the `form` attribute.
- Three-chapter Mars lifestyle slider: grow potatoes, plan an unsuccessful escape, and record a mission log.
- A repeatable potato-growing mini-game: water three times to harvest, then start again.
- A weather card that loads temperature, wind, and pressure from NASA's InSight Mars Weather API. InSight's mission ended in 2022, so the latest available readings are historical, not live conditions.
- Optional camera preview and video recording for the mission log. Recordings can be downloaded locally.

## Run locally

No build step or dependencies are required. Open `index.html` directly in a web browser.

Camera access may require a secure context, such as `localhost` or an HTTPS site, as well as browser permission. The camera starts only after selecting **Turn on camera**. The registration form is a front-end demonstration; its submit actions display an on-page confirmation and do not send data to a backend.

## Project files

- `index.html` — page content and form markup
- `styles.css` — layout, responsive styles, and visual effects
- `script.js` — form feedback, candidate preview, progress, carousel, and camera recording

## Credits

The Mark Watney image is loaded from [Space.com](https://www.space.com/30749-the-martian-faster-way-to-mars.html). Weather data comes from [NASA's InSight Mars Weather API](https://api.nasa.gov/insight_weather/?api_key=DEMO_KEY&feedtype=json&ver=1.0). Google Fonts provides the Manrope and DM Mono typefaces.
