// betting.js

const BETTING_STATE_URL =
  "https://world-cup-api.cdarlb02.workers.dev/api/betting-state";

// Store the private key only for the current browser tab session.
// The key is not committed to GitHub.
const BETTING_API_KEY_SESSION_KEY =
  "bettingApiKey";

// Default state shown until the Worker state has loaded.
export let bettingState = {
  balance: 100,
  activeBet: null
};

// Load the saved betting state from Cloudflare KV.
export async function loadBettingState() {
  const apiKey =
    getBettingApiKey();

  const response =
    await fetch(BETTING_STATE_URL, {
      headers: {
        Authorization:
          `Bearer ${apiKey}`
      }
    });

  if (!response.ok) {
    handleFailedResponse(response);
  }

  const data =
    await response.json();

  if (!isValidBettingState(data)) {
    throw new Error(
      "The Worker returned an invalid betting-state shape."
    );
  }

  bettingState =
    data;

  return bettingState;
}

// Save the current betting state to Cloudflare KV.
export async function saveBettingState() {
  const apiKey =
    getBettingApiKey();

  const response =
    await fetch(BETTING_STATE_URL, {
      method: "PUT",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${apiKey}`
      },

      body:
        JSON.stringify(
          bettingState
        )
    });

  if (!response.ok) {
    handleFailedResponse(response);
  }

  const data =
    await response.json();

  if (!isValidBettingState(data)) {
    throw new Error(
      "The Worker returned an invalid betting-state shape."
    );
  }

  bettingState =
    data;

  return bettingState;
}

// Remove the saved key from this browser tab.
// Useful if the wrong key was entered.
export function forgetBettingApiKey() {
  sessionStorage.removeItem(
    BETTING_API_KEY_SESSION_KEY
  );
}

// Clear a won or lost active bet so the next featured match can accept a new bet.
export async function clearSettledActiveBet() {
  if (!bettingState.activeBet) {
    return false;
  }

  const settledStatuses = [
    "won",
    "lost"
  ];

  if (!settledStatuses.includes(bettingState.activeBet.status)) {
    return false;
  }

  bettingState.activeBet = null;

  await saveBettingState();

  return true;
}

// Ask for the private key once per browser-tab session.
function getBettingApiKey() {
  const savedApiKey =
    sessionStorage.getItem(
      BETTING_API_KEY_SESSION_KEY
    );

  if (savedApiKey) {
    return savedApiKey;
  }

  const enteredApiKey =
    window.prompt(
      "Enter your personal betting key:"
    );

  if (!enteredApiKey) {
    throw new Error(
      "A betting key is required."
    );
  }

  sessionStorage.setItem(
    BETTING_API_KEY_SESSION_KEY,
    enteredApiKey
  );

  return enteredApiKey;
}

// If the key is wrong, remove it so the user can
// enter the correct value on the next attempt.
function handleFailedResponse(response) {
  if (response.status === 401) {
    forgetBettingApiKey();

    throw new Error(
      "The betting key was rejected."
    );
  }

  throw new Error(
    `Unable to access betting state. HTTP status: ${response.status}`
  );
}

// Validate the shape returned by the Worker.
export function isValidBettingState(state) {
  if (
    !state ||
    typeof state !== "object" ||
    Array.isArray(state)
  ) {
    return false;
  }

  if (
    typeof state.balance !== "number" ||
    !Number.isFinite(state.balance) ||
    state.balance < 0
  ) {
    return false;
  }

  if (state.activeBet === null) {
    return true;
  }

  const bet =
    state.activeBet;

  if (
    !bet ||
    typeof bet !== "object" ||
    Array.isArray(bet)
  ) {
    return false;
  }

  return (
    Number.isInteger(
      bet.fixtureId
    ) &&
    [
      "home",
      "draw",
      "away"
    ].includes(
      bet.selection
    ) &&
    typeof bet.stake === "number" &&
    Number.isFinite(
      bet.stake
    ) &&
    bet.stake > 0 &&
    [
      "pending",
      "won",
      "lost"
    ].includes(
      bet.status
    )
  );
}
