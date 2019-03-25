 FROM node:11-alpine as build-stage

 ADD yarn.lock /yarn.lock
 ADD package.json /package.json

 ENV NODE_PATH=/node_modules
 ENV PATH=$PATH:/node_modules/.bin

 WORKDIR /app
 ADD . /app

 RUN npm install && npm run build



# # STAGE: 0 (https://michalzalecki.com/solve-code-sharing-and-setup-project-with-lerna-and-monorepo/)
# FROM tiangolo/node-frontend:10 as build-stage
# # FROM node:11-alpine as build-stage

# # ENV NODE_ENV=production

# WORKDIR /app

# COPY . . 

# RUN  npm install && npm run build


# # FROM node:11-alpine as build
# # ENV NODE_ENV=production
# # WORKDIR /app

# # COPY package*.json ./
# # RUN npm install && \
# #     npm cache clean --force

# # COPY --from=build-stage ./dist .

# # STAGE: 1
FROM nginx:1.15.8-alpine

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --from=build-stage /nginx.conf /etc/nginx/conf.d/default.conf