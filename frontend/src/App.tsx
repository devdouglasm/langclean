import { useState } from 'react'
import { SceneCanvas } from './components/SceneCanvas'
import { ChatPanel } from './components/chat/ChatPanel'
import { INITIAL_MESSAGES, type ChatMessage } from './components/chat/types'
import { DashboardPanel } from './components/dashboard/DashboardPanel'
import './App.css'

function nowTime() {
  return new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [draft, setDraft] = useState('')

  const handleSend = () => {
    const text = draft.trim()
    if (!text) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      time: nowTime(),
    }

    setMessages((current) => [...current, userMessage])
    setDraft('')
  }

  return (
    <div className="app-shell">
      <SceneCanvas />
      <div className="app-ui">
        <ChatPanel
          messages={messages}
          draft={draft}
          onDraftChange={setDraft}
          onSend={handleSend}
        />
        <DashboardPanel />
      </div>
    </div>
  )
}

export default App
