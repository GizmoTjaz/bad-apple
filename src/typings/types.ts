export interface DrawnFrame {
	width: number;
	height: number;
	data: string;
}

export type RawFrame = Buffer;

export type Packet = DrawnFrame[];

export type WorkerMessageType = "message" | "packet";