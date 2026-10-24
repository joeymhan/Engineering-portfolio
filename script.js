function startSite() {
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

  // 3. Always launch the Tintin Rockets
  initTintinRockets();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startSite);
} else {
  startSite();
}

function initTintinRockets() {
  // Prevent duplicate canvases if script runs twice
  if (document.querySelector(".rocket-canvas")) return;

  const canvas = document.createElement("canvas");
  canvas.className = "rocket-canvas";
  canvas.setAttribute("aria-hidden", "true");

  // Apply positioning directly in JS so cached CSS never hides the canvas
  Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "5",
  });

  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let width = window.innerWidth;
  let height = window.innerHeight;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resize);
  resize();

  class TintinRocket {
    constructor(spawnInside = false) {
      this.reset(spawnInside);
    }

    reset(spawnInside = false) {
      const pad = 60;

      if (spawnInside) {
        this.x = width * (0.15 + Math.random() * 0.7);
        this.y = height * (0.15 + Math.random() * 0.7);
        this.angle = Math.random() * Math.PI * 2;
      } else {
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) {
          this.x = -pad;
          this.y = Math.random() * height;
          this.angle = (Math.random() - 0.5) * 0.9;
        } else if (edge === 1) {
          this.x = width + pad;
          this.y = Math.random() * height;
          this.angle = Math.PI + (Math.random() - 0.5) * 0.9;
        } else if (edge === 2) {
          this.x = Math.random() * width;
          this.y = height + pad;
          this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
        } else {
          this.x = Math.random() * width;
          this.y = -pad;
          this.angle = Math.PI / 2 + (Math.random() - 0.5) * 0.9;
        }
      }

      this.speed = 1.8 + Math.random() * 1.0;
      this.turnRate = (Math.random() - 0.5) * 0.01;
      this.turnTimer = 0;
      this.scale = 0.65 + Math.random() * 0.2;
      this.trail = [];
      this.maxTrail = 75;
    }

    update() {
      this.turnTimer++;
      if (this.turnTimer > 80) {
        this.turnRate = (Math.random() - 0.5) * 0.014;
        this.turnTimer = 0;
      }
      this.angle += this.turnRate;

      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;

      const tailOffset = 18 * this.scale;
      const tailX = this.x - Math.cos(this.angle) * tailOffset;
      const tailY = this.y - Math.sin(this.angle) * tailOffset;

      this.trail.push({ x: tailX, y: tailY });
      if (this.trail.length > this.maxTrail) {
        this.trail.shift();
      }

      const bound = 120;
      if (
        this.x < -bound ||
        this.x > width + bound ||
        this.y < -bound ||
        this.y > height + bound
      ) {
        this.reset(false);
      }
    }

    draw(ctx) {
      // 1. Draw fading trail
      if (this.trail.length > 2) {
        for (let i = 1; i < this.trail.length; i++) {
          const p0 = this.trail[i - 1];
          const p1 = this.trail[i];
          const progress = i / this.trail.length;

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = `rgba(214, 40, 40, ${progress * 0.35})`;
          ctx.lineWidth = progress * 5 * this.scale;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      }

      // 2. Draw Tintin Rocket
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.scale(this.scale, this.scale);

      const red = "#d62828";
      const white = "#ffffff";
      const dark = "#1a1a1a";

      // Flickering exhaust flame
      const flameLen = 20 + Math.random() * 8;
      ctx.beginPath();
      ctx.moveTo(-14, -3.5);
      ctx.lineTo(-flameLen, 0);
      ctx.lineTo(-14, 3.5);
      ctx.closePath();
      ctx.fillStyle = "#f77f00";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-14, -1.8);
      ctx.lineTo(-flameLen * 0.7, 0);
      ctx.lineTo(-14, 1.8);
      ctx.closePath();
      ctx.fillStyle = "#fcbf49";
      ctx.fill();

      // Rear swept fins
      ctx.strokeStyle = dark;
      ctx.lineWidth = 1.2;
      ctx.fillStyle = red;

      // Top fin
      ctx.beginPath();
      ctx.moveTo(-5, -5);
      ctx.quadraticCurveTo(-14, -14, -20, -14);
      ctx.lineTo(-13, -3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Bottom fin
      ctx.beginPath();
      ctx.moveTo(-5, 5);
      ctx.quadraticCurveTo(-14, 14, -20, 14);
      ctx.lineTo(-13, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Center fin spine
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(-20, 0);
      ctx.strokeStyle = red;
      ctx.lineWidth = 2.2;
      ctx.stroke();

      function fuselagePath() {
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.bezierCurveTo(11, -8.5, -7, -8.5, -15, -3.5);
        ctx.lineTo(-15, 3.5);
        ctx.bezierCurveTo(-7, 8.5, 11, 8.5, 20, 0);
        c
