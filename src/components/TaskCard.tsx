import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Circle,
  Edit2,
  Trash2,
  ExternalLink,
  User,
  Calendar,
  Flag,
} from 'lucide-react'
import { cn, getPriorityColor } from '../lib/utils'
import { format } from 'date-fns'

interface Task {
  id: string
  title: string
  description?: string
  assignee?: string
  priority: string
  due_date?: string
  status: string
  external_url?: string
  is_duplicate: boolean
}

interface TaskCardProps {
  task: Task
  onUpdate: (id: string, data: Partial<Task>) => void
  onDelete: (id: string) => void
  onApprove: (id: string) => void
  isSelected: boolean
  onSelect: (id: string) => void
}

export default function TaskCard({
  task,
  onUpdate,
  onDelete,
  onApprove,
  isSelected,
  onSelect,
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate(task.id, { title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  const isDraft = task.status === 'draft'
  const isSynced = task.status === 'synced'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'card p-4 transition-all duration-200',
        isSelected && 'ring-2 ring-teal-500/50',
        task.is_duplicate && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onSelect(task.id)}
          className={cn(
            'mt-1 transition-colors',
            isSelected ? 'text-teal-500' : 'text-navy-500 hover:text-navy-300'
          )}
        >
          {isSelected ? <CheckCircle size={20} /> : <Circle size={20} />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title */}
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
              className="input-field text-sm py-1 px-2"
            />
          ) : (
            <h4
              className={cn(
                'font-medium mb-1',
                isSynced ? 'text-navy-300' : 'text-white'
              )}
            >
              {task.title}
              {task.is_duplicate && (
                <span className="ml-2 text-xs text-amber-500">(Duplicate)</span>
              )}
            </h4>
          )}

          {/* Description */}
          {task.description && (
            <p className="text-sm text-navy-400 mb-2 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {task.assignee && task.assignee !== 'Unassigned' && (
              <span className="flex items-center gap-1 text-navy-400">
                <User size={12} />
                {task.assignee}
              </span>
            )}

            {task.due_date && (
              <span className="flex items-center gap-1 text-navy-400">
                <Calendar size={12} />
                {format(new Date(task.due_date), 'MMM d, yyyy')}
              </span>
            )}

            <span className={cn('flex items-center gap-1', getPriorityColor(task.priority))}>
              <Flag size={12} />
              {task.priority}
            </span>

            {isSynced && task.external_url && (
              <a
                href={task.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-teal-400 hover:text-teal-300"
              >
                <ExternalLink size={12} />
                View in {task.external_url.includes('asana') ? 'Asana' : 'Trello'}
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {isDraft && (
            <button
              onClick={() => onApprove(task.id)}
              className="p-2 text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors"
              title="Approve task"
            >
              <CheckCircle size={18} />
            </button>
          )}
          
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-navy-400 hover:text-white hover:bg-navy-700 rounded-lg transition-colors"
            title="Edit task"
          >
            <Edit2 size={16} />
          </button>
          
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-navy-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
