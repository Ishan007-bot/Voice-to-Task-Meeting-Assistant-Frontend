import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Link2,
  Plus,
  Check,
  X,
  ExternalLink,
  Trash2,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { integrationsAPI } from '../lib/api'
import { cn } from '../lib/utils'

const INTEGRATION_TYPES = [
  {
    type: 'asana',
    name: 'Asana',
    description: 'Sync tasks to your Asana projects',
    color: 'from-rose-500 to-rose-600',
    icon: '📋',
  },
  {
    type: 'trello',
    name: 'Trello',
    description: 'Create cards in your Trello boards',
    color: 'from-blue-500 to-blue-600',
    icon: '📌',
  },
]

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    setIsLoading(true)
    try {
      const { data } = await integrationsAPI.list()
      setIntegrations(data.items)
    } catch (error) {
      toast.error('Failed to load integrations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddIntegration = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)

    try {
      await integrationsAPI.create({
        integration_type: selectedType,
        api_key: apiKey || undefined,
        access_token: accessToken || undefined,
      })
      
      toast.success('Integration added!')
      setShowAddModal(false)
      setSelectedType('')
      setApiKey('')
      setAccessToken('')
      fetchIntegrations()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add integration')
    } finally {
      setIsAdding(false)
    }
  }

  const handleTestConnection = async (id: string) => {
    setTestingId(id)
    try {
      const { data } = await integrationsAPI.test(id)
      if (data.success) {
        toast.success('Connection successful!')
      } else {
        toast.error(data.message || 'Connection failed')
      }
    } catch (error) {
      toast.error('Connection test failed')
    } finally {
      setTestingId(null)
    }
  }

  const handleDeleteIntegration = async (id: string) => {
    if (!confirm('Are you sure you want to remove this integration?')) return

    try {
      await integrationsAPI.delete(id)
      setIntegrations(integrations.filter((i) => i.id !== id))
      toast.success('Integration removed')
    } catch (error) {
      toast.error('Failed to remove integration')
    }
  }

  const getIntegrationConfig = (type: string) => {
    return INTEGRATION_TYPES.find((t) => t.type === type)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Integrations
          </h1>
          <p className="text-navy-400 mt-1">
            Connect your project management tools
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Integration
        </button>
      </div>

      {/* Integrations list */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-6 bg-navy-700 rounded w-1/3 mb-3" />
              <div className="h-4 bg-navy-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : integrations.length > 0 ? (
        <div className="grid gap-4">
          {integrations.map((integration, index) => {
            const config = getIntegrationConfig(integration.integration_type)
            
            return (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl',
                        config?.color || 'from-navy-600 to-navy-700'
                      )}
                    >
                      {config?.icon || '🔗'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        {config?.name || integration.integration_type}
                        {integration.is_active ? (
                          <span className="status-completed">Active</span>
                        ) : (
                          <span className="status-pending">Inactive</span>
                        )}
                      </h3>
                      <p className="text-sm text-navy-400 mt-1">
                        {integration.workspace_name || config?.description}
                      </p>
                      {integration.last_error && (
                        <p className="text-sm text-red-400 mt-1">
                          Error: {integration.last_error}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestConnection(integration.id)}
                      disabled={testingId === integration.id}
                      className="btn-ghost text-sm flex items-center gap-1"
                    >
                      {testingId === integration.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <RefreshCw size={16} />
                      )}
                      Test
                    </button>
                    <button
                      onClick={() => handleDeleteIntegration(integration.id)}
                      className="p-2 text-navy-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-12 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-navy-800 flex items-center justify-center mb-4">
            <Link2 className="w-8 h-8 text-navy-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No integrations yet
          </h3>
          <p className="text-navy-400 mb-6">
            Connect Asana, Trello, or Jira to sync your tasks
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Add Integration
          </button>
        </motion.div>
      )}

      {/* Available integrations */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Available Integrations
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {INTEGRATION_TYPES.map((type) => {
            const isConnected = integrations.some(
              (i) => i.integration_type === type.type
            )
            
            return (
              <div
                key={type.type}
                className={cn(
                  'card p-5 transition-all',
                  isConnected
                    ? 'opacity-60'
                    : 'hover:border-teal-500/30 cursor-pointer'
                )}
                onClick={() => {
                  if (!isConnected) {
                    setSelectedType(type.type)
                    setShowAddModal(true)
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-xl',
                      type.color
                    )}
                  >
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{type.name}</h4>
                    <p className="text-sm text-navy-400">{type.description}</p>
                  </div>
                  {isConnected && (
                    <Check className="w-5 h-5 text-teal-500" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative card p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Add Integration
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-navy-400 hover:text-white rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddIntegration} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-300 mb-2">
                  Integration Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  required
                  className="input-field"
                >
                  <option value="">Select type...</option>
                  {INTEGRATION_TYPES.map((type) => (
                    <option key={type.type} value={type.type}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedType === 'trello' && (
                <div>
                  <label className="block text-sm font-medium text-navy-300 mb-2">
                    API Key
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Your Trello API key"
                    className="input-field"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-navy-300 mb-2">
                  {selectedType === 'asana' ? 'Personal Access Token' : 'Access Token'}
                </label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Your access token"
                  required
                  className="input-field"
                />
                <p className="text-xs text-navy-500 mt-1">
                  {selectedType === 'asana' && (
                    <a
                      href="https://app.asana.com/0/my-apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:underline inline-flex items-center gap-1"
                    >
                      Get your Asana token <ExternalLink size={12} />
                    </a>
                  )}
                  {selectedType === 'trello' && (
                    <a
                      href="https://trello.com/power-ups/admin"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:underline inline-flex items-center gap-1"
                    >
                      Get your Trello credentials <ExternalLink size={12} />
                    </a>
                  )}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {isAdding ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Plus size={18} />
                      Add
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
