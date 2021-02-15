// Modules
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

// Utils
const loadingBuffer = require("./loading_buffer");

// Variables
const tempPath = path.join(__dirname, "../", "temp");
const framePath = path.join(tempPath, "frames");
const frameOutputPath = path.join(tempPath, "frames.json");

let framesDump = [];

// Constants
const IMAGE_WIDTH = 48;
const IMAGE_HEIGHT = 36;

fs.writeFileSync(frameOutputPath, JSON.stringify([]));

function saveDump () {

    const frames = JSON.parse(fs.readFileSync(frameOutputPath));
    fs.writeFileSync(frameOutputPath, JSON.stringify(frames.concat(framesDump)));

    framesDump = [];
    global.gc();

}

async function convertFrame (file) {

    const frameIndex = path.basename(file).split(".")[0];

    let
        frame = "",
        img = await sharp(file, { sequentialRead: true }).resize(IMAGE_WIDTH, IMAGE_HEIGHT).raw().toBuffer({ resolveWithObject: true });

    console.log("\033[F\033[0K" + `[${ loadingBuffer() }] Converting Frames... (#${ frameIndex })`);

    for (let y = 0; y < IMAGE_HEIGHT; y++) {

        for (let x = 0; x < IMAGE_WIDTH; x++) {
            const pixel = img.data[(y * 3) * IMAGE_WIDTH + (x * 3)];
            frame += pixel >= 250 ? " " : ".";
        }

        frame += "\n";
    }

    framesDump.push(frame);

    if (framesDump.length >= 400) {
        saveDump();
    }

    frame = undefined;
}

if (!(global.gc instanceof Function)) {
    console.error("You must expose the Garbage Collector before converting all frames");
    process.exit(1);
}

console.log("[.] Converting Frames...");

(async () => {
    for await (const frame of fs.readdirSync(framePath).sort((a, b) => parseInt(a) - parseInt(b))) {
        await convertFrame(path.join(framePath, frame));
    }
})().then(() => {
    saveDump();
    console.log("\033[F\033[0K[#] Finished Converting Frames");
});