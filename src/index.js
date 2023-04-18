#!/usr/bin/env node
const { sshDeploy } = require('./rsyncCli');
const { remoteCmdBefore, remoteCmdAfter } = require('./remoteCmd');
const { addSshKey, getPrivateKeyPath, updateKnownHosts } = require('./sshKey');
const { validateRequiredInputs } = require('./helpers');
const inputs = require('./inputs');

const run = async () => {
  const {
    source, remoteUser, remoteHost, remotePort,
    deployKeyName, sshPrivateKey,
    args, exclude, sshCmdArgs,
    scriptBefore, scriptBeforeRequired,
    scriptAfter, scriptAfterRequired,
    rsyncServer
  } = inputs;
  // Validate required inputs
  validateRequiredInputs({ sshPrivateKey, remoteHost, remoteUser });
  // Add SSH key
  addSshKey(sshPrivateKey, deployKeyName);
  const { path: privateKeyPath } = getPrivateKeyPath(deployKeyName);
  // Update known hosts if ssh command is present to avoid prompt
  if (scriptBefore || scriptAfter) {
    updateKnownHosts(remoteHost, remotePort);
  }
  // Check Script before
  if (scriptBefore) {
    await remoteCmdBefore(scriptBefore, privateKeyPath, scriptBeforeRequired);
  }
  /* eslint-disable object-property-newline */
  await sshDeploy({
    source, rsyncServer, exclude, remotePort,
    privateKeyPath, args, sshCmdArgs
  });
  // Check script after
  if (scriptAfter) {
    await remoteCmdAfter(scriptAfter, privateKeyPath, scriptAfterRequired);
  }
};

run()
  .then((data = '') => {
    console.log('✅ [DONE]', data);
  })
  .catch((error) => {
    console.error('❌ [ERROR]', error.message);
    process.exit(1);
  });
