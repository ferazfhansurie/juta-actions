# Juta AI Actions

AI Actions is a WhatsApp conversation monitoring system that automatically detects actionable content (reminders, notes, events, tasks) from your conversations and sends you notifications to confirm or reject these actions.

## Features

- **WhatsApp Integration**: Connect via QR code or pairing code
- **AI-Powered Detection**: Automatically identifies actionable content in conversations
- **Real-time Monitoring**: Processes messages as they arrive
- **Action Management**: Confirm or reject detected actions with a clean UI
- **Multiple Action Types**: Supports reminders, notes, events, tasks, and contacts

## Setup

1. **Install Dependencies**
   ```bash
   cd juta-ai-actions
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3002
   ```

3. **Start the Application**
   
   **Terminal 1 - Backend Server:**
   ```bash
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm run frontend
   ```

4. **Connect WhatsApp**
   - Open http://localhost:3001 in your browser
   - Scan the QR code with WhatsApp or use the pairing code
   - Once connected, AI Actions will start monitoring your conversations

## How It Works

1. **Message Monitoring**: The system monitors all incoming WhatsApp messages (doesn't reply)
2. **AI Processing**: Each message is analyzed by OpenAI GPT-4 to detect actionable content
3. **Action Detection**: When actions are detected, they appear in the frontend interface
4. **User Confirmation**: You can edit, approve, or reject each detected action
5. **Integration Ready**: Approved actions can be integrated with your existing systems

## Action Types

- **Reminders**: "Remind me to call John tomorrow"
- **Notes**: "Note this down - meeting room is booked"
- **Events**: "Schedule a meeting with the team next Friday"
- **Tasks**: "Add to my todo list - review the proposal"
- **Contacts**: "Save his number in my contacts"

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WhatsApp      │───▶│   Backend       │───▶│   AI Processor  │
│   Web.js        │    │   (Node.js)     │    │   (OpenAI)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◀───│   WebSocket     │
│   (React)       │    │   Server        │
└─────────────────┘    └─────────────────┘
```

## Development

- **Backend**: Node.js with Express, Socket.IO, and WhatsApp-Web.js
- **Frontend**: React with TypeScript and Tailwind CSS
- **AI**: OpenAI GPT-4 for message analysis
- **Communication**: WebSocket for real-time updates

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run frontend` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build