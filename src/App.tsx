import { AnimatePresence } from 'framer-motion'
import { useGame } from './game/useGame'
import { StartScreen } from './screens/StartScreen'
import { SetupScreen } from './screens/SetupScreen'
import { GameScreen } from './screens/GameScreen'
import { TransitionScreen } from './screens/TransitionScreen'
import { EndScreen } from './screens/EndScreen'

// Screen router + state. One screen is visible at a time; AnimatePresence
// cross-fades between them so the whole thing feels like one moving surface.

function App() {
  const { state, spotlight, nextPlayer, actions } = useGame()

  return (
    <div className="app-surface relative h-full overflow-hidden bg-[#14101a]">
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
