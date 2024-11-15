#!/bin/bash
REPOSITORY=/home/ubuntu/build

cd $REPOSITORY

sudo npm install pnpm -g

sudo pnpm install

sudo pm2 start dist/index.js --name ckhelper