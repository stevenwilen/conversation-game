import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useGame } from './game/useGame'
import { screenBackground } from './game/theme'
import { StartScreen } from './screens/StartScreen'
import { SetupScreen } from './screens/SetupScreen'
import { GameScreen } from './screens/GameScreen'
import { TransitionScreen } from './screens/TransitionScreen'
import { EndScreen } from './screens/EndScreen'

// Screen router + state. One screen is visible at a time; AnimatePresence
// cross-fades between them so the whole thing feels like one moving surface.

function App() {
  const { state, spotlight, nextPlayer, actions } = useGame()

  // Paint the current screen's gradient on the root <html> element. The root
  // background is propagated across the whole browser canvas, so the iOS
  // safe-area strip below the app matches the screen instead of showing a dark
  // bar. The screens keep their own gradient on top for cross-fade transitions.
  useEffect(() => {
    document.documentElement.style.background = screenBackground(
      state.screen,
      state.depth,
    )
  }, [state.screen, state.depth])

  return (
    <div className="app-surface relative min-h-dvh overflow-hidden">
      <AnimatePresence mode="wait">
        {state.screen === 'start' && (
          <StartScreen key="start" onNewGame={actions.openSetup} />
        )}

        {state.screen === 'setup' && (
          <SetupScreen key="setup" onBack={actions.quit} onStart={actions.start} />
        )}

        {state.screen === 'playing' && (
          <GameScreen
            key="playing"
            depth={state.depth}
            card={state.card}
            spotlightName={spotlight?.name ?? 'Player'}
            seenCoach={state.seenCoach}
            onAnswer={() => actions.act('answer')}
            onLighter={() => actions.act('lighter')}
            onDeeper={() => actions.act('deeper')}
            onEnd={actions.end}
            onDismissCoach={actions.dismissCoach}
          />
        )}

        {state.screen === 'transition' && (
          <TransitionScreen
            key="transition"
            nextPlayerName={nextPlayer?.name ?? 'the next player'}
            action={state.lastAction}
            onContinue={actions.continueTurn}
            onUndo={actions.undo}
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
