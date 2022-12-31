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
  try {
    execSync("sudo apt-get update", { stdio: 'inherit' });
  } catch (e) {
    console.log( "⚠️ [CLI] Cant run . apt-get update. Skipping ...". e.message);
  }

  exec("sudo apt-get --no-install-recommends install rsync", { stdio: 'inherit' }, (err, data, stderr) => {
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
