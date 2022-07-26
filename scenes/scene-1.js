class Scene1 extends Phaser.Scene {

    // We could eventually get the length from the length of a csv row
    levelLength = 32;
    levelHeight = 16;

    constructor() {
        super("scene-1");
        this.handler = new Handler();
        this.timeState = "normal"; // "apocalyptic"
    }

    preload() {
        this.load.spritesheet("normal-player", "image/normal-player.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("apocalyptic-player", "image/apocalyptic-player.png", { frameWidth: 32, frameHeight: 32 });
        this.load.tilemapCSV("testmap", "tilemaps/testlvl.csv");
        this.load.tilemapCSV("testmap2", "tilemaps/testlvl apocalyptic.csv");
        this.load.image("world1tiles", "image/blocksnormal.png");
        this.load.image("world1tiles-purple", "image/blockspurple.png");
        this.load.spritesheet("bg1", "image/parallax back 1.png", { frameWidth: 128 * 6, frameHeight: 96 * 6 });
        this.load.spritesheet("bg2", "image/parallax back 2.png", { frameWidth: 128 * 6, frameHeight: 96 * 6 });
        this.load.image("background5-normal", "image/tree n road.png");
        this.load.image("background5-apocalyptic", "image/tree n road apocalyptic.png");
        this.load.spritesheet("spikes", "image/spikes.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("pressure plate", "image/button.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("pressure plate purple", "image/button purple.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("door", "image/door normal.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("door purple", "image/door purple.png", { frameWidth: 32, frameHeight: 32 });
        this.load.image("box", "image/pushbox.png");
        this.load.image("box purple", "image/pushbox-purple.png");
        this.load.spritesheet("portal", "image/portal.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("fire", "image/fire.png", { frameWidth: 32, frameHeight: 32 });
        this.load.audio("normalmusic", "muzak/nice_song.mp3");
        this.load.audio("apocmusic", "muzak/scary_song.mp3");
        this.load.audio("coinsound", "sound/coin.wav");
        this.load.audio("damagesound", "sound/damage.wav");
        this.load.audio("explosionsound", "sound/explosion.wav");
        this.load.audio("jumpsound", "sound/jump.wav");
        this.load.audio("selectsound", "sound/select.wav");
    }

    create() {
        // Internal clock
        this.internalClock = -1;

        // Background
        this.background1 = this.add.tileSprite(0, 0, gameWidth, gameHeight, "bg1", 4);
        this.background1.setOrigin(0, 0);
        this.background1.setScrollFactor(0);
        this.background2 = this.add.tileSprite(0, 0, gameWidth, gameHeight, "bg1", 3);
        this.background2.setOrigin(0, 0);
        this.background2.setScrollFactor(0);  // .1
        this.background3 = this.add.tileSprite(0, 0, gameWidth, gameHeight, "bg1", 2);
        this.background3.setOrigin(0, 0);
        this.background3.setScrollFactor(0);  // .15
        this.background4 = this.add.tileSprite(0, 0, gameWidth, gameHeight, "bg1", 1);
        this.background4.setOrigin(0, 0);
        this.background4.setScrollFactor(0);  // .185
        this.background5 = this.add.tileSprite(0, 0, gameWidth, gameHeight, "background5-normal");
        this.background5.scale = 6;
        this.background5.setOrigin(0, 0);
        this.background5.setScrollFactor(0);  // .25

        // World Setup
        this.baseTilemap = this.make.tilemap({ key: "testmap", tileWidth: 32, tileHeight: 32 });
        var world1tiles = this.baseTilemap.addTilesetImage("world1tileset", "world1tiles");
        this.tiles = this.baseTilemap.createLayer(0, world1tiles, 0, 0);
        this.tiles.scale = gameScale / 16;
        this.tiles.setCollisionBetween(1, 8);

        // Player Setup
        this.player = new Player(this.handler, this, "", "player");
        this.handler.addEntity(this.player);
        this.playerCollider = this.physics.add.collider(this.player.sprite, this.tiles);
        this.player.sprite.depth = 2;

        // HUD
        this.scene.launch("hud", {player: this.player});

        // Camera
        this.physics.world.setBounds(0, 0, gameWidth * this.levelLength / 16, gameHeight * this.levelHeight / 9);
        this.cameras.main.setBounds(0, 0, gameWidth * this.levelLength / 16, gameHeight * this.levelHeight / 9);
        this.cameras.main.startFollow(this.player.sprite);

        // Boxes
        this.box = new Box(this.handler, this, "box", "box");
        this.box.sprite.x = 200;
        this.handler.addEntity(this.box);
        this.boxCollider1 = this.physics.add.collider(this.box.sprite, this.tiles);
        this.boxCollider2 = this.physics.add.collider(this.box.sprite, this.player.sprite);
        this.box.sprite.depth = 3;

        // Makes entities for each special tile
        this.doors = [];
        this.pressurePlates = [];
        this.tiles.forEachTile((tile) => {
            if (tile.index === 25) {
                let spikes = new Spikes(this.handler, this, "spikes", "spikes");
                spikes.sprite.x = (tile.x + 0.5) * tileSize * (gameScale / 16);
                spikes.sprite.y = (tile.y + 0.5) * tileSize * (gameScale / 16);
                this.handler.addEntity(spikes);
                spikes.sprite.depth = 3;
            } else if (tile.index === 24) {
                let pressurePlate = new PressurePlate(this.handler, this, "pressure plate", "pressure plate", this.box, this.player);
                pressurePlate.sprite.x = (tile.x + 0.5) * tileSize * (gameScale / 16);
                pressurePlate.sprite.y = (tile.y + 0.5) * tileSize * (gameScale / 16);
                this.handler.addEntity(pressurePlate);
                this.pressurePlates.push(pressurePlate);
                pressurePlate.sprite.depth = 1;
            } else if (tile.index === 23) {
                let door = new Door(this.handler, this, "door", "door", this.player);
                door.sprite.x = (tile.x + 0.5) * tileSize * (gameScale / 16);
                door.sprite.y = (tile.y + 0.5) * tileSize * (gameScale / 16);
                this.handler.addEntity(door);
                let doorAndCollider = [door, this.physics.add.collider(door.sprite, this.player.sprite)];
                this.doors.push(doorAndCollider);
                door.sprite.depth = 1;
            } else if (tile.index === 69) {
                let endPortal = new Portal(this.handler, this, "portal", "portal");
                endPortal.setCollector(this.player);
                endPortal.sprite.x = (tile.x + 0.5) * tileSize * (gameScale / 16);
                endPortal.sprite.y = (tile.y + 0.5) * tileSize * (gameScale / 16);
                this.handler.addEntity(endPortal);
            } else if (tile.index === 88) {
                // LOL!!!!
                this.anims.create({
                    key: "flames",
                    frames: this.anims.generateFrameNumbers("fire", { start: 0, end: 11 }),
                    frameRate: 8,
                    repeat: -1
                });

                let flames = new Fire(this.handler, this, "fire", "fire");
                flames.sprite.x = (tile.x + 0.5) * tileSize * (gameScale / 16);
                flames.sprite.y = (tile.y + 0.5) * tileSize * (gameScale / 16);
                this.handler.addEntity(flames);
                flames.sprite.depth = 3;

                flames.sprite.play("flames", true);
            }
        });

        // Animations
        this.anims.create({
            key: "normal-player-idle",
            frames: this.anims.generateFrameNumbers("normal-player", { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: "normal-player-run",
            frames: this.anims.generateFrameNumbers("normal-player", { start: 4, end: 10 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: "normal-player-stopping",
            frames: this.anims.generateFrameNumbers("normal-player", { start: 14, end: 17 }),
            frameRate: 8,
            repeat: 0
        });

        this.anims.create({
            key: "portal-animation",
            frames: this.anims.generateFrameNumbers("portal", { start: 0, end: 3 }),
            frameRate: 8,
            repeat: 0
        });
        // Music
        this.music1 = this.sound.add("normalmusic");
        this.music1.loop = true;
        this.music1.play();
        this.music2 = this.sound.add("apocmusic");
        this.music2.loop = true;
        this.music2.play();
        this.music2.setVolume(0);
    }

    update() {
        this.internalClock++;

        this.handler.update();

        // Makes the clouds move
        this.background2.tilePositionX += .2;

        // Does parallax scrolling
        let cameraX = this.cameras.main.scrollX;
        this.background3.tilePositionX = cameraX / 30;
        this.background4.tilePositionX = cameraX / 15;
        this.background5.tilePositionX = cameraX / 20;

        let cameraY = this.cameras.main.scrollY;
        this.background3.tilePositionY = cameraY / 30;
        this.background4.tilePositionY = cameraY / 20;
        this.background5.tilePositionY = cameraY / 20;

        // Changes gravity
        if (this.player.sprite.x > 300 && this.player.sprite.x < 1000 && this.timeState === "apocalyptic") {
            this.player.sprite.setGravityY(-30);
        } else if (this.timeState === "apocalyptic") {
            this.player.sprite.setGravityY(1000);
        } else {
            this.player.sprite.setGravityY(1700);
        }

        // Connects pressure plates and doors
        if (this.pressurePlates[0].isPressed) {
            this.doors[0][0].openDoor();
        } else {
            this.doors[0][0].closeDoor();
        }

        // Opens and closes doors collision
        for (let i = 0; i < this.doors.length; i++) {
            let door = this.doors[i][0];
            let collider = this.doors[i][1];

            collider.active = !door.isOpen;
        }
    }
    
    onTimeStateChange() {
        this.baseTilemap.destroy();
        this.physics.world.removeCollider(this.playerCollider);
        this.physics.world.removeCollider(this.boxCollider1);
        this.physics.world.removeCollider(this.boxCollider2);

        for (let i = 0; i < this.doors.length; i++) {
            let collider = this.doors[i][1];
            this.physics.world.removeCollider(collider);
        }

        if (this.particles) {
            this.particles.destroy();
        }

        switch (this.timeState) {
            case "normal":
                this.baseTilemap = this.make.tilemap({ key: "testmap", tileWidth: 32, tileHeight: 32 });
                var world1tiles = this.baseTilemap.addTilesetImage("world1tileset", "world1tiles");
                this.tiles = this.baseTilemap.createLayer(0, world1tiles, 0, 0);
                this.tiles.scale = gameScale / 16;
                this.playerCollider = this.physics.add.collider(this.player.sprite, this.tiles);
                this.boxCollider1 = this.physics.add.collider(this.box.sprite, this.tiles);
                this.boxCollider2 = this.physics.add.collider(this.box.sprite, this.player.sprite);

                for (let i = 0; i < this.doors.length; i++) {
                    let door = this.doors[i][0];
                    this.doors[i][1] = this.physics.add.collider(door.sprite, this.player.sprite);
                }

                this.tiles.setCollisionBetween(1, 4);

                this.background1.setTexture("bg1", 4);
                this.background2.setTexture("bg1", 3);
                this.background3.setTexture("bg1", 2);
                this.background4.setTexture("bg1", 1);
                this.background5.setTexture("background5-normal");
                this.box.sprite.setTexture("box");

                this.player.sprite.tint = 0xffffff;
                
                this.music1.setVolume(1);
                this.music2.setVolume(0);
                break;
            case "apocalyptic":
                this.baseTilemap = this.make.tilemap({ key: "testmap2", tileWidth: 32, tileHeight: 32 });
                var world1tiles = this.baseTilemap.addTilesetImage("world1tileset", "world1tiles-purple");
                this.tiles = this.baseTilemap.createLayer(0, world1tiles, 0, 0);
                this.tiles.scale = gameScale / 16;
                this.playerCollider = this.physics.add.collider(this.player.sprite, this.tiles);
                this.boxCollider1 = this.physics.add.collider(this.box.sprite, this.tiles);
                this.boxCollider2 = this.physics.add.collider(this.box.sprite, this.player.sprite);

                this.particles = this.add.particles("normal-player");

                this.particles.createEmitter({
                    x: { min: 300, max: 1000 },
                    y: { min: 0, max: 850 },
                    lifespan: 400,
                    speedX: { min: 0, max: 0 },
                    speedY: { min: -10, max: -100 },
                    scale: { start: 0.4, end: 0.2 },
                    rotate: {start: 10, end: 200},
                    alpha: {end: 0, min: 0, max: 0.5},
                    quantity: 0.0001,
                    frequency: 0.0001,
                    blendMode: 'NORMAL'
                });

                for (let i = 0; i < this.doors.length; i++) {
                    let door = this.doors[i][0];
                    this.doors[i][1] = this.physics.add.collider(door.sprite, this.player.sprite);
                }

                this.tiles.setCollisionBetween(1, 4);

                this.background1.setTexture("bg2", 4);
                this.background2.setTexture("bg2", 3);
                this.background3.setTexture("bg2", 2);
                this.background4.setTexture("bg2", 1);
                this.background5.setTexture("background5-apocalyptic");
                this.box.sprite.setTexture("box purple");

                this.player.sprite.tint = 0xee66ff; // I couldn't think of a way to seamlessly switch spritesheets, so this is a temporary solution to that.
                        
                this.music1.setVolume(0);
                this.music2.setVolume(1);
                break;
        }
    }

}