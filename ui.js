const currentPage = window.location.pathname.split("/").pop() || "index.html";
const navLinks = document.querySelectorAll("nav a");
const mainElement = document.querySelector("main");

navLinks.forEach(link => {
  const linkPage = link.getAttribute("href");

  if (linkPage === currentPage) {
    link.classList.add("active-page");
  }
});

if (mainElement) {
  const badge = document.createElement("div");
  badge.className = "page-badge";
  badge.textContent = `> ${document.title}`;
  mainElement.prepend(badge);
}

// This UI was done by AI because Ben was Lazy
