---
description: Review the conversation game's logic against the locked rules.
---

# Game Logic Review Skill

Review the game logic against the locked rules in CLAUDE.md.

## Locked Rules To Check

- Player-facing system is Deck + Depth + Spotlight choice.
- No player-facing Risk, Tone, or Topic.
- No redraw mechanic.
- Tap answers / stays at current depth.
- Swipe left goes lighter.
- Swipe right goes deeper.
- Depth cannot go below 1 or above 5.
- Open to Group uses phone turn/orientation when possible.
- Long press is fallback for Open to Group.
- Pivot is disabled until multiple decks exist.
- If a player steers, they do not answer.
- A next-player transition appears after every action.
- Players cannot rapidly swipe through cards without transition pacing.

## Output Format

Return:

1. Correct behaviors
2. Rule mismatches
3. Edge cases
4. Suggested fixes
5. Files that need editing

Do not add new mechanics unless explicitly asked.
