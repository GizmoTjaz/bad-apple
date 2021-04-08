// Types
import { DrawnFrame } from "@typings/types";

export default function (drawnFrame: DrawnFrame) {
	process.stdout.cursorTo(0);
	process.stdout.write(drawnFrame.data);
}