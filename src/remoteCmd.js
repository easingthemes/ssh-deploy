const { exec } = require('child_process');

const { privateKey, sshServer, githubWorkspace } = require('./inputs');
const { writeToFile } = require('./helpers');

const handleError = (message, isRequired, callback) => {
  if (isRequired) {
    callback(new Error(message));
  } else {
    console.warn(message);
  }
};

const remoteCmd = async (content, label, isRequired) => new Promise((resolve, reject) => {
  const filename = `local_ssh_script-${label}.sh`;
  try {
    writeToFile({ dir: githubWorkspace, filename, content });
    console.log(`Executing remote script: ssh -i ${privateKey} ${sshServer}`);
    exec(`DEBIAN_FRONTEND=noninteractive ssh -i ${privateKey} ${sshServer} 'RSYNC_STDOUT=${process.env.RSYNC_STDOUT} bash -s' < ${filename}`, (err, data, stderr) => {
      if (err) {
        const message = `⚠️ [CMD] Remote script failed: ${err.message}`;
        console.warn(`${message} \n`, data, stderr);
        handleError(message, isRequired, reject);
      } else {
        console.log('✅ [CMD] Remote script executed. \n', data, stderr);
        resolve(data);
      }
    });
  } catch (err) {
    handleError(err.message, isRequired, reject);
  }
});

module.exports = {
  remoteCmdBefore: async (cmd, isRequired) => remoteCmd(cmd, 'before', isRequired),
  remoteCmdAfter: async (cmd, isRequired) => remoteCmd(cmd, 'after', isRequired)
};
