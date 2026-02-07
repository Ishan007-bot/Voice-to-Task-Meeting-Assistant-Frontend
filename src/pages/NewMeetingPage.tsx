import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { meetingsAPI } from '../lib/api'
import AudioRecorder from '../components/AudioRecorder'

export default function NewMeetingPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const navigate = useNavigate()

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setAudioBlob(blob)
    setAudioFile(null)
    setAudioDuration(duration)
    toast.success('Recording captured!')
  }

  const handleFileUpload = (file: File) => {
    setAudioFile(file)
    setAudioBlob(null)
    toast.success(`File selected: ${file.name}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Please enter a meeting title')
      return
    }

    if (!audioBlob && !audioFile) {
      toast.error('Please record or upload audio')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create meeting
      const { data: meeting } = await meetingsAPI.create({
        title: title.trim(),
        description: description.trim() || undefined,
      })

      // Prepare file
      let fileToUpload: File
      if (audioBlob) {
        fileToUpload = new File([audioBlob], 'recording.webm', {
          type: 'audio/webm',
        })
      } else if (audioFile) {
        fileToUpload = audioFile
      } else {
        throw new Error('No audio file')
      }

      // Upload audio
      await meetingsAPI.uploadAudio(
        meeting.id,
        fileToUpload,
        (progress) => setUploadProgress(progress)
      )

      toast.success('Processing started!')
      navigate(`/meetings/${meeting.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white">
          New Recording
        </h1>
        <p className="text-navy-400 mt-1">
          Record or upload a meeting to extract action items
        </p>
      </div>

      {/* Audio Recorder */}
      <AudioRecorder
        onRecordingComplete={handleRecordingComplete}
        onFileUpload={handleFileUpload}
      />

      {/* Audio confirmation */}
      {(audioBlob || audioFile) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 border-teal-500/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <span className="text-teal-400 text-lg">✓</span>
            </div>
            <div>
              <p className="font-medium text-white">
                {audioFile ? audioFile.name : 'Recording captured'}
              </p>
              <p className="text-sm text-navy-400">
                {audioFile
                  ? `${(audioFile.size / (1024 * 1024)).toFixed(1)} MB`
                  : `${Math.floor(audioDuration / 60)}:${(audioDuration % 60)
                      .toString()
                      .padStart(2, '0')} duration`}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Meeting Details Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-navy-300 mb-2">
            Meeting Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Weekly Team Standup"
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-300 mb-2">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the meeting..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        {/* Upload progress */}
        {isUploading && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-navy-400">Uploading...</span>
              <span className="text-teal-400">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-teal-500 to-teal-400"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading || (!audioBlob && !audioFile)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              Process Meeting
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
