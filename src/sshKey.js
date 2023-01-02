const { join } = require('path');

const { writeToFile } = require('./helpers');

const addSshKey = (content, filename) => {
  const { HOME } = process.env;
  const dir = join(HOME || __dirname, '.ssh');
  const filePath = join(dir, filename);

  writeToFile({ dir, filename: 'known_hosts', content: '' });
  writeToFile({ dir, filename, content, isRequired: true });

  console.log('✅ Ssh key added to `.ssh` dir ', dir);

  return filePath;
};

module.exports = {
  addSshKey
};
