document.addEventListener("DOMContentLoaded", () => {
  // 1. Automatically keep the footer copyright year current
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Automatically sync the active page indicator in the navbar
  const isProjectsPage = window.location.pathname.includes("/projects");
  const currentPage = isProjectsPage ? "projects" : "home";

  document.querySelectorAll(".site-nav .nav-link").forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
});

