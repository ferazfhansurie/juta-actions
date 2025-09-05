import React from 'react';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: {
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
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.sender === 'ai';

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isAI ? '' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 ${isAI ? 'mr-3' : 'ml-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center glass-card ${
            isAI ? 'text-white' : 'text-white'
          }`}>
            {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>
        </div>
        <div className={`px-4 py-2 rounded-xl glass-card ${
          isAI 
            ? 'text-white' 
            : 'text-white bg-blue-500/20 border-blue-400/30'
        }`}>
          <p className="text-sm">{message.content}</p>
          
          {message.actionData && (
            <div className="mt-2 compact-padding glass-card rounded-lg text-xs">
              <div className="font-medium text-white mb-1">
                Detected {message.actionData.type}
              </div>
              <div className="text-white/70">{message.actionData.description}</div>
              {message.actionData.originalMessage && (
                <div className="mt-1 text-white/50">
                  From: {message.actionData.originalMessage.fromName}
                </div>
              )}
            </div>
          )}
          
          <div className={`text-xs mt-1 ${isAI ? 'text-white/40' : 'text-white/60'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;