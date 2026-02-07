import { create } from 'zustand'

interface Meeting {
  id: string
  user_id: string
  title: string
  description?: string
  audio_file_name?: string
  audio_file_size?: number
  audio_duration_seconds?: number
  audio_format?: string
  status: string
  status_message?: string
  processing_progress: number
  meeting_date?: string
  error_message?: string
  created_at: string
  updated_at: string
  task_count: number
  has_transcript: boolean
}

interface MeetingState {
  meetings: Meeting[]
  currentMeeting: Meeting | null
  isLoading: boolean
  
  setMeetings: (meetings: Meeting[]) => void
  setCurrentMeeting: (meeting: Meeting | null) => void
  updateMeeting: (id: string, updates: Partial<Meeting>) => void
  addMeeting: (meeting: Meeting) => void
  removeMeeting: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useMeetingStore = create<MeetingState>((set) => ({
  meetings: [],
  currentMeeting: null,
  isLoading: false,
  
  setMeetings: (meetings) => set({ meetings }),
  
  setCurrentMeeting: (meeting) => set({ currentMeeting: meeting }),
  
  updateMeeting: (id, updates) => set((state) => ({
    meetings: state.meetings.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    ),
    currentMeeting: state.currentMeeting?.id === id
      ? { ...state.currentMeeting, ...updates }
      : state.currentMeeting,
  })),
  
  addMeeting: (meeting) => set((state) => ({
    meetings: [meeting, ...state.meetings],
  })),
  
  removeMeeting: (id) => set((state) => ({
    meetings: state.meetings.filter((m) => m.id !== id),
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
}))
