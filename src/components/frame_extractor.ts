// Modules
import { spawn } from "child_process";

// Types
import { RawFrame } from "@typings/types";

type ErrCallback = Error | number;

export default function (videoPath: string, frameCallback: (frame: RawFrame) => void): Promise<void> {
	return new Promise((res: () => void, rej: (err: ErrCallback) => void) => {

		const ffmpegProcess = spawn("ffmpeg", [
			"-i", videoPath,
			"-preset", "ultrafast",
			"-tune", "fastdecode",
			"-s", "48x36",
			"-c:v", "png",
			"-f", "image2pipe",
			"-"
		], {
			shell: true
		});
	
		ffmpegProcess.stdin.on("error", rej);
		ffmpegProcess.stdout.on("error", rej);
		ffmpegProcess.stdout.on("data", frameCallback);
	
		ffmpegProcess.on("close", (exitCode: number) => {
			exitCode === 0
				? res()
				: rej(exitCode);
		});

	});
}