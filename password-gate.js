const sitePassword = "Tim8drake!";
const unlockedKey = "bensWorldCupUnlocked";

if (sessionStorage.getItem(unlockedKey) !== "true") {
  document.documentElement.classList.add("site-locked");

  window.addEventListener("DOMContentLoaded", () => {
    const gate = document.createElement("div");
    gate.className = "password-gate";
    gate.innerHTML = `
      <form class="password-box" id="password-form">
        <h2>Enter Password</h2>

        <label for="site-password">
          Password
        </label>

        <input
          id="site-password"
          type="password"
          autocomplete="current-password"
          required
        >

        <button type="submit">
          Unlock Site
        </button>

        <p id="password-message"></p>
      </form>
    `;

    document.body.appendChild(gate);

    const form = document.getElementById("password-form");
    const passwordInput = document.getElementById("site-password");
    const message = document.getElementById("password-message");

    passwordInput.focus();

    form.addEventListener("submit", event => {
      event.preventDefault();

      if (passwordInput.value === sitePassword) {
        sessionStorage.setItem(unlockedKey, "true");
        document.documentElement.classList.remove("site-locked");
        gate.remove();
        return;
      }

      message.textContent = "Wrong password.";
      passwordInput.value = "";
      passwordInput.focus();
    });
  });
}
