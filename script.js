const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");

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
