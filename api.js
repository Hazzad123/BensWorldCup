// api.js

// The frontend contacts the Cloudflare Worker.
// The Worker contacts football-data.org using its secret token.
const FIXTURES_URL =
  "https://world-cup-api.cdarlb02.workers.dev/api/fixtures";

// Request the normalised fixtures from the Worker.
export async function getFixtures() {
  const response =
    await fetch(FIXTURES_URL);

  if (!response.ok) {
    throw new Error(
      `Unable to load fixtures. HTTP status: ${response.status}`
    );
  }

  const data =
    await response.json();

  if (!Array.isArray(data.response)) {
    throw new Error(
      "Fixture response did not contain an array."
    );
  }

  return data.response;
}