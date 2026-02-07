import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle, XCircle, FileAudio, Brain, ListChecks } from 'lucide-react'
import { cn } from '../lib/utils'

interface ProcessingStatusProps {
  meetingId: string
  status: string
  message?: string
  progress: number
  onComplete?: () => void
}

const STEPS = [
  { key: 'uploading', label: 'Uploading Audio', icon: FileAudio },
  { key: 'processing', label: 'Processing Audio', icon: FileAudio },
  { key: 'transcribing', label: 'Transcribing', icon: FileAudio },
  { key: 'extracting', label: 'Extracting Tasks', icon: Brain },
  { key: 'completed', label: 'Complete', icon: ListChecks },
]

export default function ProcessingStatus({
  meetingId,
  status,
  message,
  progress,
  onComplete,
}: ProcessingStatusProps) {
  const [currentStep, setCurrentStep] = useState(0)
  
  useEffect(() => {
    const stepIndex = STEPS.findIndex((s) => s.key === status.toLowerCase())
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex)
    }
    
    if (status === 'completed' && onComplete) {
      onComplete()
    }
  }, [status, onComplete])

  const isFailed = status === 'failed'

  return (
    <div className="card p-8">
      {/* Progress Circle */}
      <div className="flex justify-center mb-8">
        <div className="relative w-40 h-40">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              className="fill-none stroke-navy-700"
              strokeWidth="8"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              className={cn(
                'fill-none',
                isFailed ? 'stroke-red-500' : 'stroke-teal-500'
              )}
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 440' }}
              animate={{
                strokeDasharray: `${(progress / 100) * 440} 440`,
              }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isFailed ? (
              <XCircle className="w-12 h-12 text-red-500" />
            ) : status === 'completed' ? (
              <CheckCircle className="w-12 h-12 text-teal-500" />
            ) : (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              >
                <Loader2 className="w-12 h-12 text-teal-500" />
              </motion.div>
            )}
            <span className="mt-2 text-2xl font-bold gradient-text">
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Status message */}
      <p className="text-center text-lg font-medium text-white mb-2">
        {message || status}
      </p>
      
      {/* Step indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {STEPS.slice(0, -1).map((step, index) => (
          <div
            key={step.key}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-300',
              index < currentStep
                ? 'bg-teal-500'
                : index === currentStep
                ? 'bg-teal-500 animate-pulse'
                : 'bg-navy-600'
            )}
          />
        ))}
      </div>

      {/* Steps list */}
      <div className="mt-8 space-y-3">
        {STEPS.slice(0, -1).map((step, index) => {
          const Icon = step.icon
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          
          return (
            <div
              key={step.key}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-all duration-300',
                isActive && 'bg-teal-500/10 border border-teal-500/30',
                isCompleted && 'opacity-50'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  isActive
                    ? 'bg-teal-500/20 text-teal-400'
                    : isCompleted
                    ? 'bg-navy-700 text-teal-500'
                    : 'bg-navy-800 text-navy-500'
                )}
              >
                {isCompleted ? (
                  <CheckCircle size={18} />
                ) : isActive ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  >
                    <Loader2 size={18} />
                  </motion.div>
                ) : (
                  <Icon size={18} />
                )}
              </div>
              <span
                className={cn(
                  'font-medium',
                  isActive ? 'text-white' : 'text-navy-400'
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
