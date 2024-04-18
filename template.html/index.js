let player;
let zombies = [];
let playerLives = 3;
let ImageZombie;
let ImageSurvivant;
let lastSpawnTime = 0;
let spawnDelay = 1000;

function preload() {
  ImageZombie = loadImage('[removal.ai]_a2f6fc48-1e53-4dd7-9aac-f698a64786d5-zombzomb.png');
  ImageSurvivant = loadImage('[removal.ai]_44584a0c-ccce-47d6-b319-183254945aa8-image.png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  player = new Player(20, height - 373, 50);
}

function draw() {
  background(220);
  
  player.display();
  player.move();

  let currentTime = millis();
  
  if (currentTime - lastSpawnTime > spawnDelay) {
    zombies.push(new Zombie(width, player.y, 50));
    lastSpawnTime = currentTime;
  }

  for (let i = zombies.length - 1; i >= 0; i--) {
    zombies[i].display();
    zombies[i].move();
    
    if (zombies[i].hits(player)) {
      playerLives--;
      zombies.splice(i, 1);
      if (playerLives <= 0) {
        noLoop();
        console.log("Game Over!");
      }
    }
  }

  fill(0);
  textSize(20);
  text(`Lives: ${playerLives}`, 10, 30);
}

class Player {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = 5;
  }

  display() {
    image(ImageSurvivant, this.x, this.y, this.size, this.size);
  }

  move() {
    if (keyIsDown(LEFT_ARROW)) this.x -= this.speed;
    if (keyIsDown(RIGHT_ARROW)) this.x += this.speed;
    if (keyIsDown(UP_ARROW)) this.y -= this.speed;
    if (keyIsDown(DOWN_ARROW)) this.y += this.speed;
  }
}

class Zombie {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = 3;
  }

  display() {
    image(ImageZombie, this.x, this.y, this.size, this.size);
  }

  move() {
    this.x -= this.speed;
  }

  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size / 2 + player.size / 2;
  }
}
