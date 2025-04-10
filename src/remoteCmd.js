const { exec } = require('child_process');
const crypto = require('crypto');
const { sshServer, githubWorkspace, remotePort } = require('./inputs');
const { writeToFile, deleteFile } = require('./helpers');

const handleError = (message, isRequired, callback) => {
  if (isRequired) {
    callback(new Error(message));
  } else {
    console.warn(message);
  }
};

// eslint-disable-next-line max-len
const remoteCmd = async (content, privateKeyPath, isRequired, label, sshCmdArgs) => new Promise((resolve, reject) => {
  const uuid = crypto.randomUUID();
  const filename = `local_ssh_script-${label}-${uuid}.sh`;
  try {
    writeToFile({ dir: githubWorkspace, filename, content });
    const dataLimit = 10000;
    const rsyncStdout = (process.env.RSYNC_STDOUT || '').substring(0, dataLimit);
    console.log(`Executing remote script: ssh -i ${privateKeyPath} ${sshCmdArgs} ${sshServer}`);
    exec(
      `DEBIAN_FRONTEND=noninteractive ssh -p ${(remotePort || 22)} -i ${privateKeyPath} ${sshCmdArgs} ${sshServer} 'RSYNC_STDOUT="${rsyncStdout}" bash -s' < ${filename}`,
      (err, data = '', stderr = '') => {
        if (err) {
          const message = `⚠️ [CMD] Remote script failed: ${err.message}`;
          console.warn(`${message} \n`, data, stderr);
          handleError(message, isRequired, reject);
        } else {
          const limited = data.substring(0, dataLimit);
          console.log('✅ [CMD] Remote script executed. \n', limited, stderr);
          deleteFile({ dir: githubWorkspace, filename });
          console.log('✅ [FILE] Script file deleted.');
          resolve(limited);
        }
      }
    );
  } catch (err) {
    handleError(err.message, isRequired, reject);
  }
});

module.exports = {
  remoteCmdBefore: async (cmd, privateKeyPath, isRequired, sshCmdArgs) => remoteCmd(cmd, privateKeyPath, isRequired, 'before', sshCmdArgs),
  remoteCmdAfter: async (cmd, privateKeyPath, isRequired, sshCmdArgs) => remoteCmd(cmd, privateKeyPath, isRequired, 'after', sshCmdArgs)
};
