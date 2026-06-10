import React, { useState, useEffect, useRef } from "react";
import { Send, Cpu, User, Terminal, Check, Copy } from "lucide-react";
import { api, type ChatMessage } from "../services/api";

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "assistant",
      text: "Hello! I am your InstallGen AI DevOps assistant. Ask me questions about configuration files, shell scripts, ports binding, service autostarts, or server installations. How can I help you compile or debug scripts today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const assistantResponse = await api.chatWithAssistant(userMessage, messages);
      setMessages((prev) => [...prev, { sender: "assistant", text: assistantResponse }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "Error connecting to Gemini DevOps Swarm: " + (err.message || "Failed to parse API stream.")
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format/parse basic code blocks in chat messages
  const renderMessageContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        // Extract content
        const lines = part.split("\n");
        const lang = lines[0].replace("```", "").trim();
        const code = lines.slice(1, lines.length - 1).join("\n");

        return <CodeSnippetBlock key={index} language={lang} code={code} />;
      }
      return (
        <span key={index} className="whitespace-pre-wrap leading-relaxed">
          {part}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl glass-panel rounded-2xl overflow-hidden border border-slate-200/10">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-200/5 dark:bg-slate-800/10 border-b border-slate-200/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white">
            <Cpu className="w-5 h-5 animate-pulse-slow" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Gemini DevOps AI Swarm</h3>
            <span className="text-[10px] text-indigo-400 font-semibold">Ready to draft & analyze configs</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg, index) => {
          const isAi = msg.sender === "assistant";
          return (
            <div
              key={index}
              className={`flex items-start gap-3 max-w-[85%] ${isAi ? "" : "ml-auto flex-row-reverse"}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white ${
                  isAi
                    ? "bg-indigo-600 shadow-md shadow-indigo-600/10"
                    : "bg-slate-600 shadow-md shadow-slate-600/10"
                }`}
              >
                {isAi ? <Cpu className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div
                className={`p-4 rounded-2xl text-xs shadow-sm ${
                  isAi
                    ? "bg-slate-200/10 dark:bg-slate-800/10 border border-slate-200/20 text-slate-700 dark:text-slate-200 rounded-tl-none"
                    : "bg-indigo-600 text-white rounded-tr-none"
                }`}
              >
                {renderMessageContent(msg.text)}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-start gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-indigo-600/10">
              <Cpu className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-4 rounded-2xl text-xs bg-slate-200/10 dark:bg-slate-800/10 border border-slate-200/20 text-slate-400 rounded-tl-none flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 animate-spin" />
              <span>Agents are thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form footer */}
      <form
        onSubmit={handleSend}
        className="p-4 bg-slate-200/5 dark:bg-slate-800/10 border-t border-slate-200/10 flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question (e.g. 'How do I generate an SSH key on Ubuntu?' or 'Explain reverse proxies')"
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200/20 bg-slate-950/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

// Sub-component to render copyable code snippet
const CodeSnippetBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 border border-slate-200/10 rounded-xl overflow-hidden shadow bg-slate-950 flex flex-col max-w-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-200/10">
        <span className="text-[10px] font-mono text-slate-400 capitalize">{language || "code"}</span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 text-[9px] text-indigo-400 hover:text-indigo-300 font-bold"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto font-mono text-[10px] text-indigo-300 whitespace-pre scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default AIAssistantPage;
