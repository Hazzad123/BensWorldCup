// Load saved betting data from the browser.
const savedState = localStorage.getItem("bettingState");

// Default betting state used when nothing has been saved yet.
export let bettingState = savedState
  ? JSON.parse(savedState)
  : {
      balance: 100,
      activeBet: null
    };

// Save the current betting state back to localStorage.
export function saveBettingState() {
  localStorage.setItem(
    "bettingState",
    JSON.stringify(bettingState)
  );
}
