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
import { WorkerMessageType, Packet, DrawnFrame, RawFrame } from "@typings/types";

// Variables
let extractorFinished = false;

(async () => {

	// Fix missing directories
	if (!fs.existsSync(TEMP_PATH)) fs.mkdirSync(TEMP_PATH);
	if (!fs.existsSync(VIDEO_PATH)) await downloadVideo();

	if (cluster.isMaster) {

		const worker = cluster.fork();
		const framePackets: Packet[] = [];

		worker.on("message", ({ type, data }: { type: WorkerMessageType, data: string | Packet }) => {
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

		function unpackPacket (packet: Packet) {
			packet.forEach((frame: DrawnFrame, index: number) => {
				setTimeout(() => {
					paintFrame(frame);
					if (index === (packet.length - 1)) fetchNewPacket();
				}, index * FRAME_PERIOD);
			});
		}

		function fetchNewPacket () {

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

		}

		fetchNewPacket();

	} else {

		let rawFrameQueue: RawFrame[] = [];

		setInterval(async () => {
			if (rawFrameQueue.length >= 10) {

				// Get first 10 raw frames
				const rawPacketFrames = rawFrameQueue.slice(0, 10);
				rawFrameQueue = rawFrameQueue.slice(10);

				const framePacket = new Array(rawPacketFrames.length);

				for await (const [ packetFrameIndex ] of framePacket.entries()) {{
					framePacket[packetFrameIndex] = await drawFrame(rawPacketFrames[packetFrameIndex]);
				}}

				process.send!({ type: "packet", data: framePacket });
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