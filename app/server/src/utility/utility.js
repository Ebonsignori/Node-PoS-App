// Use await to sleep in synchronous code for the specified milliseconds
async function sleepFor(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = {
    sleepFor: sleepFor
};