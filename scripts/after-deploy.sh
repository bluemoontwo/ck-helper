#!/bin/bash
REPOSITORY=/home/ubuntu/build

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

cd $REPOSITORY

npm install pnpm -g

pnpm install

# .store 디렉토리 생성 및 권한 설정
mkdir -p /home/ubuntu/.store
chown -R ubuntu:ubuntu /home/ubuntu/.store

pm2 delete ckhelper || true
pm2 start dist/index.js --name ckhelper