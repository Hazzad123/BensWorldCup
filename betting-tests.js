// This AI-developed test file checks the betting code before deployment.
// It uses fake API responses, so it does not change the real betting data.

// Import the real betting functions so the tests check the same code the site uses.
import {
  bettingState,
  clearSettledActiveBet,
  forgetBettingApiKey,
  isValidBettingState,
  loadBettingState,
  saveBettingState
} from "./betting.js";

// Find the HTML elements where test results will be shown.
const resultsElement =
  document.getElementById("test-results");

const summaryElement =
  document.getElementById("test-summary");

const originalFetch =
  window.fetch;

// Store every test that should run when the page loads.
const tests = [];

// Add one betting test to the list.
function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

// Throw an error when two values are not exactly equal.
function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(
      `Expected ${expected}, but got ${actual}`
    );
  }
}

// Throw an error when a value is not true.
function assertTrue(value) {
  if (value !== true) {
    throw new Error(
      `Expected true, but got ${value}`
    );
  }
}

// Throw an error when a value is not false.
function assertFalse(value) {
  if (value !== false) {
    throw new Error(
      `Expected false, but got ${value}`
    );
  }
}

// Show one pass or fail result on the page.
function renderResult(name, passed, message = "") {
  const result =
    document.createElement("div");

  result.className =
    `test-result ${passed ? "pass" : "fail"}`;

  result.textContent =
    `${passed ? "PASS" : "FAIL"}: ${name}${message ? ` - ${message}` : ""}`;

  resultsElement.appendChild(result);
}

// Run each betting test and update the summary at the top.
async function runTests() {
  let passedCount = 0;

  for (const item of tests) {
    try {
      await item.callback();
      passedCount += 1;
      renderResult(item.name, true);
    } catch (error) {
      renderResult(item.name, false, error.message);
    }
  }

  summaryElement.textContent =
    `${passedCount} of ${tests.length} betting tests passed.`;

  summaryElement.className =
    `test-summary ${passedCount === tests.length ? "pass" : "fail"}`;
}

// Replace fetch with a fake API response and record every request.
function mockFetchResponse(data, options = {}) {
  const calls = [];

  window.fetch = async (url, fetchOptions = {}) => {
    calls.push({
      url,
      options: fetchOptions
    });

    return {
      ok: options.ok ?? true,
      status: options.status ?? 200,
      json: async () => data
    };
  };

  return calls;
}

// Restore the real browser fetch function after a fake API test.
function restoreFetch() {
  window.fetch =
    originalFetch;
}

// Store a fake betting API key so tests never show the password prompt.
function setTestBettingApiKey() {
  sessionStorage.setItem(
    "bettingApiKey",
    "test-key"
  );
}

// Put the shared betting state back into a known state.
function resetBettingState(balance = 100, activeBet = null) {
  bettingState.balance =
    balance;

  bettingState.activeBet =
    activeBet;
}

// These tests check which betting-state shapes are accepted or rejected.
test("default betting state is valid", () => {
  resetBettingState();

  assertTrue(
    isValidBettingState(bettingState)
  );
});

test("pending bet state is valid", () => {
  assertTrue(
    isValidBettingState({
      balance: 75,
      activeBet: {
        fixtureId: 1001,
        selection: "home",
        stake: 25,
        status: "pending"
      }
    })
  );
});

test("won bet state is valid", () => {
  assertTrue(
    isValidBettingState({
      balance: 120,
      activeBet: {
        fixtureId: 1002,
        selection: "away",
        stake: 10,
        status: "won"
      }
    })
  );
});

test("lost bet state is valid", () => {
  assertTrue(
    isValidBettingState({
      balance: 90,
      activeBet: {
        fixtureId: 537328,
        selection: "away",
        stake: 10,
        status: "lost"
      }
    })
  );
});

test("invalid bet selection is rejected", () => {
  assertFalse(
    isValidBettingState({
      balance: 100,
      activeBet: {
        fixtureId: 1001,
        selection: "both",
        stake: 10,
        status: "pending"
      }
    })
  );
});

test("invalid bet stake is rejected", () => {
  assertFalse(
    isValidBettingState({
      balance: 100,
      activeBet: {
        fixtureId: 1001,
        selection: "draw",
        stake: 0,
        status: "pending"
      }
    })
  );
});

test("invalid bet status is rejected", () => {
  assertFalse(
    isValidBettingState({
      balance: 100,
      activeBet: {
        fixtureId: 1001,
        selection: "home",
        stake: 10,
        status: "finished"
      }
    })
  );
});

// These tests check loading and saving without calling the real Worker.
test("loadBettingState loads balance and activeBet from the API", async () => {
  setTestBettingApiKey();

  const calls =
    mockFetchResponse({
      balance: 90,
      activeBet: {
        fixtureId: 537328,
        selection: "away",
        stake: 10,
        status: "lost"
      }
    });

  try {
    await loadBettingState();

    assertEqual(bettingState.balance, 90);
    assertEqual(bettingState.activeBet.status, "lost");
    assertEqual(
      calls[0].options.headers.Authorization,
      "Bearer test-key"
    );
  } finally {
    restoreFetch();
  }
});

test("saveBettingState sends the current state with PUT", async () => {
  setTestBettingApiKey();

  resetBettingState(75, {
    fixtureId: 1001,
    selection: "home",
    stake: 25,
    status: "pending"
  });

  const calls =
    mockFetchResponse({
      balance: 75,
      activeBet: {
        fixtureId: 1001,
        selection: "home",
        stake: 25,
        status: "pending"
      }
    });

  try {
    await saveBettingState();

    const requestBody =
      JSON.parse(calls[0].options.body);

    assertEqual(calls[0].options.method, "PUT");
    assertEqual(
      calls[0].options.headers.Authorization,
      "Bearer test-key"
    );
    assertEqual(requestBody.balance, 75);
    assertEqual(requestBody.activeBet.selection, "home");
  } finally {
    restoreFetch();
  }
});

test("clearSettledActiveBet removes a lost active bet", async () => {
  setTestBettingApiKey();

  resetBettingState(90, {
    fixtureId: 537328,
    selection: "away",
    stake: 10,
    status: "lost"
  });

  const calls =
    mockFetchResponse({
      balance: 90,
      activeBet: null
    });

  try {
    const wasCleared =
      await clearSettledActiveBet();

    const requestBody =
      JSON.parse(calls[0].options.body);

    assertTrue(wasCleared);
    assertEqual(requestBody.activeBet, null);
    assertEqual(bettingState.activeBet, null);
  } finally {
    restoreFetch();
  }
});

test("clearSettledActiveBet removes a won active bet", async () => {
  setTestBettingApiKey();

  resetBettingState(120, {
    fixtureId: 1002,
    selection: "home",
    stake: 10,
    status: "won"
  });

  mockFetchResponse({
    balance: 120,
    activeBet: null
  });

  try {
    const wasCleared =
      await clearSettledActiveBet();

    assertTrue(wasCleared);
    assertEqual(bettingState.activeBet, null);
  } finally {
    restoreFetch();
  }
});

test("clearSettledActiveBet keeps a pending active bet", async () => {
  resetBettingState(75, {
    fixtureId: 1001,
    selection: "draw",
    stake: 25,
    status: "pending"
  });

  let fetchWasCalled = false;

  window.fetch = async () => {
    fetchWasCalled = true;
  };

  try {
    const wasCleared =
      await clearSettledActiveBet();

    assertFalse(wasCleared);
    assertFalse(fetchWasCalled);
    assertEqual(bettingState.activeBet.status, "pending");
  } finally {
    restoreFetch();
  }
});

test("clearing a settled bet allows canPlaceBet to become true", async () => {
  setTestBettingApiKey();

  const upcomingMatch = {
    fixture: {
      status: {
        short: "NS"
      }
    }
  };

  resetBettingState(90, {
    fixtureId: 537328,
    selection: "away",
    stake: 10,
    status: "lost"
  });

  mockFetchResponse({
    balance: 90,
    activeBet: null
  });

  try {
    await clearSettledActiveBet();

    const canPlaceBet =
      upcomingMatch.fixture.status.short === "NS" &&
      bettingState.activeBet === null;

    assertTrue(canPlaceBet);
  } finally {
    restoreFetch();
  }
});

// These tests check error handling for bad API data and rejected keys.
test("invalid API response causes an error", async () => {
  setTestBettingApiKey();

  mockFetchResponse({
    balance: "not a number",
    activeBet: null
  });

  try {
    try {
      await loadBettingState();
    } catch (error) {
      assertEqual(
        error.message,
        "The Worker returned an invalid betting-state shape."
      );
      return;
    }

    throw new Error("Expected loadBettingState to fail.");
  } finally {
    restoreFetch();
  }
});

test("rejected betting key is removed", async () => {
  setTestBettingApiKey();

  mockFetchResponse({}, {
    ok: false,
    status: 401
  });

  try {
    try {
      await loadBettingState();
    } catch (error) {
      assertEqual(
        error.message,
        "The betting key was rejected."
      );

      assertEqual(
        sessionStorage.getItem("bettingApiKey"),
        null
      );

      return;
    }

    throw new Error("Expected loadBettingState to reject the key.");
  } finally {
    restoreFetch();
  }
});

test("forgetBettingApiKey removes the saved key", () => {
  setTestBettingApiKey();

  forgetBettingApiKey();

  assertEqual(
    sessionStorage.getItem("bettingApiKey"),
    null
  );
});

// This starts the full test run after all tests have been registered.
runTests();
