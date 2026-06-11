import { getFixtures } from "./api.js";

const matchesList =
  document.getElementById("matches-list");

renderUpcomingMatches();

// Load fixtures from the Worker and display
// only matches that have not started yet.
async function renderUpcomingMatches() {
  matchesList.textContent =
    "Loading matches...";

  try {
    const matches =
      await getFixtures();

    const upcomingMatches =
      matches
        .filter(match => {
          return (
            match.fixture.status.short === "NS"
          );
        })
        .sort((matchA, matchB) => {
          const dateA =
            new Date(matchA.fixture.date);

          const dateB =
            new Date(matchB.fixture.date);

          return dateA - dateB;
        });

    if (upcomingMatches.length === 0) {
      matchesList.textContent =
        "No upcoming matches available.";

      return;
    }

    matchesList.innerHTML =
      upcomingMatches
        .map(match => {
          return createUpcomingMatchCard(match);
        })
        .join("");
  } catch (error) {
    console.error(error);

    matchesList.textContent =
      "Unable to load matches.";
  }
}

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
