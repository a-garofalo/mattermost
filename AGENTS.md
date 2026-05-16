# AGENTS.md

Explicitly import subdirectory instruction files that must always be in context:
@server/AGENTS.md

## Pull Requests

When creating a pull request, follow `.github/PULL_REQUEST_TEMPLATE.md` exactly:

- Remove all `<!-- -->` comments.
- Omit sections that are not applicable (Ticket Link, Screenshots) — do not write N/A, just remove the header.
- The `#### Release Note` header and its "```release-note" fenced code block **must always be present** (WITHOUT escaping the ``` characters). Write `NONE` if the change has no API, schema, UI, or breaking changes.

## Cursor Cloud Agents

This repository has a checked-in Cloud Agent environment under `.cursor/`. Docker is started by `.cursor/scripts/cloud-agent-start.sh`; if Docker is unavailable in Cloud, treat that as an environment failure rather than falling back to snapshot assumptions.

The environment declares `mattermost/enterprise` as a Cursor multi-repo dependency. Cursor clones the repositories as siblings, so `server/Makefile` can use its default `../../enterprise` path; the install hook does not clone or symlink enterprise.

## Cursor Cloud specific instructions

Detailed startup instructions live in `.cursor/cursor.md` (materialized as `.cursor/AGENTS.md` at session start). The key commands are documented there. Below are non-obvious caveats discovered during setup:

- **Go version**: The `.cursor/Dockerfile` bakes Go 1.25.9 but `server/.go-version` specifies 1.26.2. If the image Go version is outdated relative to `.go-version`, install the correct version before building. The update script handles this.
- **Docker in Cloud**: Docker is not available by default in non-Dockerfile Cloud VMs. The start hook (`.cursor/scripts/cloud-agent-start.sh`) starts dockerd, but if you're in a fresh environment you may need to install Docker CE with `fuse-overlayfs` and `iptables-legacy` first. See the Dockerfile for the exact packages.
- **Minimal Docker services**: Use `ENABLED_DOCKER_SERVICES='postgres redis'` to avoid pulling optional images (Prometheus, Grafana, Loki, Minio, etc.) that can hit Docker Hub rate limits.
- **Webapp Jest tests**: Must be run from `webapp/channels/` directory (not the workspace root), via `npm run test -- --testPathPatterns='...'`.
- **ESLint**: Run from `webapp/` root: `npx eslint --quiet <file>`.
- **Go vet**: Run from `server/`: `go vet ./...`. Never run `go mod tidy` directly; use `make modules-tidy` instead.
- **mmctl**: Build with `cd server && go build -o bin/mmctl ./cmd/mmctl`. Use `--local` flag for local socket connection when the server is running.
- **Server health check**: `curl http://127.0.0.1:8065/api/v4/system/ping` — returns `{"status":"OK"}` when ready.
