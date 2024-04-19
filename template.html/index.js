let player;
let zombies = [];
let playerLives = 3;
let scorebarre = 0;
let ImageZombie;
let ImageSurvivant;
let ImageBoss1;
let projectiles = []; 
let authorizetoshoot = true;
let lastprojectiles = 0;
let projectiledelay = 1;
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

function restartGame() {
  playerLives = 3;
  scorebarre = 0;
  zombies = [];
  projectiles = [];
  loop();
  document.getElementById('game-over').style.display = 'none';
}

function draw() {
  background(220);
  
  player.display();
  player.move();

  projectilethrow();
  zombielogical();
  
  displayInfo();
}

function projectilethrow() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].display();
    projectiles[i].move();
    if (projectiles[i].x > width) {
      projectiles.splice(i, 1);
    } else {
      for (let j = zombies.length - 1; j >= 0; j--) {
        if (projectiles[i] && projectiles[i].hits(zombies[j])) {
          zombies.splice(j, 1);
          projectiles.splice(i, 1);
          scorebarre += 50;
          break;
        }
      }
    }
  }
}

function zombielogical() {
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
        document.getElementById('game-over').style.display = 'block'; // Affiche le message de fin de jeu
      }
    }
  }
}

function displayInfo() {
  fill(0);
  textSize(20);
  text(`Lives: ${playerLives}`, 10, 30);
  text(`Score: ${scorebarre}`, 10, 60);
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
    if (keyIsDown(65) && authorizetoshoot) {
      projectiles.push(new Projectile(this.x + this.size / 2, this.y + this.size / 2));
      lastprojectiles = millis();
      authorizetoshoot = false;
    }
    if (!authorizetoshoot && millis() - lastprojectiles > projectiledelay * 1000) {
      authorizetoshoot = true;
    }
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

class Projectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 10;
    this.speed = 10;
  }

  display() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, this.size, this.size);
  }

  move() {
    this.x += this.speed;
  }

  hits(zombie) {
    let d = dist(this.x, this.y, zombie.x, zombie.y);
    return d < this.size / 2 + zombie.size / 2;
  }
}
class Boss1{
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = 1;
  }
  display() {
    image(ImageBoss1, this.x, this.y, this.size, this.size);
  }

  move() {
    this.x -= this.speed;
  }

  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size / 2 + player.size / 2;
  }

}