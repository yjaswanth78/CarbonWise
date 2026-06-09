import React, { useState } from 'react'
import { Calendar, MapPin, Zap, RefreshCw, CheckCircle } from 'lucide-react'

export default function LifeSync({ username, refreshProfile, API_BASE }) {
  const [synced, setSynced] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [loggedTransit, setLoggedTransit] = useState(false)

  // Mock Calendar Events
  const events = [
    { time: '09:00 AM - 11:30 AM', title: 'Interactive Media Class', location: 'University Engineering Block' },
    { time: '01:00 PM - 02:00 PM', title: 'Lunch with Project Team', location: 'Down Town Food Hub' },
    { time: '04:30 PM - 06:00 PM', title: 'Gym Workout Session', location: 'Active Life Fitness Center' }
  ]

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      setSynced(true)
    }, 1500)
  }

  const logTransitAction = async () => {
    try {
      const res = await fetch(`${API_BASE}/quests/complete?username=${username}&quest_id=1`, {
        method: 'POST'
      })
      if (res.ok) {
        setLoggedTransit(true)
        refreshProfile()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Life-Sync Calendar Routing</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Automate transit tracking by syncing your daily schedule</p>
        </div>

        <button 
          onClick={handleSync} 
          disabled={syncing}
          className="btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--primary)' }}
        >
          {syncing ? (
            <>
              <RefreshCw size={16} className="animate-spin-slow" /> Syncing...
            </>
          ) : synced ? (
            'Calendar Connected'
          ) : (
            <>
              <Calendar size={16} /> Sync My Calendar
            </>
          )}
        </button>
      </div>

      {!synced ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'rgba(15,23,42,0.3)',
          borderRadius: '12px',
          border: '1px dashed var(--border-glass)'
        }}>
          <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>No Calendar Synced</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto 1.5rem' }}>
            Sync your Google Calendar or Outlook schedule to allow CarbonWise AI to suggest eco-friendly commute plans.
          </p>
          <button onClick={handleSync} className="btn-primary">Connect Now</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          
          {/* Calendar List */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary)' }}>Today's Scheduled Commutes</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {events.map((ev, i) => (
                <div key={i} className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(30,41,59,0.3)', borderLeft: '4px solid var(--secondary)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold' }}>{ev.time}</span>
                  <h5 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0.25rem 0' }}>{ev.title}</h5>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    <MapPin size={12} /> {ev.location}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Commute Route Optimizer */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'radial-gradient(circle at 100% 100%, rgba(6,182,212,0.1) 0%, rgba(15,23,42,0) 80%)', alignSelf: 'start' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem', color: 'var(--secondary)' }}>
              <Zap size={18} />
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold' }}>AI Commute Optimization</h4>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Based on your schedule, you have a <strong>15 km</strong> total round trip today.
            </p>

            <div style={{
              background: 'rgba(30,41,59,0.5)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Driving a car:</span>
                <span style={{ color: '#ef4444' }}>+2.7 kg CO₂</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold' }}>
                <span style={{ color: 'var(--primary)' }}>Metro Transit alternative:</span>
                <span style={{ color: 'var(--primary)' }}>0.4 kg CO₂</span>
              </div>
              <div style={{ 
                marginTop: '0.75rem', 
                paddingTop: '0.75rem', 
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem'
              }}>
                <span>Savings Potential:</span>
                <strong style={{ color: 'var(--secondary)' }}>5.4 kg CO₂ saved</strong>
              </div>
            </div>

            {loggedTransit ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '0.5rem', 
                background: 'rgba(34,197,94,0.1)', 
                color: 'var(--primary)',
                padding: '1rem',
                borderRadius: '8px',
                fontWeight: 'bold'
              }}>
                <CheckCircle size={18} /> Commute Logged: +50 Eco Points!
              </div>
            ) : (
              <button onClick={logTransitAction} className="btn-primary" style={{ width: '100%' }}>
                Log Metro/Bike Commute Today
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
