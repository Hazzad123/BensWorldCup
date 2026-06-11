import { mockFixturesResponse } from "./mock-fixtures.js";

const matches = mockFixturesResponse.response;

// Keep only matches that are finished.
const finishedMatches = matches.filter(match => {
  return match.fixture.status.short === "FT";
});

const matchesList = document.getElementById("completed-matches-list");

matchesList.innerHTML = finishedMatches
  .map(match => createFinishedMatchCard(match))
  .join("");

// Build the HTML for one completed match card.
function createFinishedMatchCard(match) {
  return `
    <article class="match-card">
      <p>${match.teams.home.name}</p>

      <p>
        ${displayScore(match.goals.home)}
        -
        ${displayScore(match.goals.away)}
      </p>

      <p>${match.teams.away.name}</p>

      <p>${formatKickoff(match.fixture.date)}</p>
    </article>
  `;
}

// Show a dash if a score is missing.
function displayScore(score) {
  return score === null ? "-" : score;
}

// Format the API date into a readable match time.
function formatKickoff(dateString) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateString));
}
