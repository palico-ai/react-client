import { TextField } from '@mui/material'
import React, { useMemo } from 'react'

export interface ChatInputProps {
  onSend: (message: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled,
  placeholder = 'Type a message'
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [message, setMessage] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    try {
      setLoading(true)
      await onSend(message)
      setMessage('')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMessage(event.target.value)
  }

  const enableInput = useMemo(() => !loading && !disabled, [loading, disabled])

  return (
    <form onSubmit={handleFormSubmit}>
      <TextField
        autoComplete="off"
        placeholder={placeholder}
        ref={inputRef}
        disabled={!enableInput}
        inputRef={inputRef}
        size="small"
        fullWidth
        variant="outlined"
        value={message}
        onChange={handleChange}
      />
    </form>
  )
}
