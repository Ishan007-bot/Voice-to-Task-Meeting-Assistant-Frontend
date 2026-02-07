import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, FileAudio, CheckSquare, ChevronRight } from 'lucide-react'
import { cn, formatDuration, formatRelativeTime, getStatusColor } from '../lib/utils'

interface Meeting {
  id: string
  title: string
  status: string
  status_message?: string
  processing_progress: number
  audio_duration_seconds?: number
  created_at: string
  task_count: number
  has_transcript: boolean
}

interface MeetingCardProps {
  meeting: Meeting
  index: number
}

export default function MeetingCard({ meeting, index }: MeetingCardProps) {
  const isProcessing = ['processing', 'transcribing', 'extracting', 'uploading'].includes(
    meeting.status.toLowerCase()
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/meetings/${meeting.id}`}
        className="card-hover block p-5 group"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-white truncate group-hover:text-teal-400 transition-colors">
                {meeting.title}
              </h3>
              <span className={getStatusColor(meeting.status)}>
                {meeting.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-navy-400">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {formatRelativeTime(meeting.created_at)}
              </span>
              
              {meeting.audio_duration_seconds && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {formatDuration(meeting.audio_duration_seconds)}
                </span>
              )}
              
              {meeting.task_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <CheckSquare size={14} />
                  {meeting.task_count} task{meeting.task_count !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Progress bar for processing */}
            {isProcessing && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-navy-400">{meeting.status_message || 'Processing...'}</span>
                  <span className="text-teal-400">{meeting.processing_progress}%</span>
                </div>
                <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${meeting.processing_progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center text-navy-500 group-hover:text-teal-400 transition-colors">
            <ChevronRight size={20} />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
