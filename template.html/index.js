let player;
let boss1spawn = false;
let boss2spawn = false;
let boss3spawn = false;
let boss3dead = false;
let boss3;
let zombies = [];
let playerLives = 3;
let scorebarre = 0;
let ImageZombie;
let ImageSurvivant;
let ImageBOSS;
let ImageBoss2;
let ImageBoss3;
let projectiles = []; 
let authorizetoshoot = true;
let lastprojectiles = 0;
let projectiledelay = 0.3;
let lastSpawnTime = 0;
let spawnDelay = 1000;
let playerTeam = [];
let conversiontozombieally = 0.5;
let placezombieally = {
  front: null,
  top: null,
  bottom: null
};
const orderzombieally = {
  front: { x: 50, y: 0 },
  top: { x: 50, y: -60 },
  bottom: { x: 50, y: 60 }
};

let gameInitialized = false;

function preload() {
  ImageZombie = loadImage('zombie.png');
  ImageZombieAlly = loadImage('zomb.png');
  ImageSurvivant = loadImage('Survivant.png');
  ImageBOSS = loadImage('Boss2.png');
  ImageBoss2 = loadImage('Boss3.png');
  ImageBoss3 = loadImage('Boss1.png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  player = new Player(20, height - 373, 50);
  noLoop();
}

function PlayGame() {
  if (!gameInitialized) {
      gameInitialized = true;
      loop();
  }
}

function restartGame() {
  playerLives = 3;
  scorebarre = 0;
  zombies = [];
  playerTeam = [];
  projectiles = [];
  loop();
  document.getElementById('game-over').style.display = 'none';
}

function draw() {
  background(220);

  player.display();
  player.move();
  updateAllyPositions();

  zombielogical();

  for (let i = 0; i < playerTeam.length; i++) {
    playerTeam[i].attack(zombies);
    playerTeam[i].moveTowardsEnemy(zombies);
    playerTeam[i].display();
  }
  handleZombieCombat();
  projectilethrow();
  displayInfo();
}

function handleZombieCombat() {
  for (let i = zombies.length - 1; i >= 0; i--) {
    for (let j = playerTeam.length - 1; j >= 0; j--) {
      let d = dist(zombies[i].x, zombies[i].y, playerTeam[j].x, playerTeam[j].y);
      if (d < 50) {
        playerTeam[j].health -= zombies[i].damage;
        zombies[i].health -= playerTeam[j].damage;
        if (zombies[i].health <= 0) {
          zombies.splice(i, 1);
          scorebarre += 50;
          continue;
        }
        if (playerTeam[j].health <= 0) {
          for (const [key, zombie] of Object.entries(placezombieally)) {
            if (zombie === playerTeam[j]) {
              placezombieally[key] = null;
              break;
            }
          }
          playerTeam.splice(j, 1);
        }
      }
    }
    if (zombies.length == 0) break;
  }
}

function projectilethrow() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].display();
    projectiles[i].move();
    if (projectiles[i].x > width) {
      projectiles.splice(i, 1);
      continue;
    }
    for (let j = zombies.length - 1; j >= 0; j--) {
      if (projectiles[i] && projectiles[i].hits(zombies[j])) {
        if (j < zombies.length && zombies[j] && !zombies[j].isFriendly && Math.random() < conversiontozombieally) {
          let posKey = null;
          if (!placezombieally.front) {
            posKey = 'front';
          } else if (!placezombieally.top) {
            posKey = 'top';
          } else if (!placezombieally.bottom) {
            posKey = 'bottom';
          }
          if (posKey) {
            zombies[j].isFriendly = true;
            switch (posKey) {
              case 'front':
                zombies[j].x = player.x + 50;
                zombies[j].y = player.y;
                break;
              case 'top':
                zombies[j].x = player.x + 50;
                zombies[j].y = player.y - 60;
                break;
              case 'bottom':
                zombies[j].x = player.x + 50;
                zombies[j].y = player.y + 60;
                break;
            }
            playerTeam.push(zombies[j]);
            placezombieally[posKey] = zombies[j];
            zombies.splice(j, 1);
            scorebarre += 50;
          }
        } else if (zombies[j] && zombies[j].health <= 0) {
          scorebarre += 50;
          zombies.splice(j, 1);
        }
        projectiles.splice(i, 1);
        break;
      }
    }
  }
}

function zombielogical() {
  let currentTime = millis();
  let spawnInterval = random(spawnDelay - 200, spawnDelay + 500);
  if (currentTime - lastSpawnTime > spawnInterval) {
    let numberOfZombies = floor(random(1, 4));
    for (let i = 0; i < numberOfZombies; i++) {
      let zombieSpeed = 3;
      let newZombie = new Zombie(width - i * 50, player.y, 50, false, zombieSpeed);
      zombies.push(newZombie);
    }
    lastSpawnTime = currentTime;
  }
  zombies.forEach((zombie, index) => {
    zombie.display();
    zombie.move();
    if (zombie.hits(player)) {
      playerLives--;
      zombies.splice(index, 1);
      if (playerLives <= 0) {
        noLoop();
        document.getElementById('game-over').style.display = 'block';
      }
    }
  });
  if (boss1spawn === false) {
    checkScore();
  }
  if (boss2spawn === false) {
    checkScore2();
  }
  if (boss3spawn === false) {
    checkScore3();
  } else {
    if(boss3dead===true) {
      console.log("bossdead");
      noLoop();
    }
  }
}

function updateAllyPositions() {
  Object.entries(placezombieally).forEach(([key, zombie]) => {
    if (zombie) {
      zombie.x = player.x + orderzombieally[key].x;
      zombie.y = player.y + orderzombieally[key].y;
    }
  });
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
  constructor(x, y, size, isFriendly = false) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = 2;
    this.isFriendly = isFriendly;
    this.health = this.isFriendly ? 150 : 100;
    this.damage = this.isFriendly ? 25 : 10;
  }
  display() {
    if (this.isFriendly) {
      image(ImageZombieAlly, this.x, this.y, this.size, this.size);
    } else {
      image(ImageZombie, this.x, this.y, this.size, this.size);
    }
  }
  move() {
    this.x -= this.speed;
  }
  moveTowardsEnemy(enemies) {
    if (this.isFriendly && enemies.length > 0) {
      let closestEnemy = enemies[0];
      let closestDist = dist(this.x, this.y, enemies[0].x, enemies[0].y);

      for (let i = 1; i < enemies.length; i++) {
        let d = dist(this.x, this.y, enemies[i].x, enemies[i].y);
        if (d < closestDist) {
          closestEnemy = enemies[i];
          closestDist = d;
        }
      }

      let dir = p5.Vector.sub(closestEnemy.createVector(), this.createVector()).normalize();
      this.x += dir.x * this.speed;
      this.y += dir.y * this.speed;
    }
  }

  createVector() {
    return createVector(this.x, this.y);
  }
  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size / 2 + player.size / 2;
  }
  attack(zombies) {
    for (let i = zombies.length - 1; i >= 0; i--) {
      if (this.isFriendly && !zombies[i].isFriendly) {
        let d = dist(this.x, this.y, zombies[i].x, zombies[i].y);
        if (d < 50) {
          zombies[i].health -= this.damage;
          if (zombies[i].health <= 0) {
            zombies.splice(i, 1);
            scorebarre += 50;
            break;
          }
        }
      }
    }
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
    let zombieLeft = zombie.x;
    let zombieRight = zombie.x + zombie.size;
    let zombieTop = zombie.y;
    let zombieBottom = zombie.y + zombie.size;

    let projectileLeft = this.x - this.size / 2;
    let projectileRight = this.x + this.size / 2;
    let projectileTop = this.y - this.size / 2;
    let projectileBottom = this.y + this.size / 2;

    if (projectileRight > zombieLeft &&
        projectileLeft < zombieRight &&
        projectileBottom > zombieTop &&
        projectileTop < zombieBottom) {
      zombie.health -= 100;
      if (zombie.health <= 0) {
        console.log(zombie);
        zombies.splice(zombies.indexOf(zombie), 1);
        scorebarre += 50;
        if (zombie.isBoss) {
          boss3dead = true;
        }
        return true;
      }
    }
    return false;
  }
}
class Boss {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = 3;
    this.damage = 10;
    this.health = 100;
  }
  display() {
    image(ImageBOSS, this.x, this.y, this.size, this.size);
  }
  move() {
        this.x -= this.speed;
  }
  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size / 2 + player.size / 2;
  }
  attack(zombies) {
    for (let i = zombies.length - 1; i >= 0; i--) {
      let d = dist(this.x, this.y, zombies[i].x, zombies[i].y);
      if (d < 50) {
        zombies[i].health -= this.damage;
        if (zombies[i].health <= 0) {
          zombies.splice(i, 1);
          scorebarre += 50;
          break;
        }
      }
    }
  }
}
function checkScore() {
  if (scorebarre >= 1000) {
    spawnBoss();
    boss1spawn = true;
  }
}
function spawnBoss() {
    boss1 = new Boss(width - 100, height / 2, 100);
    zombies.push(boss1);
}
class Boss2 {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = 3;
    this.damage = 10;
    this.health = 100;
  }
  display() {
    image(ImageBoss2, this.x, this.y, this.size, this.size);
  }
  move() {
        this.x -= this.speed;
  }
  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size / 2 + player.size / 2;
  }
  attack(zombies) {
    for (let i = zombies.length - 1; i >= 0; i--) {
      let d = dist(this.x, this.y, zombies[i].x, zombies[i].y);
      if (d < 50) {
        zombies[i].health -= this.damage;
        if (zombies[i].health <= 0) {
          zombies.splice(i, 1);
          scorebarre += 50;
          break;
        }
      }
    }
  }
}
function checkScore2() {
  if (scorebarre >= 1500) {
    spawnBoss2();
    boss2spawn = true
  }
}
function spawnBoss2() {
  boss2 = new Boss2(width - 100, height / 2, 100);
  zombies.push(boss2);
}
class Boss3 {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = 3;
    this.damage = 10;
    this.health = 100;
    this.isBoss = true;
  }
  display() {
    image(ImageBoss3, this.x, this.y, this.size, this.size);
  }
  move() {
        this.x -= this.speed;
  }
  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size / 2 + player.size / 2;
  }
  attack(zombies) {
    for (let i = zombies.length - 1; i >= 0; i--) {
      let d = dist(this.x, this.y, zombies[i].x, zombies[i].y);
      if (d < 50) {
        zombies[i].health -= this.damage;
        if (zombies[i].health <= 0) {
          zombies.splice(i, 1);
          scorebarre += 50;
          break;
        }
      }
    }
  }
}
function checkScore3() {
  if (scorebarre >= 2000) {
    spawnBoss3();
  }
}
function spawnBoss3() {
  let boss3 = new Boss3(width - 100, height / 2, 100);
  console.log("boss3 spawned")
  zombies.push(boss3);
  boss3spawn = true;
}