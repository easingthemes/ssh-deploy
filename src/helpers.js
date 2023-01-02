const { existsSync, mkdirSync, writeFileSync } = require('fs');
const { join } = require('path');

const validateDir = (dir) => {
  if (!dir) {
    console.warn('⚠️ [DIR] dir is not defined');
    return;
  }
  if (existsSync(dir)) {
    console.log(`✅ [DIR] ${dir} dir exist`);
    return;
  }

  console.log(`[DIR] Creating ${dir} dir in workspace root`);
  mkdirSync(dir);
  console.log('✅ [DIR] dir created.');
};

const handleError = (message, isRequired) => {
  if (isRequired) {
    throw new Error(message);
  }
  console.warn(message);
};

const writeToFile = ({ dir, filename, content, isRequired, mode = '0644' }) => {
  validateDir(dir);
  const filePath = join(dir, filename);

  if (existsSync(filePath)) {
    const message = `⚠️ [FILE] ${filePath} Required file exist.`;
    handleError(message, isRequired);
    return;
  }

  try {
    console.log(`[FILE] writing ${filePath} file ...`, content.length);
    writeFileSync(filePath, content, {
      encoding: 'utf8',
      mode
    });
  } catch (error) {
    const message = `⚠️[FILE] Writing to file error. filePath: ${filePath}, message:  ${error.message}`;
    handleError(message, isRequired);
  }
};

const validateRequiredInputs = (inputs) => {
  const inputKeys = Object.keys(inputs);
  const validInputs = inputKeys.filter((inputKey) => {
    const inputValue = inputs[inputKey];

    if (!inputValue) {
      console.error(`❌ [INPUTS] ${inputKey} is mandatory`);
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
