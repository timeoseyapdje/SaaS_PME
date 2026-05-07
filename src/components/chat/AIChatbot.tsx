"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  ChevronDown,
  Lock,
} from "lucide-react";
import { useSession } from "next-auth/react";

// Simple markdown-like formatting (bold, italic, line breaks)
function formatMessage(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={j} className="italic text-muted-foreground">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
    return (
      <span key={i}>
        {i > 0 && <br />}
        {parts}
      </span>
    );
  });
}

// Typing indicator
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-emerald-400"
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

const DEMO_EMAIL = "demo@nkapcontrol.cm";

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const isDemo = session?.user?.email === DEMO_EMAIL;
  const { messages, isLoading, sendMessage, clearChat, suggestions } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    setShowScrollBtn(container.scrollHeight - container.scrollTop - container.clientHeight > 100);
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const showSuggestions = messages.length <= 1;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center group cursor-pointer"
          >
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-emerald-400"
              animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[420px] h-[100dvh] sm:h-[600px] sm:max-h-[85vh] flex flex-col sm:rounded-2xl overflow-hidden border-0 sm:border border-border bg-card/98 backdrop-blur-2xl shadow-2xl shadow-black/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-muted/60 backdrop-blur-md border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-none">Nkap AI</h3>
                  <p className="text-[10px] text-emerald-500 mt-0.5">Assistant financier intelligent</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Nouvelle conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
            >
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index === messages.length - 1 ? 0.1 : 0 }}
                  className={`flex gap-2.5 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    message.role === "user"
                      ? "bg-muted text-muted-foreground"
                      : "bg-emerald-500/15 text-emerald-500"
                  }`}>
                    {message.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                    message.role === "user"
                      ? "bg-emerald-500 text-white rounded-br-md shadow-md"
                      : message.isError
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-bl-md"
                      : "bg-muted text-foreground border border-border rounded-bl-md"
                  }`}>
                    {formatMessage(message.content)}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="bg-muted border border-border rounded-2xl rounded-bl-md px-4 py-2.5">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-[120px] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-card border border-border text-muted-foreground flex items-center justify-center shadow-lg hover:bg-muted transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && !isLoading && !isDemo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-2"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.slice(0, 4).map((suggestion, i) => (
                      <motion.button
                        key={suggestion}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        onClick={() => sendMessage(suggestion)}
                        className="text-[11px] px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input area */}
            <div className="px-4 py-3 border-t border-border bg-muted/40 backdrop-blur-md">
              {isDemo ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Nkap AI n&apos;est pas disponible en mode démo. Créez votre compte pour utiliser l&apos;assistant.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Posez une question..."
                      disabled={isLoading}
                      className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50 transition-all"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center disabled:opacity-30 disabled:hover:bg-emerald-500 transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <p className="text-[9px] text-muted-foreground text-center mt-2">
                    Nkap AI analyse vos données en temps réel • Propulsé par Claude
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
