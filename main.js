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
  version: "1.2.3-dev",
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

// ---------- PRELOAD FUNCTION ---------- //

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

// ---------- CREATE FUNCTION ---------- //

function create() {

  this.add
    .text(10, 10, `Version: ${config.version}`, {
      fontSize: "16px",
      color: "#ffffff",
    })
    .setDepth(3);
  damage_ind = this.add.text(10, 770, `Damage ${player_damage}%`, {
    fontSize: "20px",
    color: "#2a2a2a",
  });
  damage_ind.setDepth(3);

  background = this.add.image(300, 400, "bground");
  background.setDepth(0);

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

  function hitPlane(plane, bullet) {

    if (plane === enemy_dornier) {
      hit.x = bullet.x;
      hit.y = bullet.y + 10;
      hit.play("bullet_hit");
      enemy_damage += 0.25;
      console.log(enemy_damage)
    }
    else if (plane === player) {
      player_hit.x = bullet.x;
      player_hit.y = bullet.y + 10;
      player_hit.play("bullet_hit");
      damage_ind.setText(`Damage ${player_damage}%`);
      player_damage += 1.75;
    }
    bullet.setActive(false);
    bullet.setVisible(false);
  }

  setInterval(() => {
    if (temperature > 0) {
      temperature -= 100;
    }
  }, 500);
}

// ---------- UPDATE FUNCTION ---------- //

function update(time, delta) {
  if (cursors.left.isDown) {
    player.setVelocityX(-player.speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(+player.speed);
  }

  fire.x = player.x;
  fire.y = player.y - 40;

  enemy_fire.x = enemy_dornier.x - 4;
  enemy_fire.y = enemy_dornier.y - 25;

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

  if (enemy_dornier.x > 500) {
    if (enemy_dornier.x > 400) {
    }
    enemy_dornier.setVelocityX(-enemy_dornier.speed); // Move left
  } else if (enemy_dornier.x < 100) {
    if (enemy_dornier.x < 200) {
    }
    enemy_dornier.setVelocityX(+enemy_dornier.speed); // Move right
  }

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
      }, 1000);
    }
  }
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
  if (player_damage > 100 || enemy_damage > 200) {
    if (player_damage > 100) {
      player_damage = 0;
    }
    enemy_damage = 0;
    player.x = 300;
    player.y = 720;
    enemy_dornier.x = 300;
    enemy_dornier.y = 300;
    damage_ind.setText(`Damage ${player_damage}%`);
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
