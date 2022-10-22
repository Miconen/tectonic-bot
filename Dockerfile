## build runner
FROM node:lts-alpine as build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json
COPY package.json .

# Move source files
COPY src ./src
COPY tsconfig.json .
COPY prisma ./prisma

# Install dependencies
RUN npm install
RUN npx prisma generate

# Build project
RUN npm run build

## producation runner
FROM node:lts-alpine as prod-runner

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /tmp/app/package.json /app/package.json

# Install dependencies
RUN npm install --only=production

# Move build files
COPY --from=build-runner /tmp/app/build /app/build
COPY --from=build-runner /tmp/app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build-runner /tmp/app/prisma /app/prisma

# Start bot
CMD [ "node", "build/main.js" ]
