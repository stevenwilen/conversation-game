import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Disable pinch-zoom. The viewport meta handles Android; iOS Safari ignores
// `user-scalable=no`, so preventing these "gesture" events is the only reliable
// way to stop pinch there. Single-finger swipes are untouched (those are pointer
// events, not gestures), so the card drag still works.
const preventZoom = (event: Event) => event.preventDefault()
for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(type, preventZoom)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
