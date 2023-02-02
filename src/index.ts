#!/usr/bin/env node

// Modules
import fs from "fs";
import cluster from "cluster";

// Utils
import { FRAME_PERIOD, TEMP_PATH, VIDEO_PATH } from "@utils/constants";

// Components
import frameExtractor from "@components/frame_extractor";
import paintFrame from "@components/paint_frame";
import drawFrame from "@components/draw_frame";
import downloadVideo from "@components/download_video";

// Types
import type { WorkerMessageType, Packet, DrawnFrame, RawFrame } from "@typings/types";

// Variables
let extractorFinished = false;

(async () => {

	// Fix missing directories
	if (!fs.existsSync(TEMP_PATH)) fs.mkdirSync(TEMP_PATH);
	if (!fs.existsSync(VIDEO_PATH)) await downloadVideo();

	if (cluster.isMaster) {

		const worker = cluster.fork();
		const framePackets: Packet[] = [];

		worker.on("message", ({ type, data }: { type: WorkerMessageType; data: string | Packet }) => {
			switch (type) {
				case "message":
					console.log(data);
					break;
				case "packet":
					framePackets.push(data as Packet);
					break;
				default:
			}
		});

		const unpackPacket = (packet: Packet): void => {
			for (let i = 0; i <= packet.length; i++) {

				const frame = packet[i];

				if (frame) {
					setTimeout(() => {
						paintFrame(frame);
						if (i === (packet.length - 1)) fetchNewPacket();
					}, i * FRAME_PERIOD);
				}
			}
		};
		
		const fetchNewPacket = (): void => {
		
			const framePacket: Packet = framePackets[0];
		
			if (framePacket) {
				framePackets.shift();
				unpackPacket(framePacket);
			} else {
				setTimeout(() => {
					if (framePackets.length === 0 && extractorFinished) {
						process.exit(0);
					} else {
						fetchNewPacket();
					}
				}, FRAME_PERIOD);
			}
		
		};

		fetchNewPacket();

	} else {

		const rawFrameQueue: RawFrame[] = [];

		setInterval(async () => {
			if (rawFrameQueue.length >= 10 && process.send) {

				
				// Get first 10 raw frames
				const
					_rawFrameQueue = rawFrameQueue.splice(0, 10),
					framePacketPromise: Promise<DrawnFrame>[] = [];

				for (let i = 0; i <= _rawFrameQueue.length; i++) {

					const rawFrame = _rawFrameQueue[i];

					if (rawFrame) {
						framePacketPromise.push(drawFrame(rawFrame));
					}
				}

				process.send({
					type: "packet",
					data: await Promise.all(framePacketPromise)
				});
			}
		}, FRAME_PERIOD);

		frameExtractor(VIDEO_PATH, (frame: RawFrame) => {
			rawFrameQueue.push(frame);
		}).then(() => {
			extractorFinished = true;
		}).catch(err => {
			throw err;
		});

	}

})();
