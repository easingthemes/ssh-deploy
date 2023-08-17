const { join } = require('path');
const { execSync } = require('child_process');
const { writeToFile } = require('./helpers');

const KNOWN_HOSTS = 'known_hosts';
const getPrivateKeyPath = (filename = '') => {
  const { HOME } = process.env;
  const dir = join(HOME || '~', '.ssh');
  const knownHostsPath = join(dir, KNOWN_HOSTS);
  return {
    dir,
    filename,
    path: join(dir, filename),
    knownHostsPath
  };
};

const addSshKey = (content, deployKeyName) => {
  const { dir, filename } = getPrivateKeyPath(deployKeyName);
  writeToFile({ dir, filename: KNOWN_HOSTS, content: '' });
  console.log('✅ [SSH] known_hosts file ensured', dir);
  writeToFile({ dir, filename, content: `${content}\n`, isRequired: true, mode: '0400' });
  console.log('✅ [SSH] key added to `.ssh` dir ', dir, filename);
};

const updateKnownHosts = (host, remotePort) => {
  const { knownHostsPath } = getPrivateKeyPath();
  console.log('[SSH] Adding host to `known_hosts` ....', host, knownHostsPath);
  try {
    execSync(`ssh-keyscan -p ${(remotePort || 22)} -H ${host}  >> ${knownHostsPath}`, {
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('❌ [SSH] Adding host to `known_hosts` ERROR', host, error.message);
  }
  console.log('✅ [SSH] Adding host to `known_hosts` DONE', host, knownHostsPath);
};

module.exports = {
  getPrivateKeyPath,
  updateKnownHosts,
  addSshKey
};
