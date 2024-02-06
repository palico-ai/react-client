import type OpenAI from 'openai'

export type OpenAIMessage = OpenAI.Chat.ChatCompletionMessageParam & {
  function_call?: OpenAI.Chat.ChatCompletionMessage['function_call']
}

export interface AgentMessage {
  role: OpenAI.Chat.ChatCompletionMessageParam['role']
  content: OpenAI.Chat.ChatCompletionMessageParam['content']
  toolCalls?: OpenAI.Chat.ChatCompletionMessage['tool_calls']
}

export interface AgentCallResponse {
  finishReason: OpenAI.Chat.ChatCompletion.Choice['finish_reason']
  message: AgentMessage
  conversationId: number
}

export interface AgentAPIParams {
  deploymentId: number
}

export interface NewConversationParams {
  apiURL: string
  message: string
  context?: Record<string, unknown>
}

export interface ReplyAsUserParams {
  apiURL: string
  conversationId: number
  message: string
  context?: Record<string, unknown>
}

export interface ToolExecutionMessage {
  functionName: string
  toolId: string
  output: Record<string, unknown>
}

export interface ReplyToToolCallParams {
  apiURL: string
  conversationId: number
  toolOutputs: ToolExecutionMessage[]
}

export class AgentAPI {
  public static async newConversation (params: NewConversationParams): Promise<AgentCallResponse> {
    const payload = {
      message: params.message,
      context: params.context
    }
    const response = await fetch(params.apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'new_conversation',
        payload
      })
    })
    const data = await response.json()
    if (response.status !== 200) {
      console.error(data)
      throw new Error('Failed to start new conversation.')
    }
    return data
  }

  public static async replyAsUser (params: ReplyAsUserParams): Promise<AgentCallResponse> {
    const payload = {
      conversationId: params.conversationId,
      message: params.message,
      context: params.context
    }
    const response = await fetch(params.apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'reply_as_user',
        payload
      })
    })
    const data = await response.json()
    if (response.status !== 200) {
      console.error(data)
      throw new Error('Failed to reply as user.')
    }
    return data
  }

  public static async replyToToolCall (params: ReplyToToolCallParams): Promise<AgentCallResponse> {
    const payload = {
      conversationId: params.conversationId,
      toolOutputs: params.toolOutputs
    }
    const response = await fetch(params.apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'reply_as_tool',
        payload
      })
    })
    const data = await response.json()
    if (response.status !== 200) {
      console.error(data)
      throw new Error('Failed to reply to tool call.')
    }
    return data
  }
}
