import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, X, Sparkles } from 'lucide-react';
import { User } from '../types';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface StudyAIChatProps {
    user: User;
}

const OFFLINE_RESPONSES: Record<string, string> = {
    "linked list": "🔗 Linked List: A linear data structure with nodes containing data and pointers.\n• Types: Singly, Doubly, Circular\n• Time: Access O(n), Insert O(1)",
    "tree": "🌲 Trees: Hierarchical structure not linear.\n• Root: Top node\n• Binary Tree: Max 2 children\n• Used in: DOM, File Systems",
    "stack": "📚 Stack: LIFO (Last In First Out).\n• Push/Pop\n• Undo mechanism, Call stack",
    "queue": "🚶 Queue: FIFO (First In First Out).\n• Enqueue/Dequeue\n• Printer spooling, Task scheduling",
    "graph": "🕸️ Graph: Vertices + Edges.\n• BFS (Layer by layer)\n• DFS (Deep dive)\n• Used in: Social networks, Maps",
    "sort": "🔢 Sorting: Arranging data.\n• Bubble Sort O(n²)\n• Quick Sort O(n log n)\n• Merge Sort O(n log n)",
    "search": "🔍 Searching:\n• Linear Search O(n)\n• Binary Search O(log n) (Sorted only!)",
    "sql": "💾 SQL: Relational Databases.\n• Tables, Rows, Columns\n• SELECT, INSERT, UPDATE, DELETE",
    "python": "🐍 Python: Readable, versatile language.\n• Great for: AI, Data Science, Web (Django/Flask)",
    "javascript": "⚡ JavaScript: Web language.\n• Frontend (React), Backend (Node)\n• Event-driven",
    "react": "⚛️ React: UI Library.\n• Components, Props, State, Hooks\n• Virtual DOM for speed"
};

const StudyAIChat: React.FC<StudyAIChatProps> = ({ user }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hi! I'm your AI Assistant. You can ask me about anything! (General knowledge, definitions, coding, study topics, etc.) 📚\n\nNote: I don't discuss movies/entertainment or harmful topics.",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/study-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input.trim() })
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);

            // Offline Fallback Logic
            const lowerInput = input.trim().toLowerCase();
            let offlineResponse = "";

            // Check against expanded offline responses
            for (const [key, response] of Object.entries(OFFLINE_RESPONSES)) {
                if (lowerInput.includes(key)) {
                    offlineResponse = "📡 Offline Mode\n\n" + response;
                    break;
                }
            }

            // Additional broad matches
            if (!offlineResponse) {
                if (lowerInput.includes("sort")) offlineResponse = "📡 Offline Mode\n\n" + OFFLINE_RESPONSES["sort"];
                else if (lowerInput.includes("search")) offlineResponse = "📡 Offline Mode\n\n" + OFFLINE_RESPONSES["search"];
                else if (lowerInput.includes("graph")) offlineResponse = "📡 Offline Mode\n\n" + OFFLINE_RESPONSES["graph"];
                else if (lowerInput.includes("react")) offlineResponse = "📡 Offline Mode\n\n" + OFFLINE_RESPONSES["react"];
                else if (lowerInput.includes("js") || lowerInput.includes("javascript")) offlineResponse = "📡 Offline Mode\n\n" + OFFLINE_RESPONSES["javascript"];
                else if (lowerInput.includes("python")) offlineResponse = "📡 Offline Mode\n\n" + OFFLINE_RESPONSES["python"];
                else if (lowerInput.includes("sql") || lowerInput.includes("database")) offlineResponse = "📡 Offline Mode\n\n" + OFFLINE_RESPONSES["sql"];
                else if (lowerInput.match(/(hi|hello|hey|greetings)/)) offlineResponse = "👋 Hello! I'm currently unable to reach the server, but I can help with basic study topics in Offline Mode!";
            }

            const errorMessage: Message = {
                role: 'assistant',
                content: offlineResponse || "⚠️ Connection Error\n\nI can't reach the server right now. However, I can still help you with these topics in Offline Mode:\n\n• Data Structures (List, Tree, Stack, Queue, Graph)\n• Algorithms (Sorting, Search)\n• Web Dev (React, JS, SQL, Python)",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                role: 'assistant',
                content: "Chat cleared! Ready to help with any topic! 🎓",
                timestamp: new Date()
            }
        ]);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-lg border border-purple-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 sm:p-3 rounded-xl backdrop-blur-sm">
                                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold">AI Study Assistant</h2>
                                <p className="text-purple-100 text-xs sm:text-sm">Powered by Gemini AI</p>
                            </div>
                        </div>
                        <button
                            onClick={clearChat}
                            className="px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs sm:text-sm font-medium transition-colors backdrop-blur-sm"
                        >
                            Clear Chat
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="h-[60vh] sm:h-[500px] overflow-y-auto p-4 sm:p-6 space-y-4 bg-white">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                    : 'bg-gradient-to-r from-purple-50 to-blue-50 text-slate-900 border border-purple-200'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-500'}`}>
                                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl px-4 py-3 border border-purple-200">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                    <p className="text-sm text-slate-600">AI is thinking...</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-t border-purple-200">
                    <div className="flex gap-2 sm:gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask any question..."
                            className="flex-1 px-4 py-3 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm sm:text-base"
                            disabled={loading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium shadow-lg"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                            <span className="hidden sm:inline">Send</span>
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                        💡 AI answers general questions but strictly blocks movies & harmful content
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudyAIChat;
