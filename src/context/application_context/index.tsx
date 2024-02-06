import React from 'react'
import useSendMessage from './use_handle_message'

export interface ChatMessage {
  content: string
  role: 'user' | 'assistant'
}

export interface PalicoContextProps {
  apiURL: string
  loading: boolean
  conversationHistory: ChatMessage[]
  sendMessage: (
    message: string,
    context: Record<string, unknown>
  ) => Promise<void>
}

export const PalicoContext = React.createContext<PalicoContextProps>({
  apiURL: '',
  loading: false,
  conversationHistory: [],
  sendMessage: async () => {}
})

export type ToolHandler<Input, Output> = (input: Input) => Promise<Output>

export interface PalicoContextProviderProps {
  apiURL: string
  tools: Record<string, ToolHandler<any, any>>
  children?: any
}

export interface PendingMessagePayload {
  message: string
  context: Record<string, unknown>
}

export const PalicoContextProvider: React.FC<PalicoContextProviderProps> = ({
  apiURL,
  tools,
  children
}) => {
  const {
    sendMessage: handleSendMessage,
    messageHistory,
    loading
  } = useSendMessage({
    apiURL,
    tools
  })

  const sendMessage = async (
    message: string,
    context: Record<string, unknown>
  ): Promise<void> => {
    console.log('Calling sendMessage')
    await handleSendMessage(message, context)
    console.log('Done calling sendMessage')
  }

  return (
    <PalicoContext.Provider
      value={{
        apiURL,
        conversationHistory: messageHistory,
        sendMessage,
        loading
      }}
    >
      {children}
    </PalicoContext.Provider>
  )
}
