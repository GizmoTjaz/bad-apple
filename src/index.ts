// Modules
import fs from "fs";
import path from "path";
import cluster from "cluster";

// Paths
const tempPath = path.join(__dirname, "../temp");
const videoPath = path.join(tempPath, "video.mp4");

// Utils
import { FRAME_PERIOD } from "@utils/constants";

// Components
import frameExtractor from "@components/frame_extractor";
import paintFrame from "@components/paint_frame";
import drawFrame from "@components/draw_frame";

// Types
import { WorkerMessageType, Packet, DrawnFrame, RawFrame } from "@typings/types";

// Fix missing directories
if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);
if (!fs.existsSync(videoPath)) {



}

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
		packet.forEach((frame: DrawnFrame, index) => {
			setTimeout(() => {
				paintFrame(frame);
				if (index === (packet.length - 1)) fetchNewPacket();
			}, index * FRAME_PERIOD);
		});
	}

	function fetchNewPacket () {

		const framePacket: Packet = framePackets[0];

		if (framePackets) {
			framePackets.shift();
			unpackPacket(framePacket);
		} else {
			setTimeout(() => {
				fetchNewPacket();
			}, FRAME_PERIOD);
		}

	}

	fetchNewPacket();

} else {

	let rawFrameQueue: RawFrame[] = [];

	setInterval(async () => {
		if (rawFrameQueue.length > 10) {

			const rawPacketFrames = rawFrameQueue.slice(0, 10);
			rawFrameQueue = rawFrameQueue.slice(10);

			const framePacket = new Array(rawPacketFrames.length);

			for await (const [ packetFrameIndex ] of framePacket.entries()) {{
				framePacket[packetFrameIndex] = await drawFrame(rawPacketFrames[packetFrameIndex]);
			}}

			if (process) {
				process.send!({ type: "packet", data: framePacket });
			}
		}
	}, FRAME_PERIOD);

	frameExtractor(videoPath, (frame: RawFrame) => {
		rawFrameQueue.push(frame);
	}).then(() => {
		process.exit(0);
	}).catch(err => {
		throw err;
	});

}