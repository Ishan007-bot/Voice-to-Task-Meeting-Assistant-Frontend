import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Upload, Pause, Play } from 'lucide-react'
import { cn, formatDuration } from '../lib/utils'

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void
  onFileUpload: (file: File) => void
}

export default function AudioRecorder({
  onRecordingComplete,
  onFileUpload,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioData, setAudioData] = useState<number[]>(new Array(64).fill(0))
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const animationFrameRef = useRef<number>()
  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const visualize = useCallback(() => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    // Sample 64 bars from the frequency data
    const bars = []
    const step = Math.floor(dataArray.length / 64)
    for (let i = 0; i < 64; i++) {
      bars.push(dataArray[i * step] / 255)
    }
    setAudioData(bars)
    
    animationFrameRef.current = requestAnimationFrame(visualize)
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Set up audio analysis for visualization
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      
      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onRecordingComplete(blob, duration)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current.start(1000)
      setIsRecording(true)
      setIsPaused(false)
      setDuration(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)
      
      // Start visualization
      visualize()
    } catch (err) {
      console.error('Failed to start recording:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (audioContextRef.current) audioContextRef.current.close()
      
      setAudioData(new Array(64).fill(0))
    }
  }

  const togglePause = () => {
    if (!mediaRecorderRef.current) return
    
    if (isPaused) {
      mediaRecorderRef.current.resume()
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)
      visualize()
    } else {
      mediaRecorderRef.current.pause()
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
    setIsPaused(!isPaused)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (audioContextRef.current) audioContextRef.current.close()
    }
  }, [])

  return (
    <div className="card p-8">
      {/* Waveform Visualizer */}
      <div className="relative h-32 mb-8 flex items-center justify-center gap-[2px] overflow-hidden rounded-xl bg-navy-800/50 p-4">
        <AnimatePresence>
          {isRecording && !isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-teal-500/10 to-teal-500/5"
            />
          )}
        </AnimatePresence>
        
        {audioData.map((value, index) => (
          <motion.div
            key={index}
            className={cn(
              'w-1 rounded-full transition-colors',
              isRecording && !isPaused ? 'bg-teal-500' : 'bg-navy-600'
            )}
            animate={{
              height: isRecording && !isPaused ? Math.max(4, value * 80) : 4,
            }}
            transition={{ duration: 0.1 }}
          />
        ))}
        
        {!isRecording && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-navy-400 text-sm">
              Click record to start or upload an audio file
            </p>
          </div>
        )}
      </div>

      {/* Timer */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mb-6"
          >
            <span className="font-mono text-4xl font-bold gradient-text">
              {formatDuration(duration)}
            </span>
            <p className="text-navy-400 text-sm mt-1">
              {isPaused ? 'Paused' : 'Recording...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!isRecording ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-shadow"
            >
              <Mic size={32} className="text-white" />
            </motion.button>
            
            <div className="text-navy-500 font-medium">or</div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center gap-2"
            >
              <Upload size={20} />
              Upload File
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePause}
              className="w-14 h-14 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center hover:bg-navy-600 transition-colors"
            >
              {isPaused ? <Play size={24} /> : <Pause size={24} />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-shadow"
            >
              <Square size={28} className="text-white" fill="white" />
            </motion.button>
          </>
        )}
      </div>

      {/* Recording indicator */}
      <AnimatePresence>
        {isRecording && !isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 mt-6"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-3 h-3 rounded-full bg-red-500"
            />
            <span className="text-sm text-navy-300">Recording in progress</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
