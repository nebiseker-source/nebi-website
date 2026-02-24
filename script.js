const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");
const navLinks = menu ? Array.from(menu.querySelectorAll("a")) : [];

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const setActiveNav = () => {
  if (!navLinks.length) return;
  const path = window.location.pathname.replace(/\/+$/, "");
  const hash = window.location.hash;

  const isBlogPage = /\/blog(\/|$)/.test(path);
  const isReportPage = /\/reports(\/|$)/.test(path);
  const isCertificatePage = /\/certificates(\/|$)/.test(path);
  const isPlayPage = /\/play(\/|$)/.test(path);
  const isHomePath = /\/$|\/index\.html$/.test(path);

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    link.classList.remove("active");

    if (hash && isHomePath && href === hash) {
      link.classList.add("active");
      return;
    }

    if (isBlogPage && /(^|\/)index\.html$/.test(href) && !href.includes("#")) {
      link.classList.add("active");
      return;
    }

    if (isReportPage && href.includes("#raporlar")) {
      link.classList.add("active");
      return;
    }

    if (isCertificatePage && href.includes("#sertifikalar")) {
      link.classList.add("active");
      return;
    }

    if (isPlayPage && /\/play\/index\.html$|^index\.html$/.test(href)) {
      link.classList.add("active");
    }
  });
};

setActiveNav();
window.addEventListener("hashchange", setActiveNav);

const sections = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const cursorGlow = document.querySelector(".cursor-glow");
const shapeA = document.querySelector(".bg-shape-a");
const shapeB = document.querySelector(".bg-shape-b");

if (reduceMotion || !("IntersectionObserver" in window)) {
  sections.forEach((section) => section.classList.add("show"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

if (!reduceMotion) {
  window.addEventListener("mousemove", (event) => {
    if (cursorGlow) {
      cursorGlow.style.opacity = "1";
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    }

    if (shapeA && shapeB) {
      const offsetX = (event.clientX / window.innerWidth - 0.5) * 14;
      const offsetY = (event.clientY / window.innerHeight - 0.5) * 14;

      shapeA.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      shapeB.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`;
    }
  });
}

const applyContentData = async () => {
  const localOverride = localStorage.getItem("nebi_content_override");
  let data = {};

  if (localOverride) {
    try {
      data = JSON.parse(localOverride);
    } catch {
      data = {};
    }
  }

  if (!Object.keys(data).length) {
    try {
      const res = await fetch("/assets/data/site-content.json", { cache: "no-store" });
      data = await res.json();
    } catch {
      data = {};
    }
  }

  document.querySelectorAll("[data-content-key]").forEach((el) => {
    const key = el.getAttribute("data-content-key");
    if (key && typeof data[key] === "string") {
      el.textContent = data[key];
    }
  });
};

const setupCaseFilters = () => {
  const filters = Array.from(document.querySelectorAll(".case-filter"));
  const items = Array.from(document.querySelectorAll(".case-item"));
  const visibleCount = document.getElementById("caseVisibleCount");
  const impactEl = document.getElementById("caseImpact");
  const focusEl = document.getElementById("caseFocus");
  if (!filters.length || !items.length) return;

  const updateMetrics = (label) => {
    const visible = items.filter((item) => !item.classList.contains("is-hidden"));
    const impact = visible.reduce((sum, item) => sum + Number(item.dataset.impact || 0), 0);
    if (visibleCount) visibleCount.textContent = String(visible.length);
    if (impactEl) impactEl.textContent = `+${impact}`;
    if (focusEl) focusEl.textContent = label;
  };

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((f) => f.classList.remove("is-active"));
      btn.classList.add("is-active");
      const filter = btn.dataset.filter || "all";
      items.forEach((item) => {
        const tags = (item.dataset.tags || "").split(",");
        const show = filter === "all" || tags.includes(filter);
        item.classList.toggle("is-hidden", !show);
      });
      updateMetrics(btn.textContent || "Tümü");
    });
  });

  updateMetrics("Tümü");
};

const trackEvent = (eventName, metadata = {}) => {
  const key = "nebi_event_log";
  let existing = [];
  try {
    existing = JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    existing = [];
  }
  existing.push({
    event: eventName,
    metadata,
    ts: new Date().toISOString(),
  });
  localStorage.setItem(key, JSON.stringify(existing.slice(-200)));
};

const setupEventTracking = () => {
  document.querySelectorAll("[data-track]").forEach((el) => {
    el.addEventListener("click", () => {
      const eventName = el.getAttribute("data-track") || "click";
      const label = (el.textContent || "").trim();
      trackEvent(eventName, { label, href: el.getAttribute("href") || "" });
    });
  });
};

const setupHeroAbTest = () => {
  const cta = document.getElementById("heroPrimaryCta");
  if (!cta) return;
  const key = "nebi_ab_hero_cta";
  let variant = localStorage.getItem(key);
  if (!variant) {
    variant = Math.random() > 0.5 ? "A" : "B";
    localStorage.setItem(key, variant);
  }

  if (variant === "B") {
    cta.textContent = "Projeleri Gör";
  }

  cta.setAttribute("data-track", `hero_primary_cta_${variant}`);
};

applyContentData();
setupCaseFilters();
setupEventTracking();
setupHeroAbTest();
