const body = document.body;
const themeToggle = document.getElementById("toggle-dark");
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("site-menu");
const currentPage = body.dataset.page;

if (currentPage === "projects" && !window.location.hash) {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  };

  scrollToTop();
  window.addEventListener("pageshow", scrollToTop);
  window.addEventListener("load", scrollToTop);

  document.querySelectorAll(".browser-frame iframe").forEach((iframe) => {
    iframe.tabIndex = -1;

    iframe.addEventListener("load", () => {
      if (document.activeElement === iframe) {
        iframe.blur();
        scrollToTop();
      }
    });
  });
}

function setTheme(isDark) {
  body.classList.toggle("dark", isDark);
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.textContent = isDark ? "Light" : "Dark";
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

const savedTheme = localStorage.getItem("theme");
setTheme(savedTheme ? savedTheme === "dark" : true);

themeToggle.addEventListener("click", () => {
  setTheme(!body.classList.contains("dark"));
});

navToggle.addEventListener("click", () => {
  const open = navMenu.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});

navMenu.querySelectorAll("a").forEach((link) => {
  if (link.dataset.nav === currentPage) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }

  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav")) {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");

if (!reduceMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

(() => {
  const canvas = document.getElementById("bg");
  if (!canvas || reduceMotion) return;

  const ctx = canvas.getContext("2d");
  let width;
  let height;
  let particles = [];
  let mouse = { x: -9999, y: -9999 };

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function init() {
    const count = Math.min(58, Math.floor((width * height) / 28000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      r: Math.random() * 1.4 + 0.6
    }));
  }

  function cssVar(name, fallback) {
    return getComputedStyle(body).getPropertyValue(name).trim() || fallback;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;

      const dx = particle.x - mouse.x;
      const dy = particle.y - mouse.y;

      if (dx * dx + dy * dy < 7000) {
        particle.vx += dx * 0.00003;
        particle.vy += dy * 0.00003;
      }

      ctx.globalAlpha = 0.78;
      ctx.fillStyle = cssVar("--dot", "#1abc9c");
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 0.11;
    ctx.strokeStyle = cssVar("--brand", "#1abc9c");

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;

        if (dx * dx + dy * dy < 125 * 125) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();

  window.addEventListener("resize", () => {
    resize();
    init();
  });

  window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });
})();
