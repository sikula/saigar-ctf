FROM tiangolo/node-frontend:10 as dev-stage
WORKDIR /usr/src/saigar-ctf
ENV NODE_ENV=development
COPY package.json yarn.lock ./
RUN yarn install

FROM tiangolo/node-frontend:10 as build-stage
WORKDIR /usr/src/saigar-ctf
ENV NODE_ENV=production
COPY --from=dev-stage /usr/src/saigar-ctf/node_modules node_modules
COPY . .
RUN yarn run build

# # STAGE: 0 (https://michalzalecki.com/solve-code-sharing-and-setup-project-with-lerna-and-monorepo/)
# FROM tiangolo/node-frontend:10 as build-stage
# FROM nginx:1.15.8-alpine

# COPY --from=build-stage /usr/src/saigar-ctf/dist /usr/share/nginx/html
# COPY /nginx.conf/web.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["yarn", "run", "start"]