// Modules
import sharp from "sharp";

// Types
import { DrawnFrame, RawFrame } from "@typings/types";

export default async function (frame: RawFrame): Promise<DrawnFrame> {

	const
		image = sharp(frame, { sequentialRead: true }).raw(),
		imageData = await image.toBuffer({ resolveWithObject: true });

	const {
		info: {
			width: IMAGE_WIDTH,
			height: IMAGE_HEIGHT
		},
		data: IMAGE_DATA
	} = imageData;

	let drawnFrame = "";

	for (let y = 0; y < IMAGE_HEIGHT; y++) {
		
		for (let x = 0; x < IMAGE_WIDTH; x++) {

			const pixel = IMAGE_DATA[(y * 3) * IMAGE_WIDTH + (x * 3)];

			drawnFrame += pixel >= 250
				? ""
				: ".";

		}

		drawnFrame += "\n";
	}

	return {
		width: IMAGE_WIDTH,
		height: IMAGE_HEIGHT,
		data: drawnFrame
	};

}