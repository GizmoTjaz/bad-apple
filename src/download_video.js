// Modules
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const ytdl = require("ytdl-core");

// Utils
const loadingBuffer = require("./loading_buffer");

// Variables
const tempPath = path.join(__dirname, "../", "temp");
const framePath = path.join(tempPath, "frames");

// Add missing directories
if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);
if (!fs.existsSync(framePath)) fs.mkdirSync(framePath);

const video = ytdl("https://www.youtube.com/watch?v=FtutLA63Cp8", {
    quality: "highest"
});

// So the next logging won't collide with the CLI lines
console.log("\n");

video.pipe(fs.createWriteStream(path.join(__dirname, "../", "temp", "out.mp4")));

video.on("data", () => {
    console.log("\033[F" + `[${ loadingBuffer() }] Downloading Video...`);
});

video.on("end", () => {

    console.log("\033[F\033[0K[#] Downloaded Video\n");

    const proc = spawn("ffmpeg", [
        "-i", path.join(tempPath, "out.mp4"),
        path.join(framePath, "/%03d.png"),
        "-preset", "ultrafast"
    ], {
        shell: true
    });

    // For some reason it outputs data to stderr...
    proc.stderr.on("data", data => {
        console.log("\033[F" + `[${ loadingBuffer() }] Splitting Frames...`);
    });

    proc.on("close", exitCode => {
        console.log("\033[F\033[0K" + "[#] Done Splitting Frames");
        process.exit(exitCode);
    });

});

video.on("error", err => {
    console.error(err);
});
