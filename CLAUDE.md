# Conversation Game Project

## Project Goal

Build a mobile-first electronic prototype of a conversation game.

This should feel like a real mobile party game, not a rough web prototype or a button-heavy website. The game is designed for one phone being passed around a group.

## Core Game Promise

The game helps groups choose and control the kind of conversation they want to have.

It is mainly for friends, college groups, party groups, and strangers.

The game should let groups keep things light, go deeper, debate, or shift direction without forcing individual players to reveal more than they want.

Players should feel like they chose to talk about things, not like they were tested.

## Locked Player-Facing System

The player-facing system is only:

- Deck
- Depth
- Spotlight choice

Do not add player-facing Risk, Tone, Topic, scoring, roles, power cards, or complex mechanics unless explicitly asked.

Tone, topic, sensitivity, and question format can exist behind the scenes while writing cards, but they should not appear as controls in the UI.

## Prototype Scope

The first prototype uses one deck:

- Friendship

It has five depth levels:

- Depth 1
- Depth 2
- Depth 3
- Depth 4
- Depth 5

Each depth should support the same number of cards if possible.

Pivot is disabled until multiple decks exist.

## Depth Levels

Depth 1: Surface  
Easy, funny, low-pressure.

Depth 2: Opinion / Preference  
Casual, but slightly more revealing.

Depth 3: Personal  
Real experiences, stories, values, and personal thoughts.

Depth 4: Vulnerable  
Honest, reflective, emotionally revealing.

Depth 5: Very Deep  
Highly personal, rare, and only reached deliberately.

Depth moves one level at a time.

## Core Loop

The turn loop is:

1. Spotlight player draws a card from the current deck and depth.
2. They read the card.
3. They choose what happens through gesture-based actions.
4. The game shows a short transition for the next player.
5. The spotlight rotates.

## Mobile Interaction Model

Do not use a screen full of action buttons during gameplay.

The main game screen should feel gesture-based and mobile-native.

Player actions:

- Tap the card: answer the card, or complete the turn after the group answers, at the current depth
- Swipe left: go lighter
- Swipe right: go deeper
- Pivot: disabled until multiple decks exist

Showing a card to the group is informal — the spotlight player can read it aloud or hand the phone around, then tap to continue. There is no separate "open to group" gesture: it produced the same result as a tap (complete the turn, same depth, pass the spotlight), so it was removed to keep the model simple.

The game should not feel like a form with buttons. It should feel like a physical card being handled on a phone.

## No Redraw Rule

Do not add a redraw or replacement-card mechanic.

If a player does not have an answer, they can:

- answer the closest honest version
- let the group answer it, then tap to continue
- steer away by going deeper or going lighter

## Turn Transition

After every completed action, show a short transition before revealing the next card.

Purpose:

- make it clear the spotlight is moving to the next player
- prevent players from rapidly swiping through cards
- create pacing
- make the phone feel like it is being passed around

The transition should show something like:

"Pass to the next player"

Then reveal the next card after a short animation or tap-to-continue moment.

Do not let players instantly chain-swipe through multiple cards.

## UX Direction

Mobile-first.

The app should feel like a real game on a phone, similar in presence to a mobile party game.

Prioritize:

- large readable text
- strong card presence
- gesture-first controls
- one-handed use
- minimal visible UI
- smooth transitions
- clear current depth
- clear current spotlight
- polished empty states
- tactile motion
- iPhone responsiveness

Avoid:

- clutter
- desktop-first layouts
- tiny text
- generic SaaS styling
- over-explaining rules during play
- too many settings
- button-heavy controls
- anything that feels like a form

## Visual Direction

This is a PROTOTYPE for playtesting on a phone before printing physical cards.
It should look clean and readable, not like a finished App Store product. Favor
a flat, simple, slightly-playful prototype look over heavy polish.

The design should feel:

- social
- warm
- clean
- slightly playful
- mobile-native

Use:

- solid flat colors (one color per depth), NOT gradients
- rounded cards and generous spacing
- minimal, flat shadows (or none) — no soft glows
- restrained motion — simple fades over springs, no looping/pulsing flourishes

Depth is still color-coded (a functional cue), just with solid colors.

Do not make it look corporate, and do not over-polish it back into a
finished-app aesthetic (no gradients, glows, stacked-card flourishes, or
decorative animation) unless explicitly asked.

## Technical Direction

Use:

- Vite
- React
- TypeScript
- Tailwind
- Framer Motion if useful for card gestures and transitions
- localStorage for simple saved state
- no backend
- no authentication
- no database
- Vercel deployment

Keep the code simple and readable.

## Development Rules

Before major edits, explain the plan briefly.

After edits:

- run TypeScript check
- run build
- test mobile responsiveness
- summarize what changed
- list any issues remaining

Do not introduce unnecessary dependencies.

Do not change the locked game rules unless explicitly asked.
