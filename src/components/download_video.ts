// Modules
import fs from "fs";
import ytdl from "ytdl-core";
import readline from "readline";

// Utils
import { VIDEO_PATH } from "@utils/constants";
import loadingBuffer from "@utils/loading_buffer";

// function askForVideoURL (callback: (url: string) => void): void {

// 	const rl = readline.createInterface({
// 		input: process.stdin,
// 		output: process.stdout
// 	});

// 	rl.question("YouTube video URL (default: Bad Apple): ", (url: string) => {
// 		if (url) {
// 			callback(url);
// 		} else {
// 			console.error("You must specify a URL");
// 			askForVideoURL(callback);
// 		}
// 	});

// }

export default function downloadVideo (): Promise<void> {
	return new Promise((res, rej): void => {

		const video = ytdl("https://youtu.be/FtutLA63Cp8", {
			quality: "highest"
		});

		video.pipe(fs.createWriteStream(VIDEO_PATH));

		video.on("data", () => {
			console.log("\x1B[F" + `[${loadingBuffer()}] Downloading Video...`);
		});

		video.on("end", () => {
			console.log("\x1B[F\x1B[0K[#] Downloaded Video\n");
			res();
		});

		video.on("error", rej);

		// askForVideoURL((url: string) => {

		// 	// Go to new line so it doesn't overwrite input prompts
		// 	process.stdout.write("\n");

		// });
	});
}
