#!/bin/bash
# Snapshot at the end of every agent session, so git history lines up with
# the AI chat log exports for submission — one commit boundary per
# completed prompt/session, useful for reconstructing "where I intervened."
git add -A
git commit -m "agent: session snapshot $(date -u +%Y-%m-%dT%H:%M:%SZ)" --no-verify -q || true
exit 0
