'use client'
import { useEffect } from "react"
import { useAtBottom } from "@/lib/use-at-bottom"
import {useInView} from "react-intersection-observer"

export const ChatScrollAnchor = () => {
  const trackVisibility = true 

  const isAtBottom = useAtBottom();
  const {ref, entry, inView} = useInView({
    trackVisibility, 
    delay: 100, 
    rootMargin: "0px 0px -50px 0px"
  });

  useEffect(() => {
    if (isAtBottom && trackVisibility && !inView){
      entry?.target.scrollIntoView({
        block:"start"
      })

    }
  }, [inView, entry, isAtBottom])
  return <div ref={ref} className="h-px w-full"/>;
}

export default ChatScrollAnchor