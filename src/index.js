#!/usr/bin/env node
const { sshDeploy } = require('./rsyncCli');
const { remoteCmdBefore, remoteCmdAfter } = require('./remoteCmd');
const { addSshKey, getPrivateKeyPath } = require('./sshKey');
const { validateRequiredInputs } = require('./helpers');
const inputs = require('./inputs');

const run = () => {
  const {
    source, remoteUser, remoteHost, remotePort,
    deployKeyName, sshPrivateKey,
    args, exclude, sshCmdArgs,
    scriptBefore, scriptAfter,
    rsyncServer
  } = inputs;
  // Validate required inputs
  validateRequiredInputs({ sshPrivateKey, remoteHost, remoteUser });
  // Add SSH key
  addSshKey(sshPrivateKey, deployKeyName);
  const { path: privateKeyPath } = getPrivateKeyPath(deployKeyName);
  // Check Script before
  if (scriptBefore) {
    remoteCmdBefore(scriptBefore);
  }
  // Check script after
  let callback = () => {};
  if (scriptAfter) {
    callback = (...result) => {
      remoteCmdAfter(scriptAfter, result);
    };
  }
  /* eslint-disable object-property-newline */
  sshDeploy({
    source, rsyncServer, exclude, remotePort,
    privateKeyPath, args, sshCmdArgs, callback
  });
};

run();
