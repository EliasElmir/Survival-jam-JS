let player;
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
let gameLevel = 1;


function preload() {
  ImageZombie = loadImage('zombie.png');
  ImageZombieAlly = loadImage('zomb.png')
  ImageSurvivant = loadImage('Survivant.png');
  ImageBOSS = loadImage('BruteLeft.webp');
  ImageBoss2 = loadImage('Boss2.gif');
  ImageBoss3 = loadImage('Boss3.gif');
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
  playerTeam = [];
  projectiles = [];
  loop();
  document.getElementById('game-over').style.display = 'none';
}

function draw() {
  background(220);
  
  player.display();
  player.move();

  zombielogical();

  for (let i = 0; i < playerTeam.length; i++) {
    playerTeam[i].attack(zombies);
    playerTeam[i].display();
  }

  handleZombieCombat();

  projectilethrow();

  displayInfo();
  
  checkScore();
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
            console.log(`Zombie converted to ally at position ${posKey}.`);
            scorebarre += 50;
          }
        } else if (zombies[j] && zombies[j].health <= 0) { 
          console.log(`Zombie killed at position ${j} with 0 health remaining.`);
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
  updateGameLevel();
  let currentTime = millis();
  let spawnInterval = random(spawnDelay - 200, spawnDelay + 500);

  if (currentTime - lastSpawnTime > spawnInterval) {
    let numberOfZombies = floor(random(1, 4));
    for (let i = 0; i < numberOfZombies; i++) {
      let zombieSpeed = gameLevel === 2 ? 4 : 3;
      let newZombie = new Zombie(width - i * 50, player.y, 50, false, zombieSpeed);
      zombies.push(newZombie);
      console.log(`New zombie spawned with ${newZombie.health} health at x=${newZombie.x}`);
    }
    lastSpawnTime = currentTime;
  }

  zombies.forEach((zombie, index) => {
    zombie.display();
    zombie.move();
    if (zombie.hits(player)) {
      console.log(`Zombie hits player. Zombie health: ${zombie.health}`);
      playerLives--;
      zombies.splice(index, 1);
      if (playerLives <= 0) {
        console.log("Game Over! Player lives are zero.");
        noLoop();
        document.getElementById('game-over').style.display = 'block';
      }
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
    this.speed = 3;
    this.isFriendly = isFriendly;
    this.health = this.isFriendly ? 150 : 100;
    this.damage = this.isFriendly ? 25 : 10;
    console.log(`Creating ${this.isFriendly ? "friendly" : "enemy"} zombie with ${this.health} health.`);
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

  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size / 2 + player.size / 2;
  }

  attack(zombies) {
    for (let i = zombies.length - 1; i >= 0; i--) {
      if (this.isFriendly && !zombies[i].isFriendly) {
        let d = dist(this.x, this.y, zombies[i].x, zombies[i].y);
        if (d < 50) {
          console.log(`Friendly zombie at (${this.x}, ${this.y}) attacks enemy zombie at (${zombies[i].x}, ${zombies[i].y}) with ${this.damage} damage.`);
          zombies[i].health -= this.damage;
          if (zombies[i].health <= 0) {
            console.log(`Enemy zombie at (${zombies[i].x}, ${zombies[i].y}) killed by friendly zombie.`);
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
    let d = dist(this.x, this.y, zombie.x, zombie.y);
    if (d < this.size / 2 + zombie.size / 2 && !zombie.isFriendly) {
      zombie.health -= 100;
      console.log(`Projectile inflicts 100 damage on zombie. Zombie health now ${zombie.health}.`);
      if (zombie.health <= 0) {
        console.log(`Zombie at position ${zombies.indexOf(zombie)} killed.`);
        zombies.splice(zombies.indexOf(zombie), 1); 
        scorebarre += 50;
        return true;
      }
    }
    return false;
  }
}

function updateGameLevel() {
  if (scorebarre >= 1300 && gameLevel === 1) {
    gameLevel = 2;
    updateGameDifficulty();
    console.log("Level 2 has started! Difficulty increased.");
  }
}

function updateGameDifficulty() {
  switch (gameLevel) {
    case 2:
      spawnDelay = 800;
      projectiledelay = 0.3;
      conversiontozombieally = 0.4;
      break;
    default:
      spawnDelay = 1000;
      projectiledelay = 0.4;
      conversiontozombieally = 0.5;
      break;
  }
}

class Boss {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = 1;
    this.damage = 10;
    this.health = 100;
  }

  display() {
    image(ImageBOSS, this.x, this.y, this.size, this.size);
  }

  move(player) {
    if (player.x > this.x) {
      this.x += this.speed;
    } else if (player.x < this.x) {
      this.x -= this.speed;
    }

    if (player.y > this.y) {
      this.y += this.speed;
    } else if (player.y < this.y) {
      this.y -= this.speed;
    }
  }

  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size / 2 + player.size / 2;
  }

  attack(zombies) {
    for (let i = zombies.length - 1; i >= 0; i--) {
      let d = dist(this.x, this.y, zombies[i].x, zombies[i].y);
      if (d < 50) {
        console.log(`Boss at (${this.x}, ${this.y}) attacks zombie at (${zombies[i].x}, ${zombies[i].y}) with ${this.damage} damage.`);
        zombies[i].health -= this.damage;
        if (zombies[i].health <= 0) {
          console.log(`Zombie at (${zombies[i].x}, ${zombies[i].y}) killed by boss.`);
          zombies.splice(i, 1);
          scorebarre += 50;
          if (scorebarre >= 1000) {
            spawnBoss();
          }
          break;
        }
      }
    }
  }
}

function checkScore() {
  if (scorebarre >= 1000) {
    spawnBoss();
  }
}

function spawnBoss() {
  let boss = new Boss(width - 100, height / 2, 100);
  zombies.push(boss);
  console.log("Boss spawned!");
}

class Boss2 {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = 1;
    this.damage = 10;
    this.health = 100;
  }

  display() {
    image(ImageBoss2, this.x, this.y, this.size, this.size);
  }

  move(player) {
    if (player.x > this.x) {
      this.x += this.speed;
    } else if (player.x < this.x) {
      this.x -= this.speed;
    }

    if (player.y > this.y) {
      this.y += this.speed;
    } else if (player.y < this.y) {
      this.y -= this.speed;
    }
  }

  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size / 2 + player.size / 2;
  }

  attack(zombies) {
    for (let i = zombies.length - 1; i >= 0; i--) {
      let d = dist(this.x, this.y, zombies[i].x, zombies[i].y);
      if (d < 50) {
        console.log(`Boss at (${this.x}, ${this.y}) attacks zombie at (${zombies[i].x}, ${zombies[i].y}) with ${this.damage} damage.`);
        zombies[i].health -= this.damage;
        if (zombies[i].health <= 0) {
          console.log(`Zombie at (${zombies[i].x}, ${zombies[i].y}) killed by boss.`);
          zombies.splice(i, 1);
          scorebarre += 50;
          if (scorebarre >= 1500) {
            spawnBoss2();
          }
          break;
        }
      }
    }
  }
}

function checkScore() {
  if (scorebarre >= 1500) {
    spawnBoss2();
  }
}

function spawnBoss2() {
  let boss2 = new Boss2(width - 100, height / 2, 100);
  zombies.push(boss2);
  console.log("Boss2 spawned!");
}



class Boss3 {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = 1;
    this.damage = 10;
    this.health = 100;
  }

  display() {
    image(ImageBoss3, this.x, this.y, this.size, this.size);
  }

  move(player) {
    if (player.x > this.x) {
      this.x += this.speed;
    } else if (player.x < this.x) {
      this.x -= this.speed;
    }

    if (player.y > this.y) {
      this.y += this.speed;
    } else if (player.y < this.y) {
      this.y -= this.speed;
    }
  }

  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size / 2 + player.size / 2;
  }

  attack(zombies) {
    for (let i = zombies.length - 1; i >= 0; i--) {
      let d = dist(this.x, this.y, zombies[i].x, zombies[i].y);
      if (d < 50) {
        console.log(`Boss at (${this.x}, ${this.y}) attacks zombie at (${zombies[i].x}, ${zombies[i].y}) with ${this.damage} damage.`);
        zombies[i].health -= this.damage;
        if (zombies[i].health <= 0) {
          console.log(`Zombie at (${zombies[i].x}, ${zombies[i].y}) killed by boss.`);
          zombies.splice(i, 1);
          scorebarre += 50;
          if (scorebarre >= 2000) {
            spawnBoss3();
          }
          break;
        }
      }
    }
  }
}

function checkScore() {
  if (scorebarre >= 2000) {
    spawnBoss3();
  }
}

function spawnBoss3() {
  let boss3 = new Boss3(width - 100, height / 2, 100);
  zombies.push(boss3);
  console.log("Boss3 spawned!");
}





