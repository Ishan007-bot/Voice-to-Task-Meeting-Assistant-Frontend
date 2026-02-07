import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mic, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../lib/api'
import { useAuthStore } from '../stores/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: tokens } = await authAPI.login(email, password)
      
      // Set tokens first
      useAuthStore.getState().setTokens(tokens.access_token, tokens.refresh_token)
      
      // Get user info
      const { data: user } = await authAPI.getMe()
      
      login(user, tokens.access_token, tokens.refresh_token)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30 mb-4"
          >
            <Mic size={32} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-display font-bold text-white">
            Welcome Back
          </h1>
          <p className="text-navy-400 mt-1">
            Sign in to your Voice to Task account
          </p>
        </div>

        {/* Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field pl-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pl-12"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-navy-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-teal-400 hover:text-teal-300 font-medium"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials hint */}
        <p className="text-center text-navy-500 text-sm mt-6">
          First time? Register a new account to get started.
        </p>
      </motion.div>
    </div>
  )
}
