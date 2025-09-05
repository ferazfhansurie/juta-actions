# Multiple User Sessions Implementation

## Overview

The Juta AI Actions system now supports multiple user sessions, where each user gets their own independent WhatsApp Web.js session. This ensures complete isolation between users and their WhatsApp conversations.

## Key Features

### 🔐 User-Specific Sessions
- Each user gets their own WhatsApp Web.js client instance
- Separate session directories: `wwebjs_auth/session-{userId}/`
- Independent QR codes and authentication states
- Isolated message processing and action detection

### 🛡️ Authentication & Security
- JWT-based authentication with user-specific tokens
- Socket.IO authentication middleware
- User-specific API endpoints with authorization checks
- Database isolation with user_id foreign keys

### 📊 Data Isolation
- Actions are stored with user_id references
- User-specific action retrieval and management
- Separate chat histories and AI interactions
- Independent status monitoring

## Architecture Changes

### Backend Changes

#### 1. Session Manager (`backend/sessionManager.js`)
```javascript
class SessionManager {
  constructor() {
    this.sessions = new Map(); // userId -> session data
    this.db = new Pool({...}); // Database connection
  }
  
  async createUserSession(userId, phoneNumber) {
    // Creates unique WhatsApp client for each user
    // Sets up user-specific event handlers
    // Manages session lifecycle
  }
}
```

#### 2. Updated Server (`backend/server.js`)
- Replaced single WhatsApp client with SessionManager
- Added authentication middleware for Socket.IO
- Updated all API endpoints to be user-specific
- Added user socket mapping for targeted notifications

#### 3. Database Schema Updates
```sql
-- ai_actions table now requires user_id
ALTER TABLE ai_actions 
ADD COLUMN user_id INTEGER REFERENCES users(id) NOT NULL;

-- All queries now filter by user_id
SELECT * FROM ai_actions WHERE user_id = $1 AND status = 'pending';
```

### Frontend Changes

#### 1. Updated useSocket Hook (`src/hooks/useSocket.ts`)
- Added authentication token to all API calls
- User-specific status and actions fetching
- Proper error handling for unauthorized access

#### 2. Enhanced Dashboard (`src/components/Dashboard.tsx`)
- Added chat interface with user authentication
- User-specific chat message handling
- Integrated with user session management

## Usage

### 1. User Login
```javascript
// Each user logs in with their phone number
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phoneNumber: '+60123456789' })
});

const { token, user } = await response.json();
localStorage.setItem('authToken', token);
```

### 2. Session Creation
```javascript
// Session is automatically created on login
// Each user gets their own WhatsApp client
const userSession = sessionManager.createUserSession(userId, phoneNumber);
```

### 3. User-Specific Operations
```javascript
// All API calls include authentication token
const actions = await fetch('/api/actions', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const status = await fetch('/api/status', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Testing

Run the test script to verify multiple user sessions:

```bash
node test-multiple-sessions.js
```

This will test:
- ✅ Multiple user logins
- ✅ User-specific status checks
- ✅ Isolated action retrieval
- ✅ Independent chat functionality

## Benefits

### 🔒 Complete Isolation
- Users cannot see each other's WhatsApp messages
- Actions are completely separated
- No cross-user data leakage

### ⚡ Scalability
- Each user session runs independently
- No shared resources or conflicts
- Easy to add/remove users

### 🛠️ Maintenance
- Individual session management
- User-specific error handling
- Granular control over user sessions

## Session Management

### Automatic Cleanup
- Inactive sessions are automatically cleaned up
- Configurable timeout (default: 60 minutes)
- Graceful session destruction

### Error Handling
- Session creation failures don't affect other users
- Individual session restart capabilities
- Comprehensive error logging

## Security Considerations

1. **Token Security**: JWT tokens are user-specific and time-limited
2. **Database Isolation**: All queries include user_id filtering
3. **Session Isolation**: Complete separation of WhatsApp sessions
4. **API Authorization**: All endpoints require valid user tokens

## Future Enhancements

- [ ] Session persistence across server restarts
- [ ] User session monitoring dashboard
- [ ] Advanced session analytics
- [ ] Multi-device session support
- [ ] Session sharing capabilities

## Troubleshooting

### Common Issues

1. **Session Creation Fails**
   - Check Chrome installation path
   - Verify database connectivity
   - Check user authorization

2. **Authentication Errors**
   - Verify JWT token validity
   - Check token expiration
   - Ensure proper authorization headers

3. **Session Conflicts**
   - Each user gets unique session directory
   - No shared resources between sessions
   - Automatic cleanup of inactive sessions

### Debug Commands

```bash
# Check active sessions
curl -H "Authorization: Bearer <token>" https://c4ba947d9455f026.ngrok.app/api/status

# View user actions
curl -H "Authorization: Bearer <token>" https://c4ba947d9455f026.ngrok.app/api/actions

# Test chat functionality
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}' \
  https://c4ba947d9455f026.ngrok.app/api/chat
```
