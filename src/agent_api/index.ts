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
  deploymentId: number
  message: string
  context?: Record<string, unknown>
}

export interface ReplyAsUserParams {
  deploymentId: number
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
  deploymentId: number
  conversationId: number
  toolOutputs: ToolExecutionMessage[]
}

export class AgentAPI {
  // private static readonly BASE_URL = 'https://n2ixeodlxi.execute-api.us-east-1.amazonaws.com/prod/deployment'
  private static readonly BASE_URL = 'http://localhost:8001/deployment'

  public static async newConversation (params: NewConversationParams): Promise<AgentCallResponse> {
    const response = await fetch(`${AgentAPI.BASE_URL}/${params.deploymentId}/new-conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })
    const json = await response.json()
    return json
  }

  public static async replyAsUser (params: ReplyAsUserParams): Promise<AgentCallResponse> {
    const response = await fetch(`${AgentAPI.BASE_URL}/${params.deploymentId}/${params.conversationId}/user-reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: params.message,
        context: params.context
      })
    })
    const json = await response.json()
    return json
  }

  public static async replyToToolCall (params: ReplyToToolCallParams): Promise<AgentCallResponse> {
    const response = await fetch(`${AgentAPI.BASE_URL}/${params.deploymentId}/${params.conversationId}/tool-call-reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        toolOutputs: params.toolOutputs
      })
    })
    const json = await response.json()
    return json
  }
}
