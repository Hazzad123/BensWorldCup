import { getFixtures } from "./api.js";

const matchesList =
  document.getElementById("completed-matches-list");

renderCompletedMatches();

// Load fixtures from the Worker and display
// only matches that have finished.
async function renderCompletedMatches() {
  matchesList.textContent =
    "Loading completed matches...";

  try {
    const matches =
      await getFixtures();

    const finishedStatuses = [
      "FT",
      "AET",
      "PEN"
    ];

    const finishedMatches =
      matches
        .filter(match => {
          return finishedStatuses.includes(
            match.fixture.status.short
          );
        })
        .sort((matchA, matchB) => {
          const dateA =
            new Date(matchA.fixture.date);

          const dateB =
            new Date(matchB.fixture.date);

          return dateB - dateA;
        });

    if (finishedMatches.length === 0) {
      matchesList.textContent =
        "No completed matches available.";

      return;
    }

    matchesList.innerHTML =
      finishedMatches
        .map(match => {
          return createFinishedMatchCard(match);
        })
        .join("");
  } catch (error) {
    console.error(error);

    matchesList.textContent =
      "Unable to load completed matches.";
  }
}

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
