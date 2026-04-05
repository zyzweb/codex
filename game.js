const GRID_SIZE = 20;
const TILE_SIZE = 20;
const INITIAL_SPEED = 120;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const restartBtn = document.getElementById('restart-btn');

let snake;
let food;
let direction;
let nextDirection;
let score;
let speed;
let loopId;
let isGameOver;

const highScore = Number(localStorage.getItem('snake-high-score') || 0);
highScoreEl.textContent = String(highScore);

function initGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { ...direction };
  score = 0;
  speed = INITIAL_SPEED;
  isGameOver = false;
  scoreEl.textContent = '0';

  spawnFood();
  clearInterval(loopId);
  loopId = setInterval(gameLoop, speed);
  draw();
}

function spawnFood() {
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

function gameLoop() {
  if (isGameOver) {
    return;
  }

  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  if (isWallCollision(head) || isSelfCollision(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = String(score);
    updateHighScore();
    spawnFood();
    increaseSpeed();
  } else {
    snake.pop();
  }

  draw();
}

function isWallCollision(point) {
  return point.x < 0 || point.y < 0 || point.x >= GRID_SIZE || point.y >= GRID_SIZE;
}

function isSelfCollision(head) {
  return snake.some(segment => segment.x === head.x && segment.y === head.y);
}

function endGame() {
  isGameOver = true;
  clearInterval(loopId);
  draw();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = '16px sans-serif';
  ctx.fillText('点击“重新开始”再来一局', canvas.width / 2, canvas.height / 2 + 26);
}

function updateHighScore() {
  const currentHigh = Number(localStorage.getItem('snake-high-score') || 0);
  if (score > currentHigh) {
    localStorage.setItem('snake-high-score', String(score));
    highScoreEl.textContent = String(score);
  }
}

function increaseSpeed() {
  const newSpeed = Math.max(70, INITIAL_SPEED - Math.floor(score / 50) * 7);
  if (newSpeed !== speed) {
    speed = newSpeed;
    clearInterval(loopId);
    loopId = setInterval(gameLoop, speed);
  }
}

function drawGrid() {
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;

  for (let i = 0; i <= GRID_SIZE; i += 1) {
    const pos = i * TILE_SIZE;

    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';
    ctx.fillRect(segment.x * TILE_SIZE + 1, segment.y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
  });
}

function drawFood() {
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(
    food.x * TILE_SIZE + TILE_SIZE / 2,
    food.y * TILE_SIZE + TILE_SIZE / 2,
    TILE_SIZE / 2.7,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  drawSnake();
}

window.addEventListener('keydown', event => {
  const keyMap = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 }
  };

  const inputDirection = keyMap[event.key];
  if (!inputDirection) {
    return;
  }

  const isReverse =
    inputDirection.x + direction.x === 0 && inputDirection.y + direction.y === 0;

  if (!isReverse) {
    nextDirection = inputDirection;
  }
});

restartBtn.addEventListener('click', initGame);

initGame();
