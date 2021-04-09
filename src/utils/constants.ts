// Modules
import path from "path";

export const PLAYBACK_FPS = 30;
export const FRAME_PERIOD = 1 / 30 * 1000;
export const TEMP_PATH = path.join(__dirname, "../", "temp");
export const VIDEO_PATH = path.join(TEMP_PATH, "video.mp4");