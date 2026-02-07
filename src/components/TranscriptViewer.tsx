import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Clock, Edit2, Check, X } from 'lucide-react'
import { cn, formatDuration } from '../lib/utils'

interface Segment {
  id: string
  text: string
  speaker_label?: string
  speaker_name?: string
  start_time: number
  end_time: number
}

interface TranscriptViewerProps {
  segments: Segment[]
  onUpdateSpeaker: (label: string, name: string) => void
}

const SPEAKER_COLORS = [
  'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'bg-green-500/20 text-green-400 border-green-500/30',
]

export default function TranscriptViewer({
  segments,
  onUpdateSpeaker,
}: TranscriptViewerProps) {
  const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null)
  const [speakerName, setSpeakerName] = useState('')

  // Get unique speakers
  const speakers = new Map<string, number>()
  segments.forEach((seg) => {
    if (seg.speaker_label && !speakers.has(seg.speaker_label)) {
      speakers.set(seg.speaker_label, speakers.size)
    }
  })

  const getSpeakerColor = (label?: string) => {
    if (!label) return 'bg-navy-700 text-navy-400 border-navy-600'
    const index = speakers.get(label) || 0
    return SPEAKER_COLORS[index % SPEAKER_COLORS.length]
  }

  const handleEditSpeaker = (label: string, currentName?: string) => {
    setEditingSpeaker(label)
    setSpeakerName(currentName || label)
  }

  const handleSaveSpeaker = (label: string) => {
    if (speakerName.trim()) {
      onUpdateSpeaker(label, speakerName.trim())
    }
    setEditingSpeaker(null)
    setSpeakerName('')
  }

  return (
    <div className="space-y-4">
      {/* Speaker Legend */}
      {speakers.size > 0 && (
        <div className="card p-4 mb-6">
          <h4 className="text-sm font-medium text-navy-300 mb-3">Speakers</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(speakers.entries()).map(([label, index]) => {
              const segment = segments.find((s) => s.speaker_label === label)
              const displayName = segment?.speaker_name || label

              return (
                <div key={label} className="flex items-center gap-2">
                  {editingSpeaker === label ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={speakerName}
                        onChange={(e) => setSpeakerName(e.target.value)}
                        className="input-field text-xs py-1 px-2 w-32"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveSpeaker(label)}
                        className="p-1 text-teal-400 hover:bg-teal-500/10 rounded"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingSpeaker(null)}
                        className="p-1 text-navy-400 hover:bg-navy-700 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditSpeaker(label, segment?.speaker_name)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all hover:scale-105',
                        getSpeakerColor(label)
                      )}
                    >
                      <User size={12} />
                      {displayName}
                      <Edit2 size={10} className="ml-1 opacity-50" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Transcript Segments */}
      <div className="space-y-3">
        <AnimatePresence>
          {segments.map((segment, index) => (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="card p-4 hover:bg-navy-800/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Speaker badge */}
                <div
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border shrink-0',
                    getSpeakerColor(segment.speaker_label)
                  )}
                >
                  <User size={12} />
                  {segment.speaker_name || segment.speaker_label || 'Unknown'}
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <p className="text-navy-100 leading-relaxed">{segment.text}</p>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1 text-xs text-navy-500 shrink-0">
                  <Clock size={12} />
                  {formatDuration(Math.floor(segment.start_time))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
