export class Start extends Phaser.Scene {
    constructor() {
        super('Start');

        // Target position to move towards
        this.target = null;
        this.isMouseDown = false; // Whether mouse is being held down
        this.speed = 100;          // Movement speed (pixels per second)
        this.currentAngle = 0;     // Current rotation angle of ship (radians)
        this.arrived = false;      // Whether the ship has arrived at target
    }

    preload() {
        // Load background and sun images
        this.load.image('background', 'assets/background/screenshot.png');
        this.load.image('sun', 'assets/background/sun.png');

        // Load ship spritesheets (animations with multiple frames)
        this.load.spritesheet('ship', 'assets/ship/ship93.png', { frameWidth: 225, frameHeight: 225 });
        this.load.spritesheet('venga', 'assets/ship/venga.png', { frameWidth: 164, frameHeight: 118 });
    }

    create() {
        // Add and scale background
        const bg = this.add.image(0, 0, 'background').setOrigin(0);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        // Add sun decoration at center
        this.sun = this.add.image(this.scale.width / 2, this.scale.height / 2, 'sun').setScale(0.5);

        // Add the main ship (venga) and make it interactive (clickable)
        this.ship = this.add.sprite(this.scale.width * 1 / 4, this.scale.height / 2, 'venga', 0)
            .setScale(0.7)
            .setInteractive();

        // Create accessory sprites (attached to ship)
        this.accessories = [];
        this.accessories.push(this.add.sprite(this.ship.x, this.ship.y, 'ship', 0).setScale(0.4));
        this.accessories.push(this.add.sprite(this.ship.x, this.ship.y, 'ship', 0).setScale(0.4));

        // Define offsets for accessories relative to ship position
        this.accessoryOffsets = [
            { x: 100, y: -80 },
            { x: 100, y: 80 }
        ];

        /** --- Setup Input Events --- */

        // Handle mouse down (left click)
        this.input.on('pointerdown', (pointer, gameObjects) => {
            if (gameObjects.length === 0) {
                // If clicked on empty space, set target to mouse position
                this.target = { x: pointer.x, y: pointer.y };
                this.isMouseDown = true;
                this.arrived = true;
            } else {
                // If clicked on a ship or accessory, ignore
                this.target = null;
            }
        });

        // Handle mouse release
        this.input.on('pointerup', () => {
            this.isMouseDown = false;
            this.arrived = false;
        });

        // Handle mouse move while dragging
        this.input.on('pointermove', (pointer, gameObjects) => {
            if (this.isMouseDown & this.arrived) {
                // Continuously update target while mouse is held
                this.target = { x: pointer.x, y: pointer.y };
            }
        });
    }

    update(time, delta) {
        let targetX, targetY;

        // Update target coordinates based on whether mouse is held
        if (this.isMouseDown & this.arrived) {
            const pointer = this.input.activePointer;
            targetX = pointer.x;
            targetY = pointer.y;
        } else if (this.target) {
            targetX = this.target.x;
            targetY = this.target.y;
        }

        // If we have a valid target, move towards it
        if (targetX !== undefined) {
            const dx = targetX - this.ship.x;
            const dy = targetY - this.ship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 5) {
                // Move towards the target
                const angle = Math.atan2(dy, dx);
                const vx = Math.cos(angle) * this.speed * (delta / 1000);
                const vy = Math.sin(angle) * this.speed * (delta / 1000);

                this.ship.x += vx;
                this.ship.y += vy;
                this.currentAngle = angle; // Save angle for rotation updates
            } else {
                // Stop moving if close enough
                if (this.arrived) {
                    this.arrived = false;
                }
            }
        }

        // Update animation frames based on current angle
        this.updateVengaFrames();
        this.updateShip93Frames();

        // Update accessory positions based on ship's position and rotation
        this.accessories.forEach((accessory, index) => {
            const offset = this.accessoryOffsets[index];

            // Rotate offset around ship
            const offsetX = Math.cos(this.currentAngle) * offset.x - Math.sin(this.currentAngle) * offset.y;
            const offsetY = Math.sin(this.currentAngle) * offset.x + Math.cos(this.currentAngle) * offset.y;

            accessory.x = this.ship.x - offsetX;
            accessory.y = this.ship.y - offsetY;
        });
    }

    updateVengaFrames() {
        // Update the venga ship frame to match the direction (360° mapped to 32 frames)
        let degrees = Phaser.Math.RadToDeg(this.currentAngle) + 180;
        degrees = (degrees + 360) % 360; // Normalize between 0–360
        const frame = Math.round((degrees / 360) * 31) % 32; // 32 frames total
        this.ship.setFrame(frame);
    }

    updateShip93Frames() {
        // Update accessory frames to match ship's rotation (360° mapped to 72 frames)
        let degrees = Phaser.Math.RadToDeg(this.currentAngle);
        const inverseDegrees = (360 - degrees) % 360;
        const frame = Math.round((inverseDegrees / 360) * 71) % 72; // 72 frames total
        this.accessories.forEach(acc => acc.setFrame(frame));
    }
}
