const { sync: commandExists } = require('command-exists');
const { get: nodeCmd } = require('node-cmd');

const validateRsync = (callback = () => {}) => {
  const rsyncCli = commandExists.sync('rsync');

  if (!rsyncCli) {
    nodeCmd(
      'sudo apt-get --no-install-recommends install rsync',
      (err, data, stderr) => {
        if (err) {
          console.log('⚠️ [CLI] Rsync installation failed ', err.message);
          process.abort();
        } else {
          console.log('✅ [CLI] Rsync installed. \n', data, stderr);
          callback();
        }
      }
    );
  } else {
    callback();
  }
};

const validateInputs = (inputs) => {
  const validInputs = inputs.filter((input) => {
    if (!input) {
      console.error(`⚠️ ${input} is mandatory`);
    }

    return input;
  });

  if (validInputs.length !== inputs.length) {
    process.abort();
  }
};

module.exports = {
  validateRsync,
  validateInputs
}
