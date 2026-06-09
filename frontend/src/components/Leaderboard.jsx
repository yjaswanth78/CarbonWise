import React, { useState, useEffect } from 'react'
import { Trophy, Award, Users, Star } from 'lucide-react'

export default function Leaderboard({ username, API_BASE }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  // Badge unlock cabinet milestones
  const badgesList = [
    { name: 'Pantry Warden', points: 150, icon: '🛒', desc: 'Scan your first receipt containing organic alternatives.' },
    { name: 'Grid Saver', points: 300, icon: '🔌', desc: 'Complete home phantom load audit checklists.' },
    { name: 'Transit Hero', points: 450, icon: '🚇', desc: 'Opt for metro or bike commutes for 3+ days.' },
    { name: 'Eco Lender', points: 600, icon: '🤝', desc: 'Post items or share tools in the community xchange.' }
  ]

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/leaderboard`)
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
      
      {/* Ranking List */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Trophy size={24} style={{ color: '#fbbf24' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Neighborhood Leaderboard</h3>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading Leaderboard...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {leaderboard.map((user, index) => {
              const isCurrentUser = user.username === username
              const rank = index + 1
              return (
                <div 
                  key={user.id} 
                  className="glass-panel"
                  style={{
                    padding: '0.85rem 1.25rem',
                    background: isCurrentUser ? 'rgba(34,197,94,0.08)' : 'rgba(30,41,59,0.25)',
                    border: isCurrentUser ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transform: isCurrentUser ? 'scale(1.02)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Rank indicator */}
                    <div style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      background: rank === 1 ? '#fbbf24' : rank === 2 ? '#94a3b8' : rank === 3 ? '#b45309' : 'rgba(255,255,255,0.05)',
                      color: rank <= 3 ? '#fff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}>
                      {rank}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {user.username}
                        {isCurrentUser && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(34,197,94,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>You</span>}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Score: {user.eco_points} points</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>-{user.co2_saved} kg</strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CO₂ offset</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Badges Cabinet */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Award size={24} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Badge Cabinet</h3>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Unlock unique badges by earning points! Every 150 points awards you a new level in the leaderboard status.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {badgesList.map((badge, idx) => (
            <div key={idx} className="glass-panel" style={{ 
              padding: '1rem 1.25rem', 
              background: 'rgba(15,23,42,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '2rem', padding: '0.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                {badge.icon}
              </div>
              
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {badge.name}
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                    (Unlock at {badge.points} pts)
                  </span>
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {badge.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
