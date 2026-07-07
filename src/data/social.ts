import type { DeckId, Depth } from '../game/types'

// The Social deck. 50 cards, 10 per depth level.
// This is the source of truth for card content; game/cards.ts groups it into
// the runtime deck shape the game logic already uses. Text is verbatim from the
// provided deck — do not reword.

export interface SocialCard {
  id: string
  deck: DeckId
  depth: Depth
  text: string
}

export const socialCards: SocialCard[] = [
  // Level 1 — Surface
  { id: 'social-1-01', deck: 'social', depth: 1, text: "What’s the most annoying part of making plans in a group chat?" },
  { id: 'social-1-02', deck: 'social', depth: 1, text: "What’s a social rule everyone acts like they understand?" },
  { id: 'social-1-03', deck: 'social', depth: 1, text: "Are you more likely to host the plans or just show up?" },
  { id: 'social-1-04', deck: 'social', depth: 1, text: "What’s the perfect number of people for a good night out?" },
  { id: 'social-1-05', deck: 'social', depth: 1, text: "What instantly makes a hangout better?" },
  { id: 'social-1-06', deck: 'social', depth: 1, text: "What instantly ruins the vibe?" },
  { id: 'social-1-07', deck: 'social', depth: 1, text: "What’s the best kind of last-minute plan?" },
  { id: 'social-1-08', deck: 'social', depth: 1, text: "What text usually means the plan is about to fall apart?" },
  { id: 'social-1-09', deck: 'social', depth: 1, text: "What do people do in public that gives you secondhand embarrassment?" },
  { id: 'social-1-10', deck: 'social', depth: 1, text: "What matters most for a good hangout: food, music, people, place, or activity?" },

  // Level 2 — Opinion / Preference
  { id: 'social-2-01', deck: 'social', depth: 2, text: "What’s the most random plan you’ve ended up at?" },
  { id: 'social-2-02', deck: 'social', depth: 2, text: "What’s the funniest reason you almost canceled plans?" },
  { id: 'social-2-03', deck: 'social', depth: 2, text: "When has a plan changed so many times it barely made sense anymore?" },
  { id: 'social-2-04', deck: 'social', depth: 2, text: "When did you think something would be awkward, but it turned out fine?" },
  { id: 'social-2-05', deck: 'social', depth: 2, text: "What’s the most chaotic thing that’s happened during a hangout?" },
  { id: 'social-2-06', deck: 'social', depth: 2, text: "What’s something harmless your friends still bring up about you?" },
  { id: 'social-2-07', deck: 'social', depth: 2, text: "When did you go somewhere for “just a little bit” and stay way too long?" },
  { id: 'social-2-08', deck: 'social', depth: 2, text: "What’s the funniest misunderstanding you’ve had while hanging out?" },
  { id: 'social-2-09', deck: 'social', depth: 2, text: "What’s an old inside joke your group had that seems ridiculous now?" },
  { id: 'social-2-10', deck: 'social', depth: 2, text: "What always happens when your group tries to make plans?" },

  // Level 3 — Personal
  { id: 'social-3-01', deck: 'social', depth: 3, text: "When have you acted more confident than you actually felt?" },
  { id: 'social-3-02', deck: 'social', depth: 3, text: "When have you acted like you didn’t care, but you definitely did?" },
  { id: 'social-3-03', deck: 'social', depth: 3, text: "What do you do when you’re trying to fit in?" },
  { id: 'social-3-04', deck: 'social', depth: 3, text: "When have you felt left out but pretended you were fine?" },
  { id: 'social-3-05', deck: 'social', depth: 3, text: "Who do you act the most different around?" },
  { id: 'social-3-06', deck: 'social', depth: 3, text: "When have you said yes to plans just because you didn’t want to miss out?" },
  { id: 'social-3-07', deck: 'social', depth: 3, text: "What do you overthink after hanging out with people?" },
  { id: 'social-3-08', deck: 'social', depth: 3, text: "What’s a social habit you have that most people probably don’t notice?" },
  { id: 'social-3-09', deck: 'social', depth: 3, text: "When have you realized you were trying too hard to seem cool?" },
  { id: 'social-3-10', deck: 'social', depth: 3, text: "What do people misunderstand about how you are in groups?" },

  // Level 4 — Vulnerable
  { id: 'social-4-01', deck: 'social', depth: 4, text: "When have you felt like the backup option?" },
  { id: 'social-4-02', deck: 'social', depth: 4, text: "When have you acted like you were fine, but you really weren’t?" },
  { id: 'social-4-03', deck: 'social', depth: 4, text: "What makes you feel unwanted in a group?" },
  { id: 'social-4-04', deck: 'social', depth: 4, text: "When have you stayed around people longer than you should have?" },
  { id: 'social-4-05', deck: 'social', depth: 4, text: "What’s a weird social dynamic you notice but usually don’t mention?" },
  { id: 'social-4-06', deck: 'social', depth: 4, text: "When have you felt replaced by someone else?" },
  { id: 'social-4-07', deck: 'social', depth: 4, text: "What’s something annoying people do without realizing?" },
  { id: 'social-4-08', deck: 'social', depth: 4, text: "When have you been jealous of someone socially?" },
  { id: 'social-4-09', deck: 'social', depth: 4, text: "What’s a social mistake you still think about?" },
  { id: 'social-4-10', deck: 'social', depth: 4, text: "What have you put up with socially that you probably shouldn’t have?" },

  // Level 5 — Very Deep
  { id: 'social-5-01', deck: 'social', depth: 5, text: "What about your social life looks better from the outside than it actually feels?" },
  { id: 'social-5-02', deck: 'social', depth: 5, text: "When did you realize you cared about someone more than they cared about you?" },
  { id: 'social-5-03', deck: 'social', depth: 5, text: "What rejection or exclusion do you still remember?" },
  { id: 'social-5-04', deck: 'social', depth: 5, text: "When were you the problem in a social situation?" },
  { id: 'social-5-05', deck: 'social', depth: 5, text: "What do you hope people don’t notice about you socially?" },
  { id: 'social-5-06', deck: 'social', depth: 5, text: "When have you wanted to be included but felt embarrassed for wanting it?" },
  { id: 'social-5-07', deck: 'social', depth: 5, text: "When have you felt lonely even though you were around people?" },
  { id: 'social-5-08', deck: 'social', depth: 5, text: "What version of yourself socially have you outgrown?" },
  { id: 'social-5-09', deck: 'social', depth: 5, text: "Who did you try way too hard to be accepted by?" },
  { id: 'social-5-10', deck: 'social', depth: 5, text: "What’s a hard truth you’ve learned about where you fit in with people?" },
]
