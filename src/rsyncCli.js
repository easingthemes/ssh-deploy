const { execSync, spawn } = require('child_process');

const escapeSpaces = (str) => (typeof str === 'string' ? str.replace(/\b\s/g, '\\ ') : str);

const buildRsyncCommand = ({ src, dest, excludeFirst, port, privateKey, args, sshCmdArgs }) => {
  const cmdParts = [];

  // Sources and destination (with space escaping)
  const sources = (Array.isArray(src) ? src : [src]).map(escapeSpaces);
  cmdParts.push(...sources);
  cmdParts.push(escapeSpaces(dest));

  // SSH transport
  let sshCmd = `ssh -p ${port || 22} -i ${privateKey}`;
  if (sshCmdArgs && sshCmdArgs.length > 0) {
    sshCmd += ` ${sshCmdArgs.join(' ')}`;
  }
  cmdParts.push('--rsh', `"${sshCmd}"`);

  // Recursive
  cmdParts.push('--recursive');

  // Exclude-first patterns
  if (excludeFirst && excludeFirst.length > 0) {
    excludeFirst.forEach((pattern) => {
      if (pattern) cmdParts.push(`--exclude=${escapeSpaces(pattern)}`);
    });
  }

  // User-provided args
  if (args && args.length > 0) {
    cmdParts.push(...args);
  }

  // Deduplicate while preserving order
  const dedupedParts = [...new Set(cmdParts)];
  return `rsync ${dedupedParts.join(' ')}`;
};

const runRsync = async (config) => new Promise((resolve, reject) => {
  const cmd = buildRsyncCommand(config);
  const logCMD = (c) => {
    console.warn('================================================================');
    console.log(c);
    console.warn('================================================================');
  };

  let stdout = '';
  let stderr = '';
  const proc = spawn('/bin/sh', ['-c', cmd]);

  proc.stdout.on('data', (data) => {
    const str = data.toString();
    console.log(str);
    stdout += str;
  });

  proc.stderr.on('data', (data) => {
    const str = data.toString();
    console.error(str);
    stderr += str;
  });

  proc.on('exit', (code) => {
    if (code !== 0) {
      const error = new Error(`rsync exited with code ${code}`);
      error.code = code;
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

  proc.on('error', (error) => {
    console.error('❌ [Rsync] command error: ', error.message, error.stack);
    reject(error);
  });
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

  /* eslint-disable object-property-newline */
  return runRsync({
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
