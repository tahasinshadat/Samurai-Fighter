////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                   SAMURAI FIGHTER 
//                   CREATED BY: TAHASIN SHADAT
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                   SETUP
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 1500;
canvas.height = 800;
ctx.clearRect(0, 0, canvas.width, canvas.height);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                   GAME VARIABLES
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let player1;
let player2;
const gravity = 0.75;
const roundTime = 90; // REMINDER: should be a minute 30 in actual game
let timerSeconds = roundTime; 
let healthbar;

const player1_Damage_Output = 0.55;
const player2_Damage_Output = 0.50;
let P1_Damage_Output = player1_Damage_Output;
let P2_Damage_Output = player2_Damage_Output;

const playerVitality = 100;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                   ANIMATION VARIABLES / PLAYER SPRITES
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let player1Animation = {
    Attack1: ['assets/player1/Attack1.png', 6],
    Attack2: ['assets/player1/Attack2.png', 6],
    Death: ['assets/player1/Death.png', 6],
    Fall: ['assets/player1/Fall.png', 2],
    Idle: ['assets/player1/Idle.png', 8],
    Jump: ['assets/player1/Jump.png', 2],
    Run: ['assets/player1/Run.png', 8],
    TakeDamage: ['assets/player1/Take Hit.png', 4]
};

let player2Animation = {
    Attack1: ['assets/player2/Attack1.png', 4],
    Attack2: ['assets/player2/Attack2.png', 4],
    Death: ['assets/player2/Death.png', 7],
    Fall: ['assets/player2/Fall.png', 2],
    Idle: ['assets/player2/Idle.png', 4],
    Jump: ['assets/player2/Jump.png', 2],
    Run: ['assets/player2/Run.png', 8],
    TakeDamage: ['assets/player2/Take hit.png', 3]
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                   HELPER FUNCTIONS
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function random (min, max) {
    return Math.random() * (max - min) + min
}

function randomInt (min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function signOff() {
    ctx.fillStyle = 'black';
    ctx.fillRect(canvas.width-375, canvas.height-40, 375, 40);
    ctx.font = "25px Arial";
    ctx.fillStyle = 'white';
    ctx.fillText("Created By: Tahasin Shadat", canvas.width-190, canvas.height-20);   
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                   IMAGE PROCESSSING LOGIC
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
}

async function preloadImages(imageUrls) {
    const imagePromises = imageUrls.map(loadImage);
    return Promise.all(imagePromises);
}

function imageload(imagePath) {
    let img = new Image();
    img.src = imagePath;
    return img;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                   CLASSES
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Round 1 Variables:
let round1Data;

//Round 2 variables:
let round2Data;

class Bar {
    constructor(player1, player2, player1Wins, player2Wins, tiedRounds, elapsedRounds) {
        this.player1Health = player1.health;
        this.player2Health = player2.health;
        this.timerColor = 'orange';
        this.player1Wins = player1Wins;
        this.player2Wins = player2Wins;
        this.tiedRounds = tiedRounds;
        this.elapsedRounds = elapsedRounds;

        this.winData = [];

        // To have circles at the top to display your progress
        if (this.elapsedRounds == 2) {
            let data = [this.player1Wins, this.player2Wins, this.tiedRounds]
            this.winData[0] = data;
        } 
        if (this.elapsedRounds == 3) {
            let data = [this.player1Wins, this.player2Wins, this.tiedRounds]
            this.winData[1] = data;
        }

    }

    drawPlayer1Health() {
        if (this.player1Health > 0) {
            ctx.fillStyle = 'black';
            ctx.fillRect(70, 37.5, canvas.width/2 - 105, 50);
            ctx.fillStyle = 'red';
            ctx.fillRect(75, 42.5, canvas.width / 2 - 115, 40);
            ctx.fillStyle = 'blue';
            // Complex Logic to make the bar lose width and move orgin spot to make it seem like the health bar is depleteing the other way
            ctx.fillRect(75 + (canvas.width / 2 - 115) * (1 - this.player1Health / 100), 42, (canvas.width / 2 - 115) * (this.player1Health / 100), 41);
        } else {
            // Stop healthbar from depleteing past 0 health
            ctx.fillStyle = 'black';
            ctx.fillRect(70, 37.5, canvas.width/2 - 105, 50);
            ctx.fillStyle = 'red';
            ctx.fillRect(75, 42.5, canvas.width / 2 - 115, 40);
        }
    }

    drawPlayer2Health() {
        if (this.player2Health > 0) {
            ctx.fillStyle = 'black';
            ctx.fillRect(canvas.width/2 + 35, 37.5, canvas.width/2 - 105, 50);
            ctx.fillStyle = 'red';
            ctx.fillRect(canvas.width / 2 + 40, 42.5, canvas.width / 2 - 115, 40);
            ctx.fillStyle = 'purple';
            // Decrease rect/bar width to create depleteing healthbar affect
            ctx.fillRect(canvas.width / 2 + 40, 42, (canvas.width / 2 - 115) * (this.player2Health / 100), 41);
        } else { 
            // Stop healthbar from depleteing past 0 health
            ctx.fillStyle = 'black';
            ctx.fillRect(canvas.width/2 + 35, 37.5, canvas.width/2 - 105, 50);
            ctx.fillStyle = 'red';
            ctx.fillRect(canvas.width / 2 + 40, 42.5, canvas.width / 2 - 115, 40);
        }
    }

    drawTimer() {
        ctx.fillStyle = 'black';
        ctx.fillRect(canvas.width/2 - 37.5, 25, 75, 75);
        ctx.fillStyle = this.timerColor;
        ctx.fillRect(canvas.width/2 - 32.5, 30, 65, 65);
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatTime(timerSeconds), canvas.width/2, 63); // Update the displayed timer
    }

    drawEmptyCircle(centerX, centerY) {
        const radius = 15;
        const lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }

    drawColoredCircle(centerX, centerY, color) {
        const radius = 15;
        const lineWidth = 0;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = lineWidth;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();
    }

    drawPlayerRoundWins() {
        const yPos = 110;
        const spacing = 50;
        let initialPlayer1CircleX = 88;
        let initialPlayer2CircleX = 1310;

        // Player 1
        this.drawEmptyCircle(initialPlayer1CircleX, yPos); // Round 1 Circle for player 1
        this.drawEmptyCircle(initialPlayer1CircleX + spacing, yPos); // Round 2 Circle for player 1
        this.drawEmptyCircle(initialPlayer1CircleX + spacing * 2, yPos); // Round 3 Circle for player 1

        // Player 2
        this.drawEmptyCircle(initialPlayer2CircleX + spacing * 2, yPos); // Round 1 Circle for player 2
        this.drawEmptyCircle(initialPlayer2CircleX + spacing, yPos); // Round 2 Circle for player 2
        this.drawEmptyCircle(initialPlayer2CircleX, yPos); // Round 3 Circle for player 2

        // Draws White circle for current round
        if (this.elapsedRounds >= 1) {
            this.drawColoredCircle(initialPlayer1CircleX, yPos, 'white');
            this.drawColoredCircle(initialPlayer2CircleX + spacing * 2, yPos, 'white');
        } 
        if (this.elapsedRounds >= 2) {
            this.drawColoredCircle(initialPlayer1CircleX + spacing, yPos, 'white');
            this.drawColoredCircle(initialPlayer2CircleX + spacing, yPos, 'white');
        } 
        if (this.elapsedRounds >= 3) {
            this.drawColoredCircle(initialPlayer1CircleX + spacing * 2, yPos, 'white');
            this.drawColoredCircle(initialPlayer2CircleX, yPos, 'white');
        }

        // WinData's format -> [this.player1Wins, this.player2Wins, this.tiedRounds]
        
        // Assign data that doesnt get updated once set. This is because the update function constantly updates winData to be up to par with the CURRENT round and therefore erasing previous round data.
        if (this.winData.length == 1) {
            if (round1Data === undefined) {
                round1Data = this.winData[0];
            }
        }

        // To get round 2's data only, not a mix of multiple previous data.
        if (this.winData.length > 1) {
            if (round2Data === undefined) {
                round2Data = this.winData[1];
                let final = [];
                for (let i = 0; i < round1Data.length; i++) {
                    final.push(round2Data[i] - round1Data[i]);
                }
                round2Data = final;
            }
        }

        // TO not cause error during first round
        if (round1Data != undefined) {

            this.drawColoredCircle(
                initialPlayer1CircleX,
                yPos,
                round1Data[0] > round1Data[1] ? 'green' : round1Data[0] === round1Data[1] ? 'yellow' : 'red'
            );
            this.drawColoredCircle(
                initialPlayer2CircleX + spacing * 2,
                yPos,
                round1Data[1] > round1Data[0] ? 'green' : round1Data[1] === round1Data[0] ? 'yellow' : 'red'
            );

        }

        if (round2Data != undefined) {

            this.drawColoredCircle(
                initialPlayer1CircleX + spacing,
                yPos,
                round2Data[0] > round2Data[1] ? 'green' : round2Data[0] === round2Data[1] ? 'yellow' : 'red'
            );
            this.drawColoredCircle(
                initialPlayer2CircleX + spacing,
                yPos,
                round2Data[1] > round2Data[0] ? 'green' : round2Data[1] === round2Data[0] ? 'yellow' : 'red'
            );

        }


    }

    drawNames() {
        ctx.font = '25px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('RONIN', canvas.width/2 - 90, 63);
        ctx.fillText('HIROSHI', canvas.width/2 + 100, 63); 
    }

    Animate() {
        this.drawPlayer1Health();
        this.drawPlayer2Health();
        this.drawTimer();
        this.drawNames();
        this.drawPlayerRoundWins();
    }
}

class Player {
    constructor(x, y, width, height, color, animationData, image, frameWidth, frames) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.health = playerVitality;
        this.yVelocity = 0;
        this.xVelocity = 0;
        this.speed = 7;
        this.jumping = false;
        this.jumpPower = 25;
        this.attackBoxOffsetX = 65;
        this.right = true;
        this.attacking = false;
        this.attackCooldown = 1000; // 1.0 seconds in milliseconds
        this.lastAttackTime = 0;

        // Animation/Visual variables
        this.animationData = animationData;
        this.nextAttack = 'Attack1';
        this.image = image;
        this.action = 'Idle'; 
        this.frameWidth = frameWidth; // To help split sprite up
        this.frames = frames; 
        this.currentFrame = 0; // To help iterate through frames
        this.framesDrawn = 0; // To control frame iteration speed
        this.takingDamage = false;

        // End Game Logic
        this.dead = false;
        this.tied = false;
        
    }
    
    Draw() {
        // Show Hitbox's
        // ctx.fillStyle = this.color;
        // ctx.fillRect(this.x, this.y, this.width, this.height);

        // Display Samurais
        if (!this.right) {
            // Flip the sprite horizontally if facing left
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.image,
                this.currentFrame * this.frameWidth,
                0,
                this.frameWidth,
                this.image.height,
                -this.x - this.width - 225, // Adjust the x-coordinate to flip the sprite
                this.y - 205,
                this.frameWidth + 300,
                this.image.height + 300
            );
            ctx.restore();
        } else {
            // Draw normally if facing right
            ctx.drawImage(
                this.image,
                this.currentFrame * this.frameWidth,
                0,
                this.frameWidth,
                this.image.height,
                this.x - 225,
                this.y - 205,
                this.frameWidth + 300,
                this.image.height + 300
            );
        }

        // Iterate through the frames
        this.framesDrawn++;
        if (this.framesDrawn >= 5) {
            if (!this.dead) {
                this.currentFrame = (this.currentFrame + 1) % this.frames;
            } else if (this.currentFrame != this.frames - 1) {
                this.currentFrame++
            }
            this.framesDrawn = 0;
        }

    }
    
    DrawAttackBox() {
        // ctx.fillStyle = 'black';
        // if (this.right) {
        //     ctx.fillRect(this.x + this.attackBoxOffsetX, this.y + this.height/7, this.width + 120, this.height/1.5);
        // } else {
        //     ctx.fillRect(this.x - this.attackBoxOffsetX - 120, this.y + this.height/7, this.width + 120, this.height/1.5);
        // }
    }
    
    get attackHitbox() {
        return {
            x: this.x + (this.right ? this.attackBoxOffsetX : -this.attackBoxOffsetX - 120),
            y: this.y + this.height / 7,
            width: this.width + 120,
            height: this.height / 1.5,
        };
    }

    Animate() {
        // gravity + floor
        if (this.y >= 546) {
            this.yVelocity = 0;
            this.y = 546;
        } else {
            this.yVelocity += gravity;
        }

        // Off the left side of Map
        if (this.x <= -this.width/2) {
            this.x = -this.width/2;
        } 
        // Off the right side of Map
        if (this.x >= canvas.width - this.width/2) {
            this.x = canvas.width - this.width/2;
        } 

        // Jumping
        if (this.jumping) {
            this.yVelocity = -this.jumpPower;
            this.jumping = false;
        }
        if (this.y <= 250) this.jumping = false;

        // Move the player
        this.x += this.xVelocity;
        this.y += this.yVelocity;

        if (this.attacking) {
            const currentTime = Date.now();
            if (currentTime - this.lastAttackTime >= 500) {
                this.attacking = false;
            }
        }

        // Animation changes
        if (!this.dead) {
            if (this.xVelocity === 0 && this.yVelocity === 0) this.action = 'Idle';
            if (this.xVelocity !== 0 ) this.action = 'Run'
            if (this.yVelocity > 0) this.action = 'Fall';
            if (this.yVelocity < 0) this.action = 'Jump';
            if (this.takingDamage) this.action = 'TakeDamage';
            if (this.attacking) this.action = this.nextAttack; // Switches between 2 attacks
            if (this.health <= 0) this.dead = true;
        } else {
            this.action = 'Death'; 
            this.xVelocity = 0;
            this.yVelocity = 0;   
            this.speed = 0;
            this.jumpPower = 0;
            this.right = null;
        }

        this.Draw();
        this.DrawAttackBox();
    }

    jump() {
        // Can only jump if player is on the floor
        if (this.y >= 546) {
            this.jumping = true;
            this.yVelocity = -this.jumpPower;
            // console.log('jumping');
        }
    }


    isColliding(enemy) {
        const attackBox = this.attackHitbox;
        if (enemy.dead) return false;
        if (this.dead) return false;
        if (enemy.tied) return false;
        if (this.tied) return false;
        return (
            attackBox.x < enemy.x + enemy.width &&
            attackBox.x + attackBox.width > enemy.x &&
            attackBox.y < enemy.y + enemy.height &&
            attackBox.y + attackBox.height > enemy.y
        );
    }

    canAttack() {
        // Check if enough time has passed since the last attack
        return Date.now() - this.lastAttackTime >= this.attackCooldown;
    }

    attack() {
        if (this.canAttack()) {
            this.lastAttackTime = Date.now();
            this.attacking = true;
            // console.log('Attacking!!');
        }
    }

    reset(x, y, width, height, color, animationData, image, frameWidth, frames) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.health = 100;
        this.yVelocity = 0;
        this.xVelocity = 0;
        this.speed = 7;
        this.jumping = false;
        this.jumpPower = 25;
        this.attackBoxOffsetX = 65;
        this.right = true;
        this.attacking = false;
        this.attackCooldown = 1000; // ATTACK COOLDOWN
        this.lastAttackTime = 0;

        // Animation/Visual variables
        this.animationData = animationData;
        this.nextAttack = 'Attack1';
        this.image = image;
        this.action = 'Idle'; 
        this.frameWidth = frameWidth; // To help split sprite up
        this.frames = frames; 
        this.currentFrame = 0; // To help iterate through frames
        this.framesDrawn = 0; // To control frame iteration speed
        this.takingDamage = false;

        // End Game Logic
        this.dead = false;
        this.tied = false;
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                   MAIN - GAME SETUP + GAME START + GAME MAINTENANCE
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let gameStart = false;

function setup() {
    let backgroundImage = new Image();
    backgroundImage.src = 'assets/background/gateBG.gif';
    backgroundImage.onload = function() {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Samurai Fighter', canvas.width / 2, canvas.height / 3);
        ctx.fillStyle = 'yellow';
        ctx.font = '30px Arial';
        ctx.fillText('Press Enter to Begin your Duel', canvas.width / 2, canvas.height / 2);
        hideLoadingAnimation();
    };

    // Wait for the Enter key press to start the game
    document.addEventListener('keydown', startGameOnEnter);
}

async function startGame() {
    // Load all the images before starting the game
    const imageUrls = Object.values(player1Animation)
      .concat(Object.values(player2Animation))
      .map((animation) => animation[0]);
    await preloadImages(imageUrls);

    let one = await displayAnimation(player1Animation, 'Idle');
    let two = await displayAnimation(player2Animation, 'Idle');
    //                   (x, y, width, height, color, animationData, image, frameWidth, frames)
    player1 = new Player(200, 50, 50, 100, 'blue', player1Animation, one[0], one[1], one[2]);
    player2 = new Player(1250, 50, 50, 100, 'red', player2Animation, two[0], two[1], two[2]);
    player2.right = false;
    player2.attackCooldown = 900; // Player 2 has a higher attack speed by 0.1 seconds because he has less frames in his attack. But to make up, Player 1 has a higher attack damage

    setInterval(updateTimer, 1000);
    incrementElapsedRound();
    update();
}

async function update() {
    // Start with a fresh canvas after every frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageload('assets/background/rooftopBG.jpg'), 0, 0, canvas.width, canvas.height);
    signOff();
    displayRound(displayTime);
    
    healthbar = new Bar(player1, player2, player1Wins, player2Wins, tiedRounds, elapsedRounds);
    healthbar.Animate();

    // Updates the players animation based on their actions
    changeAnimation(player1, player1.action, player1Animation);
    changeAnimation(player2, player2.action, player2Animation);

/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        Attacking + Health Depletion Logic:

        -> Player 1 does more damage because his attack animation is longer so he has a slower attack speed
        -> Player 2 does less damage because his attack animation is shorter meaning he has a faster attack speed
        Thus:
        -> Player 1 takes 6 FULL ATTACKS to kill Player 2
        -> Player 2 takes 7 FULL ATTACKS to kill Player 1

        Semi-Attacks:
        -> Semi-Attacks are when the player or other player moves outside of the attack hit range mid attack.
        --> this leads to the attack doing only a certain PERCENTAGE of the full damage 

        Example:
        ----> SCENARIO: Player 1 attacks and Player 2 leaves Player 1's attack range after 75% of the animation
        ----> RESULT: Player 2 will recieve 75% of the damage Player 1 can output

*/ /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    if (player1.isColliding(player2) && player1.attacking) {

        // console.log('blue attacking red');
        player2.health -= P1_Damage_Output;
        player2.takingDamage = true;

    } else player2.takingDamage = false;

    if (player2.isColliding(player1) && player2.attacking) {

        // console.log('red attacking blue');
        player1.health -= P2_Damage_Output;
        player1.takingDamage = true;
        
    } else player1.takingDamage = false;


    // Check Loss
    if (isRoundEnded()) {
        endRound();
    } 

    player1.Animate();
    player2.Animate();

    displayTime++;
    requestAnimationFrame(update);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                   TIMER LOGIC
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function formatTime(seconds) {
    return `${seconds.toString().padStart(2, '0')}`;
}

function updateTimer() {
    if (timerSeconds > 0) {
        timerSeconds -= 1;
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                   ANIMATION LOGIC
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function displayAnimation(animationData, action) {
    const [imageUrl, frames] = animationData[action];
    const image = await loadImage(imageUrl);
    const frameWidth = image.width / frames;
    return [image, frameWidth, frames]
}

async function changeAnimation(player, animation, animationDict) {
    let change = await displayAnimation(animationDict, animation);
    player.image = change[0]
    player.frameWidth = change[1]
    player.frames = change[2];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                   HANDLE DEATH + ROUND INCREMENTING LOGIC
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let player1Wins = 0;
let player2Wins = 0;
let tiedRounds = 0;
let elapsedRounds = 0;
const totalRounds = 3;

function endRound() {
    if (player1.health > player2.health) {

        // console.log('Player 1 wins!');
        player2.dead = true;
        player2.action = 'Death'; 
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Samurai 1 (Ronin) wins Round ${elapsedRounds}!`, canvas.width / 2, canvas.height / 2);
        incrementPlayer1Win();

    } else if (player2.health > player1.health) {

        player1.dead = true;
        player1.action = 'Death'; 
        // console.log("Player 2 wins!");
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Samurai 2 (Hiroshi) wins Round ${elapsedRounds}!`, canvas.width / 2, canvas.height / 2);
        incrementPlayer2Win();

    } else {

        // console.log('Tie!');
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Round ${elapsedRounds} is a DRAW!`, canvas.width / 2, canvas.height / 2);
        player1.tied = true;
        player2.tied = true;
        incrementTiedRound();

    }
    
    
    if (isGameOver()) {

        healthbar.Animate();   
        endGame();
        

    } else {

        setTimeout(() => {
            reset();
            incrementElapsedRound();
        /* 
            Because there is a delay due to loading, preparing, and processing the animations, add 
            a loading screen to let the player know the game is loading and it's not just frozen
        */
            showLoadingAnimation();
        }, 3000);

    }
}

function endGame() {
    if (player1Wins > player2Wins) {

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageload('assets/background/rooftopBG.jpg'), 0, 0, canvas.width, canvas.height);
        signOff();
        player2.dead = true;
        player2.action = 'Death'; 
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Samurai 1 (Ronin) Wins!', canvas.width / 2, canvas.height / 2);

    } else if (player2Wins > player1Wins) {

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageload('assets/background/rooftopBG.jpg'), 0, 0, canvas.width, canvas.height);
        signOff();
        player1.dead = true;
        player1.action = 'Death'; 
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Samurai 2 (Hiroshi) Wins!', canvas.width / 2, canvas.height / 2);

    } else {

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageload('assets/background/rooftopBG.jpg'), 0, 0, canvas.width, canvas.height);
        signOff();
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('The Game is a DRAW!', canvas.width / 2, canvas.height / 2);
        player1.tied = true;
        player2.tied = true;

    }
    promptRestart();
}

function isRoundEnded() {
    return timerSeconds === 0 || player1.health <= 0 || player2.health <= 0;
}

function isGameOver() {
    return elapsedRounds >= totalRounds || player1Wins == 2 || player2Wins == 2;
}

function promptRestart() {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 1.6);
    signOff();
    gameStart = false;
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !gameStart) {
            showLoadingAnimation()
            location.reload(); // Refresh Page LOL -> I was too lazy to write more code to actually restart it
        }
    });
}

// Had to use a few functions that can't be called so many times because update kept on spamming the round incrementation making the rounds increment in increments of 183+
// These functions can only be called once every 7.5 seconds (the fastest you can kill the other samurai)
let lastIncrementTime_ElapsedRound = 0;
function incrementElapsedRound() {
    const currentTime = new Date().getTime();
    if (currentTime - lastIncrementTime_ElapsedRound >= 7500) { // Check if 10 seconds have passed
        elapsedRounds++;
        lastIncrementTime_ElapsedRound = currentTime;
    }
}

let lastIncrementTime_TiedRound = 0;
function incrementTiedRound() {
    const currentTime = new Date().getTime();
    if (currentTime - lastIncrementTime_TiedRound >= 7500) { // Check if 10 seconds have passed
        tiedRounds++;
        lastIncrementTime_TiedRound = currentTime;
    }
}

let lastIncrementTime_Player2Win = 0;
function incrementPlayer2Win() {
    const currentTime = new Date().getTime();
    if (currentTime - lastIncrementTime_Player2Win >= 7500) { // Check if 10 seconds have passed
        player2Wins++;
        lastIncrementTime_Player2Win = currentTime;
    }
}

let lastIncrementTime_Player1Win = 0;
function incrementPlayer1Win() {
    const currentTime = new Date().getTime();
    if (currentTime - lastIncrementTime_Player1Win >= 7500) { // Check if 10 seconds have passed
        player1Wins++;
        lastIncrementTime_Player1Win = currentTime;
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                   RESETTING + DISPLAY ROUNDS + LOADING ANIMATION
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let displayTime = 0;

async function reset() {
    const imageUrls = Object.values(player1Animation)
      .concat(Object.values(player2Animation))
      .map((animation) => animation[0]);
    await preloadImages(imageUrls);

    let one = await displayAnimation(player1Animation, 'Idle');
    let two = await displayAnimation(player2Animation, 'Idle');

    player1.reset(200, -100, 50, 100, 'blue', player1Animation, one[0], one[1], one[2]);
    player2.reset(1250, -115, 50, 100, 'red', player2Animation, two[0], two[1], two[2]);
    player2.right = false;

    displayTime = 0;
    timerSeconds = roundTime;
}

function displayRound(time) {
    if (time < 150) { // Displays for 2.5 seconds because update increases time by 60 every second
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Round ${elapsedRounds}`, canvas.width / 2, canvas.height / 4);    
    }
}

let lastRunTime = 0;
function showLoadingAnimation() {
    const currentTime = new Date().getTime();

    // Check if at least 5 seconds have passed since the last run
    if (currentTime - lastRunTime >= 5000) {
        const loadingElement = document.getElementById('loading');

        // Display the loading animation
        loadingElement.style.display = 'flex';

        // Update the last run time
        lastRunTime = currentTime;

        // After 3 seconds, hide the loading animation
        setTimeout(() => {
            hideLoadingAnimation();
        }, 3000);
    }
}


function hideLoadingAnimation() {
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'none'; 
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                   EVENT LISTENERS OLD & NEW
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let jumpKeyPressed_Player1 = false;
let jumpKeyPressed_Player2 = false;

// OLD:

/*
// Keyboard event listeners to move the player
document.addEventListener('keydown', (event) => {
    if (event.key === 'd') {
        player1.xVelocity = player1.speed; // Player 1 Move right
        player1.right = true;
    } 
    if (event.key === 'ArrowRight') {
        player2.xVelocity = player2.speed; // Player 2 Move right
        player2.right = true;
    } 
    if (event.key === 'a') {
        player1.xVelocity = -player1.speed; // Player 1 Move left
        player1.right = false;
    } 
    if (event.key === 'ArrowLeft') {
        player2.xVelocity = -player2.speed; // Player 2 Move left
        player2.right = false;
    }
    if (event.key === 'w') { // Player 1 - Jump
        if (!jumpKeyPressed_Player1 && player1.y >= 546) {
            jumpKeyPressed_Player1 = true;
            player1.jump(); 
        }
    } 
    if (event.key === 'ArrowUp') { // Player 2 - Jump
        if (!jumpKeyPressed_Player2 && player2.y >= 546) {
            jumpKeyPressed_Player2 = true;
            player2.jump(); 
        }
    }
});
document.addEventListener('keyup', (event) => {
    if (event.key === 'd' || event.key === 'a') {
        player1.xVelocity = 0; // Player 1 - Stop horizontal movement when key is released

    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        player2.xVelocity = 0; // Player 2 - Stop horizontal movement when key is released

    }
    if (event.key === 'w') {
        jumpKeyPressed_Player1 = false; // Player 1 - Reset the jump key press flag

    }
    if (event.key === 'ArrowUp') {
        jumpKeyPressed_Player2 = false; // Player 2 - Reset the jump key press flag
    }
});
// Keyboard event listeners to make the player attack
document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
        player1.attack(); // Blue player attacks
    }
    if (event.key === 'Shift') {
        player2.attack(); // Red player attacks
    }
});
document.addEventListener('keyup', (event) => {
    if (event.key === ' ') {
        player1Attack = false;
        if (player1.nextAttack == 'Attack1') player1.nextAttack = 'Attack2';
        else player1.nextAttack = 'Attack1';
        
    }
    if (event.key === 'Shift') {
        player2Attack = false;
        if (player2.nextAttack == 'Attack1') player2.nextAttack = 'Attack2';
        else player2.nextAttack = 'Attack1';
    }
});
*/

// NEW:
// Tried to do seperate event listeners so that one players movement doesn't take priority!
// Keyboard event listeners to move Player 1
document.addEventListener('keydown', (event) => {
    if (event.key === 'd') {
        player1.xVelocity = player1.speed; // Player 1 Move right
        player1.right = true;

    } else if (event.key === 'a') {
        player1.xVelocity = -player1.speed; // Player 1 Move left
        player1.right = false;

    } else if (event.key === 'w') { // Player 1 - Jump
        if (!jumpKeyPressed_Player1 && player1.y >= 546) {
            jumpKeyPressed_Player1 = true;
            player1.jump();
        }

    } else if (event.key === ' ') {
        player1.attack(); // Player 1 attacks

    }
});
  
document.addEventListener('keyup', (event) => {
    if (event.key === 'd' || event.key === 'a') {
        player1.xVelocity = 0; // Player 1 - Stop horizontal movement when key is released

    } else if (event.key === 'w') {
        jumpKeyPressed_Player1 = false; // Player 1 - Reset the jump key press flag

    } else if (event.key === ' ') {
        player1Attack = false;
        if (player1.nextAttack === 'Attack1') player1.nextAttack = 'Attack2';
        else player1.nextAttack = 'Attack1';

    }
});
  
// Keyboard event listeners to move Player 2
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        player2.xVelocity = player2.speed; // Player 2 Move right
        player2.right = true;

    } else if (event.key === 'ArrowLeft') {
        player2.xVelocity = -player2.speed; // Player 2 Move left
        player2.right = false;

    } else if (event.key === 'ArrowUp') { // Player 2 - Jump
        if (!jumpKeyPressed_Player2 && player2.y >= 546) {
            jumpKeyPressed_Player2 = true;
            player2.jump();
        }

    } else if (event.key === 'Shift') {
        player2.attack(); // Player 2 attacks

    }
});
  
document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        player2.xVelocity = 0; // Player 2 - Stop horizontal movement when key is released

    } else if (event.key === 'ArrowUp') {
        jumpKeyPressed_Player2 = false; // Player 2 - Reset the jump key press flag

    } else if (event.key === 'Shift') {
        player2Attack = false;
        if (player2.nextAttack === 'Attack1') player2.nextAttack = 'Attack2';
        else player2.nextAttack = 'Attack1';

    }
});
  

// Function Name speaks for itself
function startGameOnEnter(event) {
    if (event.key === 'Enter' && !gameStart) {
        // Clear the canvas and start the game
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        startGame();
        gameStart = true;
    
        // Remove the event listener after it's used once
        document.removeEventListener('keydown', startGameOnEnter);
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                   GAMEMODE SWITCHING
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let normalBtn = document.getElementById('normal');
let armorBtn = document.getElementById('armor');
let standoffBtn = document.getElementById('standoff');
normalBtn.classList.toggle('active');

// Reset damage output
normalBtn.onclick = () => {
    normalBtn.classList.add('active');
    armorBtn.classList.remove('active');
    standoffBtn.classList.remove('active');

    // reset basics
    P1_Damage_Output = player1_Damage_Output;
    P2_Damage_Output = player2_Damage_Output;
    if (gameStart) {
        player1.health = 100;
        player2.health = 100;
        timerSeconds = 90;
    }
}

// Decrease damage output or increase health
armorBtn.onclick = () => {
    normalBtn.classList.remove('active');
    armorBtn.classList.add('active');
    standoffBtn.classList.remove('active');

    // reset basics
    if (gameStart) {
        player1.health = 100;
        player2.health = 100;
        timerSeconds = 90;
    }

    // Decrease damage output
    P1_Damage_Output = player1_Damage_Output / 5;
    P2_Damage_Output = player2_Damage_Output / 5;
}

// Increase damage output or decrease health
standoffBtn.onclick = () => {
    normalBtn.classList.remove('active');
    armorBtn.classList.remove('active');
    standoffBtn.classList.add('active');

    // reset basics
    if (gameStart) {
        player1.health = 100;
        player2.health = 100;
        timerSeconds = 90;
    }
    
    // Increase damage output
    P1_Damage_Output = player1_Damage_Output + 10;
    P2_Damage_Output = player2_Damage_Output + 10;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                   FINAL CALL
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
setup();