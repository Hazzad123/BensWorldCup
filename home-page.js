import { getFixtures } from "./api.js";

import {
  bettingState,
  loadBettingState,
  saveBettingState
} from "./betting.js";

const balanceElement =
  document.getElementById("balance");

const featuredMatchContainer =
  document.getElementById("featured-match");

const liveStatuses = [
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "LIVE"
];

let featuredMatch = null;

// Show the current fake balance on the home page.
function renderBalance() {
  balanceElement.textContent =
    bettingState.balance;
}

balanceElement.textContent =
  "...";

loadFeaturedMatch();

// Load fixtures from the Worker, settle an existing
// bet when possible, and select one featured match.
async function loadFeaturedMatch() {
  featuredMatchContainer.textContent =
    "Loading featured match...";

    try {
    // Load the saved balance and active bet from
    // Cloudflare KV before rendering the page.
    await loadBettingState();

    renderBalance();

    const matches =
      await getFixtures();

    await settleActiveBet(matches);

    // Settling a completed bet may change the balance.
    renderBalance();

    // Prefer a live match when one exists.
    const liveMatch =
      matches.find(match => {
        return liveStatuses.includes(
          match.fixture.status.short
        );
      });

    const now =
      new Date();

    // Otherwise find the nearest future match.
    const upcomingMatches =
      matches
        .filter(match => {
          const kickoff =
            new Date(match.fixture.date);

          return (
            match.fixture.status.short === "NS" &&
            kickoff > now
          );
        })
        .sort((matchA, matchB) => {
          const dateA =
            new Date(matchA.fixture.date);

          const dateB =
            new Date(matchB.fixture.date);

          return dateA - dateB;
        });

    const nearestUpcomingMatch =
      upcomingMatches[0];

    featuredMatch =
      liveMatch || nearestUpcomingMatch;

    renderFeaturedMatch();
  } catch (error) {
    console.error(error);

    featuredMatchContainer.textContent =
      "Unable to load featured match.";
  }
}

// Build the featured match card and optional bet form.
function createFeaturedMatchCard(match) {
  const canPlaceBet =
    match.fixture.status.short === "NS" &&
    bettingState.activeBet === null;

  return `
    <article class="match-card">
      <p>${createFeaturedTeamMarkup(match.teams.home)}</p>

      <p>vs</p>

      <p>${createFeaturedTeamMarkup(match.teams.away)}</p>

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

// Add a flag to teams in the featured game only.
function createFeaturedTeamMarkup(team) {
  const countryCode = getCountryCode(team.name);
  const fallbackFlag = getEmojiFlag(countryCode);

  if (!countryCode) {
    return team.name;
  }

  return `
    <span class="featured-team">
      <img
        class="featured-flag"
        src="flags/${countryCode}.svg"
        alt="${team.name} flag"
        onerror="this.nextElementSibling.style.display = 'inline'; this.remove();"
      >
      <span class="flag-fallback">${fallbackFlag}</span>
      <span>${team.name}</span>
    </span>
  `;
}

// Match team names to ISO-style flag filenames.
function getCountryCode(teamName) {
  const countryCodes = {
    Canada: "CA",
    Switzerland: "CH",
    Mexico: "MX",
    "South Korea": "KR",
    Argentina: "AR",
    Japan: "JP",
    Brazil: "BR",
    Denmark: "DK",
    Spain: "ES",
    Ghana: "GH",
    France: "FR",
    Morocco: "MA",
    England: "GB-ENG",
    Uruguay: "UY",
    Portugal: "PT",
    Netherlands: "NL",
    Germany: "DE",
    "United States": "US",
    Senegal: "SN",
    Chile: "CL",
    Italy: "IT",
    Colombia: "CO",
    Nigeria: "NG",
    Australia: "AU",
    Belgium: "BE",
    Croatia: "HR",
    Cameroon: "CM",
    "New Zealand": "NZ",
    Norway: "NO",
    Ecuador: "EC",
    Poland: "PL",
    Qatar: "QA",
    "Czech Republic": "CZ",
    Scotland: "GB-SCT",
    Egypt: "EG",
    "Costa Rica": "CR",
    Sweden: "SE",
    Paraguay: "PY",
    Tunisia: "TN",
    "Saudi Arabia": "SA",
    Wales: "GB-WLS",
    Serbia: "RS",
    Algeria: "DZ",
    Jamaica: "JM",
    Ukraine: "UA",
    Peru: "PE",
    "Ivory Coast": "CI",
    Panama: "PA"
  };

  return countryCodes[teamName];
}

// Convert two-letter country codes into emoji fallbacks.
function getEmojiFlag(countryCode) {
  if (!countryCode || countryCode.includes("-")) {
    return "🏳️";
  }

  return countryCode
    .toUpperCase()
    .replace(/./g, char =>
      String.fromCodePoint(127397 + char.charCodeAt())
    );
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

    betForm.addEventListener("submit", async event => {
    event.preventDefault();

    await placeBet(
      featuredMatch,
      betForm
    );
  });
}

// Validate and save a fake bet.
async function placeBet(match, betForm) {
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

  await saveBettingState();

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
async function settleActiveBet(matches) {
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

  await saveBettingState();
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
