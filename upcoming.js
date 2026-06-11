import { mockFixturesResponse } from "./mock-fixtures.js";

const matches = mockFixturesResponse.response;

// Keep only fixtures that have not started yet.
const upcomingMatches = matches.filter(match => {
  return match.fixture.status.short === "NS";
});

const matchesList = document.getElementById("matches-list");

matchesList.innerHTML = upcomingMatches
  .map(match => createUpcomingMatchCard(match))
  .join("");

// Build the HTML for one upcoming match card.
function createUpcomingMatchCard(match) {
  return `
    <article class="match-card">
      <p>${match.teams.home.name}</p>

      <p>vs</p>

      <p>${match.teams.away.name}</p>

      <p>${formatKickoff(match.fixture.date)}</p>
    </article>
  `;
}

// Format the API date into a readable kickoff time.
function formatKickoff(dateString) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateString));
}
