const { existsSync, mkdirSync, writeFileSync } = require('fs');
const { join } = require('path');

const validateDir = (dir) => {
  if (!dir) {
    console.log('[SSH] dir is not defined');
    return;
  }
  if (existsSync(dir)) {
    console.log(`[SSH] ${dir} dir exist`);
    return;
  }

  console.log(`[SSH] Creating ${dir} dir in workspace root`);
  mkdirSync(dir);
  console.log('✅ [SSH] dir created.');
};

const writeToFile = ({ dir, filename, content, isRequired }) => {
  validateDir(dir);
  const filePath = join(dir, filename);

  if (existsSync(filePath)) {
    console.log(`[FILE] ${filePath} file exist`);
    if (isRequired) {
      throw new Error(`⚠️ [FILE] ${filePath} Required file exist, aborting ...`);
    }
    return;
  }

  try {
    writeFileSync(filePath, content, {
      encoding: 'utf8',
      mode: 0o600
    });
  } catch (e) {
    throw new Error(`⚠️[FILE] Writing to file error. filePath: ${filePath}, message:  ${e.message}`);
  }
};

const validateRequiredInputs = (inputs) => {
  const inputKeys = Object.keys(inputs);
  const validInputs = inputKeys.filter((inputKey) => {
    const inputValue = inputs[inputKey];

    if (!inputValue) {
      console.error(`⚠️ [INPUTS] ${inputKey} is mandatory`);
    }

    return inputValue;
  });

  if (validInputs.length !== inputKeys.length) {
    throw new Error('⚠️ [INPUTS] Inputs not valid, aborting ...');
  }
};

const snakeToCamel = (str) => str.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

module.exports = {
  writeToFile,
  validateRequiredInputs,
  snakeToCamel
};
