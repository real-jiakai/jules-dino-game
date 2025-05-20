// Image assets - TODO: Load actual images
// const dinoImage = new Image();
// dinoImage.src = 'assets/dino.png'; // Example
// const cactusImage = new Image();
// cactusImage.src = 'assets/cactus.png'; // Example

// 1. Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 200;

// 2. Dinosaur Object/Class
class Dinosaur {
    constructor() {
        this.x = 50;
        this.y = canvas.height - 40; // Ground level
        this.width = 40;
        this.height = 40;
        this.velocityY = 0;
        this.isJumping = false;
        this.jumpStrength = 12; // Adjusted jump strength
        this.gravity = 0.7; // Adjusted gravity
    }

    draw(ctx) {
        // Check if dinoImage is loaded and ready
        if (typeof dinoImage !== 'undefined' && dinoImage.complete && dinoImage.naturalHeight !== 0) {
            ctx.drawImage(dinoImage, this.x, this.y, this.width, this.height);
        } else {
            // Fallback drawing
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.velocityY = -this.jumpStrength;
        }
    }

    update() {
        if (this.isJumping) {
            this.y += this.velocityY;
            this.velocityY += this.gravity;

            // Landed
            if (this.y + this.height >= canvas.height) {
                this.y = canvas.height - this.height;
                this.isJumping = false;
                this.velocityY = 0;
            }
        }
    }
}

// 3. Game Variables and Initialization
const dino = new Dinosaur();
let obstacles = [];
let gameSpeed = 4; // Adjusted initial game speed
let gameSpeedIncrease = 0.001; // Rate at which game speed increases
let obstacleSpawnInterval = 1200; // Adjusted base spawn interval
let timeToNextSpawn = obstacleSpawnInterval;
let lastTime = 0;
let score = 0;
let isGameOver = false;
let animationFrameId = null;
const scoreDisplay = document.getElementById('score');


// 4. Obstacle Class
class Obstacle {
    constructor(x, y, width, height) { // Updated constructor
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        // Check if cactusImage is loaded and ready
        if (typeof cactusImage !== 'undefined' && cactusImage.complete && cactusImage.naturalHeight !== 0) {
            ctx.drawImage(cactusImage, this.x, this.y, this.width, this.height);
        } else {
            // Fallback drawing
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update() {
        this.x -= gameSpeed;
    }
}

// 5. Obstacle Spawning Logic
function spawnObstacle() {
    const baseWidth = 20;
    const baseHeight = 30;
    const widthVariation = 15; // Allows width to be 20 to (20+15)=35
    const heightVariation = 30; // Allows height to be 30 to (30+30)=60

    const obsWidth = baseWidth + Math.random() * widthVariation;
    const obsHeight = baseHeight + Math.random() * heightVariation;
    const obsX = canvas.width;
    const obsY = canvas.height - obsHeight; // Ensure it's on the ground

    const newObstacle = new Obstacle(obsX, obsY, obsWidth, obsHeight);
    obstacles.push(newObstacle);
}

// 6. Collision Detection Logic
function checkCollision(dino, obstacle) {
    return (
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.width > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.height > obstacle.y
    );
}

// 7. Game Over Logic
function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(animationFrameId);
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over! Press Space to Restart', canvas.width / 2, canvas.height / 2);
}

// 8. Restart Game Logic
function restartGame() {
    dino.y = canvas.height - dino.height;
    dino.velocityY = 0;
    dino.isJumping = false;
    obstacles = [];
    score = 0;
    timeToNextSpawn = obstacleSpawnInterval;
    isGameOver = false;
    lastTime = 0; // Reset lastTime for deltaTime calculation
    scoreDisplay.textContent = 'Score: 0';
    animationFrameId = requestAnimationFrame(gameLoop);
}

// 9. Input Handling
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        if (isGameOver) {
            restartGame();
        } else {
            dino.jump();
        }
    }
});

// 10. Game Loop
function gameLoop(currentTime) {
    // Calculate delta time
    if (!lastTime) { // Handle the first frame
        lastTime = currentTime;
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
    }
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw the dinosaur
    dino.update();
    dino.draw(ctx);

    // Obstacle Spawning
    if (deltaTime > 0) {
        timeToNextSpawn -= deltaTime;
        if (timeToNextSpawn <= 0) {
            spawnObstacle();
            timeToNextSpawn = obstacleSpawnInterval + Math.random() * 600 - 300; // Adjusted spawn time randomness
        }
    }

    // Update, draw, and check collision for obstacles
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        obstacle.update();
        
        if (checkCollision(dino, obstacle)) {
            gameOver();
            return; // Stop current frame processing
        }
        obstacle.draw(ctx);
    }

    // Remove off-screen obstacles
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    // Update Score
    if (!isGameOver) {
        score++;
        scoreDisplay.textContent = 'Score: ' + score;
        gameSpeed += gameSpeedIncrease; // Increase game speed
    }

    // Request the next frame
    if (!isGameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// Start the game loop only if not in a test environment
if (typeof __IS_TEST_ENVIRONMENT === 'undefined' || !__IS_TEST_ENVIRONMENT) {
    animationFrameId = requestAnimationFrame(gameLoop);
}

/*
Suggested Image Assets (to be placed in assets/ directory):
- dino.png (for the player character)
- cactus_small.png (for small cacti obstacles)
- cactus_large.png (for large cacti obstacles)
- bird.png (for flying obstacles - future enhancement)
- ground.png (for a repeating ground texture - future enhancement)
*/
