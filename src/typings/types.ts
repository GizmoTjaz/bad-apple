export type RawFrame = Buffer;

export interface Frame {
	width: number;
	height: number;
	data: string;
}

export type Packet = Frame[];

export type WorkerMessageType = "message" | "packet";
