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


ENTRYPOINT ["yarn", "run", "start"]