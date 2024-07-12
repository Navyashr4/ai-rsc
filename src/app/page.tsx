'use client';

import ChatList from "@/components/chatList";
import ChatScrollAnchor from "@/components/chatScrollAnchor";
import { useEnterSubmit } from "@/lib/useEnterSubmit";
import {SubmitHandler} from "react-hook-form"
import TextareaAutosize from "react-textarea-autosize"
import { Button } from "@/components/ui/button";
import {ArrowUpIcon} from "lucide-react"
import { PlusIcon } from "lucide-react";
import {z} from 'zod';
import { useActions, useUIState } from "ai/rsc";
import {AI} from "./actions"
import { UserMessage } from "@/components/llm/message";
import { useEffect, useRef } from "react";
import {useForm} from "react-hook-form"

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required')
})

export type ChatInput = z.infer<typeof chatSchema>;

export default function Home() {
  const form = useForm<ChatInput>()
  const {formRef, onKeyDown} = useEnterSubmit()
  const [messages, setMessages] = useUIState<typeof AI>();
  const { sendMessage } = useActions<typeof AI>();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const onSubmit: SubmitHandler<ChatInput> = async(data) => {
    const value = data.message.trim();
    formRef.current?.reset();

    if (!value) return;

    setMessages(currentMessages => [
      ...currentMessages, 
      {
        id: Date.now(), 
        role: "user", 
        display: <UserMessage>{value}</UserMessage>
      },
    ]);

    try {
      const responseMessage = await sendMessage(value);
      setMessages(currentMessages => [
        ...currentMessages, 
        responseMessage,
      ]);
    } catch(error) {
      console.error(error)
    }
  
  };


  return (
    <main>
      <div className="pb-[200px] pt-4 md:pt-10">
        <ChatList messages={[]} />
        <ChatScrollAnchor />
        </div>
      <div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
        <div className="mx-auto sm:max-w-2xl sm:px-4">
          <div className="px-4 flex justify-center flex-col py-2 space-y-4 border-t shadow-lg bg-background sm:rounded-t-xl sm:border md:py-4 bg-white">
            <form
              ref={formRef}
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="relative flex flex-col w-full overflow-hidden max-h-60 grow bg-background sm:rounded-md sm:border">
                <TextareaAutosize
                  tabIndex={0}
                  onKeyDown={onKeyDown}
                  placeholder="Send a message."
                  className="min-h-[60px] w-full resize-none bg-transparent pl-4 pr-16 py-[1.3rem] focus-within:outline-none sm:text-sm"
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  rows={1}
                  {...form.register('message')}
                />
                <div className="absolute right-0 top-4 sm:right-4">
                  <Button
                    type="submit"
                    size="icon"
                    disabled={form.watch('message') === ''}
                  >
                    <ArrowUpIcon className="w-5 h-5" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </div>
            </form>
            <Button
              variant="outline"
              size="lg"
              className="p-4 mt-4 rounded-full bg-background"
              onClick={e => {
                e.preventDefault();
                window.location.reload();
              }}
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Chat</span>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
      