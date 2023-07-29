// const canvas = document.getElementById("game");
// const ctx = canvas.getContext("2d");
// //Set the width & height of the canvas to match the viewport dimensions
// canvas.width = innerWidth;
// canvas.height = innerHeight;
// //Get access to the sprite sheet
// const subZeroSpriteSheet = new Image();
// subZeroSpriteSheet.src = "assets/player1/Idle.png";
// subZeroSpriteSheet.onload = loadImages;
// //There are 7 different sprites on 2 rows
// let cols = 8;
// //Work out the size of individual sprites because they are evenly spaced apart
// let spriteWidth = subZeroSpriteSheet.width / cols;
// let spriteHeight = subZeroSpriteSheet.height
// //So increased image size can still retain its pixel art style
// ctx.webkitImageSmoothingEnabled = false;
// ctx.imageSmoothingEnabled = false;
// //So the animation can play
// let totalFrames = 8; //Because there are 7 sprites in total. Therefore the animation will take place over 7 frames
// let currentFrame = 0;
// //So the source position can be updated
// let srcX = 0;
// let srcY = 0;
// //Record the number of times the 'animate' function has been called
// let framesDrawn = 0;

// function animate() {
//     ctx.clearRect(0,0,canvas.width,canvas.height); // So the contents of the previous frame can be cleared
//     requestAnimationFrame(animate); //The function will be called repeatedly on each new frame

//     currentFrame = currentFrame % totalFrames; //Work out the current frame of the animation. Remember that 0 counts as the first image of the animation.
//     srcX = currentFrame * spriteWidth; //Src position is updated to show the new sprite image

//     //image, srcX, srcY, srcWidth, srcHeight, destX, destY, destWidth, destHeight
//     ctx.save();

//     ctx.drawImage(subZeroSpriteSheet, srcX, srcY, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);
//     ctx.restore();

//     framesDrawn++;
//     if(framesDrawn >= 5){
//         currentFrame++;
//         framesDrawn = 0;
//     }
// }

// function resizeImage() {
//     let scaleFactor = 4;
//     let midXPos = innerWidth / 2 - (spriteWidth * scaleFactor) / 2;
//     let midYPos = innerHeight / 2 - (spriteHeight * scaleFactor) / 2;
//     ctx.translate(midXPos, midYPos);
//     ctx.scale(scaleFactor, scaleFactor);
// }

// //So the canvas can't be rendered before the image
// let numOfImages = 1;
// function loadImages() {
//     if(--numOfImages > 0) return;
//     animate();
// }

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Animation variables
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

// Function to load images
function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
  // Function to display animations
async function displayAnimation(animationData, action, x, y) {
    const [imageUrl, frames] = animationData[action];
    const image = await loadImage(imageUrl);
    const frameWidth = image.width / frames;
    let currentFrame = 0;
    let framesDrawn = 0;
  
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        image,
        currentFrame * frameWidth,
        0,
        frameWidth,
        image.height,
        x, // Use the provided x-coordinate
        y, // Use the provided y-coordinate
        frameWidth,
        image.height
      );
      framesDrawn++;
      if (framesDrawn >= 5) {
        currentFrame = (currentFrame + 1) % frames;
        framesDrawn = 0;
      }
      requestAnimationFrame(animate);
    }
  
    animate();
  }
  
  
  // Example usage:
  displayAnimation(player1Animation, 'Idle', 0, 0);