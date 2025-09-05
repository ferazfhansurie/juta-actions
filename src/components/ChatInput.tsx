import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 compact-padding border-t border-white/10">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={disabled ? "Connecting..." : "Type your message..."}
        disabled={disabled}
        className="flex-1 px-3 py-2 glass-input rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      />
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="px-4 py-2 glass-button text-white rounded-lg hover:shadow-glass-hover focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};

export default ChatInput;