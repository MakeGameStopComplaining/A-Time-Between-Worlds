class Portal extends Collectable {
    constructor(handler, scene, spriteName, entityName, thisLevel, nextLevel) {
        super(handler, scene, spriteName, entityName);

        this.handler = handler;
        this.thisLevel = thisLevel;
        this.nextLevel = nextLevel;

        this.sprite.scale = gameScale / 16;
    }

    update() {
        this.sprite.play("portal-animation", true);
    }

    onPickup() {
        // This triggers when the player beats the level
        this.scene.scene.start(this.nextLevel);
        this.scene.scene.stop(this.thisLevel);
        this.scene.stopMusic();
        this.handler.clearEntities();
        if (this.scene.wizard) this.scene.wizard.destroy();
    }
}