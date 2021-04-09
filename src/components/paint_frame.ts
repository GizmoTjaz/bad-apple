// Types
import { DrawnFrame } from "@typings/types";

export default function (drawnFrame: DrawnFrame) {
	//process.stdout.cursorTo(0);
	
	for (let i = 0; i < 36; i++) {
		process.stdout.write("\x1B[F\x1B[2K");
	}

	process.stdout.write(drawnFrame.data);
}