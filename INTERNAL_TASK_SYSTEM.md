# Internal Task Management System

A comprehensive internal task management system for the WhatsApp AI Actions application that automatically creates and manages internal items when AI actions are approved.

## 🚀 System Overview

This system extends the existing AI Actions app to automatically create internal database records when users approve AI-detected actions from WhatsApp messages. It supports 13 different types of internal items and provides a complete CRUD API for managing them.

## 📊 Supported Item Types

1. **Reminders** - Time-based notifications
2. **Events** - Meetings and appointments  
3. **Tasks** - To-do items with due dates
4. **Notes** - General notes and documentation
5. **Contacts** - Contact information and communications
6. **Issues** - Problems and support requests
7. **Learning Items** - Educational content and courses
8. **Finance Items** - Financial transactions and bills
9. **Health Items** - Medical appointments and health records
10. **Shopping Items** - Shopping lists and purchases
11. **Travel Items** - Travel bookings and itineraries
12. **Creative Items** - Creative projects and ideas
13. **Admin Items** - Administrative tasks and documents

## 🏗️ Database Schema

### Core Features
- **13 specialized tables** for different item types
- **Action linking** - Each internal item links to its original AI action
- **User isolation** - All data is user-specific
- **Rich metadata** - Priority levels, status tracking, datetime handling
- **Flexible JSON fields** for type-specific data
- **Comprehensive indexing** for performance

### Common Fields (All Tables)
```sql
- id (Primary Key)
- action_id (Links to ai_actions table)
- title (Generated title)
- content (Original message content)
- priority (urgent, high, medium, low)
- status (active, completed, cancelled, etc.)
- created_from (whatsapp, api, etc.)
- user_id (Links to users table)
- created_at, updated_at
```

### Type-Specific Fields
Each table includes specialized fields relevant to its type:
- **Events**: location, attendees, start/end times
- **Tasks**: due dates, estimated hours, tags
- **Health**: appointment times, doctor info, symptoms
- **Finance**: amounts, currency, categories
- And much more...

## 🔧 API Endpoints

### Dashboard Endpoints
```
GET  /api/dashboard              - Complete dashboard data
GET  /api/dashboard/quick-stats  - Quick statistics summary
```

### CRUD Endpoints
```
GET     /api/internal/:type                    - Get all items of type
GET     /api/internal/:type/:itemId            - Get specific item
PUT     /api/internal/:type/:itemId            - Update specific item
DELETE  /api/internal/:type/:itemId            - Delete specific item
POST    /api/internal/:type/:itemId/status     - Update item status
```

### Specialized Endpoints
```
GET  /api/internal/reminders/upcoming          - Upcoming reminders
POST /api/internal/reminders/:id/snooze        - Snooze reminder
GET  /api/internal/events/today                - Today's events
GET  /api/internal/tasks/overdue               - Overdue tasks
POST /api/internal/notes/:id/pin               - Pin/unpin notes
POST /api/internal/issues/:id/resolve          - Resolve issues
```

### Search & Filter Endpoints
```
GET  /api/internal/search                      - Search across all items
GET  /api/internal/filter/priority/:priority   - Filter by priority
GET  /api/internal/filter/date-range           - Filter by date range
```

## 🔄 Workflow

### 1. AI Action Detection
- WhatsApp message received
- AI processes and detects actionable content
- Action stored in `ai_actions` table with `pending` status

### 2. User Approval
- User sees action in frontend
- User clicks "Approve" 
- **Enhanced approve endpoint** triggers

### 3. Internal Item Creation
- System retrieves action details
- Updates action status to `approved`
- **Automatically creates internal item** based on action type:
  - Extracts datetime, priority, and metadata from message
  - Maps action type to appropriate internal table
  - Creates structured internal record
  - Links back to original action

### 4. Item Management
- Users can view, edit, complete, or delete internal items
- Dashboard shows summaries and analytics
- Search and filter capabilities
- Status tracking and notifications

## 🚀 Installation & Setup

### 1. Database Migration
```bash
# Run the migration to create all internal tables
node backend/migrate.js up

# Check migration status  
node backend/migrate.js status

# Rollback if needed
node backend/migrate.js down
```

### 2. Start the Server
The system automatically initializes when you start the server:
```bash
npm start
```

The server will:
- ✅ Run database migrations automatically
- ✅ Initialize all internal item managers
- ✅ Set up API endpoints
- ✅ Start listening for WhatsApp actions

## 📱 Frontend Integration

The system is designed to integrate with the existing React frontend. Key integration points:

### Dashboard Component Updates
- Display internal items summary
- Show upcoming reminders/events
- Display overdue tasks
- Recent activity feed

### Action Cards Enhancement  
- Show internal item creation confirmation
- Link to created internal items
- Display internal item details

### New Internal Items Views
- List views for each item type
- Detail/edit views for items
- Search and filter interfaces
- Status management controls

## 🔍 Key Features

### Intelligent Content Processing
- **Datetime extraction** from natural language
- **Priority detection** from keywords
- **Smart title generation** based on content
- **Type-specific metadata extraction**

### Comprehensive CRUD Operations
- Create, read, update, delete for all item types
- Batch operations support
- Status management (complete, cancel, etc.)
- Flexible filtering and sorting

### Advanced Search & Filtering
- **Full-text search** across all internal items
- **Type-specific filtering** (reminders, tasks, etc.)
- **Priority-based filtering** (urgent, high, medium, low)
- **Date range filtering** with smart date column detection
- **Status filtering** (active, completed, etc.)

### Rich Dashboard Analytics
- **Item count summaries** by type and status
- **Upcoming items** (next 24 hours)
- **Overdue tasks** tracking
- **Today's events** overview
- **Completion statistics** with trends
- **Priority breakdown** visualization

### User Security & Isolation
- **JWT authentication** on all endpoints
- **User-specific data isolation**
- **Action-level permissions**
- **Secure database queries**

## 🔧 Core Classes

### InternalItemsManager
- **Main creation logic** for all internal item types
- **Message content parsing** and metadata extraction
- **Type-specific item generation**
- **Database operation coordination**

### InternalItemsCRUD  
- **Generic CRUD operations** across all item types
- **Type-specific query methods**
- **Status management functions**
- **Search and filtering capabilities**

### DashboardManager
- **Dashboard data aggregation**
- **Analytics and statistics generation**
- **Upcoming items calculation**
- **Trend analysis and reporting**

## 📈 Usage Examples

### Creating Internal Items (Automatic)
When a user approves an AI action:
```javascript
// Original AI action
{
  "actionId": "action_123",
  "type": "reminder",
  "description": "Remind me about the meeting tomorrow at 2pm"
}

// Automatically creates internal reminder
{
  "id": 1,
  "title": "Reminder from John",
  "content": "Remind me about the meeting tomorrow at 2pm", 
  "reminder_datetime": "2025-01-15T14:00:00Z",
  "priority": "medium",
  "status": "active"
}
```

### API Usage Examples

#### Get Dashboard Data
```bash
curl -H "Authorization: Bearer <token>" \
     https://c4ba947d9455f026.ngrok.app/api/dashboard
```

#### Search Items
```bash
curl -H "Authorization: Bearer <token>" \
     "https://c4ba947d9455f026.ngrok.app/api/internal/search?q=meeting&types=reminder,event"
```

#### Update Task Status
```bash
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"status": "completed"}' \
     https://c4ba947d9455f026.ngrok.app/api/internal/task/1/status
```

## 🛠️ Development

### Adding New Item Types
1. Add table definition to `backend/database/schema.sql`
2. Add creation function to `InternalItemsManager`
3. Add type mapping to `InternalItemsCRUD.tableMap`
4. Create migration file for new table
5. Add any specialized API endpoints

### Extending Search Capabilities
- Modify `searchUserItems()` in `InternalItemsCRUD`
- Add new filter methods as needed
- Create corresponding API endpoints

### Custom Dashboard Widgets
- Extend `DashboardManager` with new analytics
- Add corresponding API endpoints
- Update frontend dashboard components

## 🔐 Security Considerations

- **All endpoints require JWT authentication**
- **User data isolation** at database level  
- **SQL injection protection** via parameterized queries
- **Input validation** on all endpoints
- **Rate limiting** considerations for production

## 🚀 Production Deployment

### Environment Variables
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-secret-key
```

### Database Setup
1. Create PostgreSQL database
2. Run migrations: `node backend/migrate.js up`
3. Verify tables created successfully

### Monitoring
- Monitor database performance and query times
- Track API endpoint usage and response times  
- Set up alerts for failed internal item creations
- Monitor migration status and database health

## 🎯 Next Steps

### Immediate Integration
1. **Run migrations** to create database tables
2. **Test the enhanced approve endpoint** 
3. **Verify internal items are created** when actions approved
4. **Access dashboard data** via API endpoints

### Frontend Development
1. Update Dashboard component to show internal items
2. Create internal item list/detail views
3. Add search and filter interfaces
4. Implement status management controls

### Advanced Features
1. **Notifications system** for upcoming reminders
2. **Bulk operations** for managing multiple items
3. **Export capabilities** for data portability
4. **Calendar integration** for events and reminders
5. **Mobile app support** via API endpoints

---

## 📞 Support

This internal task management system provides a complete foundation for managing all types of user actions and tasks. The system is designed to be:

- **Scalable**: Handles growing user data efficiently
- **Extensible**: Easy to add new item types and features  
- **Maintainable**: Clean code structure and comprehensive documentation
- **Secure**: User data isolation and authentication
- **Fast**: Optimized database queries and indexing

The system automatically handles the conversion of WhatsApp AI actions into structured, manageable internal records, providing users with a complete task management solution integrated directly into their WhatsApp workflow.