const { join } = require('path');
const { writeToFile } = require('./helpers');

const getPrivateKeyPath = (filename) => {
  const { HOME } = process.env;
  const dir = join(HOME || __dirname, '.ssh');
  return {
    dir,
    filename,
    path: join(dir, filename)
  };
};

const addSshKey = (content, deployKeyName) => {
  const { dir, filename } = getPrivateKeyPath(deployKeyName);
  writeToFile({ dir, filename: 'known_hosts', content: '' });
  console.log('✅ [SSH] known_hosts file ensured', dir);
  writeToFile({ dir, filename, content, isRequired: true });
  console.log('✅ [SSH] key added to `.ssh` dir ', dir, filename);
};

module.exports = {
  getPrivateKeyPath,
  addSshKey
};
