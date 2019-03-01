# STAGE: 0 (https://michalzalecki.com/solve-code-sharing-and-setup-project-with-lerna-and-monorepo/)
FROM tiangolo/node-frontend:10 as build-stage

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json /app/

RUN  npm install 

COPY ./ /app/

RUN npm run build


# STAGE: 1
FROM nginx:1.15.8-alpine

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --from=build-stage /nginx.conf /etc/nginx/conf.d/default.conf