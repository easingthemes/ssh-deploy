const { sync: commandExists } = require("command-exists");
const { exec, execSync } = require("child_process");

const validateRsync = (callback = () => {}) => {
  const rsyncCli = commandExists("rsync");
  if (rsyncCli) {
    console.log('⚠️ [CLI] Rsync exists');
    const rsyncVersion = execSync("rsync --version", { stdio: 'inherit' });
    return callback();
  }

  console.log('⚠️ [CLI] Rsync doesn\'t exists. Start installation with "apt-get" \n');

  exec("sudo apt-get update && sudo apt-get --no-install-recommends install rsync", (err, data, stderr) => {
    if (err) {
      console.log("⚠️ [CLI] Rsync installation failed. Aborting ... ", err.message);
      process.abort();
    } else {
      console.log("✅ [CLI] Rsync installed. \n", data, stderr);
      callback();
    }
  });
};

const validateInputs = (inputs) => {
  const inputKeys = Object.keys(inputs);
  const validInputs = inputKeys.filter((inputKey) => {
    const inputValue = inputs[inputKey];

    if (!inputValue) {
      console.error(`⚠️ [INPUTS] ${inputKey} is mandatory`);
    }

    return inputValue;
  });

  if (validInputs.length !== inputKeys.length) {
    console.error("⚠️ [INPUTS] Inputs not valid, aborting ...");
    process.abort();
  }
};

module.exports = {
  validateRsync,
  validateInputs,
};
