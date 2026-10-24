document.addEventListener("DOMContentLoaded", () => {
  // 1. Automatically keep the footer copyright year current
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Automatically sync the active page indicator in the navbar
  const isProjectsPage = /\/projects(\/|$)/.test(window.location.pathname);
  const currentPage = isProjectsPage ? "projects" : "home";

  document.querySelectorAll(".site-nav .nav-link").forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
});

// 3. Tiny retro rockets flying around with fading trails
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.id = "rockets";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let w, h;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const COUNT = 4;         // number of rockets
  const MAX_TURN = 0.012;  // smaller = wider, lazier turns
  const STEER = 0.002;     // smaller = smoother, straighter paths
  const TRAIL_LENGTH = 70; // longer = longer trail
  const MARGIN = 40;

  const rockets = Array.from({ length: COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    angle: Math.random() * Math.PI * 2,
    turn: 0,
    speed: 0.9 + Math.random() * 0.8,
    trail: [],
  }));

  function drawTrail(r) {
    const t = r.trail;
    for (let i = 1; i < t.length; i++) {
      const k = i / t.length;
      ctx.strokeStyle = "rgba(250, 204, 21," + (k * 0.85).toFixed(3) + ")";
      ctx.lineWidth = 0.4 + k * 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(t[i - 1].x, t[i - 1].y);
      ctx.lineTo(t[i].x, t[i].y);
      ctx.stroke();
    }
  }

  function drawRocket(r, time) {
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(r.angle);

    // flame (flickers)
    const flame = 4 + Math.sin(time / 40 + r.x) * 1.5;
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.moveTo(-6, -1.4);
    ctx.lineTo(-6 - flame, 0);
    ctx.lineTo(-6, 1.4);
    ctx.closePath();
    ctx.fill();

    // fins
    ctx.fillStyle = "#c81e1e";
    ctx.beginPath();
    ctx.moveTo(-1, -2);
    ctx.lineTo(-3, -4.5);
    ctx.lineTo(-8, -4.5);
    ctx.lineTo(-5, -2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-1, 2);
    ctx.lineTo(-3, 4.5);
    ctx.lineTo(-8, 4.5);
    ctx.lineTo(-5, 2);
    ctx.closePath();
    ctx.fill();

    // body
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(-6, -2.3);
    ctx.lineTo(3, -2.3);
    ctx.quadraticCurveTo(7, -1.6, 9, 0);
    ctx.quadraticCurveTo(7, 1.6, 3, 2.3);
    ctx.lineTo(-6, 2.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // nose tip
    ctx.fillStyle = "#c81e1e";
    ctx.beginPath();
    ctx.moveTo(5, -1.7);
    ctx.quadraticCurveTo(7.5, -1, 9, 0);
    ctx.quadraticCurveTo(7.5, 1, 5, 1.7);
    ctx.closePath();
    ctx.fill();

    // porthole
    ctx.fillStyle = "#93c5fd";
    ctx.beginPath();
    ctx.arc(0.5, 0, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 16.67, 3);
    last = now;
    ctx.clearRect(0, 0, w, h);

    for (const r of rockets) {
      // gentle random steering
      r.turn += (Math.random() - 0.5) * STEER * dt;
      r.turn = Math.max(-MAX_TURN, Math.min(MAX_TURN, r.turn));
      r.angle += r.turn * dt;
      r.x += Math.cos(r.angle) * r.speed * dt;
      r.y += Math.sin(r.angle) * r.speed * dt;

      // wrap around the screen
      let wrapped = false;
      if (r.x < -MARGIN) { r.x = w + MARGIN; wrapped = true; }
      if (r.x > w + MARGIN) { r.x = -MARGIN; wrapped = true; }
      if (r.y < -MARGIN) { r.y = h + MARGIN; wrapped = true; }
      if (r.y > h + MARGIN) { r.y = -MARGIN; wrapped = true; }
      if (wrapped) r.trail = [];

      r.trail.push({ x: r.x - Math.cos(r.angle) * 6, y: r.y - Math.sin(r.angle) * 6 });
      if (r.trail.length > TRAIL_LENGTH) r.trail.shift();

      drawTrail(r);
      drawRocket(r, now);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

// 4. Night mode toggle (remembers your choice)
(function () {
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  function sync() {
    btn.setAttribute("aria-pressed", root.dataset.theme === "dark" ? "true" : "false");
  }
  sync();

  btn.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    sync();
  });
})();
