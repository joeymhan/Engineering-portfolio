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

  // 3. Tintin Red & White Rockets Background Animation
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    initTintinRockets();
  }
});

function initTintinRockets() {
  const canvas = document.createElement("canvas");
  canvas.className = "rocket-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;

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
    constructor(initialDelay = false) {
      this.reset(initialDelay);
    }

    reset(initialDelay = false) {
      // Spawn along one of the 4 screen edges and aim across the viewport
      const edge = Math.floor(Math.random() * 4);
      const pad = 70;

      if (edge === 0) {
        // Left edge -> flying right
        this.x = -pad;
        this.y = Math.random() * height;
        this.angle = (Math.random() - 0.5) * 0.9;
      } else if (edge === 1) {
        // Right edge -> flying left
        this.x = width + pad;
        this.y = Math.random() * height;
        this.angle = Math.PI + (Math.random() - 0.5) * 0.9;
      } else if (edge === 2) {
        // Bottom edge -> flying up
        this.x = Math.random() * width;
        this.y = height + pad;
        this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
      } else {
        // Top edge -> flying down
        this.x = Math.random() * width;
        this.y = -pad;
        this.angle = Math.PI / 2 + (Math.random() - 0.5) * 0.9;
      }

      if (initialDelay) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      }

      this.speed = 1.6 + Math.random() * 1.1;
      this.turnRate = (Math.random() - 0.5) * 0.008;
      this.turnTimer = 0;
      this.scale = 0.55 + Math.random() * 0.2;
      this.trail = [];
      this.maxTrail = 65;
    }

    update() {
      // Gently vary the flight curve
      this.turnTimer++;
      if (this.turnTimer > 90) {
        this.turnRate = (Math.random() - 0.5) * 0.012;
        this.turnTimer = 0;
      }
      this.angle += this.turnRate;

      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;

      // Record exhaust position at the tail of the rocket
      const tailOffset = 18 * this.scale;
      const tailX = this.x - Math.cos(this.angle) * tailOffset;
      const tailY = this.y - Math.sin(this.angle) * tailOffset;

      this.trail.push({ x: tailX, y: tailY });
      if (this.trail.length > this.maxTrail) {
        this.trail.shift();
      }

      // Respawn if well outside the screen bounds
      const bound = 140;
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
      // 1. Draw fading vapor & smoke trail
      if (this.trail.length > 2) {
        for (let i = 1; i < this.trail.length; i++) {
          const p0 = this.trail[i - 1];
          const p1 = this.trail[i];
          const progress = i / this.trail.length;

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = `rgba(210, 45, 45, ${progress * 0.28})`;
          ctx.lineWidth = progress * 4.5 * this.scale;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      }

      // 2. Draw the Tintin Rocket (oriented along +X axis)
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.scale(this.scale, this.scale);

      const red = "#d62828";
      const white = "#ffffff";
      const dark = "#1a1a1a";

      // Flickering exhaust flame
      const flameLen = 19 + Math.random() * 8;
      ctx.beginPath();
      ctx.moveTo(-14, -3.5);
      ctx.lineTo(-flameLen, 0);
      ctx.lineTo(-14, 3.5);
      ctx.closePath();
      ctx.fillStyle = "#f77f00";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-14, -1.8);
      ctx.lineTo(-flameLen * 0.72, 0);
      ctx.lineTo(-14, 1.8);
      ctx.closePath();
      ctx.fillStyle = "#fcbf49";
      ctx.fill();

      // Rear swept fins & landing pods (iconic 3-fin Tintin silhouette)
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

      // Cigar-shaped fuselage path helper
      function fuselagePath() {
        ctx.beginPath();
        ctx.moveTo(20, 0); // Nose tip
        ctx.bezierCurveTo(11, -8.5, -7, -8.5, -15, -3.5);
        ctx.lineTo(-15, 3.5);
        ctx.bezierCurveTo(-7, 8.5, 11, 8.5, 20, 0);
        ctx.closePath();
      }

      // Clip to fuselage to paint the red-and-white checkerboard & nose/tail
      ctx.save();
      fuselagePath();
      ctx.clip();

      // Base white fill
      ctx.fillStyle = white;
      ctx.fillRect(-20, -12, 45, 24);

      // Solid red nose cone and tail section
      ctx.fillStyle = red;
      ctx.fillRect(8, -12, 16, 24);
      ctx.fillRect(-18, -12, 7, 24);

      // Classic Tintin red & white checkerboard band in the middle (-11 to +8)
      const cols = [-11, -4.5, 2];
      const colW = 6.5;
      cols.forEach((cx, colIdx) => {
        // Top half (y: -9 to 0)
        ctx.fillStyle = colIdx % 2 === 0 ? red : white;
        ctx.fillRect(cx, -9, colW, 9);
        // Bottom half (y: 0 to 9)
        ctx.fillStyle = colIdx % 2 === 0 ? white : red;
        ctx.fillRect(cx, 0, colW, 9);
      });

      ctx.restore();

      // Crisp fuselage outline
      fuselagePath();
      ctx.strokeStyle = dark;
      ctx.lineWidth = 1.35;
      ctx.stroke();

      // Needle antenna spire at the nose tip
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(26, 0);
      ctx.strokeStyle = dark;
      ctx.lineWidth = 1.25;
      ctx.stroke();

      ctx.restore();
    }
  }

  // Spawn 3 small Tintin rockets
  const rockets = [
    new TintinRocket(true),
    new TintinRocket(true),
    new TintinRocket(true),
  ];

  function animate() {
    ctx.clearRect(0, 0, width, height);
    rockets.forEach((rocket) => {
      rocket.update();
      rocket.draw(ctx);
    });
    requestAnimationFrame(animate);
  }

  anima
