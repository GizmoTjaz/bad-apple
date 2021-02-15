// Modules
const fs = require("fs");
const path = require("path");

// Variables
const frames = JSON.parse(fs.readFileSync(path.join(__dirname, "../", "temp", "frames.json")));

// Constants
const IMAGE_WIDTH = 48;
const IMAGE_HEIGHT = 36;
const PLAYBACK_FPS = 30;

// Create empty canvas
for (let i = 0; i < IMAGE_HEIGHT; i++) {
    console.log("\n");
}

/* Replace color
    frames = frames.map(frame => {
        return frame.replace(/\./gm, "\u001b[33m.\u001b[0m");
    });
*/

for (let i = 0; i < frames.length; i++) {
    setTimeout(() => {
        console.log(`${ Array(IMAGE_HEIGHT).join("\033[F") }${ frames[i] }`);
    }, i * (1 / PLAYBACK_FPS * 1000));
}