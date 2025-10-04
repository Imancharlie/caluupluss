## Mr. Caluu Chatbot – Frontend Integration Guide

This document explains how your React frontend should call the chatbot endpoints, authenticate requests, and handle responses/errors to avoid 400/401 issues and stay aligned with the backend.

### Base URL
- All endpoints are mounted under: `/api/chatbot/`

### Auth Requirements
- All endpoints require JWT auth with the `Authorization: Bearer <access_token>` header.
- The backend uses `rest_framework_simplejwt`. Ensure your frontend already obtains and refreshes tokens.
- Common 401 causes:
  - Missing `Authorization` header
  - Expired access token
  - Wrong token type (must be `Bearer`)

### Content Type
- For POST requests, use `Content-Type: application/json`.

---

## Endpoints

### 1) Get/Create Active Conversation
- Method: GET
- Path: `/api/chatbot/conversations/active/`
- Headers: `Authorization: Bearer <token>`
- Success 200 Response Body:
```json
{
  "id": "<uuid>",
  "title": "New Conversation",
  "is_active": true,
  "created_at": "2025-10-02T11:20:10Z",
  "updated_at": "2025-10-02T11:20:10Z",
  "messages": [
    {
      "id": "<uuid>",
      "role": "user|assistant",
      "content": "string",
      "tokens_used": 0,
      "timestamp": "2025-10-02T11:20:10Z"
    }
  ]
}
```
- Error 401: Missing/invalid token.

Notes:
- If no active conversation exists, the backend creates one and returns it.

### 2) Create New Conversation
- Method: POST
- Path: `/api/chatbot/conversations/`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body (optional):
```json
{ "title": "My study plan" }
```
- Success 201: Same shape as the object above (without `messages` until you send one).
- Errors:
  - 401 if not authenticated
  - 400 if body is malformed JSON

### 3) Send Message (AI response is saved)
- Method: POST
- Path: `/api/chatbot/conversations/{id}/send_message/`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body:
```json
{ "message": "When is my next class?" }
```
- Success 200 Response Body:
```json
{
  "id": "<uuid>",
  "title": "New Conversation",
  "is_active": true,
  "created_at": "...",
  "updated_at": "...",
  "messages": [
    { "id": "...", "role": "user", "content": "When is my next class?", "tokens_used": 0, "timestamp": "..." },
    { "id": "...", "role": "assistant", "content": "Next class: CS101 at 09:00 in Room 1. [LINK:/app/timetable]", "tokens_used": 123, "timestamp": "..." }
  ]
}
```
- Errors:
  - 400 if `message` is missing or empty
  - 401 if not authenticated
  - 500 if Gemini API is not configured (see Setup below)

Notes:
- Quick intents like greeting/schedule/next class may return without calling Gemini (tokens_used = 0).
- Assistant responses may contain tags like `[LINK:/app/timetable]`. Parse these and render as links.

### 4) List Messages in a Conversation
- Method: GET
- Path: `/api/chatbot/conversations/{id}/messages/`
- Headers: `Authorization: Bearer <token>`
- Success 200: Array of message objects (same shape as above `messages`).
- Errors: 401 if not authenticated; 404 if conversation does not belong to user.

### 5) Archive a Conversation
- Method: POST
- Path: `/api/chatbot/conversations/{id}/archive/`
- Headers: `Authorization: Bearer <token>`
- Success 200: `{ "status": "archived" }`
- Errors: 401 if not authenticated; 404 if not owned.

### 6) Quick Chat (no conversation)
- Method: POST
- Path: `/api/chatbot/quick/`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body:
```json
{ "message": "schedule" }
```
- Success 200:
```json
{ "reply": "Today's classes...", "tokens_used": 0 }
```
- Errors: 400 missing `message`, 401 unauthenticated, 500 if Gemini not configured and quick intent not matched.

### 7) Chat Stats
- Method: GET
- Path: `/api/chatbot/stats/`
- Headers: `Authorization: Bearer <token>`
- Success 200:
```json
{ "conversations": 2, "messages": 14, "tokens_used": 3456 }
```
- Errors: 401 if unauthenticated

---

## Avoiding 400 and 401 Errors

Checklist for each request:
- Include `Authorization: Bearer <access_token>` header.
- For POSTs, include `Content-Type: application/json` and valid JSON body.
- Pass the correct `conversation id` from previous responses.
- Expect 200/201 on success. Handle 400/401/404 gracefully:
  - 400: validate required fields (`message`)
  - 401: refresh token and retry once
  - 404: user tried to access someone else’s conversation or wrong id

Rate limiting / retries:
- If you hit transient 5xx, retry once after a short delay.

Link parsing:
- Assistant may include `[LINK:/app/timetable]`. Replace with clickable routes to your app.

---

## Example Fetch Snippets

Assume `const token = localStorage.getItem('accessToken');`

```js
const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
};

// Get active conversation
const res = await fetch('/api/chatbot/conversations/active/', { headers });
const convo = await res.json();

// Send a message
const sendRes = await fetch(`/api/chatbot/conversations/${convo.id}/send_message/`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ message: 'Hello' })
});
const updated = await sendRes.json();
```

---

## Backend Setup Requirements (for developers)

1) Install deps:
```bash
pip install -r requirements.txt
```

2) Configure environment:
```bash
# PowerShell (Windows)
$Env:GEMINI_API_KEY = "<YOUR_GOOGLE_GEMINI_KEY>"

# bash
export GEMINI_API_KEY="<YOUR_GOOGLE_GEMINI_KEY>"
```

3) Migrate:
```bash
python manage.py makemigrations chatbot
python manage.py migrate
```

4) Authentication:
- Obtain JWT via your existing auth endpoints.
- Send `Authorization: Bearer <access_token>` with each request.

5) Data expectations for best answers:
- User must have a `Student` profile related to `User`.
- `StudentCourse` should hold a JSON list of courses.
- `TimetableSlot` should have entries for the student (day_of_week uses lowercase weekday names).
- `Notification` unread count is used for context.

Troubleshooting:
- 500 and message "Gemini API key not configured": ensure `GEMINI_API_KEY` is set in environment and server was restarted.
- Empty schedule responses: verify `TimetableSlot.day_of_week` matches today's weekday in lowercase (e.g., `monday`).


