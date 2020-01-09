# ssh deployments

Deploy code with rsync over ssh, using NodeJS.

NodeJS version is more than a minute `faster` than simple Docker version.

This GitHub Action deploys specific directory from `GITHUB_WORKSPACE` to a folder on a server via rsync over ssh, using NodeJS.

This action would usually follow a build/test action which leaves deployable code in `GITHUB_WORKSPACE`, eg `dist`;

# Configuration

Pass configuration with `env` vars

1. `SSH_PRIVATE_KEY` [required]

This should be the private key part of an ssh key pair. The public key part should be added to the authorized_keys file on the server that receives the deployment.

2. `REMOTE_HOST` [required]

eg: mydomain.com

3. `REMOTE_USER` [required]

eg: myusername

3. `REMOTE_PORT` (optional, default '22')

eg: '59184'

2. `ARGS` (optional, default '-rltgoDzvO')

For any initial/required rsync flags, eg: `-avzr --delete`

3. `SOURCE` (optional, default '')

The source directory, path relative to `$GITHUB_WORKSPACE` root, eg: `dist/`

4. `TARGET` (optional, default '/home/REMOTE_USER/')

The target directory

# Usage

```
  - name: Deploy to Staging server
    uses: easingthemes/ssh-deploy@v2.0.2
    env:
      SSH_PRIVATE_KEY: ${{ secrets.SERVER_SSH_KEY }}
      ARGS: "-rltgoDzvO"
      SOURCE: "dist/"
      REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
      REMOTE_USER: ${{ secrets.REMOTE_USER }}
      TARGET: ${{ secrets.REMOTE_TARGET }}
```

# Example usage in workflow

```
name: Node CI

on: [push]

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v1
    - name: Install Node.js
      uses: actions/setup-node@v1
      with:
        node-version: '10.x'
    - name: Install npm dependencies
      run: npm install
    - name: Run build task
      run: npm run build --if-present
    - name: Deploy to Server
      uses: easingthemes/ssh-deploy@v2.0.2
      env:
          SSH_PRIVATE_KEY: ${{ secrets.SERVER_SSH_KEY }}
          ARGS: "-rltgoDzvO --delete"
          SOURCE: "dist/"
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: ${{ secrets.REMOTE_TARGET }}
```

## Disclaimer

If you're using GitHub Actions, you'll probably already know that it's still in limited public beta, and GitHub advise against using Actions in production.

So, check your keys. Check your deployment paths. And use at your own risk.
