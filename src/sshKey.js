const { writeFileSync } = require('fs');
const { join } = require('path');

const {
  validateDir,
  validateFile
} = require('./helpers');

const {
  HOME
} = process.env;

const addSshKey = (key, name) => {
  const sshDir = join(HOME || __dirname, '.ssh');
  const filePath = join(sshDir, name);

  validateDir(sshDir);
  validateFile(`${sshDir}/known_hosts`);

  try {
    writeFileSync(filePath, key, {
      encoding: 'utf8',
      mode: 0o600
    });
  } catch (e) {
    console.error('⚠️ writeFileSync error', filePath, e.message);
    process.abort();
  }

  console.log('✅ Ssh key added to `.ssh` dir ', filePath);

  return filePath;
};

module.exports = {
  addSshKey
}
