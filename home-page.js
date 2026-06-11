import { mockFixturesResponse } from "./mock-fixtures.js";

import {
  bettingState,
  saveBettingState
} from "./betting.js";

const balanceElement =
  document.getElementById("balance");

// Show the current fake balance on the home page.
function renderBalance() {
  balanceElement.textContent =
    bettingState.balance;
}

const matches = mockFixturesResponse.response;

const featuredMatchContainer =
    document.getElementById("featured-match")

settleActiveBet(matches);

renderBalance();

const liveStatuses = [
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "LIVE"
];


// Prefer a live match for the featured card.
const liveMatch = matches.find(match => {
    return liveStatuses.includes(
        match.fixture.status.short
    );
});

const now = new Date()

// Find future matches that have not started.
const upcomingMatches = matches.filter(match => {
    const kickoff = new Date(match.fixture.date);

    return (
        match.fixture.status.short === "NS" && kickoff > now
    );
});

// Sort upcoming matches so the nearest one is first.
upcomingMatches.sort((matchA, matchB) => {
    const dateA = new Date(matchA.fixture.date);
    const dateB = new Date(matchB.fixture.date);

    return dateA - dateB;
});

const nearestUpcomingMatch = upcomingMatches[0]

const featuredMatch = nearestUpcomingMatch || liveMatch

// Build the featured match card and optional bet form.
function createFeaturedMatchCard(match) {
  const canPlaceBet =
    match.fixture.status.short === "NS" &&
    bettingState.activeBet === null;

  return `
    <article class="match-card">
      <p>${match.teams.home.name}</p>

      <p>vs</p>

      <p>${match.teams.away.name}</p>

      <p>${formatKickoff(match.fixture.date)}</p>

      ${createActiveBetText(match)}

      ${
        canPlaceBet
          ? createBettingForm(match)
          : ""
      }
    </article>
  `;
}

// Show a dash if a score is missing.
function displayScore(score) {
  return score === null ? "-" : score;
}

// Build a short live status label.
function getLiveStatusText(match) {
  const elapsed = match.fixture.status.elapsed;

  if (elapsed === null) {
    return "LIVE";
  }

  return `LIVE · ${elapsed}'`;
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

// Render the featured match, or a fallback message.
function renderFeaturedMatch() {
  if (featuredMatch) {
    featuredMatchContainer.innerHTML =
      createFeaturedMatchCard(featuredMatch);

    attachBettingEvents(featuredMatch);
  } else {
    featuredMatchContainer.innerHTML = `
      <p>No upcoming matches available.</p>
    `;
  } 
}

renderFeaturedMatch();

// Build the form used to place one fake bet.
function createBettingForm(match) {
  return `
    <button id="show-bet-form">
      Place Bet
    </button>

    <form id="bet-form" hidden>
      <fieldset>
        <legend>Select your prediction</legend>

        <label>
          <input
            type="radio"
            name="selection"
            value="home"
            required
          >

          ${match.teams.home.name}
        </label>

        <label>
          <input
            type="radio"
            name="selection"
            value="draw"
            required
          >

          Draw
        </label>

        <label>
          <input
            type="radio"
            name="selection"
            value="away"
            required
          >

          ${match.teams.away.name}
        </label>
      </fieldset>

      <label>
        Stake

        <input
          id="stake"
          name="stake"
          type="number"
          min="1"
          max="${bettingState.balance}"
          required
        >
      </label>

      <button type="submit">
        Confirm Bet
      </button>
    </form>

    <p id="bet-message"></p>
  `;
}

// Add click and submit events for the bet form.
function attachBettingEvents(featuredMatch) {
  const showBetFormButton =
    document.getElementById("show-bet-form");

  const betForm =
    document.getElementById("bet-form");

  if (!showBetFormButton || !betForm) {
    return;
  }

  showBetFormButton.addEventListener("click", () => {
    betForm.hidden = false;
    showBetFormButton.hidden = true;
  });

  betForm.addEventListener("submit", event => {
    event.preventDefault();

    placeBet(featuredMatch, betForm);
  });
}

// Validate and save a fake bet.
function placeBet(match, betForm) {
  const formData = new FormData(betForm);

  const selection =
    formData.get("selection");

  const stake =
    Number(formData.get("stake"));

  if (!selection) {
    showBetMessage("Choose a team or draw.");
    return;
  }

  if (
    stake <= 0 ||
    stake > bettingState.balance
  ) {
    showBetMessage("Enter a valid stake.");
    return;
  }

  bettingState.balance -= stake;

  bettingState.activeBet = {
    fixtureId: match.fixture.id,
    selection: selection,
    stake: stake,
    status: "pending"
  };

  saveBettingState();

  renderBalance();

  renderFeaturedMatch();

  showBetMessage("Bet placed.");
}

// Display feedback below the bet form.
function showBetMessage(message) {
  const betMessage =
    document.getElementById("bet-message");

  if (betMessage) {
    betMessage.textContent = message;
  }
}

// Show details for the current active bet.
function createActiveBetText(match) {
  const bet = bettingState.activeBet;

  if (!bet) {
    return "";
  }

  if (bet.fixtureId !== match.fixture.id) {
    return "";
  }

  let selectionText = "Draw";

  if (bet.selection === "home") {
    selectionText = match.teams.home.name;
  }

  if (bet.selection === "away") {
    selectionText = match.teams.away.name;
  }

  return `
    <div class="active-bet">
      <p>Your prediction: ${selectionText}</p>
      <p>Stake: $${bet.stake}</p>
      <p>Status: ${bet.status}</p>
    </div>
  `;
}

// Settle the active bet if its match has finished.
function settleActiveBet(matches) {
  const bet = bettingState.activeBet;

  if (!bet) {
    return;
  }

  if (bet.status !== "pending") {
    return;
  }

  const match = matches.find(match => {
    return match.fixture.id === bet.fixtureId;
  });

  if (!match) {
    return;
  }

  const finishedStatuses = [
    "FT",
    "AET",
    "PEN"
  ];

  const isFinished =
    finishedStatuses.includes(
      match.fixture.status.short
    );

  if (!isFinished) {
    return;
  }

  const outcome =
    getMatchOutcome(match);

  if (outcome === bet.selection) {
    bettingState.balance += bet.stake * 2;
    bet.status = "won";
  } else {
    bet.status = "lost";
  }

  saveBettingState();
}

//Translate the API winner fields
function getMatchOutcome(match) {
  if (match.teams.home.winner === true) {
    return "home";
  }

  if (match.teams.away.winner === true) {
    return "away";
  }

  return "draw";
}
