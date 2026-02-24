const canvas = document.getElementById("flightGame");
const ctx = canvas ? canvas.getContext("2d") : null;

const scoreEl = document.getElementById("gameScore");
const livesEl = document.getElementById("gameLives");
const timeEl = document.getElementById("gameTime");
const msgEl = document.getElementById("gameMessage");
const startBtn = document.getElementById("startGameBtn");
const resetBtn = document.getElementById("resetGameBtn");
const leftBtn = document.getElementById("moveLeftBtn");
const rightBtn = document.getElementById("moveRightBtn");

if (canvas && ctx) {
  const state = {
    running: false,
    score: 0,
    lives: 3,
    time: 60,
    lastSpawn: 0,
    items: [],
    keys: { left: false, right: false },
    plane: { x: 420, y: 360, w: 64, h: 36, speed: 5 },
    loopId: null,
    timerId: null,
  };

  const resetState = () => {
    state.running = false;
    state.score = 0;
    state.lives = 3;
    state.time = 60;
    state.items = [];
    state.plane.x = 420;
    if (state.loopId) cancelAnimationFrame(state.loopId);
    if (state.timerId) clearInterval(state.timerId);
    updateHud();
    msgEl.textContent = "Kontrol: Klavyede sol/sağ ok tuşları veya mobilde butonlar.";
    draw();
  };

  const updateHud = () => {
    scoreEl.textContent = String(state.score);
    livesEl.textContent = String(state.lives);
    timeEl.textContent = String(state.time);
  };

  const spawnItem = () => {
    const isFuel = Math.random() > 0.35;
    state.items.push({
      x: Math.random() * (canvas.width - 24),
      y: -30,
      w: 24,
      h: 24,
      vy: 2 + Math.random() * 2.2,
      type: isFuel ? "fuel" : "storm",
    });
  };

  const intersects = (a, b) =>
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  const drawPlane = () => {
    ctx.fillStyle = "#d8e8fa";
    ctx.beginPath();
    ctx.moveTo(state.plane.x, state.plane.y + state.plane.h);
    ctx.lineTo(state.plane.x + state.plane.w / 2, state.plane.y);
    ctx.lineTo(state.plane.x + state.plane.w, state.plane.y + state.plane.h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#8fb2d6";
    ctx.fillRect(state.plane.x + 24, state.plane.y + 22, 16, 18);
  };

  const drawItem = (item) => {
    if (item.type === "fuel") {
      ctx.fillStyle = "#71d19a";
      ctx.fillRect(item.x, item.y, item.w, item.h);
      ctx.fillStyle = "#1d2733";
      ctx.fillRect(item.x + 9, item.y + 5, 6, 14);
    } else {
      ctx.fillStyle = "#f08b8b";
      ctx.beginPath();
      ctx.arc(item.x + 12, item.y + 12, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(item.x + 7, item.y + 8);
      ctx.lineTo(item.x + 17, item.y + 18);
      ctx.moveTo(item.x + 17, item.y + 8);
      ctx.lineTo(item.x + 7, item.y + 18);
      ctx.stroke();
    }
  };

  const drawBackground = () => {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#26384c");
    grad.addColorStop(1, "#1a2736");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    for (let i = 0; i < 8; i += 1) {
      const y = 30 + i * 50;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  const draw = () => {
    drawBackground();
    drawPlane();
    state.items.forEach(drawItem);
  };

  const tick = (ts) => {
    if (!state.running) return;

    if (state.keys.left) state.plane.x -= state.plane.speed;
    if (state.keys.right) state.plane.x += state.plane.speed;
    state.plane.x = Math.max(0, Math.min(canvas.width - state.plane.w, state.plane.x));

    if (ts - state.lastSpawn > 650) {
      spawnItem();
      state.lastSpawn = ts;
    }

    state.items = state.items.filter((it) => it.y < canvas.height + 30);
    state.items.forEach((it) => {
      it.y += it.vy;
      if (intersects(state.plane, it)) {
        if (it.type === "fuel") {
          state.score += 10;
        } else {
          state.lives -= 1;
        }
        it.y = canvas.height + 50;
      }
    });

    if (state.lives <= 0) {
      state.running = false;
      msgEl.textContent = `Oyun bitti. Skor: ${state.score}`;
      updateHud();
      draw();
      return;
    }

    updateHud();
    draw();
    state.loopId = requestAnimationFrame(tick);
  };

  const start = () => {
    if (state.running) return;
    state.running = true;
    msgEl.textContent = "Oyun başladı. Yakıt bonuslarını topla.";
    state.timerId = setInterval(() => {
      state.time -= 1;
      updateHud();
      if (state.time <= 0) {
        state.running = false;
        clearInterval(state.timerId);
        msgEl.textContent = `Süre doldu. Skor: ${state.score}`;
      }
    }, 1000);
    state.loopId = requestAnimationFrame(tick);
  };

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") state.keys.left = true;
    if (e.key === "ArrowRight") state.keys.right = true;
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") state.keys.left = false;
    if (e.key === "ArrowRight") state.keys.right = false;
  });

  if (leftBtn) {
    leftBtn.addEventListener("pointerdown", () => { state.keys.left = true; });
    leftBtn.addEventListener("pointerup", () => { state.keys.left = false; });
    leftBtn.addEventListener("pointerleave", () => { state.keys.left = false; });
  }
  if (rightBtn) {
    rightBtn.addEventListener("pointerdown", () => { state.keys.right = true; });
    rightBtn.addEventListener("pointerup", () => { state.keys.right = false; });
    rightBtn.addEventListener("pointerleave", () => { state.keys.right = false; });
  }

  startBtn?.addEventListener("click", start);
  resetBtn?.addEventListener("click", resetState);

  resetState();
}
