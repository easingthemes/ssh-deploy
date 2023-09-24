const { snakeToCamel } = require('./helpers');

const inputNames = [
  'REMOTE_HOST', 'REMOTE_USER', 'REMOTE_PORT',
  'SSH_PRIVATE_KEY', 'DEPLOY_KEY_NAME',
  'SOURCE', 'TARGET', 'ARGS', 'SSH_CMD_ARGS', 'EXCLUDE',
  'SCRIPT_BEFORE', 'SCRIPT_AFTER', 'SCRIPT_BEFORE_REQUIRED', 'SCRIPT_AFTER_REQUIRED'];

const githubWorkspace = process.env.GITHUB_WORKSPACE;
const remoteUser = process.env.REMOTE_USER || process.env.INPUT_REMOTE_USER;

const defaultInputs = {
  source: '',
  target: `/home/${remoteUser}/`,
  exclude: '',
  args: '-rlgoDzvc -i',
  sshCmdArgs: '-o StrictHostKeyChecking=no',
  deployKeyName: `deploy_key_${remoteUser}_${Date.now()}`
};

const inputs = {
  githubWorkspace
};

inputNames.forEach((input) => {
  const inputName = snakeToCamel(input.toLowerCase());
  const inputVal = process.env[input] || process.env[`INPUT_${input}`] || defaultInputs[inputName];
  const validVal = inputVal === undefined ? defaultInputs[inputName] : inputVal;
  let extendedVal = validVal;
  // eslint-disable-next-line default-case
  switch (inputName) {
    case 'source':
      extendedVal = validVal.split(' ').map((src) => `${githubWorkspace}/${src}`);
      break;
    case 'args':
      extendedVal = validVal.split(' ');
      break;
    case 'exclude':
    case 'sshCmdArgs':
      extendedVal = validVal.split(',').map((item) => item.trim());
      break;
  }

  inputs[inputName] = extendedVal;
});

inputs.sshServer = `${inputs.remoteUser}@${inputs.remoteHost}`;
inputs.rsyncServer = `${inputs.remoteUser}@${inputs.remoteHost}:${inputs.target}`;

module.exports = inputs;
