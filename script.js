const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;
const paddleSpeed = 6;
const ballSpeed = 5;

let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Player paddle (left side)
const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Computer paddle (right side)
const computerPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballSize,
    dx: ballSpeed,
    dy: ballSpeed,
    speed: ballSpeed
};

// Keyboard input handling
const keys = {
    ArrowUp: false,
    ArrowDown: false
};

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') keys.ArrowUp = true;
    if (e.key === 'ArrowDown') keys.ArrowDown = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') keys.ArrowUp = false;
    if (e.key === 'ArrowDown') keys.ArrowDown = false;
});

// Mouse input handling
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const paddleCenter = playerPaddle.height / 2;
    
    if (mouseY - paddleCenter > 0 && mouseY + paddleCenter < canvas.height) {
        playerPaddle.y = mouseY - paddleCenter;
    } else if (mouseY - paddleCenter <= 0) {
        playerPaddle.y = 0;
    } else {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }
});

// Draw functions
function drawPaddle(paddle, color = '#00d4ff') {
    ctx.fillStyle = color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Update functions
function updatePlayerPaddle() {
    if (keys.ArrowUp && playerPaddle.y > 0) {
        playerPaddle.y -= paddleSpeed;
    }
    if (keys.ArrowDown && playerPaddle.y < canvas.height - playerPaddle.height) {
        playerPaddle.y += paddleSpeed;
    }
}

function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;
    const difficulty = 0.08; // 0.1 = hard, 0.05 = easier

    if (computerCenter < ballCenter - 35) {
        computerPaddle.y = Math.min(
            computerPaddle.y + paddleSpeed * difficulty,
            canvas.height - computerPaddle.height
        );
    } else if (computerCenter > ballCenter + 35) {
        computerPaddle.y = Math.max(
            computerPaddle.y - paddleSpeed * difficulty,
            0
        );
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collisions (top and bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy *= -1;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Paddle collisions
    if (
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.dx *= -1;
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
        
        // Add spin based on paddle hit location
        const hitPos = (ball.y - playerPaddle.y) / playerPaddle.height;
        ball.dy += (hitPos - 0.5) * 4;
    }

    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.dx *= -1;
        ball.x = computerPaddle.x - ball.radius;
        
        // Add spin based on paddle hit location
        const hitPos = (ball.y - computerPaddle.y) / computerPaddle.height;
        ball.dy += (hitPos - 0.5) * 4;
    }

    // Scoring
    if (ball.x < 0) {
        computerScore++;
        computerScoreDisplay.textContent = computerScore;
        resetBall();
    }
    if (ball.x > canvas.width) {
        playerScore++;
        playerScoreDisplay.textContent = playerScore;
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = ballSpeed * (Math.random() > 0.5 ? 1 : -1);
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = 'rgba(26, 26, 46, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawCenterLine();
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle, '#ff006e');
    drawBall();

    // Update game state
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();

    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Start button
startBtn.addEventListener('click', () => {
    gameRunning = true;
    resetBall();
    startBtn.textContent = 'Game Running...';
    startBtn.disabled = true;
    gameLoop();
});

// Initial draw
gameLoop();
