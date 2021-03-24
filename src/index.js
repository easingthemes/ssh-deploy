#!/usr/bin/env node
const nodeRsync = require('rsyncwrapper');

const { validateRsync, validateInputs } = require('./rsyncCli');
const { addSshKey } = require('./sshKey');

const {
  REMOTE_HOST, REMOTE_USER,
  REMOTE_PORT, SSH_PRIVATE_KEY, DEPLOY_KEY_NAME,
  SOURCE, TARGET, ARGS, EXCLUDE,
  GITHUB_WORKSPACE
} = require('./inputs');

const defaultOptions = {
  ssh: true,
  sshCmdArgs: ['-o StrictHostKeyChecking=no'],
  recursive: true
};

console.log('[general] GITHUB_WORKSPACE: ', GITHUB_WORKSPACE);

const sshDeploy = (() => {
  const rsync = ({ privateKey, port, src, dest, args, exclude }) => {
    console.log(`[Rsync] Starting Rsync Action: ${src} to ${dest}`);
    if (exclude) console.log(`[Rsync] exluding folders ${exclude}`);

    try {
      // RSYNC COMMAND
      nodeRsync({
        src, dest, args, privateKey, port, excludeFirst: exclude, ...defaultOptions
      }, (error, stdout, stderr, cmd) => {
        if (error) {
          console.error('⚠️ [Rsync] error: ', error.message);
          console.log('⚠️ [Rsync] stderr: ', stderr);
          console.log('⚠️ [Rsync] stdout: ', stdout);
          console.log('⚠️ [Rsync] cmd: ', cmd);
          process.abort();
        } else {
          console.log('✅ [Rsync] finished.', stdout);
        }
      });
    } catch (err) {
      console.error('⚠️ [Rsync] command error: ', err.message, err.stack);
      process.abort();
    }
  };

  const init = ({ src, dest, args, host = 'localhost', port, username, privateKeyContent, exclude = [] }) => {
    validateRsync(() => {
      const privateKey = addSshKey(privateKeyContent, DEPLOY_KEY_NAME || 'deploy_key');
      const remoteDest = `${username}@${host}:${dest}`;

      rsync({ privateKey, port, src, dest: remoteDest, args, exclude });
    });
  };

  return {
    init
  };
})();

const run = () => {
  validateInputs({ SSH_PRIVATE_KEY, REMOTE_HOST, REMOTE_USER });

  sshDeploy.init({
    src: `${GITHUB_WORKSPACE}/${SOURCE || ''}`,
    dest: TARGET || `/home/${REMOTE_USER}/`,
    args: ARGS ? [ARGS] : ['-rltgoDzvO'],
    host: REMOTE_HOST,
    port: REMOTE_PORT || '22',
    username: REMOTE_USER,
    privateKeyContent: SSH_PRIVATE_KEY,
    exclude: (EXCLUDE || '').split(',').map((item) => item.trim()) // split by comma and trim whitespace
  });
};

run();
