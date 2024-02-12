import { Box, Divider, Stack, Typography } from '@mui/material'
import React, { useContext } from 'react'
import { ChatHeader } from './header'
import { PalicoContext } from '../../context'
import { ChatHistory } from './history'
import { ChatInput } from './input'

export interface ChatUIProps {
  headerTitle?: string
  inputPlaceholder?: string
  initialPlaceholderAgentMessage?: string
  getSendMessageParams?: (userInput: string) => Promise<{
    message: string
    params: Record<string, unknown>
  }>
}

const DEFAULT_VALUES = {
  headerTitle: 'Copilot',
  inputPlaceholder: 'Type a message',
  initialPlaceholderAgentMessage: 'Hello! How can I help you today?'
}

const ChatUI: React.FC<ChatUIProps> = ({
  headerTitle = DEFAULT_VALUES.headerTitle,
  inputPlaceholder = DEFAULT_VALUES.inputPlaceholder,
  initialPlaceholderAgentMessage = DEFAULT_VALUES.initialPlaceholderAgentMessage,
  getSendMessageParams
}) => {
  const { conversationHistory, sendMessage } = useContext(PalicoContext)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const handleSend = async (message: string): Promise<void> => {
    try {
      if (getSendMessageParams) {
        const { message: newMessage, params } = await getSendMessageParams(
          message
        )
        await sendMessage(newMessage, params)
      } else {
        await sendMessage(message, {})
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('An unknown error occurred')
      }
    }
  }

  return (
    <Stack
      direction="column"
      justifyContent="flex-start"
      alignItems="stretch"
      spacing={2}
      sx={{
        p: 2,
        height: '100%'
      }}
    >
      <Box>
        <ChatHeader title={headerTitle ?? DEFAULT_VALUES.headerTitle} />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto'
        }}
      >
        <ChatHistory
          initialMessage={initialPlaceholderAgentMessage}
          history={conversationHistory}
        />
      </Box>
      {errorMessage && (
        <Typography variant="caption" color={'error'}>
          {errorMessage}
        </Typography>
      )}
      <Divider />
      <Box>
        <ChatInput
          placeholder={inputPlaceholder}
          disabled={errorMessage !== null}
          onSend={handleSend}
        />
      </Box>
    </Stack>
  )
}

export default ChatUI
