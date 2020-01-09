#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const commandExists = require('command-exists');
const nodeCmd = require('node-cmd');
const nodeRsync = require('rsyncwrapper');

const { REMOTE_HOST, REMOTE_USER, REMOTE_PORT, SSH_PRIVATE_KEY, DEPLOY_KEY_NAME, SOURCE, TARGET, ARGS, GITHUB_WORKSPACE, HOME } = process.env;
console.log('GITHUB_WORKSPACE', GITHUB_WORKSPACE);

const sshDeploy = (() => {
    const rsync = ({ privateKey, port, src, dest, args }) => {
        console.log(`Starting Rsync Action: ${src} to ${dest}`);

        try {
            // RSYNC COMMAND
            nodeRsync({ src, dest, args, privateKey, ssh: true, port, sshCmdArgs: ['-o StrictHostKeyChecking=no'], recursive: true }, (error, stdout, stderr, cmd) => {
                if (error) {
                    console.error('⚠️ Rsync error', error.message);
                    process.abort();
                } else {
                    console.log("✅ Rsync finished.", stdout);
                }
            });
        } catch (err) {
            console.error(`⚠️ An error happened:(.`, err.message, err.stack);
            process.abort();
        }
    };

    const init = ({
                      src,
                      dest,
                      args,
                      host = 'localhost',
                      username,
                      privateKeyContent,
                      port
                  }) => {
        validateRsync(() => {
            const privateKey = addSshKey(privateKeyContent, DEPLOY_KEY_NAME ||'deploy_key');

            const remoteDest = username + '@' + host + ':' + dest;

            rsync({ privateKey, port, src, dest: remoteDest, args });
        });
    };

    const validateDir = (dir) => {
        if (!fs.existsSync(dir)){
            console.log(`Creating ${dir} dir in `, GITHUB_WORKSPACE);
            fs.mkdirSync(dir);
        } else {
            console.log(`${dir} dir exist`);
        }
    };

    const validateFile = (filePath) => {
        if (!fs.existsSync(filePath)){
            console.log(`Creating ${filePath} file in `, GITHUB_WORKSPACE);
            try {
                fs.writeFileSync(filePath, '', {
                    encoding: 'utf8',
                    mode: 0o600
                });
            } catch (e) {
                console.error('⚠️ writeFileSync error', filePath, e.message);
                process.abort();
            }
        } else {
            console.log(`${filePath} file exist`);
        }
    };

    const addSshKey = (key, name) => {
        const sshDir = path.join(HOME || __dirname, '.ssh');
        const filePath = path.join(sshDir, name);

        validateDir(sshDir);
        validateFile(sshDir + '/known_hosts');

        try {
            fs.writeFileSync(filePath, key, {
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

    const validateRsync = (callback = () => {}) => {
        const rsyncCli = commandExists.sync('rsync');

        if (!rsyncCli) {
            nodeCmd.get(
                'sudo apt-get --no-install-recommends install rsync',
                function(err, data, stderr){
                    if (err) {
                        console.log('⚠️ Rsync installation failed ', err.message);
                        process.abort();
                    } else {
                        console.log('✅ Rsync installed. \n', data, stderr);
                        callback();
                    }
                }
            );
        } else {
            callback();
        }
    };

    return {
        init
    }
})();

const validateInputs = (inputs) => {
    const validInputs = inputs.filter(input => {
        if (!input) {
            console.error(`⚠️ ${input} is mandatory`);
        }

        return input;
    });

    if (validInputs.length !== inputs.length) {
        process.abort();
    }
};

const run = () => {
    validateInputs([SSH_PRIVATE_KEY, REMOTE_HOST, REMOTE_USER]);

    sshDeploy.init({
        src: GITHUB_WORKSPACE + '/' + SOURCE || '',
        dest: TARGET || '/home/' + REMOTE_USER + '/',
        args: [ARGS] || ['-rltgoDzvO'],
        host: REMOTE_HOST,
        port: REMOTE_PORT || '22',
        username: REMOTE_USER,
        privateKeyContent: SSH_PRIVATE_KEY,
    });
};

run();


