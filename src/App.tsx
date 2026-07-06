import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Depth, Player } from './game/types'
import { useGame } from './game/useGame'
import { requestFlipPermission } from './hooks/useDeviceFlip'
import { StartScreen } from './screens/StartScreen'
import { SetupScreen } from './screens/SetupScreen'
import { GameScreen } from './screens/GameScreen'
import { TransitionScreen } from './screens/TransitionScreen'
import { EndScreen } from './screens/EndScreen'

// Screen router + state. One screen is visible at a time; AnimatePresence
// cross-fades between them so the whole thing feels like one moving surface.

function App() {
  const { state, spotlight, nextPlayer, actions } = useGame()
  const [motionEnabled, setMotionEnabled] = useState(false)

  async function handleStart(players: Player[], depth: Depth) {
    // Ask for the orientation sensor here — this runs inside the Start tap,
    // which iOS requires for the permission prompt. Long-press works regardless.
    const granted = await requestFlipPermission()
    setMotionEnabled(granted)
    actions.start(players, depth)
  }

  return (
    <div className="app-surface relative min-h-dvh overflow-hidden bg-[#14101a]">
      <AnimatePresence mode="wait">
        {state.screen === 'start' && (
          <StartScreen key="start" onNewGame={actions.openSetup} />
        )}

        {state.screen === 'setup' && (
          <SetupScreen key="setup" onBack={actions.quit} onStart={handleStart} />
        )}

        {state.screen === 'playing' && (
          <GameScreen
            key="playing"
            depth={state.depth}
            card={state.card}
            spotlightName={spotlight?.name ?? 'Player'}
            motionEnabled={motionEnabled}
            onAnswer={() => actions.act('answer')}
            onLighter={() => actions.act('lighter')}
            onDeeper={() => actions.act('deeper')}
            onOpen={() => actions.act('open')}
            onEnd={actions.end}
          />
        )}

        {state.screen === 'transition' && (
          <TransitionScreen
            key="transition"
            nextPlayerName={nextPlayer?.name ?? 'the next player'}
            action={state.lastAction}
            onContinue={actions.continueTurn}
          />
        )}

        {state.screen === 'end' && (
          <EndScreen
            key="end"
            onPlayAgain={actions.playAgain}
            onNewPlayers={actions.newGame}
            onHome={actions.quit}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
