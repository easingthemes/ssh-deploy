const { spawn } = require('child_process');

const escapeSpaces = (str) => (typeof str === 'string' ? str.replace(/\b\s/g, '\\ ') : str);

const buildRsyncCommand = ({ src, dest, excludeFirst, port, privateKey, args, sshCmdArgs }) => {
  const cmdParts = [];

  const sources = Array.isArray(src) ? src : [src];
  cmdParts.push(...sources.map(escapeSpaces));
  cmdParts.push(escapeSpaces(dest));

  let sshCmd = `ssh -p ${port || 22} -i ${privateKey}`;
  if (sshCmdArgs && sshCmdArgs.length > 0) {
    sshCmd += ` ${sshCmdArgs.join(' ')}`;
  }
  cmdParts.push('--rsh', `"${sshCmd}"`);

  cmdParts.push('--recursive');

  if (Array.isArray(excludeFirst)) {
    excludeFirst.forEach((pattern) => {
      if (pattern) cmdParts.push(`--exclude=${escapeSpaces(pattern)}`);
    });
  }

  if (Array.isArray(args)) {
    cmdParts.push(...args);
  }

  return `rsync ${[...new Set(cmdParts)].join(' ')}`;
};

module.exports = (options, callback) => {
  const cmd = buildRsyncCommand(options);
  const noop = () => {};
  const onStdout = options.onStdout || noop;
  const onStderr = options.onStderr || noop;

  let stdout = '';
  let stderr = '';
  const proc = spawn('/bin/sh', ['-c', cmd]);

  proc.stdout.on('data', (data) => { onStdout(data); stdout += data; });
  proc.stderr.on('data', (data) => { onStderr(data); stderr += data; });

  proc.on('exit', (code) => {
    let error = null;
    if (code !== 0) {
      error = new Error(`rsync exited with code ${code}`);
      error.code = code;
    }
    callback(error, stdout, stderr, cmd);
  });

  proc.on('error', (err) => callback(err, stdout, stderr, cmd));
};
