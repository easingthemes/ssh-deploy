const { snakeToCamel } = require('./helpers');

const inputNames = [
  'REMOTE_HOST', 'REMOTE_USER', 'REMOTE_PORT',
  'SSH_PRIVATE_KEY', 'DEPLOY_KEY_NAME',
  'SOURCE', 'TARGET', 'ARGS', 'EXCLUDE',
  'SCRIPT_BEFORE', 'SCRIPT_AFTER'];

const githubWorkspace = process.env.GITHUB_WORKSPACE;
const remoteUser = process.env.REMOTE_USER;

const defaultInputs = {
  source: '', // TODO
  target: `/home/${remoteUser}/`,
  exclude: '', // TODO
  args: '-rltgoDzvO', // TODO
  deployKeyName: 'deploy_key'
};

const inputs = {
  githubWorkspace
};

inputNames.forEach((input) => {
  const inputName = snakeToCamel(input.toLowerCase());
  const inputVal = process.env[input] || process.env[`INPUT_${input}`];
  const validVal = inputVal === undefined ? defaultInputs[inputName] : inputVal;
  let extendedVal = validVal;
  // eslint-disable-next-line default-case
  switch (inputName) {
    case 'source':
      extendedVal = `${githubWorkspace}/${validVal}`;
      break;
    case 'exclude':
      extendedVal = validVal.split(',').map((item) => item.trim());
      break;
    case 'args':
      extendedVal = [validVal];
      break;
  }

  inputs[inputName] = extendedVal;
});

inputs.sshServer = `${inputs.remoteUser}@${inputs.remoteHost}:${inputs.target}`;

module.exports = inputs;
