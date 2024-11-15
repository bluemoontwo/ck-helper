export NVM_DIR="$HOME/ubuntu/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

#!/bin/bash
REPOSITORY=/home/ubuntu/build

cd $REPOSITORY

sudo npm install pnpm -g

sudo pnpm install

sudo pm2 start dist/index.js --name ckhelper