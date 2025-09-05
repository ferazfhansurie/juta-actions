import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { MessageSquare } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  actionData?: {
    type: string;
    description: string;
    originalMessage?: {
      fromName: string;
      body: string;
    };
  };
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isConnected: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isConnected }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="glass-card rounded-xl shadow-glass flex flex-col h-96">
      <div className="flex items-center space-x-3 compact-padding border-b border-white/10">
        <img src="/logo.png" alt="Juta AI" className="w-5 h-5" />
        <h2 className="text-lg font-semibold gradient-text">Juta AI Assistant</h2>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'status-on pulse-glow' : 'status-off'}`}></div>
      </div>
      
      <div className="flex-1 overflow-y-auto compact-padding space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-white/60 mt-8">
            <MessageSquare className="w-12 h-12 text-white/30 mx-auto mb-4 float" />
            <p>Start a conversation with your AI assistant</p>
            <p className="text-sm mt-1">I'll help you manage actions detected from your WhatsApp conversations</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={onSendMessage} disabled={!isConnected} />
    </div>
  );
};

export default ChatInterface;