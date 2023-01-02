const { exec } = require('child_process');

const { privateKey, sshServer, githubWorkspace } = require('./inputs');
const { writeToFile } = require('./helpers');

const handleError = (errorMessage, isRequired, callback) => {
  const message = `⚠️ [CMD] Remote script failed: ${errorMessage}`;
  if (isRequired) {
    callback(new Error(message));
  } else {
    console.log(message);
  }
};

const remoteCmd = async (content, label, isRequired) => new Promise((resolve, reject) => {
  const filename = `local_ssh_script-${label}.sh`;
  try {
    writeToFile({ dir: githubWorkspace, filename, content });

    exec(`ssh -i ${privateKey} ${sshServer} 'RSYNC_STDOUT=${process.env.RSYNC_STDOUT} bash -s' < ${filename}`, (err, data, stderr) => {
      if (err) {
        handleError(err.message, isRequired, reject);
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
