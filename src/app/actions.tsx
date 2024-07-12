'use server'

import {createAI, getMutableAIState, streamUI} from "ai/rsc"
import {CoreMessage, ToolInvocation} from "ai"
import { ReactNode } from "react";
import {openai} from "@ai-sdk/openai"
import { BotMessage } from "@/components/llm/message";
import { Loader2 } from "lucide-react";
import { z,symbol } from "zod";

/* 
  !-- The first implication of user interfaces being generative is that they are not deterministic in nature.
  !-- This is because they depend on the generation output by the model. Since these generations are probabilistic 
  !-- in nature, it is possible for every user query to result in a different user interface being generated.

  !-- Users expect their experience using your application to be predictable, so non-deterministic user interfaces
  !-- can sound like a bad idea at first. However, one way language models can be set up to limit their generations
  !-- to a particular set of outputs is to use their ability to call functions, now called tool calling.

  !-- When language models are provided with a set of function definitions, and instructed that it can choose to 
  !-- execute any of them based on user query, it does either one of the following two things:

  !-- 1. Execute a function that is most relevant to the user query.
  !-- 2. Not execute any function if the user query is out of bounds the set of functions available to them.

  !-- As you can see in the content variable below, we set the initial message so that the LLM understand what to do.
  !-- We define a few tool names which allows the LLM to decide whether or not to call the function. Then, we ensure
  !-- that the LLM understands that if the function is out of bounds of the set of functions available to them, they
  !-- should respond that they are a demo and cannot do that. Besides that, the LLM can chat with users as normal.
*/


const content = `\
You are a crypto bot and you can help users get the prices of cryptocurrencies. 

Messages inside [] means that it's a UI element or a user event. For example:
- "[Price of BTC = 69000]" means that the interface of the cryptocurrency price of BTC is shown to the user.

If the user wants the price, call \`get_crypto_price\` to show the price.
If the user wants the market cap or other stats of a given cryptocurrency, call \`get_crypto_stats\` to show the stats.
If the user wants a stock price, it is an impossible task, so you should respond that you are a demo and cannot do that.
If the user wants to do anything else unrelated to the function calls  \`get_crypto_stats\`  and  \`get_crypto_price\` , you can also chat with users and answer any questions they may have. 
`;

export const sendMessage = async(
    message: string, 
) : Promise<{
    id: number;
    role: "user" | "assistant";
    display: ReactNode;
}> => {
    const history = getMutableAIState<typeof AI>()

    history.update([
        ...history.get(),
        {
            role: "user",
            content: "message"
        }
    ]);

    const reply = await streamUI({
        model: openai("gpt-4o-2024-05-13"),
        messages: [
            {
                role: "system", 
                content, 
                toolInvocations: []
            },
            ...history.get()
        ] as CoreMessage[],
        initial: (
            <BotMessage className="items-center flex shrink-0 select-none justify-center">
                <Loader2 className="h-5 w-5 animate-spin stroke-zinc-900" />
            </BotMessage>
        ),
        text: ({content, done}) => {
            if (done) 
                history.done([...history.get(), {role: "assistant", content}])
            return <BotMessage>{content}</BotMessage>
        },

        tools: {
            get_crypto_price: {
                description: "Get the current price of a given cryptocurrency. Use this to show the price to the user.",
                parameters: z.object({
                    symbol: z.string().describe("")
                })
            }, 
            get_crypto_stats: {}
        }

    });


    return({
        id: Date.now(), 
        role: "assistant", 
        display: <p>Hello!</p>
    });
};

export type AIState = Array<{
    id?: number;
    name?: "get_crypto_price" | "get_crypto_stats"; 
    role: "user" | "assistant" | "system";
    content: string; 
}>

export type UIState = Array<{
    id?: number; 
    role: "user" | "assistant";
    display: ReactNode; 
    toolInvocations?: ToolInvocation[];
}>

export const AI = createAI({
    initialAIState: [] as AIState, 
    initialUIState: [] as UIState, 
    actions: {
        sendMessage
    }
})