import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare } from 'lucide-react'
import { tasksAPI } from '../lib/api'
import TaskCard from '../components/TaskCard'
import toast from 'react-hot-toast'

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setIsLoading(true)
    try {
      const { data } = await tasksAPI.listAll(1, 100)
      setTasks(data.items)
    } catch (error) {
      toast.error('Failed to load tasks')
    } finally {
      setIsLoading(false)
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

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const statusCounts = {
    all: tasks.length,
    draft: tasks.filter((t) => t.status === 'draft').length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    synced: tasks.filter((t) => t.status === 'synced').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white">
          All Tasks
        </h1>
        <p className="text-navy-400 mt-1">
          Manage tasks extracted from all your meetings
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'draft', label: 'Draft' },
          { key: 'pending', label: 'Pending' },
          { key: 'synced', label: 'Synced' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'bg-navy-800 text-navy-300 border border-navy-700 hover:border-navy-600'
            }`}
          >
            {f.label}
            <span className="ml-2 text-xs opacity-70">
              ({statusCounts[f.key as keyof typeof statusCounts]})
            </span>
          </button>
        ))}
      </div>

      {/* Tasks list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-5 bg-navy-700 rounded w-1/2 mb-3" />
              <div className="h-4 bg-navy-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              onApprove={handleApproveTask}
              isSelected={selectedTasks.has(task.id)}
              onSelect={toggleTaskSelection}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-12 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-navy-800 flex items-center justify-center mb-4">
            <CheckSquare className="w-8 h-8 text-navy-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No tasks found
          </h3>
          <p className="text-navy-400">
            {filter !== 'all'
              ? 'Try changing the filter to see more tasks.'
              : 'Tasks will appear here after processing meetings.'}
          </p>
        </motion.div>
      )}
    </div>
  )
}
