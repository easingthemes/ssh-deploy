#!/bin/sh

set -eu

# Set deploy key
SSH_PATH="$HOME/.ssh"
mkdir "$SSH_PATH"
echo "$DEPLOY_KEY" > "$SSH_PATH/deploy_key"
chmod 600 "$SSH_PATH/deploy_key"


# Do deployment
sh -c "rsync $1 -e 'ssh -i $SSH_PATH/deploy_key -o StrictHostKeyChecking=no' $2 $GITHUB_WORKSPACE/ $3"
