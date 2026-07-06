import type { Deck, Depth } from './types'

// ---------------------------------------------------------------------------
// Friendship deck — the only deck in the first prototype.
// Placeholder prompts, but written to sit at the right depth so the prototype
// tests like the real thing. Equal count per depth (8 each), as CLAUDE.md asks.
// Tone / topic / sensitivity live behind the scenes here; they never surface
// as player-facing controls.
// ---------------------------------------------------------------------------

export const FRIENDSHIP: Deck = {
  id: 'friendship',
  name: 'Friendship',
  tagline: 'For the people who already know your worst jokes.',
  cards: {
    1: [
      "What's a snack you could eat every day and never get sick of?",
      'Show the group the last photo you took. No explaining allowed.',
      "What's the most useless talent you have?",
      'Pick someone here to survive a zombie apocalypse with. Why them?',
      'What song do you play way too loud when no one is around?',
      "What's a small thing that instantly makes your day better?",
      'If you had to eat one cuisine forever, what would it be?',
      "What's the dumbest thing you've argued about recently?",
    ],
    2: [
      'Is it ever okay to be 20 minutes late? Defend yourself.',
      'Texting or calling — and what does your choice say about you?',
      'What is an opinion you have that your friends think is wrong?',
      'A big group of friends or a few close ones? Why?',
      'What does everyone seem to love that you find overrated?',
      'Would you rather be really funny or really wise?',
      "What's a red flag in a friend that you won't ignore?",
      'Do you plan things out, or figure it out as you go?',
    ],
    3: [
      'Tell us about a friendship that changed you.',
      'When did you last feel genuinely proud of yourself?',
      'What is something you believed as a kid that still shapes you?',
      'Who in your life do you wish you talked to more often?',
      "What is a risk you took that you're glad you didn't skip?",
      "Describe a moment you realized you'd grown up a little.",
      'What is a value you try to live by, even when it is hard?',
      'Tell us about a time a friend really showed up for you.',
    ],
    4: [
      'What is something you fear people would think if they truly knew you?',
      'When did you last feel truly understood — and by whom?',
      "What is a mistake you're still forgiving yourself for?",
      'What do you need more of from the people around you right now?',
      'What is something you often feel but have never said out loud?',
      'When do you feel most alone, even around other people?',
      'What part of yourself are you still learning to accept?',
      'What is a goodbye you never got to say properly?',
    ],
    5: [
      "What is the hardest thing you've had to forgive — or still can't?",
      'If this group could truly know one thing about your inner life, what would it be?',
      'What is a fear about your future that you rarely admit?',
      'When have you felt most changed by a loss?',
      "What do you hope people will say about you when you're gone?",
      "What is a truth about yourself you've spent years avoiding?",
      'Who shaped you the most — and what did that cost you or give you?',
      'What would you say to the version of you from your hardest year?',
    ],
  },
}

export const DECKS: Deck[] = [FRIENDSHIP]

/** Pick a prompt for a depth, avoiding an immediate repeat when possible. */
export function pickCard(deck: Deck, depth: Depth, avoid?: string): string {
  const pool = deck.cards[depth]
  if (pool.length <= 1) return pool[0]
  let card = pool[Math.floor(Math.random() * pool.length)]
  let guard = 0
  while (card === avoid && guard++ < 8) {
    card = pool[Math.floor(Math.random() * pool.length)]
  }
  return card
}
