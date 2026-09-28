export type ChatRole = 'assistant' | 'user'

export type ChatScanItem = {
  label: string
  size: string
}

export type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  time: string
  scanItems?: ChatScanItem[]
  status?: string
}

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    text: 'Olá! Eu sou o LangClean AI. Vou te ajudar a encontrar arquivos desnecessários e liberar espaço com segurança. Vamos começar? 🚀',
    time: '10:42',
  },
  {
    id: '2',
    role: 'user',
    text: 'Pode começar o escaneamento, por favor.',
    time: '10:42',
  },
  {
    id: '3',
    role: 'assistant',
    text: 'Escaneando seu sistema...',
    time: '10:43',
    scanItems: [
      { label: 'Arquivos temporários', size: '128.4 MB' },
      { label: 'Cache de aplicativos', size: '2.7 GB' },
      { label: 'Lixeira', size: '840 MB' },
      { label: 'Downloads antigos', size: '1.5 GB' },
    ],
    status: 'Analisando com segurança...',
  },
]
