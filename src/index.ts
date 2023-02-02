#!/usr/bin/env node

// Modules
import fs from "fs";
import cluster from "cluster";

// Components
import frameExtractor from "@components/frame_extractor";
import paintFrame from "@components/paint_frame";
import drawFrame from "@components/draw_frame";
import downloadVideo from "@components/download_video";

// Utils
import { FRAME_PERIOD, TEMP_PATH, VIDEO_PATH } from "@utils/constants";

// Types
import type { WorkerMessageType, Packet, Frame, RawFrame } from "@typings/types";

// Variables
let END_SIGNAL = false;

(async () => {

	if (!fs.existsSync(TEMP_PATH))
		fs.mkdirSync(TEMP_PATH);

	if (!fs.existsSync(VIDEO_PATH))
		await downloadVideo();

	if (cluster.isMaster) {

		const
			worker = cluster.fork(),
			frames: Frame[] = [];

		worker.on("message", ({ type, data }: { type: WorkerMessageType; data: string | Packet }) => {
			switch (type) {
				case "message":
					console.log(data);
					break;
				case "packet":
					for (let i = 0; i < (data as Packet).length; i++) {
						if ((data as Packet)[i]) {
							frames.push((data as Packet)[i]);
						}
					}
					break;
				default:
			}
		});

		const frameFethcer = setInterval(() => {

			const frame = frames.shift();
			
			if (frame) {
				paintFrame(frame);
			} else if (END_SIGNAL) {
				clearInterval(frameFethcer);
				process.exit(0);
			}

		}, FRAME_PERIOD);

	} else {

		const rawFrameQueue: RawFrame[] = [];

		const frameFetcher = setInterval(async () => {
			if ((rawFrameQueue.length >= 10 || END_SIGNAL) && process.send) {

				if (rawFrameQueue.length <= 10 && END_SIGNAL) {
					clearInterval(frameFetcher);
				}

				const
					framesToDraw = rawFrameQueue.splice(0, 10),
					drawnFramePromise: Promise<Frame>[] = [];

				for (let i = 0; i < framesToDraw.length; i++) {
					drawnFramePromise.push(drawFrame(framesToDraw[i]));
				}

				process.send({
					type: "packet",
					data: await Promise.all(drawnFramePromise)
				});
			}
		}, FRAME_PERIOD);

		frameExtractor(VIDEO_PATH, (rawFrame: RawFrame) => {
			if (rawFrame.length === 9 && rawFrame.toString() === "END_FRAME") {
				END_SIGNAL = true;
			} else {
				rawFrameQueue.push(rawFrame);
			}
		});

	}

})();
