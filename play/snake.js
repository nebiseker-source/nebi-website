const snakeCanvas = document.getElementById("snakeGame");
const snakeCtx = snakeCanvas ? snakeCanvas.getContext("2d") : null;

const scoreEl = document.getElementById("snakeScore");
const bestEl = document.getElementById("snakeBest");
const speedEl = document.getElementById("snakeSpeed");
const msgEl = document.getElementById("snakeMessage");

const startBtn = document.getElementById("startSnakeBtn");
const resetBtn = document.getElementById("resetSnakeBtn");
const upBtn = document.getElementById("snakeUpBtn");
const downBtn = document.getElementById("snakeDownBtn");
const leftBtn = document.getElementById("snakeLeftBtn");
const rightBtn = document.getElementById("snakeRightBtn");

if (snakeCanvas && snakeCtx) {
  const cell = 30;
  const size = snakeCanvas.width / cell;
  const bestKey = "snake_best_score";

  const state = {
    running: false,
    score: 0,
    best: Number(localStorage.getItem(bestKey) || 0),
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    snake: [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }],
    food: { x: 14, y: 10 },
    timer: null,
    speed: 120,
  };

  const randomCell = () => Math.floor(Math.random() * size);

  const spawnFood = () => {
    let fx = randomCell();
    let fy = randomCell();
    while (state.snake.some((s) => s.x === fx && s.y === fy)) {
      fx = randomCell();
      fy = randomCell();
    }
    state.food = { x: fx, y: fy };
  };

  const setDir = (x, y) => {
    if (state.dir.x + x === 0 && state.dir.y + y === 0) return;
    state.nextDir = { x, y };
  };

  const draw = () => {
    snakeCtx.fillStyle = "#162230";
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

    snakeCtx.strokeStyle = "rgba(255,255,255,0.06)";
    for (let i = 0; i <= size; i += 1) {
      snakeCtx.beginPath();
      snakeCtx.moveTo(i * cell, 0);
      snakeCtx.lineTo(i * cell, snakeCanvas.height);
      snakeCtx.stroke();
      snakeCtx.beginPath();
      snakeCtx.moveTo(0, i * cell);
      snakeCtx.lineTo(snakeCanvas.width, i * cell);
      snakeCtx.stroke();
    }

    snakeCtx.fillStyle = "#71d19a";
    state.snake.forEach((part, idx) => {
      snakeCtx.fillStyle = idx === 0 ? "#9be3ba" : "#71d19a";
      snakeCtx.fillRect(part.x * cell + 2, part.y * cell + 2, cell - 4, cell - 4);
    });

    snakeCtx.fillStyle = "#f08b8b";
    snakeCtx.beginPath();
    snakeCtx.arc(
      state.food.x * cell + cell / 2,
      state.food.y * cell + cell / 2,
      cell / 2.8,
      0,
      Math.PI * 2
    );
    snakeCtx.fill();
  };

  const updateHud = () => {
    scoreEl.textContent = String(state.score);
    bestEl.textContent = String(state.best);
    speedEl.textContent = state.speed <= 90 ? "Hızlı" : "Orta";
  };

  const gameOver = () => {
    state.running = false;
    clearInterval(state.timer);
    msgEl.textContent = `Oyun bitti. Skor: ${state.score}`;
  };

  const step = () => {
    state.dir = { ...state.nextDir };
    const head = state.snake[0];
    const next = { x: head.x + state.dir.x, y: head.y + state.dir.y };

    if (next.x < 0 || next.y < 0 || next.x >= size || next.y >= size) {
      gameOver();
      return;
    }

    if (state.snake.some((s) => s.x === next.x && s.y === next.y)) {
      gameOver();
      return;
    }

    state.snake.unshift(next);

    if (next.x === state.food.x && next.y === state.food.y) {
      state.score += 10;
      if (state.score > state.best) {
        state.best = state.score;
        localStorage.setItem(bestKey, String(state.best));
      }
      if (state.speed > 90 && state.score % 40 === 0) {
        state.speed -= 5;
        clearInterval(state.timer);
        state.timer = setInterval(step, state.speed);
      }
      spawnFood();
    } else {
      state.snake.pop();
    }

    updateHud();
    draw();
  };

  const reset = () => {
    clearInterval(state.timer);
    state.running = false;
    state.score = 0;
    state.speed = 120;
    state.dir = { x: 1, y: 0 };
    state.nextDir = { x: 1, y: 0 };
    state.snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    spawnFood();
    msgEl.textContent = "Kontrol: Yön tuşları (↑ ↓ ← →).";
    updateHud();
    draw();
  };

  const start = () => {
    if (state.running) return;
    state.running = true;
    msgEl.textContent = "Oyun başladı.";
    state.timer = setInterval(step, state.speed);
  };

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") setDir(0, -1);
    if (e.key === "ArrowDown") setDir(0, 1);
    if (e.key === "ArrowLeft") setDir(-1, 0);
    if (e.key === "ArrowRight") setDir(1, 0);
  });

  upBtn?.addEventListener("click", () => setDir(0, -1));
  downBtn?.addEventListener("click", () => setDir(0, 1));
  leftBtn?.addEventListener("click", () => setDir(-1, 0));
  rightBtn?.addEventListener("click", () => setDir(1, 0));
  startBtn?.addEventListener("click", start);
  resetBtn?.addEventListener("click", reset);

  reset();
}
