#!/bin/bash
# Deploys socialswick.com from GitHub. Run as root (cron or the WHM terminal):
#
#   /home/socialswick/repositories/socials-wick/scripts/deploy.sh          # deploy if origin/main moved
#   /home/socialswick/repositories/socials-wick/scripts/deploy.sh --force  # deploy even if unchanged
#
# Everything that touches the app runs through `runuser -u socialswick`, never
# a login shell: Fork Bomb Protection caps shell sessions at 35 processes and
# 100 open files, which makes `next build` hang.
#
# The build goes into .next-build and is swapped in only when it produced a
# BUILD_ID, so a broken commit can never leave the site without a build.
set -u

# cron gives a bare PATH without /usr/sbin, where runuser lives.
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export PATH

APP_USER=socialswick
APP_DIR=/home/socialswick/repositories/socials-wick
HOME_DIR=/home/socialswick
NODE_PATH_BIN=/opt/cpanel/ea-nodejs20/bin
LOG=$HOME_DIR/deploy.log
STATUS=$HOME_DIR/deploy-status.txt
LOCK=$HOME_DIR/.deploy.lock
KEEP_BACKUPS=10

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG"; }

# One deploy at a time; a stale lock older than an hour is ignored.
if [ -e "$LOCK" ] && [ "$(find "$LOCK" -mmin +60 2>/dev/null | wc -l)" -eq 0 ]; then
  exit 0
fi
touch "$LOCK"
trap 'rm -f "$LOCK"' EXIT

as_app() {
  runuser -u "$APP_USER" -- env HOME="$HOME_DIR" PATH="$NODE_PATH_BIN:/usr/bin:/bin" bash -c "$1"
}

cd "$APP_DIR" 2>/dev/null || { log "FAILED: $APP_DIR not found"; exit 1; }

# `npm install` rewrites package-lock.json on the server, which would block the pull.
as_app "cd $APP_DIR && git checkout -- package-lock.json 2>/dev/null; git fetch -q origin main"

LOCAL=$(as_app "cd $APP_DIR && git rev-parse HEAD")
REMOTE=$(as_app "cd $APP_DIR && git rev-parse origin/main")

if [ -z "$LOCAL" ] || [ -z "$REMOTE" ]; then
  log "FAILED: could not read git revisions (is runuser available?)"
  exit 1
fi

if [ "$LOCAL" = "$REMOTE" ] && [ "${1:-}" != "--force" ]; then
  exit 0
fi

SUBJECT=$(as_app "cd $APP_DIR && git log --format=%s -1 origin/main")
case "$SUBJECT" in
  *"[skip deploy]"*) log "skipped ${REMOTE:0:8}: $SUBJECT"; exit 0 ;;
esac

log "deploying ${REMOTE:0:8}: $SUBJECT"
echo "deploying ${REMOTE:0:8} at $(date '+%Y-%m-%d %H:%M:%S')" > "$STATUS"

CHANGED=$(as_app "cd $APP_DIR && git diff --name-only HEAD origin/main")
as_app "cd $APP_DIR && git pull -q --ff-only origin main" || { log "FAILED: git pull"; exit 1; }

# Dependencies and database only when those files actually changed.
if echo "$CHANGED" | grep -qE '^package(-lock)?\.json$'; then
  log "installing dependencies"
  as_app "cd $APP_DIR && npm install --no-audit --no-fund > $HOME_DIR/sw-npm.log 2>&1" || { log "FAILED: npm install (see sw-npm.log)"; exit 1; }
  as_app "cd $APP_DIR && git checkout -- package-lock.json 2>/dev/null"
fi

if echo "$CHANGED" | grep -q '^prisma/'; then
  STAMP=$(date +%Y%m%d-%H%M%S)
  as_app "cd $APP_DIR && cp prisma/dev.db prisma/dev.db.bak-$STAMP"
  log "database backed up to prisma/dev.db.bak-$STAMP, applying migrations"
  as_app "cd $APP_DIR && npx prisma migrate deploy > $HOME_DIR/sw-migrate.log 2>&1 && npx prisma generate >> $HOME_DIR/sw-migrate.log 2>&1" \
    || { log "FAILED: prisma migrate (see sw-migrate.log)"; exit 1; }
  # Keep the most recent backups only.
  as_app "cd $APP_DIR/prisma && ls -1t dev.db.bak-* 2>/dev/null | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm -f"
fi

log "building"
as_app "cd $APP_DIR && rm -rf .next-build && NEXT_DIST_DIR=.next-build npx next build --webpack > $HOME_DIR/sw-build.log 2>&1"

if [ ! -f "$APP_DIR/.next-build/BUILD_ID" ]; then
  log "FAILED: build produced no BUILD_ID, site left on the previous build"
  as_app "tail -15 $HOME_DIR/sw-build.log" >> "$LOG"
  echo "FAILED ${REMOTE:0:8} at $(date '+%Y-%m-%d %H:%M:%S') — site still on the previous build" > "$STATUS"
  as_app "rm -rf $APP_DIR/.next-build"
  exit 1
fi

as_app "cd $APP_DIR && rm -rf .next.old && mv .next .next.old && mv .next-build .next && touch tmp/restart.txt"
log "deployed ${REMOTE:0:8} and restarted"
echo "deployed ${REMOTE:0:8} at $(date '+%Y-%m-%d %H:%M:%S'): $SUBJECT" > "$STATUS"

# Trim the log so it can't grow forever.
tail -n 2000 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
