const { execSync } = require('child_process');
const nodeRsync = require('rsyncwrapper');

const nodeRsyncPromise = async (config) => new Promise((resolve, reject) => {
  const logCMD = (cmd) => {
    console.warn('================================================================');
    console.log(cmd);
    console.warn('================================================================');
  };

  try {
    nodeRsync(config, (error, stdout, stderr, cmd) => {
      if (error) {
        console.error('❌ [Rsync] error: ');
        console.error(error);
        console.error('❌ [Rsync] stderr: ');
        console.error(stderr);
        console.error('❌️ [Rsync] stdout: ');
        console.error(stdout);
        console.error('❌ [Rsync] command: ');
        logCMD(cmd);
        reject(new Error(`${error.message}\n\n${stderr}`));
      } else {
        console.log('⭐ [Rsync] command finished: ');
        logCMD(cmd);
        resolve(stdout);
      }
    });
  } catch (error) {
    console.error('❌ [Rsync] command error: ', error.message, error.stack);
    reject(error);
  }
});

const validateRsync = async () => {
  try {
    execSync('rsync --version', { stdio: 'inherit' });
    console.log('✅️ [CLI] Rsync exists');
    return;
  } catch (error) {
    console.warn('⚠️ [CLI] Rsync doesn\'t exists', error.message);
  }

  console.log('[CLI] Start rsync installation with "apt-get" \n');
  try {
    execSync('sudo DEBIAN_FRONTEND=noninteractive apt-get -y update && sudo DEBIAN_FRONTEND=noninteractive apt-get --no-install-recommends -y install rsync', { stdio: 'inherit' });
    console.log('✅ [CLI] Rsync installed. \n');
  } catch (error) {
    throw new Error(`⚠️ [CLI] Rsync installation failed. Aborting ... error: ${error.message}`);
  }
};

const rsyncCli = async ({
  source, rsyncServer, exclude, remotePort,
  privateKeyPath, args, sshCmdArgs
}) => {
  console.log(`[Rsync] Starting Rsync Action: ${source} to ${rsyncServer}`);
  if (exclude && exclude.length > 0) console.log(`[Rsync] excluding folders ${exclude}`);

  const defaultOptions = {
    ssh: true,
    recursive: true,
    onStdout: (data) => console.log(data.toString()),
    onStderr: (data) => console.error(data.toString())
  };

  // RSYNC COMMAND
  /* eslint-disable object-property-newline */
  return nodeRsyncPromise({
    ...defaultOptions,
    src: source, dest: rsyncServer, excludeFirst: exclude, port: remotePort,
    privateKey: privateKeyPath, args, sshCmdArgs
  });
};

const sshDeploy = async (params) => {
  await validateRsync();
  const stdout = await rsyncCli(params);
  console.log('✅ [Rsync] finished.', stdout);
  process.env.RSYNC_STDOUT = `${stdout}`;
  return stdout;
};

module.exports = {
  sshDeploy
};
