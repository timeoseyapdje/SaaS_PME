"use client";

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isError?: boolean;
}

const SUGGESTIONS = [
  "Quel est mon chiffre d'affaires ce mois ?",
  "Quelles factures sont en retard ?",
  "Résume mes dépenses du mois",
  "Quelle est ma trésorerie actuelle ?",
  "Quels clients me doivent de l'argent ?",
  "Donne-moi un conseil financier",
  "Estime ma TVA à payer",
  "Analyse ma rentabilité",
];

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Bonjour ! 👋 Je suis **Nkap AI**, votre assistant financier intelligent.\n\nJe connais vos données en temps réel : factures, dépenses, trésorerie, clients... Posez-moi n'importe quelle question sur vos finances !\n\n💡 *Essayez une des suggestions ci-dessous pour commencer.*",
  timestamp: new Date(),
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Cancel any previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    try {
      // Send only role+content (no ids, timestamps, etc.)
      const apiMessages = [...messages.filter(m => m.id !== "welcome"), userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: abortRef.current.signal,
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message || data.error || "Erreur inconnue",
        timestamp: new Date(),
        isError: !response.ok,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      if ((error as Error).name === "AbortError") return;

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "❌ Impossible de contacter l'assistant. Vérifiez votre connexion et réessayez.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    suggestions: SUGGESTIONS,
  };
}
