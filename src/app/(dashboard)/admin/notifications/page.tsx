"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Users,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Search,
} from "lucide-react";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  company: { name: string } | null;
}

export default function AdminNotificationsPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"all" | "specific">("all");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || data || []);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(
    (u) =>
      (u.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.company?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  async function handleSend() {
    if (!subject.trim() || !message.trim()) {
      setResult({ success: false, message: "Veuillez remplir le sujet et le message" });
      return;
    }

    if (targetType === "specific" && selectedUserIds.length === 0) {
      setResult({ success: false, message: "Veuillez sélectionner au moins un destinataire" });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          targetType,
          targetUserIds: targetType === "specific" ? selectedUserIds : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, message: data.message });
        setSubject("");
        setMessage("");
        setSelectedUserIds([]);
      } else {
        setResult({ success: false, message: data.error || "Erreur lors de l'envoi" });
      }
    } catch {
      setResult({ success: false, message: "Une erreur est survenue" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Envoyez des emails et notifications aux utilisateurs
        </p>
      </div>

      {/* Résultat */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
            result.success
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <p className="text-sm">{result.message}</p>
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Destinataires */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-500" />
            Destinataires
          </h2>

          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setTargetType("all")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                targetType === "all"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              Tous les utilisateurs ({users.length})
            </button>
            <button
              onClick={() => setTargetType("specific")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                targetType === "specific"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" />
              Utilisateurs spécifiques
              {selectedUserIds.length > 0 && (
                <span className="bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {selectedUserIds.length}
                </span>
              )}
            </button>
          </div>

          {targetType === "specific" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                      selectedUserIds.includes(user.id)
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-zinc-400 hover:bg-zinc-800/50 border border-transparent"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium">{user.name || "Sans nom"}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                    <span className="text-xs text-zinc-600">
                      {user.company?.name || "—"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contenu du message */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-zinc-500" />
            Message
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 font-medium uppercase mb-1.5 block">
                Sujet *
              </label>
              <input
                type="text"
                placeholder="Ex: Mise à jour importante, Nouvelle fonctionnalité..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-medium uppercase mb-1.5 block">
                Message *
              </label>
              <textarea
                placeholder="Écrivez votre message ici..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Bouton envoyer */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            {targetType === "all"
              ? `L'email sera envoyé à ${users.length} utilisateur(s)`
              : `${selectedUserIds.length} destinataire(s) sélectionné(s)`}
          </p>
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Envoyer la notification
          </button>
        </div>
      </div>
    </div>
  );
}
