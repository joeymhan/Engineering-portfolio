document.addEventListener("DOMContentLoaded", () => {
  // 1. Update footer year
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Launch background Tintin rockets
  initTintinRockets();
});

function initTintinRockets() {
  if (document.getElementById("tintin-rocket-canvas")) return;

  const canvas = document.createElement("canvas");
  canvas.id = "tintin-rocket-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;";
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

  class Rocket {
    constructor(spawnInside) {
      this.reset(spawnInside);
    }

    reset(spawnInside) {
      const pad = 60;
      if (spawnInside) {
        this.x = width * (0.2 + Math.random() * 0.6);
        this.y = height * (0.2 + Math.random() * 0.6);
        this.angle = Math.random() * Math.PI * 2;
      } else {
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) {
          this.x = -pad;
          this.y = Math.random() * height;
          this.angle = (Math.random() - 0.5) * 0.8;
        } else if (edge === 1) {
          this.x = width + pad;
          this.y = Math.random() * height;
          this.angle = Math.PI + (Math.random() - 0.5) * 0.8;
        } else if (edge === 2) {
          this.x = Math.random() * width;
          this.y = height + pad;
          this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
        } else {
          this.x = Math.random() * width;
          this.y = -pad;
          this.angle = Math.PI / 2 + (Math.random() - 0.5) * 0.8;
        }
      }

      this.speed = 1.6 + Math.random() * 0.8;
      this.turnRate = (Math.random() - 0.5) * 0.01;
      this.turnTimer = 0;
      this.scale = 0.6;
      this.trail = [];
      this.maxTrail = 60;
    }

    update() {
      this.turnTimer++;
      if (this.turnTimer > 80) {
        this.turnRate = (Math.random() - 0.5) * 0.012;
        this.turnTimer = 0;
      }
      this.angle += this.turnRate;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;

      const tailX = this.x - Math.cos(this.angle) * 16 * this.scale;
      const tailY = this.y - Math.sin(this.angle) * 16 * this.scale;
      this.trail.push({ x: tailX, y: tailY });
      if (this.trail.length > this.maxTrail) {
        this.trail.shift();
      }

      if (
        this.x < -120 ||
        this.x > width + 120 ||
        this.y < -120 ||
        this.y > height + 120
      ) {
        this.reset(false);
      }
    }

    draw(ctx) {
      if (this.trail.length > 2) {
        for (let i = 1; i < this.trail.length; i++) {
          const p0 = this.trail[i - 1];
          const p1 = this.trail[i];
          const ratio = i / this.trail.length;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = `rgba(214, 40, 40, ${ratio * 0.3})`;
          ctx.lineWidth = ratio * 4 * this.scale;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      }

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.scale(this.scale, this.scale);

      const red = "#d62828";
      const white = "#ffffff";
      const dark = "#1a1a1a";

      // Flame
      const flame = 18 + Math.random() * 6;
      ctx.beginPath();
      ctx.moveTo(-14, -3);
      ctx.lineTo(-flame, 0);
      ctx.lineTo(-14, 3);
      ctx.closePath();
      ctx.fillStyle = "#f77f00";
      ctx.fill();

      // Fins
      ctx.fillStyle = red;
      ctx.strokeStyle = dark;
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.moveTo(-5, -5);
      ctx.quadraticCurveTo(-14, -14, -20, -14);
      ctx.lineTo(-13, -3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-5, 5);
      ctx.quadraticCurveTo(-14, 14, -20, 14);
      ctx.lineTo(-13, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Body
      function bodyPath() {
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.bezierCurveTo(11, -8.5, -7, -8.5, -15, -3.5);
        ctx.lineTo(-15, 3.5);
        ctx.bezierCurveTo(-7, 8.5, 11, 8.5, 20, 0);
        ctx.closePath();
      }

      ctx.save();
      bodyPath();
      ctx.clip();

      ctx.fillStyle = white;
      ctx.fillRect(-20, -12, 45, 24);

      ctx.fillStyle = red;
      ctx.fillRect(8, -12, 16, 24);
      ctx.fillRect(-18, -12, 7, 24);

      [-11, -4.5, 2].forEach((cx, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? red : white;
        ctx.fillRect(cx, -9, 6.5, 9);
        ctx.fillStyle = idx % 2 === 0 ? white : red;
        ctx.fillRect(cx, 0, 6.5, 9);
      });

      ctx.restore();

      bodyPath();
      ctx.strokeStyle = dark;
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // Nose needle
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(26, 0);
      ctx.stroke();

      ctx.restore();
    }
  }

  const rockets = [new Rocket(true), new Rocket(true), new Rocket(true)];

  function loop() {
    ctx.clearRect(0, 0, width, height);
    rockets.forEach((r) => {
      r.update();
      r.draw(ctx);
    });
    requestAnimationFrame(loop);
  }

  loop();
}
