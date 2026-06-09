import React, { useState } from 'react'
import { Tv, Smartphone, Microwave, Monitor, CheckCircle, Info } from 'lucide-react'

export default function HomeAudit({ username, refreshProfile, API_BASE }) {
  const [selectedRoom, setSelectedRoom] = useState('living')
  const [completed, setCompleted] = useState(false)
  
  // Appliance states
  const [appliances, setAppliances] = useState({
    // Living Room
    tv_standby: false,
    phone_chargers: false,
    game_console: false,
    // Kitchen
    microwave_clock: false,
    toaster_unplug: false,
    blender_unplug: false
  })

  const handleToggle = (key) => {
    setAppliances(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Calculate carbon & watt savings based on toggled items
  // Estimates: TV standby = 10W, chargers = 5W, console = 15W, microwave = 6W, toaster = 2W
  const savingsMap = {
    tv_standby: { watts: 10, co2: 0.15, label: 'TV Standby Power' },
    phone_chargers: { watts: 5, co2: 0.08, label: 'Unused Phone Chargers' },
    game_console: { watts: 15, co2: 0.22, label: 'Console Rest Mode' },
    microwave_clock: { watts: 6, co2: 0.09, label: 'Microwave Clock Standby' },
    toaster_unplug: { watts: 2, co2: 0.03, label: 'Toaster Plugged' },
    blender_unplug: { watts: 3, co2: 0.05, label: 'Blender Clock' }
  }

  const roomAppliances = {
    living: ['tv_standby', 'phone_chargers', 'game_console'],
    kitchen: ['microwave_clock', 'toaster_unplug', 'blender_unplug']
  }

  const activeKeys = roomAppliances[selectedRoom]
  
  // Calculate totals
  let totalWatts = 0
  let totalCO2 = 0.0
  Object.keys(appliances).forEach(key => {
    if (appliances[key]) {
      totalWatts += savingsMap[key].watts
      totalCO2 += savingsMap[key].co2
    }
  })

  const submitAudit = async () => {
    if (totalCO2 === 0) return

    try {
      const res = await fetch(`${API_BASE}/quests/complete?username=${username}&quest_id=2`, {
        method: 'POST'
      })
      if (res.ok) {
        setCompleted(true)
        refreshProfile()
        // Reset checklist
        setAppliances({
          tv_standby: false,
          phone_chargers: false,
          game_console: false,
          microwave_clock: false,
          toaster_unplug: false,
          blender_unplug: false
        })
        setTimeout(() => setCompleted(false), 4000)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Home Audit (Phantom Power)</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Phantom loads are devices consuming electricity even when turned off. Unplug them to save carbon and lower your electric bills.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        
        {/* Interactive room view */}
        <div>
          {/* Room toggler tab bar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button 
              className={selectedRoom === 'living' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setSelectedRoom('living')}
              style={{ flex: 1, padding: '0.65rem' }}
            >
              Living Room Audit
            </button>
            <button 
              className={selectedRoom === 'kitchen' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setSelectedRoom('kitchen')}
              style={{ flex: 1, padding: '0.65rem' }}
            >
              Kitchen Audit
            </button>
          </div>

          <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--secondary)' }}>
            Identify standby consumers in the {selectedRoom === 'living' ? 'Living Room' : 'Kitchen'}:
          </h4>

          {/* Checklist items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeKeys.map((key) => {
              const item = savingsMap[key]
              const isChecked = appliances[key]
              return (
                <div 
                  key={key} 
                  onClick={() => handleToggle(key)}
                  className="glass-panel" 
                  style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                    background: isChecked ? 'rgba(34,197,94,0.08)' : 'rgba(15,23,42,0.3)',
                    border: isChecked ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      color: isChecked ? 'var(--primary)' : 'var(--text-muted)',
                      background: isChecked ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                      padding: '0.5rem',
                      borderRadius: '6px'
                    }}>
                      {key.includes('tv') ? <Tv size={20} /> : 
                       key.includes('charger') ? <Smartphone size={20} /> :
                       key.includes('console') ? <Monitor size={20} /> : <Microwave size={20} />}
                    </div>
                    <div>
                      <h5 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{item.label}</h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Savings: {item.watts}W (~{item.co2}kg CO₂/day)</span>
                    </div>
                  </div>

                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: '2px solid var(--border-glass)',
                    background: isChecked ? 'var(--primary)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}>
                    {isChecked && <CheckCircle size={14} style={{ strokeWidth: 3 }} />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Audit calculator widget */}
        <div className="glass-panel" style={{ 
          padding: '2rem', 
          background: 'radial-gradient(circle at 0% 0%, rgba(34,197,94,0.08) 0%, rgba(15,23,42,0.4) 100%)',
          alignSelf: 'start',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Phantom Load Calculator</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Unplugging selected devices recovers wasted standby energy instantly.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(30,41,59,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Wasted Watts Cut:</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--secondary)' }}>{totalWatts} W</div>
            </div>
            <div style={{ background: 'rgba(30,41,59,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CO₂ Savings / day:</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>{totalCO2.toFixed(2)} kg</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px' }}>
            <Info size={16} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
            <span>Leaving phone chargers plugged in without a phone connected wastes standby current 24/7.</span>
          </div>

          {completed ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: 'rgba(34,197,94,0.1)',
              color: 'var(--primary)',
              padding: '1rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              <CheckCircle size={18} /> Phantom Load Saved! +30 Eco Points!
            </div>
          ) : (
            <button 
              onClick={submitAudit} 
              disabled={totalCO2 === 0}
              className="btn-primary" 
              style={{ width: '100%', opacity: totalCO2 === 0 ? 0.5 : 1 }}
            >
              Log Unplugged Devices
            </button>
          )}

        </div>

      </div>
    </div>
  )
}
