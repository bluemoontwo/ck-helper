#!/bin/bash
REPOSITORY=/home/ubuntu/build

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

cd $REPOSITORY

npm install pnpm -g

pnpm install

export NODE_ENV=production

mkdir -p /home/ubuntu/.store
chown -R ubuntu:ubuntu /home/ubuntu/.store

pm2 delete ckhelper || true
pnpm start