import React, { useState, useEffect } from 'react'
import { 
  Home, 
  Calendar, 
  Camera, 
  Lightbulb, 
  Share2, 
  Trophy, 
  User as UserIcon, 
  Leaf, 
  Sparkles,
  Zap,
  TrendingDown,
  ChevronRight,
  LogOut
} from 'lucide-react'

// Subcomponents (we will create these next)
import Dashboard from './components/Dashboard'
import LifeSync from './components/LifeSync'
import ReceiptScanner from './components/ReceiptScanner'
import HomeAudit from './components/HomeAudit'
import EcoXchange from './components/EcoXchange'
import Leaderboard from './components/Leaderboard'

const API_BASE = '/api'

export default function App() {
  const [username, setUsername] = useState(localStorage.getItem('carbonwise_user') || '')
  const [userProfile, setUserProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [authInput, setAuthInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [syncStatus, setSyncStatus] = useState('Synced')

  // Onboarding Form State
  const [onboardIndex, setOnboardIndex] = useState(0)
  const [onboardData, setOnboardData] = useState({
    transport_mode: 'car',
    weekly_commute_km: 120,
    flights_per_year: 2,
    diet_type: 'balanced',
    recycle_frequency: 'sometimes',
    electricity_bill: 150
  })

  useEffect(() => {
    if (username) {
      fetchProfile()
    }
  }, [username])

  const fetchProfile = async () => {
    try {
      setSyncStatus('Syncing...')
      const res = await fetch(`${API_BASE}/auth/profile/${username}`)
      if (res.ok) {
        const data = await res.json()
        setUserProfile(data)
        // If they have default debt and points are 0, they might need onboarding
        if (data.co2_debt === 8500.0 && data.eco_points === 0) {
          setShowOnboarding(true)
        }
        setSyncStatus('Synced')
      } else {
        // Clear session if user not found in backend (e.g. database reset)
        handleLogout()
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setSyncStatus('Offline')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!authInput.trim()) return

    try {
      const res = await fetch(`${API_BASE}/auth/profile/${authInput.trim()}`)
      if (res.ok) {
        const data = await res.json()
        setUsername(data.username)
        localStorage.setItem('carbonwise_user', data.username)
      } else {
        // Toggle registration input
        setIsRegistering(true)
        setEmailInput('')
        setErrorMsg('Username not found. Enter email to sign up!')
      }
    } catch (err) {
      setErrorMsg('Cannot connect to backend server. Make sure it is running!')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!authInput.trim() || !emailInput.trim()) return

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authInput.trim(), email: emailInput.trim() })
      })

      if (res.ok) {
        const data = await res.json()
        setUsername(data.username)
        localStorage.setItem('carbonwise_user', data.username)
        setShowOnboarding(true)
      } else {
        const errData = await res.json()
        setErrorMsg(errData.detail || 'Registration failed')
      }
    } catch (err) {
      setErrorMsg('Server connection failed.')
    }
  }

  const handleLogout = () => {
    setUsername('')
    setUserProfile(null)
    localStorage.removeItem('carbonwise_user')
    setIsRegistering(false)
    setAuthInput('')
  }

  const submitOnboarding = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/onboard/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardData)
      })
      if (res.ok) {
        const data = await res.json()
        setUserProfile(data)
        setShowOnboarding(false)
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (!username || !userProfile) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem'
      }}>
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(34,197,94,0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
            <Leaf size={48} className="gradient-text" style={{ stroke: '#22c55e' }} />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>CarbonWise</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>AI-Powered Carbon Footprint Tracker</p>
          
          {errorMsg && (
            <div style={{ 
              background: 'rgba(239,68,68,0.1)', 
              border: '1px solid rgba(239,68,68,0.2)', 
              color: '#ef4444', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              {errorMsg}
            </div>
          )}

          {!isRegistering ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Username</label>
                <input 
                  type="text" 
                  placeholder="e.g. greencommuter10"
                  value={authInput}
                  onChange={(e) => setAuthInput(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                Sign In / Join
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Confirm Username</label>
                <input 
                  type="text" 
                  value={authInput} 
                  disabled
                  style={{ width: '100%', opacity: 0.6 }}
                />
              </div>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                <input 
                  type="email" 
                  placeholder="you@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsRegistering(false)} style={{ flex: 1 }}>
                  Back
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  Create Account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  }

  // --- ONBOARDING SLIDES MODAL ---
  if (showOnboarding) {
    const slides = [
      {
        title: 'Daily Commute',
        element: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>How do you primarily commute to school, college, or work?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {['car', 'metro', 'bike', 'walk'].map((m) => (
                <button 
                  key={m} 
                  type="button" 
                  className={onboardData.transport_mode === m ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => setOnboardData({...onboardData, transport_mode: m})}
                  style={{ padding: '1rem', textTransform: 'capitalize' }}
                >
                  {m}
                </button>
              ))}
            </div>
            {onboardData.transport_mode !== 'walk' && onboardData.transport_mode !== 'bike' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Approximate weekly distance: <strong>{onboardData.weekly_commute_km} km</strong>
                </label>
                <input 
                  type="range" 
                  min="5" 
                  max="500" 
                  value={onboardData.weekly_commute_km}
                  onChange={(e) => setOnboardData({...onboardData, weekly_commute_km: parseInt(e.target.value)})}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>
            )}
          </div>
        )
      },
      {
        title: 'Diet & Lifestyle',
        element: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Choose the description that best fits your diet:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { key: 'vegan', label: 'Vegan (Strict plant-based)' },
                { key: 'vegetarian', label: 'Vegetarian (No meat/fish, dairy included)' },
                { key: 'balanced', label: 'Balanced (Mix of meat, veggies, and grains)' },
                { key: 'meat_heavy', label: 'Meat-Heavy (Eat meat almost every meal)' }
              ].map((d) => (
                <button 
                  key={d.key} 
                  type="button" 
                  className={onboardData.diet_type === d.key ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => setOnboardData({...onboardData, diet_type: d.key})}
                  style={{ padding: '0.85rem', textAlign: 'left' }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )
      },
      {
        title: 'Flights & Energy',
        element: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                How many flights do you take in a year? (Round-trips)
              </label>
              <select 
                value={onboardData.flights_per_year}
                onChange={(e) => setOnboardData({...onboardData, flights_per_year: parseInt(e.target.value)})}
                style={{ width: '100%' }}
              >
                <option value={0}>0 flights (Keep it grounded!)</option>
                <option value={1}>1 - 2 flights</option>
                <option value={4}>3 - 5 flights</option>
                <option value={8}>More than 5 flights</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Average monthly electricity bill: <strong>${onboardData.electricity_bill}</strong>
              </label>
              <input 
                type="range" 
                min="10" 
                max="500" 
                value={onboardData.electricity_bill}
                onChange={(e) => setOnboardData({...onboardData, electricity_bill: parseInt(e.target.value)})}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Do you recycle plastics, paper, and glass?
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['always', 'sometimes', 'never'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={onboardData.recycle_frequency === r ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setOnboardData({...onboardData, recycle_frequency: r})}
                    style={{ flex: 1, padding: '0.75rem', textTransform: 'capitalize' }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      }
    ]

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', padding: '1.5rem' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Onboarding: Slide {onboardIndex + 1} of {slides.length}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Carbon Diagnostics</span>
          </div>
          
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem' }}>{slides[onboardIndex].title}</h2>
          
          <div style={{ minHeight: '260px' }}>
            {slides[onboardIndex].element}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
            {onboardIndex > 0 ? (
              <button className="btn-secondary" onClick={() => setOnboardIndex(onboardIndex - 1)}>
                Back
              </button>
            ) : <div />}

            {onboardIndex < slides.length - 1 ? (
              <button className="btn-primary" onClick={() => setOnboardIndex(onboardIndex + 1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button className="btn-primary" onClick={submitOnboarding} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Calculate My Footprint <Sparkles size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // --- MAIN APP PANEL LAYOUT ---
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* Sidebar Navigation */}
      <nav className="glass-panel" style={{
        width: '240px',
        margin: '1rem',
        marginRight: '0.5rem',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <Leaf style={{ color: 'var(--primary)', strokeWidth: 2.5 }} size={28} />
            <span style={{ fontSize: '1.35rem', fontWeight: '800' }} className="gradient-text">CarbonWise</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'dashboard', label: 'Ecosystem', icon: Home },
              { id: 'lifesync', label: 'Life-Sync', icon: Calendar },
              { id: 'scanner', label: 'Receipt Scanner', icon: Camera },
              { id: 'audit', label: 'Home Audit', icon: Lightbulb },
              { id: 'xchange', label: 'Eco-Xchange', icon: Share2 },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
            ].map((t) => {
              const Icon = t.icon
              const isSelected = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    border: 'none',
                    borderRadius: '10px',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(34,197,94,0.12)' : 'transparent',
                    color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isSelected ? '600' : '400'
                  }}
                >
                  <Icon size={18} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '0.8rem', 
            color: 'var(--text-muted)',
            padding: '0.5rem 0',
            borderTop: '1px solid var(--border-glass)',
            marginBottom: '0.75rem'
          }}>
            <span>System:</span>
            <span style={{ color: syncStatus === 'Synced' ? 'var(--primary)' : 'var(--warning)', fontWeight: 'bold' }}>
              {syncStatus}
            </span>
          </div>

          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.75rem',
              border: 'none',
              background: 'rgba(239,68,68,0.08)',
              color: '#ef4444',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', overflowY: 'auto', maxHeight: '100vh' }}>
        
        {/* Header Bar */}
        <header className="glass-panel" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          borderRadius: '16px',
          marginBottom: '1rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Hello, {userProfile.username}!</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Welcome back to your EcoSphere</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {Array.from({ length: userProfile.badge_count || 0 }).map((_, i) => (
                <div 
                  key={i} 
                  title={`Tier ${i + 1} Badge`}
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 8px rgba(251,191,36,0.5)',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    color: '#fff'
                  }}
                >
                  🏅
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(34,197,94,0.1)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
              <Zap size={16} style={{ fill: '#22c55e', color: '#22c55e' }} />
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{userProfile.eco_points} pts</span>
            </div>
          </div>
        </header>

        {/* Dynamic Panels */}
        <main className="animate-slide-up" style={{ flex: 1 }}>
          {activeTab === 'dashboard' && (
            <Dashboard userProfile={userProfile} refreshProfile={fetchProfile} API_BASE={API_BASE} />
          )}
          {activeTab === 'lifesync' && (
            <LifeSync username={username} refreshProfile={fetchProfile} API_BASE={API_BASE} />
          )}
          {activeTab === 'scanner' && (
            <ReceiptScanner username={username} refreshProfile={fetchProfile} API_BASE={API_BASE} />
          )}
          {activeTab === 'audit' && (
            <HomeAudit username={username} refreshProfile={fetchProfile} API_BASE={API_BASE} />
          )}
          {activeTab === 'xchange' && (
            <EcoXchange username={username} refreshProfile={fetchProfile} API_BASE={API_BASE} />
          )}
          {activeTab === 'leaderboard' && (
            <Leaderboard username={username} API_BASE={API_BASE} />
          )}
        </main>
      </div>

    </div>
  )
}
