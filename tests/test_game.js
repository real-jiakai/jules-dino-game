window.gameTests = {};

// Assertion helper
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

// Mocking canvas for tests if not already available (test_runner.html should handle this)
if (typeof canvas === 'undefined') {
    console.warn('Test environment: Mocking canvas for Dinosaur class.');
    window.canvas = { width: 600, height: 200 }; // Mock canvas
}
if (typeof scoreDisplay === 'undefined') {
    console.warn('Test environment: Mocking scoreDisplay.');
    window.scoreDisplay = { textContent: '' }; // Mock scoreDisplay
}


window.gameTests['dinosaur initializes correctly'] = function() {
    const testDino = new Dinosaur();
    assert(testDino.x === 50, "Dinosaur initial x position is incorrect.");
    assert(testDino.y === (canvas.height - testDino.height), "Dinosaur initial y position is incorrect.");
    assert(testDino.width === 40, "Dinosaur initial width is incorrect.");
    assert(testDino.height === 40, "Dinosaur initial height is incorrect.");
    assert(testDino.velocityY === 0, "Dinosaur initial velocityY is incorrect.");
    assert(testDino.isJumping === false, "Dinosaur initial isJumping state is incorrect.");
    assert(testDino.jumpStrength === 12, "Dinosaur jumpStrength is not 12.");
    assert(testDino.gravity === 0.7, "Dinosaur gravity is not 0.7.");
};

window.gameTests['dinosaur jump sets velocity and isJumping state'] = function() {
    const testDino = new Dinosaur();
    testDino.jump();
    assert(testDino.isJumping === true, "Dinosaur isJumping state should be true after jump.");
    assert(testDino.velocityY === -testDino.jumpStrength, "Dinosaur velocityY should be negative jumpStrength after jump.");

    const initialY = testDino.y;
    const initialVelocityY = testDino.velocityY;

    // Simulate a few frames of update
    for (let i = 0; i < 5; i++) {
        testDino.update();
    }

    assert(testDino.y !== initialY, "Dinosaur y position should change after update calls during jump.");
    assert(testDino.velocityY !== initialVelocityY, "Dinosaur velocityY should change due to gravity after update calls.");

    // Let it land
    while(testDino.isJumping) {
        testDino.update();
    }
    assert(testDino.y === (canvas.height - testDino.height), "Dinosaur should be on the ground after landing.");
    assert(testDino.isJumping === false, "Dinosaur isJumping should be false after landing.");
    assert(testDino.velocityY === 0, "Dinosaur velocityY should be 0 after landing.");
};

window.gameTests['obstacle moves left on update'] = function() {
    // Ensure gameSpeed is defined for the test, game.js should make it globally available or provide a way to set it.
    // It is global in game.js
    const initialGameSpeed = window.gameSpeed;
    window.gameSpeed = 3; // Set a predictable game speed for this test

    const testObstacle = new Obstacle(300, canvas.height - 30, 20, 30); // x, y, width, height
    const initialX = testObstacle.x;

    testObstacle.update();
    assert(testObstacle.x < initialX, "Obstacle x position should be less than initial after update.");
    assert(testObstacle.x === (initialX - window.gameSpeed), "Obstacle x moved by an unexpected amount.");

    window.gameSpeed = initialGameSpeed; // Reset game speed
};

window.gameTests['collision detection works correctly'] = function() {
    // checkCollision is globally available from game.js
    const testDino = new Dinosaur(); // Default pos: x=50, y=160, w=40, h=40

    // Case 1: Overlapping
    let collidingObstacle = new Obstacle(testDino.x + testDino.width / 2, testDino.y + testDino.height / 2, 20, 20);
    assert(checkCollision(testDino, collidingObstacle) === true, "Collision should be detected when dino and obstacle overlap.");

    // Case 2: Not overlapping - Obstacle to the right
    let nonCollidingObstacleRight = new Obstacle(testDino.x + testDino.width + 10, testDino.y, 20, 20);
    assert(checkCollision(testDino, nonCollidingObstacleRight) === false, "Collision should not be detected when obstacle is to the right.");

    // Case 3: Not overlapping - Obstacle to the left
    let nonCollidingObstacleLeft = new Obstacle(testDino.x - 20 - 10, testDino.y, 20, 20);
    assert(checkCollision(testDino, nonCollidingObstacleLeft) === false, "Collision should not be detected when obstacle is to the left.");

    // Case 4: Not overlapping - Obstacle above
    let nonCollidingObstacleAbove = new Obstacle(testDino.x, testDino.y - 20 - 10, 20, 20);
    assert(checkCollision(testDino, nonCollidingObstacleAbove) === false, "Collision should not be detected when obstacle is above.");

    // Case 5: Not overlapping - Obstacle below (should not happen if dino is on ground and obstacle is on ground)
    // But let's test for completeness, imagining an obstacle could be 'under' the dino if dino jumped high
    let nonCollidingObstacleBelow = new Obstacle(testDino.x, testDino.y + testDino.height + 10, 20, 20);
    assert(checkCollision(testDino, nonCollidingObstacleBelow) === false, "Collision should not be detected when obstacle is below.");

    // Case 6: Edge case - Just touching on the right
    let touchingObstacleRight = new Obstacle(testDino.x + testDino.width, testDino.y, 20, 20);
    assert(checkCollision(testDino, touchingObstacleRight) === false, "Collision should not be detected when just touching on the right (exclusive boundary).");
    // Adjust for inclusive boundary if checkCollision is inclusive for x + width
    // If checkCollision uses < for x + width vs obstacle.x, then the above is correct.
    // If it uses <= then this test might fail. The current checkCollision:
    // dino.x < obstacle.x + obstacle.width && dino.x + dino.width > obstacle.x ...
    // So, if testDino.x + testDino.width === obstacle.x, it's a collision.
    // Let's refine this test for the specific logic.
    // If obstacle.x is exactly dino.x + dino.width, then dino.x + dino.width > obstacle.x is NOT met.
    // So, the above test for "touching" is correct for non-collision.

    // Case 7: Edge case - Collision: obstacle's right edge is just past dino's left edge
    let barelyColliding = new Obstacle(testDino.x - 10, testDino.y, 20, 20); // obstacle.x = 40, obstacle.x + width = 60. dino.x = 50.
                                                                              // dino.x (50) < obs.x + obs.width (60) -> true
                                                                              // dino.x + dino.width (90) > obs.x (40) -> true
    assert(checkCollision(testDino, barelyColliding) === true, "Collision should be detected for slight overlap from left.");


};

// Log to console that tests are loaded and ready to be run by test_runner.html
console.log("test_game.js loaded, gameTests object populated.");
