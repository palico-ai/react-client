import React, { useEffect } from 'react'
import { type ChatCompletionMessageToolCall } from 'openai/resources/chat/completions'
import { AgentAPI, type AgentCallResponse, type AgentMessage, type ToolExecutionMessage } from '../agent_api'

export interface ChatMessage {
  content: string
  role: 'user' | 'assistant'
}

export interface PalicoContextProps {
  loading: boolean
  deploymentId: number
  conversationHistory: ChatMessage[]
  sendMessage: (message: string, context: Record<string, unknown>) => Promise<void>
}

export const PalicoContext = React.createContext<PalicoContextProps>({
  loading: false,
  deploymentId: -1,
  conversationHistory: [],
  sendMessage: async () => {}
})

export type ToolHandler<Input, Output> = (input: Input) => Promise<Output>

export interface PalicoContextProviderProps {
  tools: Record<string, ToolHandler<any, any>>
  deploymentId: number
  children?: any
}

export interface PendingMessagePayload {
  message: string
  context: Record<string, unknown>
}

export const PalicoContextProvider: React.FC<PalicoContextProviderProps> = ({
  deploymentId,
  tools,
  children
}) => {
  const [loading, setLoading] = React.useState<boolean>(false)
  const [conversationId, setConversationId] = React.useState<number>()
  const [messageHistory, setMessageHistory] = React.useState<ChatMessage[]>([])
  // TODO: Convert to step-based pending message (create user reply -> handle user reply -> handle tool call -> end)
  const [pendingMessage, setPendingMessage] = React.useState<PendingMessagePayload>()

  useEffect(() => {
    const callTool = async (tool: ChatCompletionMessageToolCall): Promise<ToolExecutionMessage> => {
      const toolHandler = tools[tool.function.name]
      if (toolHandler === null || toolHandler === undefined) {
        throw new Error(`Tool ${tool.function.name} not found`)
      }
      const output = await toolHandler(JSON.parse(tool.function.arguments))
      return {
        toolId: tool.id,
        functionName: tool.function.name,
        output
      }
    }

    const handleToolCall = async (message: AgentMessage, conversationId: number): Promise<void> => {
      if (!message.toolCalls) return
      const toolCallResponse = await Promise.all(message.toolCalls.map(callTool))
      const response = await AgentAPI.replyToToolCall({
        deploymentId,
        conversationId,
        toolOutputs: toolCallResponse
      })
      await handleAgentResponse(response, conversationId)
    }

    const handleAgentResponse = async (response: AgentCallResponse, conversationId: number): Promise<void> => {
      if (response.message.toolCalls) {
        await handleToolCall(response.message, conversationId)
      }
      if (response.message.content) {
        setMessageHistory([
          ...messageHistory,
          {
            content: response.message.content.toString(),
            role: 'assistant'
          }
        ])
      }
    }

    const handlePendingMessage = async (): Promise<void> => {
      if (!pendingMessage) return
      try {
        setPendingMessage(undefined)
        if (!conversationId) {
          const response = await AgentAPI.newConversation({
            deploymentId,
            message: pendingMessage.message,
            context: pendingMessage.context
          })
          setConversationId(response.conversationId)
          await handleAgentResponse(response, response.conversationId)
        } else {
          const response = await AgentAPI.replyAsUser({
            deploymentId,
            conversationId,
            message: pendingMessage.message,
            context: pendingMessage.context
          })
          await handleAgentResponse(response, conversationId)
        }
      } finally {
        setLoading(false)
      }
    }

    void handlePendingMessage()
  }, [conversationId, deploymentId, messageHistory, pendingMessage, tools])

  const sendMessage = async (message: string, context: Record<string, unknown>): Promise<void> => {
    setLoading(true)
    setPendingMessage({
      message,
      context
    })
    setMessageHistory([
      ...messageHistory,
      {
        content: message,
        role: 'user'
      }
    ])
  }

  return (
    <PalicoContext.Provider
      value={{ deploymentId, conversationHistory: messageHistory, sendMessage, loading }}
    >
      {children}
    </PalicoContext.Provider>
  )
}
