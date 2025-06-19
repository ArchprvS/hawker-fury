// -- CONFIG OBJECT -- //

var config = {
  type: Phaser.AUTO,
  width: 600,
  height: 800,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  physics: {
    default: "arcade", // Typ fizyki
    arcade: {
      gravity: { y: 0 }, // Brak grawitacji dla widoku z góry
      skipQuadTree: false,
      fps: 60,
      debug: false, // Wizualizacja kolizji (ustaw true dla testów)
    },
  },
  version: "1.3.2-dev",
};

// ---------- GLOBAL VARIABLES ---------- //

const game = new Phaser.Game(config);
let background;
let player;
let enemy_dornier;
let cursors;
let bullets;
let enemy_bullets;
let bullet_speed = -300;
let fireRate = 100;
let nextFire = 0;
let enemyNextFire = 0;
let fire;
let hit;
let player_hit;
let temperature = 0;
let burst = 0;
let player_damage = 0;
let enemy_damage = 0;
let damage_ind;
let game_paused = false;
let startscreen;
let goverpic;
let pausepic;
let cloud_0;
let cloud_1;
let shootdownY = 0;
let shootdowns = [];

// ---------- PRELOAD FUNCTION ---------- //

function preload() {
  this.load.font("PressStart", "assets/PressStart2P-Regular.ttf", "truetype");

  this.load.image("stscreen", "assets/startingscreen.png");
  this.load.spritesheet("enter_button", "assets/enter_button.png", {
    frameWidth: 50,
    frameHeight: 50,
  });

  this.load.image("bground", "assets/background.png");
  this.load.image("goverpic", "assets/game_over.png");
  this.load.image("pausepic", "assets/pause.png");

  this.load.image("cloud_upper_0", "assets/cloud_0.png");
  this.load.image("cloud_0", "assets/cloud_upper_0.png");

  this.load.image("esc_0", "assets/escbutton/esc_0.png");

  this.load.image("bullet_0", "assets/player_bullet/bullet_0.png");
  this.load.image("bullet_1", "assets/player_bullet/bullet_1.png");

  this.load.image("fire", "assets/gunfire/fire_0.png");
  this.load.image("nofire", "assets/gunfire/fire_1.png");

  this.load.image("player_frame0", "assets/player_aircraft/sprite_0.png");
  this.load.image("player_frame1", "assets/player_aircraft/sprite_1.png");
  this.load.image("player_frame2", "assets/player_aircraft/sprite_2.png");

  this.load.image("enemy_frame0", "assets/enemy_dornier/enemy_dornier0.png");
  this.load.image("enemy_frame1", "assets/enemy_dornier/enemy_dornier1.png");
  this.load.image("enemy_frame2", "assets/enemy_dornier/enemy_dornier2.png");

  this.load.image("hit", "assets/hit/hit_0.png");
  this.load.image("nohit", "assets/hit/hit_1.png");

  this.load.image("gcross", "assets/gcross.png");
}

// ---------- CREATE FUNCTION ---------- //

function create() {
  background = this.add.image(300, 400, "bground");
  background.setDepth(6);

  startscreen = this.add.image(300, 400, "stscreen");
  startscreen.setDepth(6);
  this.anims.create({
    key: "enter-anim",
    frames: this.anims.generateFrameNumbers("enter_button", {
      start: 0,
      end: 3,
    }),
    frameRate: 8,
    repeat: -1,
  });
  const enterButton = this.add.sprite(268, 415, "enter-button");
  enterButton.play("enter-anim");
  enterButton.setDepth(6);

  goverpic = this.add.image(300, 400, "goverpic");
  goverpic.setDepth(-1);

  cloud_0 = this.physics.add.sprite(300, 400, "cloud_0");
  cloud_1 = this.physics.add.sprite(300, 1200, "cloud_0");
  cloud_upper_0 = this.physics.add.sprite(300, 400, "cloud_upper_0");
  cloud_upper_1 = this.physics.add.sprite(300, 1200, "cloud_upper_0");
  // cloud_upper_0 = this.physics.add.sprite()
  cloud_0.setDepth(2);
  cloud_1.setDepth(2);
  cloud_upper_0.setDepth(5);
  cloud_upper_1.setDepth(5);

  pausepic = this.add.image(300, 400, "pausepic");
  pausepic.setDepth(-1);
  const escimg = this.add.image(250, 470, "esc_0");
  escimg.setDepth(-1);

  const scene = this;
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (game_paused) {
        scene.scene.resume();
        game_paused = false;
        pausepic.setDepth(-1);
        escimg.setDepth(-1);
      } else {
        scene.scene.pause();
        game_paused = true;
        pausepic.setDepth(6);
        escimg.setDepth(6);
      }
    }
  });

  this.add
    .text(10, 10, `Version: ${config.version}`, {
      fontSize: "14px",
      color: "#ffffff",
      fontFamily: "PressStart",
    })
    .setDepth(3);

  damage_ind = this.add.text(10, 770, `Damage ${player_damage}%`, {
    fontFamily: "PressStart",
    fontSize: "20px",
    color: "#2a2a2a",
  });
  damage_ind.setDepth(3);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      startscreen.setDepth(-1);
      enterButton.setDepth(-1);
      background.setDepth(0);
    }
  });

  player = this.physics.add.sprite(300, 720, "player_frame0").setScale(1.5);
  player.setOrigin(0.5, 0.5);
  player.body.setSize(50, 25, 0);
  player.speed = 200;
  player.setDrag(500, 500);
  player.setDepth(2);

  enemy_dornier = this.physics.add
    .sprite(300, 220, "enemy_frame0")
    .setScale(1.5);
  enemy_dornier.speed = 200;
  enemy_dornier.setOrigin(0.54, 0.6);
  enemy_dornier.body.setSize(90, 26, 0);
  enemy_dornier.setDrag(30, 30);
  enemy_dornier.setDepth(2);

  fire = this.physics.add.sprite(player.x, player.y - 40, "nofire");
  fire.setDrag(500, 500);
  fire.setDepth(4);

  enemy_fire = this.physics.add.sprite(
    enemy_dornier.x,
    enemy_dornier.y - 40,
    "fire"
  );
  enemy_fire.setDrag(30, 30);
  enemy_fire.setDepth(4);
  enemy_fire.setAngle(180);

  hit = this.physics.add.sprite(300, 300, "nohit");
  hit.setDepth(4);

  player_hit = this.physics.add.sprite(300, 700, "nohit");
  player_hit.setDepth(4);

  this.anims.create({
    key: "fly",
    frames: [
      { key: "player_frame0" },
      { key: "player_frame1" },
      { key: "player_frame2" },
    ],
    frameRate: 24,
    repeat: -1,
  });

  this.anims.create({
    key: "enemy_fly",
    frames: [
      { key: "enemy_frame0" },
      { key: "enemy_frame1" },
      { key: "enemy_frame2" },
    ],
    frameRate: 24,
    repeat: -1,
  });

  player.play("fly");
  enemy_dornier.play("enemy_fly");

  bullets = this.physics.add.group({
    defaultKey: "bullet_0",
    maxSize: 20,
    runChildUpdate: true,
  });
  enemy_bullets = this.physics.add.group({
    defaultKey: "bullet_0",
    maxSize: 20,
  });

  this.anims.create({
    key: "smoke",
    frames: [{ key: "bullet_0" }, { key: "bullet_1" }],
    frameRate: 12,
    repeat: -1,
  });

  this.anims.create({
    key: "gunfire",
    frames: [{ key: "fire" }, { key: "nofire" }],
    frameRate: 24,
    repeat: 0,
  });

  this.anims.create({
    key: "bullet_hit",
    frames: [{ key: "hit" }, { key: "nohit" }],
    frameRate: 40,
    repeat: 0,
  });

  player.setCollideWorldBounds(true);
  enemy_dornier.setCollideWorldBounds(true);
  this.physics.add.overlap(enemy_dornier, bullets, hitPlane, null, this);
  this.physics.add.overlap(player, enemy_bullets, hitPlane, null, this);
  cursors = this.input.keyboard.createCursorKeys();
  enemy_dornier.setVelocityX(+enemy_dornier.speed);

  /* -- Hitting function -- */

  function hitPlane(plane, bullet) {
    if (plane === enemy_dornier) {
      hit.x = bullet.x;
      hit.y = bullet.y + 10;
      hit.play("bullet_hit");
      //console.log(enemy_damage);
      enemy_damage += 0.5;
    } else if (plane === player) {
      player_hit.x = bullet.x;
      player_hit.y = bullet.y + 10;
      player_hit.play("bullet_hit");
      damage_ind.setText(`Damage ${player_damage}%`);
      player_damage += 5.75;
    }
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.destroy();
  }

  setInterval(() => {
    if (temperature > 0) {
      temperature -= 100;
    }
  }, 500);
}

// ---------- UPDATE FUNCTION ---------- //

function update(time, delta) {
  const scene = this;

  /* -- Clouds Movement -- */

  cloud_0.setVelocityY(150);
  cloud_1.setVelocityY(150);
  cloud_upper_0.setVelocityY(200);
  cloud_upper_1.setVelocityY(200);
  if (cloud_0.y > 1200) {
    cloud_0.y = -400;
  }
  if (cloud_1.y > 1200) {
    cloud_1.y = -400;
  }
  if (cloud_upper_0.y > 1200) {
    cloud_upper_0.y = -400;
  }
  if (cloud_upper_1.y > 1200) {
    cloud_upper_1.y = -400;
  }

  /* -- Player Movement -- */

  if (cursors.left.isDown) {
    player.setVelocityX(-player.speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(+player.speed);
  }

  fire.x = player.x;
  fire.y = player.y - 40;

  enemy_fire.x = enemy_dornier.x - 4;
  enemy_fire.y = enemy_dornier.y - 25;

  /* -- Player Fire -- */

  if (cursors.space.isDown) {
    if (time > nextFire && temperature < 500) {
      var bullet = bullets.get(player.x, player.y - 40);
      if (bullet) {
        shoot(bullet);
        bullet.setVelocityY(bullet_speed);
        nextFire = time + fireRate;
        fire.play("gunfire");
        temperature += 50;
      }
    }
  }

  bullets.getChildren().forEach(function (bullet) {
    if (
      bullet.active &&
      (bullet.x < 0 || bullet.x > 600 || bullet.y < 0 || bullet.y > 800)
    ) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  /* -- Enemy Movement -- */

  if (enemy_dornier.x > 500) {
    if (enemy_dornier.x > 400) {
    }
    enemy_dornier.setVelocityX(-enemy_dornier.speed); // Move left
  } else if (enemy_dornier.x < 100) {
    if (enemy_dornier.x < 200) {
    }
    enemy_dornier.setVelocityX(+enemy_dornier.speed); // Move right
  }

  /* -- Enemy Fire -- */

  if (time > enemyNextFire && burst < 6) {
    var enemy_bullet = enemy_bullets.get(
      enemy_dornier.x - 5,
      enemy_dornier.y - 15
    );

    if (enemy_bullet) {
      shoot(enemy_bullet);
      enemy_bullet.setAngle(180);
      enemy_bullet.setVelocityY(-bullet_speed);
      enemyNextFire = time + fireRate;
      enemy_fire.play("gunfire");
    }
    burst++;

    if (burst === 6) {
      setTimeout(() => {
        burst = 0;
      }, 500);
    }
  }

  /* -- Inactivating Bullets -- */

  enemy_bullets.getChildren().forEach(function (enemy_bullet) {
    if (
      enemy_bullet.active &&
      (enemy_bullet.x < 0 ||
        enemy_bullet.x > 600 ||
        enemy_bullet.y < 0 ||
        enemy_bullet.y > 800)
    ) {
      enemy_bullet.setActive(false);
      enemy_bullet.setVisible(false);
    }
  });

  /* -- Shootdown Player and Enemy -- */

  if (player_damage > 100 || enemy_damage > 20) {
    if (player_damage > 100) {
      scene.scene.pause();
      player_damage = 0;
      goverpic.setDepth(6);
      setTimeout(() => {
        shootdowns.forEach(gcross => gcross.destroy());
      }, 1500);
    }
    else if (enemy_damage > 20) {
      scene.scene.pause();
      shootdownY += 50;
      let gcross = this.add.image(550, shootdownY, "gcross");
      gcross.setDepth(5);
      shootdowns.push(gcross);
    }

    setTimeout(() => {
      resetScene(scene);
    }, 1500);
  }
}

// ---------- HELPER FUNCTIONS ---------- //

function shoot(bull) {
  bull.setActive(true);
  bull.setVisible(true);
  bull.setScale(1.5);
  bull.setDepth(3);
  bull.body.setSize(5, 5);
  bull.body.setOffset(14, 14);
  bull.play("smoke");
}

function resetScene(scene) {
  enemy_damage = 0;

  player.x = 300;
  player.y = 720;

  enemy_dornier.x = 300;
  enemy_dornier.y = 200;
  enemy_dornier.setVelocityX(+enemy_dornier.speed);

  damage_ind.setText(`Damage ${player_damage}%`);
  goverpic.setDepth(-1);

  bullets.getChildren().forEach((bullet) => {
    if (bullet.active) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });
  enemy_bullets.getChildren().forEach(bullet => {
    if (bullet.active) {
      bullet.setActive(false);
      bullet.setVisible(false);
      if (bullet.body) {
        //bullet.body.setVelocity(0, 0);
        bullet.destroy();
      }
    }
  });
  scene.scene.resume();
}
