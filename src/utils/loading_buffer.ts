// Variables
let loadingBufferIndex = 0;
const loadingBuffers: LoadingBufferSymbol[] = [
	"/",
	"-",
	"\\",
	"|"
];

type LoadingBufferSymbol = "/" | "-" | "\\" | "|";

export default function loadingBuffer (): LoadingBufferSymbol {

	loadingBufferIndex += 1;
	if (loadingBufferIndex >= loadingBuffers.length) loadingBufferIndex = 0;

	return loadingBuffers[loadingBufferIndex];
}