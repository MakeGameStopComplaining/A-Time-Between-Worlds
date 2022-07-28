const gameWidth = 960;
const gameHeight = 540;
const tileSize = 32;
const gameScale = gameWidth / tileSize;

window.onload = function() {
    var config = {
        width: gameWidth,
        height: gameHeight,
        physics: {
            default: "arcade",
            arcade: {
                gravity: { y: 0, x: 0 },
                debug: false,
                fps: 60
            }
        },
        fps: {
            target: 60,
            forceSetTimeOut: true
        },
        scene: [/*MainMenu, */Scene1, HUD],
        pixelArt: true
    };
    
    var game = new Phaser.Game(config);
};