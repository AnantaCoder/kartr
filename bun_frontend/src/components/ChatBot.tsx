import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send } from "lucide-react"

const ChatBox = () => {
  const [open, setOpen] = useState(false)
  function chatBotclick(){
    setOpen(!open);
  }

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        onClick={chatBotclick}
        className="fixed bottom-6 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:scale-105 transition"
      >
        <MessageCircle />
      </button>

      {/* CHAT PANEL */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] rounded-2xl bg-white shadow-2xl border overflow-hidden"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 text-white">
              <div>
                <p className="font-semibold">Analytics Assistant</p>
                <p className="text-xs opacity-90">
                  Ask about YouTube insights
                </p>
              </div>
              <button onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* MESSAGES */}
            <div className="h-[260px] space-y-3 overflow-y-auto px-4 py-3 text-sm">
              <div className="max-w-[85%] rounded-lg bg-gray-100 px-3 py-2">
                Hi 👋 How can I help you today?
              </div>
            </div>

            {/* INPUT */}
            <div className="flex items-center gap-2 border-t px-3 py-2">
              <input
                placeholder="Ask something..."
                className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button className="rounded-md bg-indigo-500 p-2 text-white hover:bg-indigo-600">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatBox
