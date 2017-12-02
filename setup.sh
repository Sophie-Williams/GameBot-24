#!/bin/bash
sudo apt-get install nodejs npm
npm install -g n
sudo n 0.9.4
cp /usr/local/n/versions/0.9.4/bin/node /usr/bin
npm install mongodb
npm install discord.js

