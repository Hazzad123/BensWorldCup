# Ben's World Cup

Ben's World Cup is a small static World Cup tracker built with plain HTML, CSS, and JavaScript.

It currently shows a retro-styled home page, upcoming matches, completed matches, a featured match, a fake balance, and simple fake betting state.

## Pages

- `index.html` - home page with the fake balance and featured match.
- `matches.html` - upcoming matches page.
- `completed.html` - completed matches page.
- `standings.html` - standings page with space for a bracket embed.
- `betting-tests.html` - local test page for checking betting logic before deploying.

## Main JavaScript Files

- `api.js` - loads fixture data from the Worker API.
- `home-page.js` - controls the featured match, balance display, flags, and fake bet form.
- `upcoming.js` - renders upcoming matches.
- `completed.js` - renders completed matches.
- `betting.js` - stores and saves fake betting state.
- `betting-tests.js` - tests betting state logic with fake API responses.
- `password-gate.js` - shows the simple password screen.
- `ui.js` - adds small UI helpers like active nav styling and page badges.
- `mock-fixtures.js` - mock tournament fixture data for testing and development.

## Styling

All styling is in `styles.css`.

The current design is intentionally retro and pixel-inspired, with blocky borders, simple colors, and a browser-friendly layout.

## Fake Betting

The betting feature is only fake balance tracking. It is not real betting and does not use real money.

The app stores:

- `balance`
- `activeBet`
- bet `selection`
- bet `stake`
- bet `status`

When a bet is settled as `won` or `lost`, the app clears `activeBet` so a new bet can be placed on the next featured match.

## Betting Tests

Open this file in the browser before deploying:

```text
betting-tests.html
```

The tests use fake API responses. They do not call the real Worker and do not change live betting data.

The tests check:

- valid betting state
- invalid betting state
- loading betting state
- saving betting state
- rejected betting keys
- clearing settled bets
- allowing a new bet after a settled bet is cleared

## Password Gate

The site currently uses a hardcoded password in `password-gate.js`.

This is only a simple front-end gate for a static site. It is not secure authentication, because anyone can inspect the JavaScript and see the password.

## Running Locally

Open `index.html` in a browser.

For the GitHub Pages version, push the files to the deployed branch and visit the GitHub Pages URL.

## Notes For Future Ben

- Keep API calls inside `api.js` or dedicated API files.
- Keep betting state changes inside `betting.js` when possible.
- Use `betting-tests.html` before deploying betting changes.
- Add PNG flag files to a `flags` folder using the country codes expected in `home-page.js`.
- This is still a learning project, so simple readable code is better than clever code.
