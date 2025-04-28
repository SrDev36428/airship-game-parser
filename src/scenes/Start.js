export class Start extends Phaser.Scene {
    constructor() {
        super('Start'); // Call the Phaser.Scene constructor with key 'Start'

        // Initialize variables
        this.initShip = 36; // Starting frame index for accessories
        this.target = null; // Target position where the ship moves
        this.isMouseDown = false; // Track if mouse is pressed down
        this.speed = 100; // Movement speed in pixels per second
        this.currentAngle = 0; // Current movement angle (in radians)
    }

    preload() {
        // Load images and spritesheets
        this.load.image('background', 'assets/background/screenshot.png'); // Background image
        this.load.image('sun', 'assets/background/sun.png'); // Sun image
        this.load.spritesheet('ship', 'assets/ship/ship93.png', { frameWidth: 225, frameHeight: 225 }); // Accessories sprite sheet (72 frames)
        this.load.spritesheet('venga', 'assets/ship/venga.png', { frameWidth: 164, frameHeight: 118 }); // Main ship sprite sheet (32 frames)
    }

    create() {
        // Add and resize the background
        const bg = this.add.image(0, 0, 'background').setOrigin(0);
        bg.setDisplaySize(this.scale.width, this.scale.height); // Stretch background to full screen

        // Add the sun image at the center
        this.sun = this.add.image(this.scale.width / 2, this.scale.height / 2, 'sun').setScale(0.5);

        // Add the main ship sprite at 3/4 width and center height
        this.ship = this.add.sprite(this.scale.width * 3 / 4, this.scale.height / 2, 'venga', 0)
            .setScale(0.7) // Resize ship
            .setInteractive(); // Make ship interactive (clickable)

        // Prepare accessories list
        this.accessories = [];

        // Set accessory offset positions relative to the ship
        const accessoryOffsets = [
            { x: 100, y: -80 }, // Top-right offset
            { x: 100, y: 80 }   // Bottom-right offset
        ];

        // Create accessories and attach to ship
        accessoryOffsets.forEach(offset => {
            const acc = this.add.sprite(this.ship.x + offset.x, this.ship.y + offset.y, 'ship', 0).setScale(0.4);
            acc.setFrame(this.initShip); // Set initial frame
            acc.setInteractive(); // Make accessory interactive
            acc.offset = offset; // Save relative position
            this.accessories.push(acc); // Add to list
        });

        // Setup input event: pointer down
        this.input.on('pointerdown', (pointer, gameObjects) => {
            if (gameObjects.length === 0) {
                // Clicked empty space: set target position
                this.target = { x: pointer.x, y: pointer.y };
                this.isMouseDown = true;
            } else {
                // Clicked on ship or accessories: do nothing
                this.target = null;
            }
        });

        // Setup input event: pointer up
        this.input.on('pointerup', () => {
            this.isMouseDown = false; // Stop tracking mouse movement
        });

        // Setup input event: pointer move
        this.input.on('pointermove', (pointer, gameObjects) => {
            if (this.isMouseDown) {
                // Update target while dragging mouse
                this.target = { x: pointer.x, y: pointer.y };
            }
        });
    }

    update(time, delta) {
        let targetX, targetY;

        if (this.isMouseDown) {
            const pointer = this.input.activePointer;
            targetX = pointer.x;
            targetY = pointer.y;
        } else if (this.target) {
            targetX = this.target.x;
            targetY = this.target.y;
        }

        if (targetX !== undefined) {
            const distance = Phaser.Math.Distance.Between(this.ship.x, this.ship.y, targetX, targetY);

            if (distance < 5) {
                // Close enough: snap to target without changing angle
                this.ship.x = targetX;
                this.ship.y = targetY;

                if (!this.isMouseDown) this.target = null; // Clear target if not dragging

            } else {
                // Only update angle if actually moving
                this.currentAngle = Phaser.Math.Angle.Between(this.ship.x, this.ship.y, targetX, targetY);

                const velocityX = Math.cos(this.currentAngle) * this.speed * (delta / 1000);
                const velocityY = Math.sin(this.currentAngle) * this.speed * (delta / 1000);

                this.ship.x += velocityX;
                this.ship.y += velocityY;
            }

            // These can happen always
            this.updateVengaFrames();
            this.updateShipFrames();
            this.accessories.forEach(acc => {
                acc.x = this.ship.x + acc.offset.x;
                acc.y = this.ship.y + acc.offset.y;
            });
        }
    }


    updateVengaFrames() {
        // Calculate the frame for the main ship based on the angle
        let degrees = Phaser.Math.RadToDeg(this.currentAngle) + 180; // Convert radians to degrees
        degrees = (degrees + 360) % 360; // Normalize 0-360 degrees

        const vengaFrame = Math.round((degrees / 360) * 31) % 32; // 32 frames
        this.ship.setFrame(vengaFrame); // Set ship frame
    }

    updateShipFrames() {
        // Calculate frame for accessories
        let degrees = Phaser.Math.RadToDeg(this.currentAngle);
        const inverseDegrees = (360 - degrees) % 360; // Inverse because accessories are flipped

        const ship93Frame = Math.round((inverseDegrees / 360) * 71) % 72; // 72 frames
        this.accessories.forEach(acc => {
            acc.setFrame(ship93Frame); // Set accessory frame
        });
    }
}
