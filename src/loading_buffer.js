// Variables
const loadingBuffers = [
    "/",
    "-",
    "\\",
    "|"
];
let loadingBufferIndex = 0;

/**
* Updates loading buffer icon
* @returns {String}
*/
module.exports = function loadingBuffer () {
   loadingBufferIndex += 1;
   if (loadingBufferIndex >= loadingBuffers.length) loadingBufferIndex = 0;
   return loadingBuffers[loadingBufferIndex];
}