## build runner
FROM node:20-alpine3.16 as build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json and package-lock.json
COPY package.json package-lock.json* ./
# Install dependencies
RUN npm ci && npm cache clean --force

# Move prisma
COPY prisma ./prisma
# Generate prisma
RUN npx prisma generate

# Move source files
COPY src ./src
COPY tsconfig.json .

# Build project
RUN npm run build

## producation runner
FROM node:20-alpine3.16 as prod-runner

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /tmp/app/package.json /app/package.json

# Install dependencies
RUN npm install --omit=dev

# Move build files
COPY --from=build-runner /tmp/app/build /app/build
COPY --from=build-runner /tmp/app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build-runner /tmp/app/prisma /app/prisma

# Start bot
CMD [ "node", "build/main.js" ]
