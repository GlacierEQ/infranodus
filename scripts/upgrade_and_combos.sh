#!/bin/bash

# Script to upgrade dependencies and generate combo report
# Maintains logs in upgrade_report.json
# This script checks for outdated dependencies, updates them, and groups them into categories.

set -euo pipefail

# Default settings
DRY_RUN=false
COMBO_DELIM="${COMBO_DELIM:--}"
CONCURRENCY="${CONCURRENCY:-4}"

usage() {
  echo "Usage: $0 [-n] [-c concurrency] [-d delimiter]" >&2
  echo "  -n  Dry run. Report upgrades without installing." >&2
  echo "  -c  Number of parallel installs (default $CONCURRENCY)." >&2
  echo "  -d  Delimiter for grouping combos (default '$COMBO_DELIM')." >&2
}

while getopts "nc:d:" opt; do
  case "$opt" in
    n) DRY_RUN=true ;;
    c) CONCURRENCY="$OPTARG" ;;
    d) COMBO_DELIM="$OPTARG" ;;
    *) usage; exit 1 ;;
  esac
done

WORKDIR="$(cd "$(dirname "$0")/.." && pwd)"
PACKAGE_JSON="$WORKDIR/package.json"
REPORT_JSON="$WORKDIR/upgrade_report.json"
LOGFILE="$WORKDIR/upgrade_script.log"
NODE_MODULES="$WORKDIR/node_modules"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGFILE"
}

check_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "$1 command not found" >&2; exit 1; }
}

check_cmd npm
check_cmd jq

# Ensure package.json exists
if [ ! -f "$PACKAGE_JSON" ]; then
    log "package.json not found in $WORKDIR"
    exit 1
fi

# Initialize report file
if [ ! -f "$REPORT_JSON" ]; then
    echo '{"upgrades": [], "combos": {}}' > "$REPORT_JSON"
fi

# Ensure dependencies are installed when not in dry-run mode
if [ ! -d "$NODE_MODULES" ]; then
    if [ "$DRY_RUN" = false ]; then
        log "node_modules not found. Installing dependencies"
        npm install >>"$LOGFILE" 2>&1
    else
        log "node_modules not found but dry-run enabled; skipping install"
    fi
fi

temp_outdated=$(mktemp)

log "Checking for outdated dependencies"
npm outdated --json > "$temp_outdated" 2>>"$LOGFILE" || true

if [ ! -s "$temp_outdated" ]; then
    log "All dependencies up to date or npm error"
    echo '{"upgrades": [], "combos": {}}' > "$REPORT_JSON"
    rm -f "$temp_outdated"
    exit 0
fi


# Parse outdated dependencies and update them
update_list=$(jq -r 'keys[]' "$temp_outdated")

log "Updating dependencies"
update_dep() {
    dep="$1"
    current=$(jq -r ".[\"$dep\"].current" "$temp_outdated")
    latest=$(jq -r ".[\"$dep\"].latest" "$temp_outdated")
    log "Updating $dep from $current to $latest"
    if [ "$DRY_RUN" = true ]; then
        jq --arg name "$dep" --arg from "$current" --arg to "$latest" \
           '.upgrades += [{name:$name, from:$from, to:$to, dry:true}]' "$REPORT_JSON" > "$REPORT_JSON.tmp"
        mv "$REPORT_JSON.tmp" "$REPORT_JSON"
    else
        if npm install "$dep@$latest" --save >>"$LOGFILE" 2>&1; then
            jq --arg name "$dep" --arg from "$current" --arg to "$latest" \
               '.upgrades += [{name:$name, from:$from, to:$to}]' "$REPORT_JSON" > "$REPORT_JSON.tmp"
            mv "$REPORT_JSON.tmp" "$REPORT_JSON"
        else
            log "Failed to update $dep"
        fi
    fi

    prefix=${dep%%${COMBO_DELIM}*}
    if jq -e ".combos.\"$prefix\"" "$REPORT_JSON" >/dev/null; then
        jq --arg prefix "$prefix" --arg name "$dep" '.combos[$prefix] += [$name]' "$REPORT_JSON" > "$REPORT_JSON.tmp"
    else
        jq --arg prefix "$prefix" --arg name "$dep" '.combos[$prefix] = [$name]' "$REPORT_JSON" > "$REPORT_JSON.tmp"
    fi
    mv "$REPORT_JSON.tmp" "$REPORT_JSON"
}

export -f update_dep
echo "$update_list" | xargs -I {} -n 1 -P "$CONCURRENCY" bash -c 'update_dep "$@"' _ {}

# Sort combo lists alphabetically and remove duplicates
sort_combos() {
    jq '(.combos | to_entries | map({key:.key, value: (.value|unique|sort)}) | from_entries) as $c | .combos = $c' "$REPORT_JSON" > "$REPORT_JSON.tmp" && mv "$REPORT_JSON.tmp" "$REPORT_JSON"
}

sort_combos

rm -f "$temp_outdated"

log "Upgrade process complete. Report saved to $REPORT_JSON"

echo "Upgrade report saved to $REPORT_JSON"
