const { execSync } = require('child_process');
const which = require('which');
const nodeRsync = require('rsyncwrapper');

// eslint-disable-next-line no-async-promise-executor
const validateRsync = () => new Promise(async (resolve, reject) => {
  const rsyncCli = await which('rsync', { nothrow: true });
  execSync('rsync --version', { stdio: 'inherit' });
  if (rsyncCli) {
    console.log('⚠️ [CLI] Rsync exists');
    execSync('rsync --version', { stdio: 'inherit' });
    resolve();
  }

  console.log('⚠️ [CLI] Rsync doesn\'t exists. Start installation with "apt-get" \n');

  try {
    execSync('sudo apt-get update && sudo apt-get --no-install-recommends install rsync', { stdio: 'inherit' });
    console.log('✅ [CLI] Rsync installed. \n');
    resolve();
  } catch (err) {
    reject(Error(`⚠️ [CLI] Rsync installation failed. Aborting ... error: ${err.message}`));
  }
});

const rsyncCli = ({
  source, sshServer, exclude, remotePort,
  privateKey, args, callback
}) => {
  console.log(`[Rsync] Starting Rsync Action: ${source} to ${sshServer}`);
  if (exclude) console.log(`[Rsync] excluding folders ${exclude}`);

  const defaultOptions = {
    ssh: true,
    sshCmdArgs: ['-o StrictHostKeyChecking=no'],
    recursive: true
  };

  try {
    // RSYNC COMMAND
    /* eslint-disable object-property-newline */
    nodeRsync({
      src: source, dest: sshServer, excludeFirst: exclude, port: remotePort,
      privateKey, args,
      ...defaultOptions
    }, (error, stdout, stderr, cmd) => {
      if (error) {
        console.error('⚠️ [Rsync] error: ', error.message);
        console.log('⚠️ [Rsync] stderr: ', stderr);
        console.log('⚠️ [Rsync] stdout: ', stdout);
        console.log('⚠️ [Rsync] cmd: ', cmd);
      } else {
        console.log('✅ [Rsync] finished.', stdout);
      }

      callback(error, stdout, stderr, cmd);

      if (error) {
        process.abort();
      }
    });
  } catch (err) {
    console.error('⚠️ [Rsync] command error: ', err.message, err.stack);
    process.abort();
  }
};

const sshDeploy = (params) => {
  validateRsync
    .then(() => {
      rsyncCli(params);
    })
    .catch((err) => {
      throw err;
    });
};

module.exports = {
  sshDeploy
};
