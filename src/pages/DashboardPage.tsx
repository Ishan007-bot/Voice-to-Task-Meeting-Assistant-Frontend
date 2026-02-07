import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Mic, FileAudio, CheckSquare, TrendingUp } from 'lucide-react'
import { meetingsAPI } from '../lib/api'
import { useMeetingStore } from '../stores/meetingStore'
import MeetingCard from '../components/MeetingCard'

export default function DashboardPage() {
  const { meetings, setMeetings, isLoading, setLoading } = useMeetingStore()
  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalTasks: 0,
    completedTasks: 0,
  })

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    setLoading(true)
    try {
      const { data } = await meetingsAPI.list(1, 10)
      setMeetings(data.items)
      
      // Calculate stats
      const totalTasks = data.items.reduce(
        (sum: number, m: any) => sum + (m.task_count || 0),
        0
      )
      setStats({
        totalMeetings: data.total,
        totalTasks,
        completedTasks: Math.floor(totalTasks * 0.6), // Placeholder
      })
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Dashboard
          </h1>
          <p className="text-navy-400 mt-1">
            Manage your meetings and tasks
          </p>
        </div>
        <Link to="/meetings/new" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          New Recording
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <FileAudio className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalMeetings}</p>
              <p className="text-sm text-navy-400">Total Meetings</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalTasks}</p>
              <p className="text-sm text-navy-400">Tasks Extracted</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.totalTasks > 0
                  ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-navy-400">Completion Rate</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Meetings */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Recent Meetings
        </h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-6 bg-navy-700 rounded w-1/3 mb-3" />
                <div className="h-4 bg-navy-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : meetings.length > 0 ? (
          <div className="space-y-4">
            {meetings.map((meeting, index) => (
              <MeetingCard key={meeting.id} meeting={meeting} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-navy-800 flex items-center justify-center mb-4">
              <Mic className="w-8 h-8 text-navy-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No meetings yet
            </h3>
            <p className="text-navy-400 mb-6">
              Record or upload your first meeting to get started
            </p>
            <Link to="/meetings/new" className="btn-primary inline-flex items-center gap-2">
              <Plus size={18} />
              New Recording
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
