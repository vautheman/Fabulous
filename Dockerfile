FROM node:16.14

WORKDIR /home/fabulous

COPY package*.json ./

RUN npm install

COPY . . 

CMD ["npm", "run", "start"]