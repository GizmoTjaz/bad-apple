// Modules
import { spawn } from "child_process";

// Types
import type { RawFrame } from "@typings/types";

export default function (videoPath: string, frameCallback: (frame: RawFrame) => void): void {

	const ffmpegProcess = spawn("ffmpeg", [
		"-i", videoPath,
		"-movflags", "+faststart",
		"-preset", "ultrafast",
		"-tune", "fastdecode",
		"-s", "48x36",
		"-c:v", "png",
		"-f", "image2pipe",
		"-"
	], {
		shell: true
	});

	const errorHandler = (data: unknown): void => {
		throw new Error(`FFmpeg quit unexpectedly: ${data}`);
	};

	ffmpegProcess.stdin.on("error", errorHandler);
	ffmpegProcess.stdout.on("error", errorHandler);
	ffmpegProcess.stdout.on("data", frameCallback);

	ffmpegProcess.on("close", (exitCode: number) => {
		if (exitCode === 0) {
			frameCallback(Buffer.from("END_FRAME"));
		} else {
			errorHandler(exitCode);
		}
	});
}
