const currentPage = window.location.pathname.split("/").pop() || "index.html";
const navLinks = document.querySelectorAll("nav a");

navLinks.forEach(link => {
  const linkPage = link.getAttribute("href");

  if (linkPage === currentPage) {
    link.classList.add("active-page");
  }
});

// This UI was done by AI because Ben was Lazy
