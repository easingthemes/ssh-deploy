# ssh deployments

Deploy code with rsync over ssh.

Execute remote scripts before or after rsync

NodeJS version is more than a minute `faster` than simple Docker version.

This GitHub Action deploys specific directory from `GITHUB_WORKSPACE` to a folder on a server via rsync over ssh, using NodeJS.

This action would usually follow a build/test action which leaves deployable code in `GITHUB_WORKSPACE`, eg `dist`;

In addition to rsync, this action provides scripts execution on remote host before and/or after rsync.

# Configuration

Pass configuration with `env` vars

##### 1. `SSH_PRIVATE_KEY` [required]

Private key part of an SSH key pair.
The public key part should be added to the `authorized_keys` file on the server that receives the deployment.

More info for SSH keys: https://www.ssh.com/ssh/public-key-authentication

The keys should be generated using the PEM format. You can use this command

```
ssh-keygen -m PEM -t rsa -b 4096
```
**Please Note:** You should not set a Passphrase (keep it empty) for the private key you generated.
Because rsync ssh (used for deploy) does not support private key password to be entered as a command line parameter.

##### 2. `REMOTE_HOST` [required]

eg: mydomain.com

##### 3. `REMOTE_USER` [required]

eg: myusername

##### 4. `REMOTE_PORT` (optional, default '22')

eg: '59184'

##### 5. `ARGS` (optional, default '-rlgoDzvc -i')

For any initial/required rsync flags, eg: `-avzr --delete`

##### 6. `SOURCE` (optional, default '')

The source directory, path relative to `$GITHUB_WORKSPACE` root, eg: `dist/`.
Multiple sources should be separated by space.

##### 7. `TARGET` (optional, default '/home/REMOTE_USER/')

The target directory

##### 8. `EXCLUDE` (optional, default '')

path to exclude separated by `,`, ie: `/dist/, /node_modules/`

##### 9. `SCRIPT_BEFORE` (optional, default '')

Script to run on host machine before rsync. Single line or multiline commands.
Execution is preformed by storing commands in `.sh` file and executing it via `.bash` over `ssh`
If you have issues with `ssh` connection, use this var, eg `SCRIPT_BEFORE: ls`.
This will force `known_hosts` update, adding your host via `ssh-keyscan`.

##### 10. `SCRIPT_AFTER` (optional, default '')

Script to run on host machine after rsync.
Rsync output is stored in `$RSYNC_STDOUT` env variable.

##### 11. `SSH_CMD_ARGS` (optional, default '-o StrictHostKeyChecking=no')

A list of ssh arguments, they must be prefixed with -o and separated by a comma, for example: -o SomeArgument=no, -o SomeOtherArgument=5


# Usage

Use the latest version from Marketplace,eg: ssh-deploy@v2
or use the latest version from a branch, eg: ssh-deploy@main

```
  - name: Deploy to Staging server
    uses: easingthemes/ssh-deploy@main
    with:
      SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
      ARGS: "-rlgoDzvc -i"
      SOURCE: "dist/"
      REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
      REMOTE_USER: ${{ secrets.REMOTE_USER }}
      TARGET: ${{ secrets.REMOTE_TARGET }}
      EXCLUDE: "/dist/, /node_modules/"
      SCRIPT_BEFORE: |
        whoami
        ls -al
      SCRIPT_AFTER: |
        whoami
        ls -al
        echo $RSYNC_STDOUT
```

# Example usage in workflow

```
name: Node CI

on: [push]

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    - name: Install Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16.x'
    - name: Install npm dependencies
      run: npm install
    - name: Run build task
      run: npm run build --if-present
    - name: Deploy to Server
      uses: easingthemes/ssh-deploy@main
      with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          ARGS: "-rlgoDzvc -i --delete"
          SOURCE: "dist/"
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: ${{ secrets.REMOTE_TARGET }}
          EXCLUDE: "/dist/, /node_modules/"
```

## Issues

This is a GitHub Action wrapping `rsync` via `ssh`. Only issues with action functionality can be fixed here.

Almost 95% of the issues are related to wrong SSH connection or `rsync` params and permissions.
These issues are not related to the action itself.

- Check manually your ssh connection from your client before opening a bug report.
- Check `rsync` params for your use-case. Default params are not necessarily going to be enough for everyone, it highly depends on your setup.
- Check manually your rsync command from your client before opening a bug report.
- `Deployment Failed, Permission denied (publickey,password)`: This issue occures in some cases, it is related to OS and ssh. This action can only provide a workaround:
  - Use `SCRIPT_BEFORE` param, eg `SCRIPT_BEFORE: ls`. This will force `known_hosts` update, adding your host via `ssh-keyscan`.
  - Or manually add public key to authorized_keys and add a new line to a private key.

I've added e2e test for this action.
Real example is executed on every PR merge to `main`.
Check actions tab for example.

When opening an issue, please add example of your step with env vars. You can add dummy values.

More info for SSH keys: https://www.ssh.com/ssh/public-key-authentication

## Tips

- Optional ENV variables are created for simple requirements.
For complex use cases, use `ARGS` and `SSH_CMD_ARGS` to fully configure `rsync` with all possible options.
- If you need to use multiple steps, eg multi targets deployment, save shared ENV variables in `>> $GITHUB_ENV`.
Check .github/workflows/e2e.yml for an example
- For multi sources, use -R ARG to manipulate folders structure.
- Great post about `rsync` options specific to usage of this action: https://logansnotes.com/2020/gh-action-site-deploy/


## Disclaimer

Check your keys. Check your deployment paths. And use at your own risk.
