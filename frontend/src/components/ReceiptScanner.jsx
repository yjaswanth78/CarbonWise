import React, { useState } from 'react'
import { Camera, FileText, Check, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react'

export default function ReceiptScanner({ username, refreshProfile, API_BASE }) {
  const [file, setFile] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [swappedItems, setSwappedItems] = useState({})

  // Presets for easy demonstration
  const presets = [
    { name: 'Weekly Groceries Bill', file: 'grocery_bill.jpg' },
    { name: 'Weekend Fast Food Trip', file: 'fast_food.jpg' }
  ]

  const handlePresetScan = async (preset) => {
    setScanning(true)
    setScanResult(null)
    setSwappedItems({})

    // Create a dummy image file blob to submit
    const blob = new Blob(['mock_content'], { type: 'image/jpeg' })
    const mockFile = new File([blob], preset.file)

    const formData = new FormData()
    formData.append('username', username)
    formData.append('file', mockFile)

    // Wait 2.5 seconds for visual scanning effects
    setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/receipts/scan`, {
          method: 'POST',
          body: formData
        })
        if (res.ok) {
          const data = await res.json()
          setScanResult(data.receipt)
          refreshProfile()
        }
      } catch (err) {
        console.error(err)
      } finally {
        setScanning(false)
      }
    }, 2500)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUploadScan = async (e) => {
    e.preventDefault()
    if (!file) return

    setScanning(true)
    setScanResult(null)
    setSwappedItems({})

    const formData = new FormData()
    formData.append('username', username)
    formData.append('file', file)

    setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/receipts/scan`, {
          method: 'POST',
          body: formData
        })
        if (res.ok) {
          const data = await res.json()
          setScanResult(data.receipt)
          refreshProfile()
        }
      } catch (err) {
        console.error(err)
      } finally {
        setScanning(false)
      }
    }, 2500)
  }

  const toggleSwap = (itemIndex, co2Diff) => {
    setSwappedItems(prev => ({
      ...prev,
      [itemIndex]: !prev[itemIndex]
    }))
    // Optional: We can make an API request to add extra co2 saved when they click swap.
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Receipt Scanner (Smart Pantry)</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Upload a grocery receipt to automatically extract high-carbon items and find eco alternatives</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', gap: '2rem' }}>
        
        {/* Upload Interface */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(30,41,59,0.2)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Instant Scan Presets</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetScan(p)}
                  disabled={scanning}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} style={{ color: 'var(--secondary)' }} />
                    {p.name}
                  </span>
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleUploadScan} className="glass-panel" style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            border: '2px dashed var(--border-glass)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            background: 'rgba(15,23,42,0.3)'
          }}>
            <Camera size={36} style={{ color: 'var(--text-muted)' }} />
            <div>
              <h5 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Upload Receipt Image</h5>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports PNG, JPG up to 5MB</p>
            </div>
            
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              id="file-upload" 
            />
            <label htmlFor="file-upload" className="btn-secondary" style={{ cursor: 'pointer', padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
              {file ? file.name : 'Choose File'}
            </label>

            {file && (
              <button type="submit" disabled={scanning} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Scan Selected File
              </button>
            )}
          </form>

        </div>

        {/* Scan Results & Scanning Animation */}
        <div style={{ minHeight: '340px', display: 'flex' }}>
          
          {scanning && (
            <div className="glass-panel animate-glow" style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '2rem',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid var(--secondary)'
            }}>
              {/* Scanning neon laser effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, transparent, var(--secondary), transparent)',
                boxShadow: '0 0 15px var(--secondary)',
                animation: 'float 2.5s ease-in-out infinite'
              }} />

              <Camera size={48} className="gradient-text" style={{ stroke: '#06b6d4', marginBottom: '1rem' }} />
              <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>AI OCR OCR Extracting...</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Scanning items & mapping carbon footprint...</p>
            </div>
          )}

          {!scanning && !scanResult && (
            <div className="glass-panel" style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <FileText size={48} style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>No Scans Active</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
                Select a preset or upload your own receipt to see the live AI analysis.
              </p>
            </div>
          )}

          {!scanning && scanResult && (
            <div className="glass-panel animate-slide-up" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{scanResult.store_name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carbon footprint breakdown</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ef4444' }}>{scanResult.total_co2} kg</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CO₂ generated</span>
                </div>
              </div>

              {/* Items List */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', paddingRight: '0.25rem' }}>
                {scanResult.items.map((item, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(15,23,42,0.4)',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                      <span style={{ color: item.is_eco ? 'var(--primary)' : '#ef4444', fontWeight: 'bold' }}>
                        {item.co2} kg CO₂
                      </span>
                    </div>

                    {!item.is_eco && (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        fontSize: '0.78rem',
                        background: 'rgba(6,182,212,0.08)',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '6px',
                        color: 'var(--secondary)',
                        border: '1px solid rgba(6,182,212,0.15)'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ShieldCheck size={12} /> Swap: {item.alternative} ({item.alt_co2} kg)
                        </span>
                        
                        <button 
                          onClick={() => toggleSwap(idx, item.co2 - item.alt_co2)}
                          className={swappedItems[idx] ? 'btn-primary' : 'btn-secondary'}
                          style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.7rem',
                            borderRadius: '4px',
                            background: swappedItems[idx] ? 'var(--primary)' : 'rgba(255,255,255,0.05)'
                          }}
                        >
                          {swappedItems[idx] ? 'Swapped!' : 'Adopt Swap'}
                        </button>
                      </div>
                    )}

                    {item.is_eco && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--primary)' }}>
                        <Check size={12} /> CarbonWise Eco-Approved product. Good job!
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Total footprint savings summary */}
              {Object.keys(swappedItems).length > 0 && (
                <div style={{ 
                  background: 'rgba(34,197,94,0.1)', 
                  border: '1px solid rgba(34,197,94,0.2)', 
                  padding: '0.75rem', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--primary)'
                }}>
                  <ShieldCheck size={16} /> 
                  Saved commitment: <strong>{(Object.keys(swappedItems).length * 1.5).toFixed(1)} kg CO₂</strong> saved on next purchase!
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  )
}
