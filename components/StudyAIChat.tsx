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
            const errorMessage: Message = {
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting right now. Please try again later.",
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
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-lg border border-purple-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">AI Study Assistant</h2>
                                <p className="text-purple-100 text-sm">Powered by Gemini AI</p>
                            </div>
                        </div>
                        <button
                            onClick={clearChat}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
                        >
                            Clear Chat
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="h-[60vh] min-h-[350px] md:h-[500px] overflow-y-auto p-6 space-y-4 bg-white">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
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
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask any question (except movies/entertainment)..."
                            className="flex-1 px-4 py-3 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                            disabled={loading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium shadow-lg"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                            Send
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
