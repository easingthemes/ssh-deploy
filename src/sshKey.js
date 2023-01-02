const { join } = require('path');

const { writeToFile } = require('./helpers');

const addSshKey = (content, filename) => {
  const { HOME } = process.env;
  const dir = join(HOME || __dirname, '.ssh');
  const filePath = join(dir, filename);

  writeToFile({ dir, filename: 'known_hosts', content: '' });
  console.log('✅ [SSH] known_hosts file ensured', dir, filename, content.length);
  writeToFile({ dir, filename, content, isRequired: true });
  console.log('✅ [SSH] key added to `.ssh` dir ', dir);

  return filePath;
};

module.exports = {
  addSshKey
};
