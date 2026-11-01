## Go bot (demo) — develop only. main still builds the TypeScript bot.
FROM golang:1.24-alpine AS build
WORKDIR /src

COPY go/go.mod go/go.sum ./
RUN go mod download

COPY go/ .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /bot ./cmd/bot

FROM scratch
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build /bot /bot
ENV GOMEMLIMIT=48MiB
ENTRYPOINT ["/bot"]
