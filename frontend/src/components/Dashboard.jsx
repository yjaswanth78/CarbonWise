import React, { useEffect, useRef } from 'react'
import { Leaf, TrendingDown, ShieldAlert, Award } from 'lucide-react'

export default function Dashboard({ userProfile, refreshProfile, API_BASE }) {
  const canvasRef = useRef(null)
  
  // Calculate health score (0 to 100)
  // Let's assume saving 200kg of CO2 represents reaching a fully healthy EcoSphere
  const targetSavingsForMaxHealth = 200.0
  const healthPercent = Math.min(100, Math.round((userProfile.co2_saved / targetSavingsForMaxHealth) * 100))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let frame = 0

    // Canvas drawing function
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      // 1. Draw Background Sky based on Health
      let skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      if (healthPercent > 70) {
        // Pristine Blue Sky
        skyGradient.addColorStop(0, '#1e293b')
        skyGradient.addColorStop(0.5, '#0f172a')
        skyGradient.addColorStop(1, '#020617')
      } else if (healthPercent >= 35) {
        // Hazy yellow-gray sky
        skyGradient.addColorStop(0, '#2d2e3d')
        skyGradient.addColorStop(0.5, '#181b2a')
        skyGradient.addColorStop(1, '#090a15')
      } else {
        // Polluted Gray Sky
        skyGradient.addColorStop(0, '#3f3f46')
        skyGradient.addColorStop(0.5, '#18181b')
        skyGradient.addColorStop(1, '#09090b')
      }
      ctx.fillStyle = skyGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 2. Draw Floating Island base (isometric style polygon)
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2 + 50
      const islandW = 160
      const islandH = 50

      // Island float animation offsets
      const floatY = Math.sin(frame * 0.04) * 8

      // Draw floating island dirt base
      ctx.beginPath()
      ctx.moveTo(centerX - islandW, centerY + floatY)
      ctx.lineTo(centerX, centerY + islandH + floatY)
      ctx.lineTo(centerX + islandW, centerY + floatY)
      ctx.lineTo(centerX, centerY - islandH + floatY)
      ctx.closePath()

      // Dirt color based on health
      if (healthPercent > 70) {
        ctx.fillStyle = '#451a03' // Healthy deep brown
      } else if (healthPercent >= 35) {
        ctx.fillStyle = '#78350f' // Moderate dirt
      } else {
        ctx.fillStyle = '#27272a' // Gray/polluted barren dirt
      }
      ctx.fill()
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.stroke()

      // Draw Top Grass Layer
      ctx.beginPath()
      ctx.moveTo(centerX - islandW, centerY + floatY)
      ctx.lineTo(centerX, centerY + floatY + 5)
      ctx.lineTo(centerX, centerY + islandH/2 + floatY)
      ctx.lineTo(centerX + islandW, centerY + floatY)
      ctx.lineTo(centerX, centerY - islandH/2 + floatY)
      ctx.closePath()
      
      // Grass Color based on health
      if (healthPercent > 70) {
        ctx.fillStyle = '#22c55e' // Vibrant Green
      } else if (healthPercent >= 35) {
        ctx.fillStyle = '#84cc16' // Yellow-Green
      } else {
        ctx.fillStyle = '#52525b' // Withered Charcoal Gray
      }
      ctx.fill()

      // 3. Draw a Tree on the Island
      const treeX = centerX
      const treeY = centerY - 10 + floatY
      const treeHeight = 70

      // Trunk
      ctx.beginPath()
      ctx.moveTo(treeX - 6, treeY)
      ctx.lineTo(treeX - 4, treeY - treeHeight)
      ctx.lineTo(treeX + 4, treeY - treeHeight)
      ctx.lineTo(treeX + 6, treeY)
      ctx.closePath()
      ctx.fillStyle = healthPercent > 35 ? '#713f12' : '#3f3f46'
      ctx.fill()

      // Leaves (layered circles)
      if (healthPercent > 70) {
        // Blooming Green Canopy
        ctx.beginPath()
        ctx.arc(treeX, treeY - treeHeight - 15, 30, 0, Math.PI * 2)
        ctx.arc(treeX - 20, treeY - treeHeight, 20, 0, Math.PI * 2)
        ctx.arc(treeX + 20, treeY - treeHeight, 20, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(34, 197, 94, 0.95)'
        ctx.fill()
        
        // Add dynamic leaves falling
        for (let i = 0; i < 3; i++) {
          let leafOffset = (frame + i * 80) % 250
          let leafX = treeX - 30 + (leafOffset * 0.3) % 60
          let leafY = treeY - treeHeight + leafOffset * 0.5
          if (leafY < centerY + 30) {
            ctx.beginPath()
            ctx.ellipse(leafX, leafY, 3, 5, Math.PI/4, 0, Math.PI * 2)
            ctx.fillStyle = '#4ade80'
            ctx.fill()
          }
        }

        // Draw Sun/Glow in sky
        let sunGlow = ctx.createRadialGradient(50, 50, 0, 50, 50, 80)
        sunGlow.addColorStop(0, 'rgba(253, 224, 71, 0.4)')
        sunGlow.addColorStop(1, 'rgba(253, 224, 71, 0)')
        ctx.fillStyle = sunGlow
        ctx.beginPath()
        ctx.arc(50, 50, 80, 0, Math.PI*2)
        ctx.fill()

      } else if (healthPercent >= 35) {
        // Average Sparse Canopy
        ctx.beginPath()
        ctx.arc(treeX, treeY - treeHeight - 10, 22, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(132, 204, 22, 0.85)'
        ctx.fill()
      } else {
        // Barren leafless twigs
        ctx.beginPath()
        ctx.moveTo(treeX, treeY - treeHeight)
        ctx.lineTo(treeX - 15, treeY - treeHeight - 15)
        ctx.moveTo(treeX, treeY - treeHeight + 15)
        ctx.lineTo(treeX + 15, treeY - treeHeight - 5)
        ctx.strokeStyle = '#52525b'
        ctx.lineWidth = 3
        ctx.stroke()

        // Draw Smog Overlay (floating dark gray smoke particles)
        ctx.fillStyle = 'rgba(24, 24, 27, 0.3)'
        for (let i = 0; i < 5; i++) {
          let smogX = (frame * 0.5 + i * 90) % canvas.width
          let smogY = 60 + Math.sin(frame * 0.02 + i) * 15
          ctx.beginPath()
          ctx.arc(smogX, smogY, 35 + (i % 2) * 10, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animationFrameId)
  }, [healthPercent])

  // Calculation for Carbon Debt Clock
  // Carbon Footprint starts ticking down as they save more
  const netFootprint = Math.max(0, userProfile.co2_debt - userProfile.co2_saved)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
      
      {/* Visual Live Ecosystem Card */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Your EcoSphere</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ecosystem Health Level</p>
          </div>
          <div style={{ 
            background: healthPercent > 70 ? 'rgba(34,197,94,0.1)' : healthPercent > 35 ? 'rgba(249,115,22,0.1)' : 'rgba(239,68,68,0.1)', 
            padding: '0.4rem 1rem', 
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: healthPercent > 70 ? 'var(--primary)' : healthPercent > 35 ? 'var(--warning)' : '#ef4444'
          }}>
            {healthPercent > 70 ? 'Pristine' : healthPercent > 35 ? 'Stressed' : 'Critically Polluted'}
          </div>
        </div>

        {/* Live Canvas Element */}
        <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-glass)' }}>
          <canvas 
            ref={canvasRef} 
            width={380} 
            height={280} 
            style={{ width: '100%', height: '100%', display: 'block' }} 
          />
          
          {/* Health indicator overlay */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            background: 'rgba(15,23,42,0.8)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-glass)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <span>Ecosystem Health</span>
              <span>{healthPercent}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${healthPercent}%`, 
                background: healthPercent > 70 ? 'var(--primary)' : healthPercent > 35 ? 'var(--warning)' : '#ef4444',
                boxShadow: '0 0 8px rgba(34,197,94,0.5)'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Carbon Debt Clock & Stats Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        
        {/* Carbon Debt Clock Widget */}
        <div className="glass-panel animate-glow" style={{ 
          padding: '2rem', 
          background: 'radial-gradient(circle at 100% 0%, rgba(34,197,94,0.15) 0%, rgba(15,23,42,0.7) 80%)',
          border: '1px solid rgba(34, 197, 94, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <TrendingDown size={22} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Carbon Debt Payback
            </span>
          </div>

          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Net Active Footprint</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'monospace' }}>
              {netFootprint.toLocaleString()}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>kg CO₂ / yr</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Each eco-friendly deed pays off this debt. Reduce it below {Math.round(userProfile.co2_debt * 0.7)} kg to level up your sphere!
          </p>
        </div>

        {/* Dynamic Metrics grids */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'inline-flex', padding: '0.5rem', background: 'rgba(34,197,94,0.1)', borderRadius: '8px', marginBottom: '0.75rem' }}>
              <Leaf size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Saved</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: '800' }}>{userProfile.co2_saved} kg</p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'inline-flex', padding: '0.5rem', background: 'rgba(168,85,247,0.1)', borderRadius: '8px', marginBottom: '0.75rem' }}>
              <Award size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Active Badges</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: '800' }}>{userProfile.badge_count} Earned</p>
          </div>

        </div>

        {/* Eco AI Recommendation Box */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ display: 'inline-flex', padding: '0.5rem', background: 'rgba(6,182,212,0.1)', borderRadius: '8px', color: 'var(--secondary)' }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>AI Diagnostics Assistant</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {healthPercent < 35 
                ? "Your EcoSphere is showing sign of high carbon toxicity. Go to 'Life-Sync' or 'Home Audit' to perform quick carbon-reduction actions."
                : healthPercent < 70 
                ? "Great progress. Your EcoSphere is recovering! Swapping red meat for plant-based choices or using community Eco-Xchange items will push your sphere into 'Pristine' status."
                : "Incredible! Your virtual ecosystem is thriving. You are currently setting a fantastic model for low-carbon living. Share items on Eco-Xchange to help others."
              }
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}
