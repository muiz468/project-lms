# ---- Build stage ----
FROM node:20.17-alpine AS build

WORKDIR /app

# better-sqlite3 needs to compile native bindings
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY src ./src

# ---- Final stage ----
FROM node:20.17-alpine AS final

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY package.json ./

RUN mkdir -p /app/data && chown -R appuser:appgroup /app

USER appuser

ENV PORT=3000
EXPOSE 3000

CMD ["node", "src/app.js"]