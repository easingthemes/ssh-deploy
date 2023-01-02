const { execSync } = require('child_process');
const nodeRsync = require('rsyncwrapper');

// eslint-disable-next-line no-async-promise-executor
const validateRsync = new Promise(async (resolve, reject) => {
  let rsyncCli = false;
  try {
    execSync('rsync --version', { stdio: 'inherit' });
    rsyncCli = true;
  } catch (e) {
    rsyncCli = false;
    console.log('⚠️ [CLI] Rsync doesn\'t exists', e);
  }

  if (rsyncCli) {
    console.log('⚠️ [CLI] Rsync exists');
    execSync('rsync --version', { stdio: 'inherit' });
    resolve();
  }

  console.log('⚠️ [CLI] Rsync doesn\'t exists. Start installation with "apt-get" \n');
  try {
    execSync('sudo DEBIAN_FRONTEND=noninteractive apt-get -y update && sudo DEBIAN_FRONTEND=noninteractive apt-get --no-install-recommends -y install rsync', { stdio: 'inherit' });
    console.log('✅ [CLI] Rsync installed. \n');
    resolve();
  } catch (err) {
    reject(Error(`⚠️ [CLI] Rsync installation failed. Aborting ... error: ${err.message}`));
  }
});

const rsyncCli = ({
  source, rsyncServer, exclude, remotePort,
  privateKey, args, sshCmdArgs, callback
}) => {
  console.log(`[Rsync] Starting Rsync Action: ${source} to ${rsyncServer}`);
  if (exclude) console.log(`[Rsync] excluding folders ${exclude}`);

  const defaultOptions = {
    ssh: true,
    recursive: true
  };

  try {
    // RSYNC COMMAND
    /* eslint-disable object-property-newline */
    nodeRsync({
      ...defaultOptions,
      src: source, dest: rsyncServer, excludeFirst: exclude, port: remotePort,
      privateKey, args, sshCmdArgs,
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
