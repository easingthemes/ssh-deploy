const { snakeToCamel } = require('./helpers');

const inputNames = [
  'REMOTE_HOST', 'REMOTE_USER', 'REMOTE_PORT',
  'SSH_PRIVATE_KEY', 'DEPLOY_KEY_NAME',
  'SOURCE', 'TARGET', 'ARGS', 'SSH_CMD_ARGS', 'EXCLUDE',
  'SCRIPT_BEFORE', 'SCRIPT_AFTER'];

const githubWorkspace = process.env.GITHUB_WORKSPACE;
const remoteUser = process.env.REMOTE_USER || process.env.INPUT_REMOTE_USER;

const defaultInputs = {
  target: `/home/${remoteUser}/`,
  deployKeyName: `deploy_key_${remoteUser}_${Date.now()}`
};

const inputs = {
  githubWorkspace
};

inputNames.forEach((input) => {
  const inputName = snakeToCamel(input.toLowerCase());
  const inputVal = process.env[input] || process.env[`INPUT_${input}`] || defaultInputs[inputName];
  let extendedVal = inputVal;
  // eslint-disable-next-line default-case
  switch (inputName) {
    case 'source':
      extendedVal = inputVal.split(' ').map((src) => `${githubWorkspace}/${src}`);
      break;
    case 'args':
      extendedVal = inputVal.split(' ');
      break;
    case 'exclude':
    case 'sshCmdArgs':
      extendedVal = inputVal.split(',').map((item) => item.trim());
      break;
  }

  inputs[inputName] = extendedVal;
});

inputs.sshServer = `${inputs.remoteUser}@${inputs.remoteHost}`;
inputs.rsyncServer = `${inputs.remoteUser}@${inputs.remoteHost}:${inputs.target}`;

module.exports = inputs;
