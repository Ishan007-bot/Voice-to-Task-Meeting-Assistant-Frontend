import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Mic,
  CheckSquare,
  Link2,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/meetings/new', icon: Mic, label: 'New Recording' },
  { path: '/tasks', icon: CheckSquare, label: 'All Tasks' },
  { path: '/integrations', icon: Link2, label: 'Integrations' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen mesh-bg">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-navy-800 border border-navy-600"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:translate-x-0',
          'bg-navy-900/80 backdrop-blur-xl border-r border-navy-700/50',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-navy-700/50">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Mic size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-white">Voice to Task</h1>
                <p className="text-xs text-navy-400">Meeting Assistant</p>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NavLink
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                        : 'text-navy-300 hover:bg-navy-800/50 hover:text-white'
                    )
                  }
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </motion.div>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-navy-700/50">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-800/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.full_name}
                </p>
                <p className="text-xs text-navy-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-navy-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:pl-64 min-h-screen">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
