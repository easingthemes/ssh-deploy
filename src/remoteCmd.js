const { exec } = require('child_process');
const { sshServer, githubWorkspace } = require('./inputs');
const { writeToFile } = require('./helpers');

const handleError = (message, isRequired, callback) => {
  if (isRequired) {
    callback(new Error(message));
  } else {
    console.warn(message);
  }
};

// eslint-disable-next-line max-len
const remoteCmd = async (content, privateKeyPath, isRequired, label) => new Promise((resolve, reject) => {
  const filename = `local_ssh_script-${label}.sh`;
  try {
    writeToFile({ dir: githubWorkspace, filename, content });
    console.log(`Executing remote script: ssh -i ${privateKeyPath} ${sshServer}`);
    exec(
      `DEBIAN_FRONTEND=noninteractive ssh -i ${privateKeyPath} ${sshServer} 'RSYNC_STDOUT="${process.env.RSYNC_STDOUT}" bash -s' < ${filename}`,
      (err, data, stderr) => {
        if (err) {
          const message = `⚠️ [CMD] Remote script failed: ${err.message}`;
          console.warn(`${message} \n`, data, stderr);
          handleError(message, isRequired, reject);
        } else {
          console.log('✅ [CMD] Remote script executed. \n', data, stderr);
          resolve(data);
        }
      }
    );
  } catch (err) {
    handleError(err.message, isRequired, reject);
  }
});

module.exports = {
  remoteCmdBefore: async (cmd, privateKeyPath, isRequired) => remoteCmd(cmd, privateKeyPath, isRequired, 'before'),
  remoteCmdAfter: async (cmd, privateKeyPath, isRequired) => remoteCmd(cmd, privateKeyPath, isRequired, 'after')
};
