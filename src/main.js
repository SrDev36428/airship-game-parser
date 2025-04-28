import { Start } from './scenes/Start.js';

const config = {
    type: Phaser.AUTO,
    title: 'ship',
    description: '',
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    pixelArt: false,
    physics: {
        default: 'arcade',
    },
    scene: [
        Start
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
