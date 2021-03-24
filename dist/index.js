#!/usr/bin/env node
module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(676);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 129:
/***/ (function(module) {

module.exports = require("child_process");

/***/ }),

/***/ 197:
/***/ (function(module, __unusedexports, __webpack_require__) {

const { existsSync, mkdirSync, writeFileSync } = __webpack_require__(747);

const {
  GITHUB_WORKSPACE
} = process.env;

const validateDir = (dir) => {
  if (!existsSync(dir)) {
    console.log(`[SSH] Creating ${dir} dir in `, GITHUB_WORKSPACE);
    mkdirSync(dir);
    console.log('✅ [SSH] dir created.');
  } else {
    console.log(`[SSH] ${dir} dir exist`);
  }
};

const validateFile = (filePath) => {
  if (!existsSync(filePath)) {
    console.log(`[SSH] Creating ${filePath} file in `, GITHUB_WORKSPACE);
    try {
      writeFileSync(filePath, '', {
        encoding: 'utf8',
        mode: 0o600
      });
      console.log('✅ [SSH] file created.');
    } catch (e) {
      console.error('⚠️ [SSH] writeFileSync error', filePath, e.message);
      process.abort();
    }
  } else {
    console.log(`[SSH] ${filePath} file exist`);
  }
};

module.exports = {
  validateDir,
  validateFile
};


/***/ }),

/***/ 243:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var exec = __webpack_require__(129).exec;
var execSync = __webpack_require__(129).execSync;
var fs = __webpack_require__(747);
var path = __webpack_require__(622);
var access = fs.access;
var accessSync = fs.accessSync;
var constants = fs.constants || fs;

var isUsingWindows = process.platform == 'win32'

var fileNotExists = function(commandName, callback){
    access(commandName, constants.F_OK,
    function(err){
        callback(!err);
    });
};

var fileNotExistsSync = function(commandName){
    try{
        accessSync(commandName, constants.F_OK);
        return false;
    }catch(e){
        return true;
    }
};

var localExecutable = function(commandName, callback){
    access(commandName, constants.F_OK | constants.X_OK,
        function(err){
        callback(null, !err);
    });
};

var localExecutableSync = function(commandName){
    try{
        accessSync(commandName, constants.F_OK | constants.X_OK);
        return true;
    }catch(e){
        return false;
    }
}

var commandExistsUnix = function(commandName, cleanedCommandName, callback) {

    fileNotExists(commandName, function(isFile){

        if(!isFile){
            var child = exec('command -v ' + cleanedCommandName +
                  ' 2>/dev/null' +
                  ' && { echo >&1 ' + cleanedCommandName + '; exit 0; }',
                  function (error, stdout, stderr) {
                      callback(null, !!stdout);
                  });
            return;
        }

        localExecutable(commandName, callback);
    });

}

var commandExistsWindows = function(commandName, cleanedCommandName, callback) {
  if (/[\x00-\x1f<>:"\|\?\*]/.test(commandName)) {
    callback(null, false);
    return;
  }
  var child = exec('where ' + cleanedCommandName,
    function (error) {
      if (error !== null){
        callback(null, false);
      } else {
        callback(null, true);
      }
    }
  )
}

var commandExistsUnixSync = function(commandName, cleanedCommandName) {
  if(fileNotExistsSync(commandName)){
      try {
        var stdout = execSync('command -v ' + cleanedCommandName +
              ' 2>/dev/null' +
              ' && { echo >&1 ' + cleanedCommandName + '; exit 0; }'
              );
        return !!stdout;
      } catch (error) {
        return false;
      }
  }
  return localExecutableSync(commandName);
}

var commandExistsWindowsSync = function(commandName, cleanedCommandName, callback) {
  if (/[\x00-\x1f<>:"\|\?\*]/.test(commandName)) {
    return false;
  }
  try {
      var stdout = execSync('where ' + cleanedCommandName, {stdio: []});
      return !!stdout;
  } catch (error) {
      return false;
  }
}

var cleanInput = function(s) {
  if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
    s = "'"+s.replace(/'/g,"'\\''")+"'";
    s = s.replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
      .replace(/\\'''/g, "\\'" ); // remove non-escaped single-quote if there are enclosed between 2 escaped
  }
  return s;
}

if (isUsingWindows) {
  cleanInput = function(s) {
    var isPathName = /[\\]/.test(s);
    if (isPathName) {
      var dirname = '"' + path.dirname(s) + '"';
      var basename = '"' + path.basename(s) + '"';
      return dirname + ':' + basename;
    }
    return '"' + s + '"';
  }
}

module.exports = function commandExists(commandName, callback) {
  var cleanedCommandName = cleanInput(commandName);
  if (!callback && typeof Promise !== 'undefined') {
    return new Promise(function(resolve, reject){
      commandExists(commandName, function(error, output) {
        if (output) {
          resolve(commandName);
        } else {
          reject(error);
        }
      });
    });
  }
  if (isUsingWindows) {
    commandExistsWindows(commandName, cleanedCommandName, callback);
  } else {
    commandExistsUnix(commandName, cleanedCommandName, callback);
  }
};

module.exports.sync = function(commandName) {
  var cleanedCommandName = cleanInput(commandName);
  if (isUsingWindows) {
    return commandExistsWindowsSync(commandName, cleanedCommandName);
  } else {
    return commandExistsUnixSync(commandName, cleanedCommandName);
  }
};


/***/ }),

/***/ 250:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var spawn = __webpack_require__(129).spawn
var util = __webpack_require__(669)

var escapeSpaces = function(path) {
  if (typeof path === 'string') {
    return path.replace(/\b\s/g, '\\ ')
  } else {
    return path
  }
}

var escapeSpacesInOptions = function(options) {
  // Escape paths in the src, dest, include, exclude, and excludeFirst arguments
  ;['src', 'dest', 'include', 'exclude', 'excludeFirst'].forEach(function(
    optionKey
  ) {
    var option = options[optionKey]
    if (typeof option === 'string') {
      options[optionKey] = escapeSpaces(option)
    } else if (Array.isArray(option) === true) {
      options[optionKey] = option.map(escapeSpaces)
    }
  })

  return options
}

module.exports = function(options, callback) {
  options = options || {}
  options = util._extend({}, options)
  options = escapeSpacesInOptions(options)

  var platform = options.platform || process.platform // Enable process.platform to be mocked in options for testing
  var isWin = platform === 'win32'

  if (typeof options.src === 'undefined') {
    throw new Error("'src' directory is missing from options")
  }

  if (typeof options.dest === 'undefined') {
    throw new Error("'dest' directory is missing from options")
  }

  var dest = options.dest

  if (typeof options.host !== 'undefined') {
    dest = options.host + ':' + options.dest
  }

  if (!Array.isArray(options.src)) {
    options.src = [options.src]
  }

  var args = [].concat(options.src)

  args.push(dest)

  // [rsync failed on windows, copying persmissions](https://github.com/jedrichards/rsyncwrapper/issues/28)
  // [set chmod flag by default on Windows](https://github.com/jedrichards/rsyncwrapper/pull/29)
  var chmodArg = (options.args || []).find(function(arg) {
    return arg.match(/--chmod=/)
  })
  if (isWin && !chmodArg) {
    args.push('--chmod=ugo=rwX')
  }

  if (typeof options.host !== 'undefined' || options.ssh) {
    args.push('--rsh')
    var rshCmd = 'ssh'
    if (typeof options.port !== 'undefined') {
      rshCmd += ' -p ' + options.port
    }
    if (typeof options.privateKey !== 'undefined') {
      rshCmd += ' -i ' + options.privateKey
    }
    if (typeof options.sshCmdArgs !== 'undefined') {
      rshCmd += ' ' + options.sshCmdArgs.join(' ')
    }
    args.push(rshCmd)
  }

  if (options.recursive === true) {
    args.push('--recursive')
  }

  if (options.times === true) {
    args.push('--times')
  }

  if (options.syncDest === true || options.deleteAll === true) {
    args.push('--delete')
    args.push('--delete-excluded')
  }

  if (options.syncDestIgnoreExcl === true || options.delete === true) {
    args.push('--delete')
  }

  if (options.dryRun === true) {
    args.push('--dry-run')
    args.push('--verbose')
  }

  if (
    typeof options.excludeFirst !== 'undefined' &&
    util.isArray(options.excludeFirst)
  ) {
    options.excludeFirst.forEach(function(value, index) {
      args.push('--exclude=' + value)
    })
  }

  if (typeof options.include !== 'undefined' && util.isArray(options.include)) {
    options.include.forEach(function(value, index) {
      args.push('--include=' + value)
    })
  }

  if (typeof options.exclude !== 'undefined' && util.isArray(options.exclude)) {
    options.exclude.forEach(function(value, index) {
      args.push('--exclude=' + value)
    })
  }

  switch (options.compareMode) {
    case 'sizeOnly':
      args.push('--size-only')
      break
    case 'checksum':
      args.push('--checksum')
      break
  }

  if (typeof options.args !== 'undefined' && util.isArray(options.args)) {
    args = [...new Set([...args, ...options.args])]
  }

  args = [...new Set(args)]

  var noop = function() {}
  var onStdout = options.onStdout || noop
  var onStderr = options.onStderr || noop

  var cmd = 'rsync '
  args.forEach(function(arg) {
    if (arg.substr(0, 4) === 'ssh ') {
      arg = '"' + arg + '"'
    }
    cmd += arg + ' '
  })
  cmd = cmd.trim()

  if (options.noExec) {
    callback(null, null, null, cmd)
    return
  }

  try {
    var stdout = ''
    var stderr = ''
    // Launch cmd in a shell just like Node's child_process.exec() does:
    // see https://github.com/joyent/node/blob/937e2e351b2450cf1e9c4d8b3e1a4e2a2def58bb/lib/child_process.js#L589
    var child
    if (isWin) {
      child = spawn('cmd.exe', ['/s', '/c', '"' + cmd + '"'], {
        windowsVerbatimArguments: true,
        stdio: [process.stdin, 'pipe', 'pipe'],
      })
    } else {
      child = spawn('/bin/sh', ['-c', cmd])
    }

    child.stdout.on('data', function(data) {
      onStdout(data)
      stdout += data
    })

    child.stderr.on('data', function(data) {
      onStderr(data)
      stderr += data
    })

    child.on('exit', function(code) {
      var err = null
      if (code !== 0) {
        err = new Error('rsync exited with code ' + code)
        err.code = code
      }
      callback(err, stdout, stderr, cmd)
    })
  } catch (err) {
    callback(err, null, null, cmd)
  }
}


/***/ }),

/***/ 428:
/***/ (function(module, __unusedexports, __webpack_require__) {

var exec = __webpack_require__(129).exec;

var commandline={
    get:getString,
    run:runCommand
};

function runCommand(command){
    //return refrence to the child process
    return exec(
        command
    );
}

function getString(command,callback){
    //return refrence to the child process
    return exec(
        command,
        (
            function(){
                return function(err,data,stderr){
                    if(!callback)
                        return;

                    callback(err, data, stderr);
                }
            }
        )(callback)
    );
}

module.exports=commandline;


/***/ }),

/***/ 613:
/***/ (function(module, __unusedexports, __webpack_require__) {

const { writeFileSync } = __webpack_require__(747);
const { join } = __webpack_require__(622);

const {
  validateDir,
  validateFile
} = __webpack_require__(197);

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


/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 659:
/***/ (function(module) {

const inputNames = ['REMOTE_HOST', 'REMOTE_USER', 'REMOTE_PORT', 'SSH_PRIVATE_KEY', 'DEPLOY_KEY_NAME', 'SOURCE', 'TARGET', 'ARGS', 'EXCLUDE'];

const inputs = {
  GITHUB_WORKSPACE: process.env.GITHUB_WORKSPACE
};
// Get inputs from ENV or WITH workflow settings
inputNames.forEach((input) => {
  inputs[input] = process.env[input] || process.env[`INPUT_${input}`];
});

module.exports = inputs;


/***/ }),

/***/ 669:
/***/ (function(module) {

module.exports = require("util");

/***/ }),

/***/ 676:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

const nodeRsync = __webpack_require__(250);

const { validateRsync, validateInputs } = __webpack_require__(735);
const { addSshKey } = __webpack_require__(613);

const {
  REMOTE_HOST, REMOTE_USER,
  REMOTE_PORT, SSH_PRIVATE_KEY, DEPLOY_KEY_NAME,
  SOURCE, TARGET, ARGS, EXCLUDE,
  GITHUB_WORKSPACE
} = __webpack_require__(659);

const defaultOptions = {
  ssh: true,
  sshCmdArgs: ['-o StrictHostKeyChecking=no'],
  recursive: true
};

console.log('[general] GITHUB_WORKSPACE: ', GITHUB_WORKSPACE);

const sshDeploy = (() => {
  const rsync = ({ privateKey, port, src, dest, args, exclude }) => {
    console.log(`[Rsync] Starting Rsync Action: ${src} to ${dest}`);
    if (exclude) console.log(`[Rsync] exluding folders ${exclude}`);

    try {
      // RSYNC COMMAND
      nodeRsync({
        src, dest, args, privateKey, port, excludeFirst: exclude, ...defaultOptions
      }, (error, stdout, stderr, cmd) => {
        if (error) {
          console.error('⚠️ [Rsync] error: ', error.message);
          console.log('⚠️ [Rsync] stderr: ', stderr);
          console.log('⚠️ [Rsync] stdout: ', stdout);
          console.log('⚠️ [Rsync] cmd: ', cmd);
          process.abort();
        } else {
          console.log('✅ [Rsync] finished.', stdout);
        }
      });
    } catch (err) {
      console.error('⚠️ [Rsync] command error: ', err.message, err.stack);
      process.abort();
    }
  };

  const init = ({ src, dest, args, host = 'localhost', port, username, privateKeyContent, exclude = [] }) => {
    validateRsync(() => {
      const privateKey = addSshKey(privateKeyContent, DEPLOY_KEY_NAME || 'deploy_key');
      const remoteDest = `${username}@${host}:${dest}`;

      rsync({ privateKey, port, src, dest: remoteDest, args, exclude });
    });
  };

  return {
    init
  };
})();

const run = () => {
  validateInputs({ SSH_PRIVATE_KEY, REMOTE_HOST, REMOTE_USER });

  sshDeploy.init({
    src: `${GITHUB_WORKSPACE}/${SOURCE || ''}`,
    dest: TARGET || `/home/${REMOTE_USER}/`,
    args: ARGS ? [ARGS] : ['-rltgoDzvO'],
    host: REMOTE_HOST,
    port: REMOTE_PORT || '22',
    username: REMOTE_USER,
    privateKeyContent: SSH_PRIVATE_KEY,
    exclude: (EXCLUDE || '').split(',').map((item) => item.trim()) // split by comma and trim whitespace
  });
};

run();


/***/ }),

/***/ 677:
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = __webpack_require__(243);


/***/ }),

/***/ 735:
/***/ (function(module, __unusedexports, __webpack_require__) {

const { sync: commandExists } = __webpack_require__(677);
const { get: nodeCmd } = __webpack_require__(428);

const validateRsync = (callback = () => {}) => {
  const rsyncCli = commandExists('rsync');

  if (!rsyncCli) {
    nodeCmd(
      'sudo apt-get --no-install-recommends install rsync',
      (err, data, stderr) => {
        if (err) {
          console.log('⚠️ [CLI] Rsync installation failed. Aborting ... ', err.message);
          process.abort();
        } else {
          console.log('✅ [CLI] Rsync installed. \n', data, stderr);
          callback();
        }
      }
    );
  } else {
    callback();
  }
};

const validateInputs = (inputs) => {
  const inputKeys = Object.keys(inputs);
  const validInputs = inputKeys.filter((inputKey) => {
    const inputValue = inputs[inputKey];

    if (!inputValue) {
      console.error(`⚠️ [INPUTS] ${inputKey} is mandatory`);
    }

    return inputValue;
  });

  if (validInputs.length !== inputKeys.length) {
    console.error('⚠️ [INPUTS] Inputs not valid, aborting ...');
    process.abort();
  }
};

module.exports = {
  validateRsync,
  validateInputs
};


/***/ }),

/***/ 747:
/***/ (function(module) {

module.exports = require("fs");

/***/ })

/******/ });