(function () {
  "use strict";

  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const progress = document.querySelector(".scroll-progress span");
  const mobileCta = document.querySelector(".mobile-ride-cta");
  const year = document.querySelector("[data-year]");

  function closeNavigation() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Åbn menu");
    document.body.classList.remove("nav-open");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      nav.classList.toggle("is-open", !isOpen);
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Åbn menu" : "Luk menu");
      document.body.classList.toggle("nav-open", !isOpen);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNavigation);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNavigation();
    });
  }

  function updateScrollUi() {
    const top = window.scrollY;
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = available > 0 ? Math.min(100, (top / available) * 100) : 0;

    if (header) header.classList.toggle("is-scrolled", top > 20);
    if (progress) progress.style.width = percentage + "%";
    if (mobileCta) mobileCta.classList.toggle("is-hidden", top > available - 500);
  }

  updateScrollUi();
  window.addEventListener("scroll", updateScrollUi, { passive: true });
  window.addEventListener("resize", updateScrollUi);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealElements = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach(function (element) {
      element.classList.add("is-visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  }

  const sections = document.querySelectorAll("main section[id]");
  const navigationLinks = document.querySelectorAll('.main-nav a[href^="#"]');

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navigationLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-35% 0px -55%", threshold: 0 }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  function getNextTrainingDate() {
    const now = new Date();
    const candidates = [];

    for (let offset = 0; offset < 8; offset += 1) {
      const candidate = new Date(now);
      candidate.setDate(now.getDate() + offset);
      candidate.setHours(17, 30, 0, 0);

      if ((candidate.getDay() === 2 || candidate.getDay() === 4) && candidate > now) {
        candidates.push(candidate);
      }
    }

    return candidates.sort(function (a, b) { return a - b; })[0];
  }

  const nextRide = document.querySelector("[data-next-ride]");
  const nextTraining = getNextTrainingDate();

  if (nextRide && nextTraining) {
    const formatted = new Intl.DateTimeFormat("da-DK", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit"
    }).format(nextTraining);

    nextRide.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  if (year) year.textContent = String(new Date().getFullYear());
})();
