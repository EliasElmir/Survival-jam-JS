let player;
let zombies = [];
let playerLives = 3;
let scorebarre = 0;
let ImageZombie;
let ImageSurvivant;
let projectiles = []; 
let authorizetoshoot = true;
let lastprojectiles = 0;
let projectiledelay = 0.3;
let lastSpawnTime = 0;
let spawnDelay = 1000;
let playerTeam = [];
let conversiontozombieally = 0.8;
let maxzombiespawn = 3;
let zombieSpeed = 2;
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
let gameLevel = 1;
// This part of the code, initializes and configures the basic variables and parameters for our game.

function preload() {
  ImageZombie = loadImage('zombie.png');
  ImageZombieAlly = loadImage('zomb.png')
  ImageSurvivant = loadImage('Survivant.png');
}
// This function is used to load all the images we need in our game.

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
// This function ensures that our canvas is always the size of the entire browser window.

function setup() {
  createCanvas(windowWidth, windowHeight);
  player = new Player(20, height - 373, 50);
  noLoop();
}
// This function runs at the start to reset your canvas to the correct size and place the player in the correct location and size.

function PlayGame() {
  if (!gameInitialized) {
      gameInitialized = true;
      loop();
  }
}
// This function is used to initialize the game once and allows us to animate and update the canvas of our game.

function restartGame() {
  playerLives = 3;
  scorebarre = 0;
  zombies = [];
  playerTeam = [];
  projectiles = [];
  loop();
  document.getElementById('game-over').style.display = 'none';
}
// This function allows us to be able to reset our game when it starts, whether after an end of the game or a voluntary restart.

function draw() {
  background(51);

  player.display();
  player.move();

  

  updateGameLevel();

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
// The draw function is the capital function of our game, it runs in a loop to update the game dynamically. 
// It displays all the details of our game that we defined in each function.

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
        // In this part of the function we go through the list of zombies and allies then we calculate their distance.
        // If they are less than 50 pixels away, they can inflict damage on themselves. 
        // Then if one of the two dies, he is removed from the list and the score increases.

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
// In this part of the function, we check if the health of an ally is at zero, if it is, we find the position of this zombie and we delete it from the list of allies. 
// Then, if there are no zombies left, the loop stops to optimize performance.

function projectilethrow() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].display();
    projectiles[i].move();
    if (projectiles[i].x > width) {
      projectiles.splice(i, 1);
      continue;
    }
    // In this part of the function, browse our "projectiles" array. 
    // We then display and move each projectile. 
    // If the projectile leaves the screen, we remove it from the board.

    for (let j = zombies.length - 1; j >= 0; j--) {
      if (projectiles[i] && projectiles[i].hits(zombies[j])) {
        console.log("Projectile hit a zombie.");
        if (j < zombies.length && zombies[j] && !zombies[j].isFriendly) {
          console.log("Trying to convert a zombie.");
          if (Math.random() < conversiontozombieally) {
            console.log("Conversion check passed.");
          let posKey = null;
          if (!placezombieally.front) {
            posKey = 'front';
          } else if (!placezombieally.top) {
            posKey = 'top';
          } else if (!placezombieally.bottom) {
            posKey = 'bottom';
          }
          // In this part of the function, handles the conversion of zombies into allies. 
          // We first go through our zombie table, we check if it is hit by a projectile. 
          // If the affected zombie is not a friend there is a percentage chance that it will become an ally. 
          // If it is converted it is then placed in a free position defined by "placezombieally".

          if (posKey) {
            console.log("Found a place for a new ally: " + posKey);
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
            // In this part of the function, look at where the allied zombie can be placed, all just converted in relation to the player.

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
}
// In this part of the function, we manage what happens to the zombies. 
// If the zombie becomes an ally it is added to the player's team and its place is saved. 
// The score increases by 50 points. If the zombie's life is less than or equal to zero, it is removed from the zombie table and the score increases by another 50 points. 
// The projectile is then removed.

function zombielogical() {
  if (frameCount % 60 === 0) {
    updateGameLevel();
  }
  let currentTime = millis();
  let spawnInterval = random(spawnDelay - 200, spawnDelay + 500);
  if (currentTime - lastSpawnTime > spawnInterval) {
    let numberOfZombies = floor(random(1, maxzombiespawn + 1));
    for (let i = 0; i < numberOfZombies; i++) {
      let newZombie = new Zombie(width + i * 50, max(0, random(height)), 50, false, zombieSpeed);
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
    }
    //if (zombie.x < 0) {
      //playerLives--;
      //zombies.splice(index, 1);
    //}
    if (playerLives <= 0) {
      noLoop();
      document.getElementById('game-over').style.display = 'block';
    }
  });
}


function displayInfo() {
  fill(0);
  textSize(20);
  text(`Lives: ${playerLives}`, 10, 30);
  text(`Score: ${scorebarre}`, 10, 60);
}
// This function displays essential information of the game, such as the number of lives of the player and the score, we position this information at the top left of the screen.

class Player {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = 5;
  }
  // In this "Player" class we initialize the player properties. 
  // We initialize its position, its size, its speed, with specific default values.

  display() {
    image(ImageSurvivant, this.x, this.y, this.size, this.size);
  }
  // This method is used to display the correct images of the survivor, it also places this image at the correct coordinates and size.
  
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
// This method is used to allow the player to move and be able to shoot in the game. 
// We check the keys pressed to move the player left, right, up or down depending on the directional keys. 
// This method also manages the possibility of the player being able to shoot (with a). 
// The player can shoot "authorizedtoshoot" is activated, we create a new projectile from the player's position and then update the time of the last shot. 
// This method also manages the delay between shots.

class Zombie {
  constructor(x, y, size, isFriendly = false, speed = 2) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.isFriendly = isFriendly;
    this.health = this.isFriendly ? 150 : 100;
    this.damage = this.isFriendly ? 25 : 10;
  }
  // In this "Zombie" class we initialize the properties of the zombies. 
  // We initialize its position, size, speed, health and damage, with specific default values for allied and enemy zombies.


  display() {
    if (this.isFriendly) {
      image(ImageZombieAlly, this.x, this.y, this.size, this.size);
    } else {
      image(ImageZombie, this.x, this.y, this.size, this.size);
    }
  }
  // This method is used to display the correct images based on enemy or allied zombies, it also places them at the correct coordinates and at the right size.

  move() {
    this.x -= this.speed;
  }
  // This method is used for objects that have it. 
  // It handles the fact that objects move to the left at a specific speed.

  moveTowardsEnemy(enemies) {
    if (this.isFriendly && enemies.length > 0) {
      let closestEnemy = enemies[0];
      let closestDist = dist(this.x, this.y, enemies[0].x, enemies[0].y);
      // This method is used for allies to move towards the enemy to attack them. 
      // Here we calculate the distance between him and all the enemies.

      for (let i = 1; i < enemies.length; i++) {
        let d = dist(this.x, this.y, enemies[i].x, enemies[i].y);
        if (d < closestDist) {
          closestEnemy = enemies[i];
          closestDist = d;
        }
      }
      // In this part of the method, we browse the enemies then compare each distance with closetDist where the currently closest enemy is recorded. 
      // If the new distance is closer closetDist is updated.

      let dir = p5.Vector.sub(closestEnemy.createVector(), this.createVector()).normalize();
      this.x += dir.x * this.speed;
      this.y += dir.y * this.speed;
    }
  }
  // In this part of the method, we calculate a directional vector between the current object and the closest enemy, then use this vector to move the object towards the enemy with a specific speed.


  createVector() {
    return createVector(this.x, this.y);
  }
  // This method returns a vector with the x and y coordinates of the current object.


  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size / 2 + player.size / 2;
  }
  // This method lets you know the current object collides with the player. 
  // For this we calculate the distance between their centers.

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
// This method allows allies to attack nearby enemy zombies. 
// We cycle through enemy zombies, check if the current object is an ally and if the zombie is an enemy, then reduce the zombie's health if it's close enough. 
// If the zombie's health reaches zero or less, it is removed from the zombie table and the score is increased.


class Projectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 10;
    this.speed = 10;
  }
  // In this "Projectile" class we initialize the projectile properties.
  // We initialize its position, its size, its speed, with specific default values.

  display() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, this.size, this.size);
  }
  //The method displays the projectile as a red ellipse on the screen, centered on its coordinates and with a specified size.

  move() {
    this.x += this.speed;
  }
  // It handles the fact that objects move to the left at a specific speed.


  hits(zombie) {
    let zombieLeft = zombie.x;
    let zombieRight = zombie.x + zombie.size;
    let zombieTop = zombie.y;
    let zombieBottom = zombie.y + zombie.size;

    let projectileLeft = this.x - this.size / 2;
    let projectileRight = this.x + this.size / 2;
    let projectileTop = this.y - this.size / 2;
    let projectileBottom = this.y + this.size / 2;
    // This part of the method is used to calculate the coordinates of the zombie and projectile edges to determine if they overlap.


    if (projectileRight > zombieLeft &&
        projectileLeft < zombieRight &&
        projectileBottom > zombieTop &&
        projectileTop < zombieBottom) {
      zombie.health -= 100;
      if (zombie.health <= 0) {
        console.log(zombie);
        zombies.splice(zombies.indexOf(zombie), 1);
        scorebarre += 50;
        return true;
      }
    }
    return false;
  }
}
// This part of the method is used to check if a projectile hits a zombie by comparing their positions. 
// If so, the zombie's health is reduced, and if it is killed, it is removed from the game and the score is increased.

function updateGameLevel() {
  let nextLevelScore = gameLevel * 1000;
  if (scorebarre >= nextLevelScore && gameLevel < 5) {
    gameLevel++;
    console.log("Level Up: Now at Level " + gameLevel);
    updateGameDifficulty();
  }
}
// This function checks if the player's score reaches or exceeds a threshold to move on to the next level, the levels succeed each other every 1000 score. 
// If the score exceeds this threshold and the current level is below 5, the game level is increased by one and the game difficulty is updated.

function updateGameDifficulty() {
  console.log("Updating game difficulty settings for level:", gameLevel);
  switch (gameLevel) {
    case 1:
      spawnDelay = 1000;
      projectiledelay = 0.3;
      conversiontozombieally = 0.8;
      zombieSpeed = 2;
      maxZombiesPerSpawn = 3;
      break;
    case 2:
      spawnDelay = 850;
      projectiledelay = 0.25;
      conversiontozombieally = 0.8;
      zombieSpeed = 2.5;
      maxZombiesPerSpawn = 5;
      break;
    case 3:
      spawnDelay = 700;
      projectiledelay = 0.2;
      conversiontozombieally = 0.9;
      zombieSpeed = 3;
      maxZombiesPerSpawn = 6;
      break;
    case 4:
      spawnDelay = 550;
      projectiledelay = 0.15;
      conversiontozombieally = 0.9;
      zombieSpeed = 3.5;
      maxZombiesPerSpawn = 7;
      break;
    case 5:
      spawnDelay = 400;
      projectiledelay = 0.1;
      conversiontozombieally = 0.9;
      zombieSpeed = 4;
      maxZombiesPerSpawn = 8;
      break;
  }
  console.log("Settings updated: spawnDelay", spawnDelay, "projectiledelay", projectiledelay, "conversiontozombieally", conversiontozombieally, "zombieSpeed", zombieSpeed, "maxZombiesPerSpawn", maxZombiesPerSpawn);
}
// This feature updates the game's difficulty settings based on the score. 
// The difficulty is adjusted by modifying various parameters such as projectile delay, zombie speed etc.
