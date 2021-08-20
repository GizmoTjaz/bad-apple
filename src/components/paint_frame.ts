// Types
import { DrawnFrame } from "@typings/types";

export default function (drawnFrame: DrawnFrame): void {

	//process.stdout.cursorTo(0);
	
	//for (let i = 0; i < 36; i++) {
	//	process.stdout.write("\x1B[F\x1B[2K");
	//}

	// console.log(drawnFrame);
	// a = !a;

	//process.stdout.write(new Array(36).fill("\x1B[1A").join("\x1B["))

	//process.stdout.write("\x1B[36A" + `${ a ? "\x1B[94m" : "\x1B[31m" }` + drawnFrame.data);

	process.stdout.write("\x1B[2J" + drawnFrame.data);
}