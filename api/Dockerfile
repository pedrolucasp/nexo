FROM node:24-alpine3.23

RUN apk add -U bash postgresql17-client build-base yaml-dev valkey-cli

ARG UID=1000
ARG GID=1000

USER "${UID}:${GID}"

WORKDIR /app

COPY --chown="${UID}:${GID}" package*.json .

RUN npm i --frozen-lockfile

COPY --chown="${UID}:${GID}" prisma ./prisma/

RUN npx prisma generate

COPY --chown="${UID}:${GID}" . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
