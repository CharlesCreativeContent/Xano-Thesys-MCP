# API Structure

This API follows the official [persistence-with-c1-chat example](https://github.com/thesysdev/examples/tree/main/persistence-with-c1-chat) pattern.

## Endpoints

### `/api/threads`
- **GET** - Get all threads for the authenticated user
- **POST** - Create a new thread
  ```json
  {
    "name": "Thread name"
  }
  ```

### `/api/thread/[id]`
- **GET** - Get all messages for a specific thread
- **PATCH** - Update thread name or add messages
  ```json
  // Update thread name
  {
    "name": "New thread name"
  }
  
  // Add messages
  {
    "messages": [
      {
        "id": "msg_123",
        "role": "user",
        "content": "Hello"
      }
    ]
  }
  ```
- **DELETE** - Delete a thread

### `/api/chat`
- **POST** - Process chat completion with streaming response
  ```json
  {
    "prompt": {
      "id": "msg_123",
      "role": "user", 
      "content": "Hello"
    },
    "threadId": "thread_123",
    "responseId": "msg_124"
  }
  ```

## Authentication

All endpoints require authentication via Bearer token in the Authorization header.

## Data Flow

1. **Thread Creation**: `POST /api/threads` → Creates thread in external API
2. **Message Storage**: `POST /api/chat` → Stores messages via thread service
3. **Thread Loading**: `GET /api/thread/[id]` → Loads messages from external API
4. **Thread Management**: PATCH/DELETE `/api/thread/[id]` → Updates external API 