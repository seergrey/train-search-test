#!/bin/bash
# Fast feedback after every agent edit. Non-blocking on purpose (always
# exit 0) — this is visibility into the Hooks output channel, not a gate,
# so it never stalls an agent mid-task over unrelated pre-existing noise.
# Most useful with two parallel worktree agents: catches type drift
# between tracks early, before you get to manual review.
npx tsc --noEmit 2>&1 | head -n 40
npx eslint . --quiet 2>&1 | head -n 40
exit 0
