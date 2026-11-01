## build
FROM golang:1.24-alpine AS build
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /bot ./cmd/bot

## run
FROM scratch
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build /bot /bot

# Optional: cap the Go heap so the runtime collects garbage before the
# container gets close to its memory limit.
ENV GOMEMLIMIT=48MiB

ENTRYPOINT ["/bot"]
