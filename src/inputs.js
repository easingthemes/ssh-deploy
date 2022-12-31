const inputNames = ['REMOTE_HOST', 'REMOTE_USER', 'REMOTE_PORT', 'SSH_PRIVATE_KEY', 'DEPLOY_KEY_NAME', 'SOURCE', 'TARGET', 'ARGS', 'EXCLUDE'];

const inputs = {
  GITHUB_WORKSPACE: process.env.GITHUB_WORKSPACE
};
// Get inputs from ENV or WITH workflow settings
console.log('EXAMPLE_REMOTE_HOST: ', process.env.EXAMPLE_REMOTE_HOST);
console.log('REMOTE_HOST: ', process.env.REMOTE_HOST);

inputNames.forEach((input) => {
  inputs[input] = process.env[input] || process.env[`INPUT_${input}`];
});

module.exports = inputs;
