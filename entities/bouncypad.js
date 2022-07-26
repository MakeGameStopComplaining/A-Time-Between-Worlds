class BouncyPad extends Entity {
    constructor(handler, scene, spriteName, entityName) {
        super(handler, scene, spriteName, entityName);
        this.sprite.scale = gameScale / 16;
        this.overlapper = this.scene.physics.add.overlap(this.scene.player.sprite, this.sprite, this.onHit, null, this);
        this.strength = 900;
    }

    onHit(player, pad) {
        player.body.velocity.y = -this.strength;
        this.remakeOverlapper();
    }

    remakeOverlapper() {
        this.overlapper.destroy();
        this.overlapper = this.scene.physics.add.overlap(this.scene.player.sprite, this.sprite, this.onHit, null, this);
    }
}