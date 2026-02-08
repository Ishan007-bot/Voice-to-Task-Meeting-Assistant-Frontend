import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  ListChecks,
  Send,
  CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { meetingsAPI, transcriptsAPI, tasksAPI, integrationsAPI } from '../lib/api'
import { useMeetingStore } from '../stores/meetingStore'
import ProcessingStatus from '../components/ProcessingStatus'
import TranscriptViewer from '../components/TranscriptViewer'
import TaskCard from '../components/TaskCard'

type Tab = 'transcript' | 'tasks'

export default function MeetingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentMeeting, setCurrentMeeting, updateMeeting } = useMeetingStore()
  
  const [activeTab, setActiveTab] = useState<Tab>('tasks')
  const [transcript, setTranscript] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [integrations, setIntegrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchMeeting()
      fetchIntegrations()
    }
  }, [id])

  useEffect(() => {
    // Poll for status updates during processing
    if (
      currentMeeting &&
      ['processing', 'transcribing', 'extracting', 'uploading'].includes(
        currentMeeting.status.toLowerCase()
      )
    ) {
      const interval = setInterval(() => {
        fetchMeetingStatus()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [currentMeeting?.status])

  const fetchMeeting = async () => {
    try {
      const { data } = await meetingsAPI.get(id!)
      setCurrentMeeting(data)
      
      if (data.status === 'completed') {
        fetchTranscript()
        fetchTasks()
      }
    } catch (error) {
      toast.error('Failed to load meeting')
      navigate('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMeetingStatus = async () => {
    try {
      const { data } = await meetingsAPI.getStatus(id!)
      updateMeeting(id!, {
        status: data.status,
        status_message: data.status_message,
        processing_progress: data.progress,
        error_message: data.error_message,
      })
      
      if (data.status === 'completed') {
        fetchTranscript()
        fetchTasks()
      }
    } catch (error) {
      console.error('Status check failed:', error)
    }
  }

  const fetchTranscript = async () => {
    try {
      const { data } = await transcriptsAPI.get(id!)
      setTranscript(data)
    } catch (error) {
      console.error('Failed to fetch transcript:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      const { data } = await tasksAPI.listByMeeting(id!)
      setTasks(data.items)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  const fetchIntegrations = async () => {
    try {
      const { data } = await integrationsAPI.list()
      setIntegrations(data.items.filter((i: any) => i.is_active))
    } catch (error) {
      console.error('Failed to fetch integrations:', error)
    }
  }

  const handleUpdateSpeaker = async (label: string, name: string) => {
    try {
      await transcriptsAPI.updateSpeakers(id!, [{ speaker_label: label, speaker_name: name }])
      fetchTranscript()
      toast.success('Speaker updated')
    } catch (error) {
      toast.error('Failed to update speaker')
    }
  }

  const handleUpdateTask = async (taskId: string, data: any) => {
    try {
      await tasksAPI.update(taskId, data)
      fetchTasks()
      toast.success('Task updated')
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksAPI.delete(taskId)
      setTasks(tasks.filter((t) => t.id !== taskId))
      toast.success('Task deleted')
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const handleApproveTask = async (taskId: string) => {
    try {
      await tasksAPI.update(taskId, { status: 'pending' })
      fetchTasks()
      toast.success('Task approved')
    } catch (error) {
      toast.error('Failed to approve task')
    }
  }

  const handleBulkApprove = async () => {
    if (selectedTasks.size === 0) return
    try {
      await tasksAPI.bulkAction(Array.from(selectedTasks), 'approve')
      setSelectedTasks(new Set())
      fetchTasks()
      toast.success('Tasks approved')
    } catch (error) {
      toast.error('Bulk action failed')
    }
  }

  const handleSyncTasks = async (integrationId: string) => {
    const taskIds = selectedTasks.size > 0
      ? Array.from(selectedTasks)
      : tasks.filter((t) => t.status === 'pending').map((t) => t.id)
    
    if (taskIds.length === 0) {
      toast.error('No tasks to sync')
      return
    }

    try {
      await tasksAPI.sync(taskIds, integrationId)
      toast.success('Tasks queued for sync')
      setSelectedTasks(new Set())
      setTimeout(fetchTasks, 2000)
    } catch (error) {
      toast.error('Sync failed')
    }
  }

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const isProcessing = currentMeeting && ['processing', 'transcribing', 'extracting', 'uploading'].includes(
    currentMeeting.status.toLowerCase()
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!currentMeeting) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 text-navy-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            {currentMeeting.title}
          </h1>
          {currentMeeting.description && (
            <p className="text-navy-400 mt-1">{currentMeeting.description}</p>
          )}
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <ProcessingStatus
          meetingId={currentMeeting.id}
          status={currentMeeting.status}
          message={currentMeeting.status_message}
          progress={currentMeeting.processing_progress}
          onComplete={fetchMeeting}
        />
      )}

      {/* Completed: Show tabs */}
      {currentMeeting.status === 'completed' && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 border-b border-navy-700">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'tasks'
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-navy-400 hover:text-white'
              }`}
            >
              <ListChecks size={18} />
              Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'transcript'
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-navy-400 hover:text-white'
              }`}
            >
              <FileText size={18} />
              Transcript
            </button>
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Task actions */}
                {tasks.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {selectedTasks.size > 0 && (
                      <>
                        <span className="text-sm text-navy-400">
                          {selectedTasks.size} selected
                        </span>
                        <button
                          onClick={handleBulkApprove}
                          className="btn-ghost text-sm flex items-center gap-1"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                      </>
                    )}
                    
                    {integrations.length > 0 && (
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-sm text-navy-400">Sync to:</span>
                        {integrations.map((integration) => (
                          <button
                            key={integration.id}
                            onClick={() => handleSyncTasks(integration.id)}
                            className="btn-secondary text-sm py-2 flex items-center gap-1"
                          >
                            <Send size={14} />
                            {integration.integration_type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tasks list */}
                <div className="space-y-3">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onUpdate={handleUpdateTask}
                        onDelete={handleDeleteTask}
                        onApprove={handleApproveTask}
                        isSelected={selectedTasks.has(task.id)}
                        onSelect={toggleTaskSelection}
                      />
                    ))
                  ) : (
                    <div className="card p-8 text-center">
                      <p className="text-navy-400">
                        No tasks were extracted from this meeting.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'transcript' && (
              <motion.div
                key="transcript"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {transcript ? (
                  <TranscriptViewer
                    segments={transcript.segments}
                    onUpdateSpeaker={handleUpdateSpeaker}
                  />
                ) : (
                  <div className="card p-8 text-center">
                    <p className="text-navy-400">
                      Transcript not available.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Failed status */}
      {currentMeeting.status === 'failed' && (
        <div className="card p-8 text-center border-red-500/30">
          <p className="text-red-400 mb-2">Processing failed</p>
          <p className="text-navy-400 text-sm">
            {currentMeeting.error_message || 'An error occurred during processing.'}
          </p>
        </div>
      )}
    </div>
  )
}
