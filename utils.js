const fs = require('fs');

module.exports.createOutputDir = (dir) => {
  try {
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir)
    }
  } catch (err) {
    console.error(err)
  }
}

module.exports.logger = (logMode, message) => {
  if (logMode) {
    console.log(message);
  }
}

module.exports.calculateElapsedTime = (startTime) => {
  const elapsed = Date.now() - startTime;
  const totalTimeInSeconds = elapsed / 1000;
  const seconds = Math.floor(totalTimeInSeconds % 60);
  const minutes = Math.floor(totalTimeInSeconds / 60);
  return {
  	seconds,
  	minutes,
  };
}