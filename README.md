# 🎨 Voice-to-Task Frontend

<div align="center">

![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=flat-square&logo=vite&logoColor=white)

**Modern React frontend for the Voice-to-Task Meeting Assistant**

</div>

---

## ✨ Features

- 🎤 **Audio Recording** with real-time waveform visualizer (Web Audio API)
- 📤 **File Upload** with progress tracking
- 📊 **Dashboard** with meeting statistics
- 📝 **Transcript Viewer** with speaker diarization
- ✅ **Task Management** - Review, edit, approve, and sync tasks
- 🔗 **Integration Settings** - Connect Asana and Trello
- 🌙 **Dark Theme** - Professional navy & teal color scheme
- 📱 **Responsive Design** - Works on desktop and mobile

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on port 8000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
```

---

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── AudioRecorder.tsx    # Recording with visualizer
│   ├── Layout.tsx           # Main app layout
│   ├── MeetingCard.tsx      # Meeting list cards
│   ├── TaskCard.tsx         # Task cards
│   ├── TranscriptViewer.tsx # Transcript display
│   └── ProcessingStatus.tsx # Progress indicator
├── pages/                # Route pages
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── NewMeetingPage.tsx
│   ├── MeetingPage.tsx
│   ├── TasksPage.tsx
│   └── IntegrationsPage.tsx
├── stores/               # Zustand state management
│   ├── authStore.ts
│   └── meetingStore.ts
├── lib/                  # Utilities
│   ├── api.ts               # Axios API client
│   └── utils.ts             # Helper functions
├── App.tsx               # Main app component
├── main.tsx              # Entry point
└── index.css             # Tailwind styles
```

---

## 🎨 Design System

### Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Navy 950 | `#0a1929` | Background |
| Navy 900 | `#102a43` | Cards |
| Navy 700 | `#334e68` | Borders |
| Teal 500 | `#27ab83` | Primary accent |
| Teal 400 | `#3ebd93` | Hover states |

### Typography

- **Display**: Outfit (headings)
- **Body**: DM Sans (text)
- **Mono**: JetBrains Mono (code)

### Components

```tsx
// Primary button
<button className="btn-primary">Action</button>

// Secondary button
<button className="btn-secondary">Cancel</button>

// Card
<div className="card p-6">Content</div>

// Input
<input className="input-field" placeholder="Enter text..." />

// Status badges
<span className="status-completed">Completed</span>
<span className="status-processing">Processing</span>
<span className="status-pending">Pending</span>
```

---

## 🔌 API Integration

The frontend connects to the backend API using Axios with automatic token refresh:

```typescript
import { meetingsAPI, tasksAPI } from '@/lib/api'

// Fetch meetings
const { data } = await meetingsAPI.list()

// Upload audio
await meetingsAPI.uploadAudio(meetingId, file, (progress) => {
  console.log(`Upload: ${progress}%`)
})

// Update task
await tasksAPI.update(taskId, { status: 'pending' })
```

---

## 🏗️ Building for Production

```bash
# Type check
npx tsc --noEmit

# Build
npm run build

# Output in dist/
```

### Docker

```bash
# Build image
docker build -t voice-to-task-frontend .

# Run container
docker run -p 3000:3000 voice-to-task-frontend
```

---

## 🧪 Code Quality

```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Part of the [Voice-to-Task Meeting Assistant](https://github.com/Ishan007-bot/Voice-to-Task-Meeting-Assistant)**

</div>
