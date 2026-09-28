import type { ChatMessage } from './types'
import './ChatPanel.css'

function AgentAvatar() {
  return (
    <div className="chat-avatar" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  )
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3.4 20.6 21 12 3.4 3.4l.1 6.6L15 12 3.5 14z"
      />
    </svg>
  )
}

function ReadChecks() {
  return (
    <svg className="chat-checks" viewBox="0 0 18 12" width="16" height="11" aria-hidden="true">
      <path
        d="M1.2 6.2 4.4 9.4 11.2 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.2 6.2 9.4 9.4 16.2 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type MessageBubbleProps = {
  message: ChatMessage
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`chat-row ${isUser ? 'is-user' : 'is-assistant'}`}>
      {!isUser && <AgentAvatar />}
      <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-agent'}`}>
        <p className="chat-text">{message.text}</p>

        {message.scanItems && message.scanItems.length > 0 && (
          <ul className="chat-scan-list">
            {message.scanItems.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <strong>{item.size}</strong>
              </li>
            ))}
          </ul>
        )}

        {message.status && (
          <p className="chat-status">
            {message.status} <span className="chat-ellipsis">•••</span>
          </p>
        )}

        <div className="chat-meta">
          <time>{message.time}</time>
          {isUser && <ReadChecks />}
        </div>
      </div>
    </div>
  )
}

type ChatPanelProps = {
  messages: ChatMessage[]
  draft: string
  onDraftChange: (value: string) => void
  onSend: () => void
}

export function ChatPanel({ messages, draft, onDraftChange, onSend }: ChatPanelProps) {
  return (
    <aside className="chat-panel" aria-label="Chat LangClean AI">
      <div className="chat-messages">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <form
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault()
          onSend()
        }}
      >
        <div className="chat-input-shell">
          <input
            className="chat-input"
            type="text"
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Pergunte algo..."
            aria-label="Mensagem para o LangClean AI"
          />
          <button
            className="chat-send"
            type="submit"
            aria-label="Enviar mensagem"
            disabled={!draft.trim()}
          >
            <SendIcon />
          </button>
        </div>
        <p className="chat-disclaimer">
          LangClean AI pode cometer erros. Sempre revise antes de limpar.
        </p>
      </form>
    </aside>
  )
}
