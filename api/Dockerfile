FROM node:24-alpine3.23

RUN apk add -U bash postgresql17-client build-base yaml-dev

ARG UID=1000
ARG GID=1000

USER "${UID}:${GID}"

WORKDIR /app

COPY --chown="${UID}:${GID}" package*.json .

RUN npm i --frozen-lockfile

COPY --chown="${UID}:${GID}" . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
