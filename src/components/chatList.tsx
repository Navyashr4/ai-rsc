import React from 'react'
import type { UIState } from '@/app/actions'

interface MessagesProps {
  messages: UIState;
}

export const ChatList = ({messages} : MessagesProps) => {
  if (messages.length == 0){
    return null; 
  }

  return (
    <div className='relative mx-auto max-w-2xl px-4'>
      {messages.map((message) => (
        <div key = {message.id} className='pb-4'>
          {message.display}
        </div>
      ))}
    </div>
  )
}

export default ChatList
