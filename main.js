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
      debug: false, // Wizualizacja kolizji (ustaw true dla testów)
    },
  },
  version: "1.1.4-dev",
};

// -- GLOBAL VARIABLES -- //

var game = new Phaser.Game(config);
var background;
var player;
var enemy_dornier;
var cursors;
var bullets;
var enemy_bullets;
var bullet_speed = -300;
var fireRate = 100;
var nextFire = 0;
var enemyNextFire = 0;
var fire;
var hit;
var temperature = 0;
var burst = 0;

// -- PRELOAD FUNCTION -- //

function preload() {
  this.load.image("bground", "assets/bground.jpg");

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
}

// -- CREATE FUNCTION -- //

function create() {
  this.add
    .text(10, 10, `Version: ${config.version}`, {
      fontSize: "16px",
      color: "#ffffff",
    })
    .setDepth(3);
  background = this.add.image(300, 400, "bground");
  background.setDepth(0);

  player = this.physics.add.sprite(300, 720, "player_frame0").setScale(1.5);
  player.setOrigin(0.5, 0.5);
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

  hit = this.physics.add.sprite(300, 300, "nohit");
  hit.setDepth(4);

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
  // fire.setCollideWorldBounds(true);
  this.physics.add.overlap(enemy_dornier, bullets, hitEnemy, null, this);
  cursors = this.input.keyboard.createCursorKeys();
  enemy_dornier.setVelocityX(+enemy_dornier.speed);

  function hitEnemy(enemy, bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);

    hit.x = bullet.x;
    hit.y = bullet.y + 10;
    hit.play("bullet_hit");
  }

  setInterval(() => {
    if (temperature > 0) {
      temperature -= 100;
    }
  }, 500);
}

// -- UPDATE FUNCTION -- //

function update(time, delta) {
  if (cursors.left.isDown) {
    player.setVelocityX(-player.speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(+player.speed);
  }

  fire.x = player.x;
  fire.y = player.y - 40;

  if (cursors.space.isDown) {
    if (time > nextFire && temperature < 500) {
      var bullet = bullets.get(player.x, player.y - 40);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocityY(bullet_speed);
        bullet.setScale(1.5);
        bullet.setDepth(3);
        bullet.body.setSize(5, 5);
        bullet.body.setOffset(14, 14);
        nextFire = time + fireRate;
        bullet.play("smoke");
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

  if (enemy_dornier.x > 500) {
    if (enemy_dornier.x > 400) {
    }
    enemy_dornier.setVelocityX(-enemy_dornier.speed); // Move left
  } else if (enemy_dornier.x < 100) {
    if (enemy_dornier.x < 200) {
    }
    enemy_dornier.setVelocityX(+enemy_dornier.speed); // Move right
  }

   if (time > enemyNextFire && burst < 5) {
      var enemy_bullet = enemy_bullets.get(enemy_dornier.x, enemy_dornier.y - 40);
      if (enemy_bullet) {
        enemy_bullet.setActive(true);
        enemy_bullet.setVisible(true);
        enemy_bullet.setVelocityY(-bullet_speed);
        enemy_bullet.setScale(1.5);
        enemy_bullet.setAngle(180);
        enemy_bullet.setDepth(3);
        enemy_bullet.body.setSize(5, 5);
        enemy_bullet.body.setOffset(14, 14);
        enemyNextFire = time + fireRate;
        enemy_bullet.play("smoke");

      }
      burst++;
      if (burst === 5) {
        setTimeout(() => {
          burst = 0;
        },1000)
      }
    }
    enemy_bullets.getChildren().forEach(function (enemy_bullet) {
    if (
      enemy_bullet.active &&
      (enemy_bullet.x < 0 || enemy_bullet.x > 600 || enemy_bullet.y < 0 || enemy_bullet.y > 800)
    ) {
      enemy_bullet.setActive(false);
      enemy_bullet.setVisible(false);
    }
  });
}

// -- HELPER FUNCTIONS -- //
