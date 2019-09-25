# ssh deployments

This GitHub Action deploys specific directory from `GITHUB_WORKSPACE` to a folder on a server via rsync over ssh. 

This action would usually follow a build/test action which leaves deployable code in `GITHUB_WORKSPACE`, eg `dist`;

# Configuration

Pass configuration with `env` vars

1. `DEPLOY_KEY`
This should be the private key part of an ssh key pair. The public key part should be added to the authorized_keys file on the server that receives the deployment.

2. `ARGS`
For any initial/required rsync flags, eg: `-avzr --delete`

3. `SOURCE`
The source directory, path relative to `$GITHUB_WORKSPACE` root, eg: `dist`

4. `TARGET`
The target directory, in the format`[USER]@[HOST]:[PATH]`


```
- name: Deploy to Staging server
        uses: easingthemes/ssh-deploy@v1.0
        env:
          DEPLOY_KEY: ${{ secrets.SERVER_SSH_KEY }}
          ARGS: "-rltgoDzvO --delete"
          SOURCE: "dist"
          TARGET: ${{ secrets.SERVER_STAGING }}
```

# Example usage

```
name: Node CI

on: [push]

jobs:
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [10.x]

    steps:
    - uses: actions/checkout@v1
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v1
      with:
        node-version: ${{ matrix.node-version }}
    - name: Install npm dependencies
      run: |
        npm install
    - name: Run build task
      run: |
        npm run build --if-present
    - name: Deploy to Staging server
            uses: easingthemes/ssh-deploy@v1.0
            env:
              DEPLOY_KEY: ${{ secrets.SERVER_SSH_KEY }}
              ARGS: "-rltgoDzvO --delete"
              SOURCE: "dist"
              TARGET: ${{ secrets.SERVER_STAGING }}
```

## Disclaimer

If you're using GitHub Actions, you'll probably already know that it's still in limited public beta, and GitHub advise against using Actions in production. 

So, check your keys. Check your deployment paths. And use at your own risk.