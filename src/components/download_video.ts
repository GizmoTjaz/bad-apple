// Modules
import fs from "fs";
import ytdl from "ytdl-core";
import readline from "readline";

// Utils
import { VIDEO_PATH } from "@utils/constants";
import loadingBuffer from "@utils/loading_buffer";

function askForVideoURL (callback: (url: string) => void): void {

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	process.stdout.write("== First Time Setup ==\n");

	rl.question("Video URL (default: YouTube): ", (url: string) => {
		if (url.trim().length > 0) {
			callback(url.trim());
		} else {
			callback("https://youtu.be/FtutLA63Cp8");
		}
	});

}

export default function downloadVideo (): Promise<void> {
	return new Promise((res, rej): void => {
		askForVideoURL((url: string) => {

			const video = ytdl(url, {
				quality: "highest"
			});

			video.pipe(fs.createWriteStream(VIDEO_PATH));

			video.on("data", () => {
				console.log("\x1B[F" + `[${loadingBuffer()}] Downloading Video...`);
			});

			video.on("error", rej);

			video.on("end", () => {
				console.log("\x1B[F\x1B[0K[#] Downloaded Video\n");
				res();
			});
			
			// Go to new line so it doesn't overwrite input prompts
			process.stdout.write("\n");

		});
	});
}
