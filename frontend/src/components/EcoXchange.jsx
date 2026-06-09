import React, { useState, useEffect } from 'react'
import { PlusCircle, Search, HelpCircle, ArrowRightLeft, Leaf, Users, CheckCircle } from 'lucide-react'

export default function EcoXchange({ username, refreshProfile, API_BASE }) {
  const [items, setItems] = useState([])
  const [showPostModal, setShowPostModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [borrowSuccess, setBorrowSuccess] = useState('')

  // Post form state
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCat, setNewCat] = useState('Tools')
  const [newAvoidedCO2, setNewAvoidedCO2] = useState(15.0)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/xchange`)
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleBorrow = async (itemId) => {
    setBorrowSuccess('')
    try {
      const res = await fetch(`${API_BASE}/xchange/borrow?username=${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId })
      })

      if (res.ok) {
        setBorrowSuccess('Item Borrowed! Points & Carbon savings updated!')
        fetchItems()
        refreshProfile()
        setTimeout(() => setBorrowSuccess(''), 4000)
      } else {
        const data = await res.json()
        alert(data.detail || 'Failed to borrow')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handlePost = async (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newDesc.trim()) return

    try {
      const res = await fetch(`${API_BASE}/xchange/post?username=${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          category: newCat,
          co2_avoided: parseFloat(newAvoidedCO2)
        })
      })

      if (res.ok) {
        setShowPostModal(false)
        setNewTitle('')
        setNewDesc('')
        fetchItems()
        refreshProfile()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      
      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Eco-Xchange (Borrow, Don't Buy)</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Reduce manufacturing emissions by borrowing low-use appliances and tools from your neighbors.</p>
        </div>

        <button 
          onClick={() => setShowPostModal(true)} 
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <PlusCircle size={18} /> Post an Item
        </button>
      </div>

      {borrowSuccess && (
        <div style={{
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.2)',
          color: 'var(--primary)',
          padding: '0.85rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={18} /> {borrowSuccess}
        </div>
      )}

      {/* Search and Filters Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search tools, tents, appliance name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Sharing Grid */}
      {filteredItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'rgba(15,23,42,0.3)',
          borderRadius: '12px',
          border: '1px dashed var(--border-glass)'
        }}>
          <ArrowRightLeft size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>No Items Listed</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '320px', margin: '0 auto' }}>
            Be the first to list a household item (e.g. vacuum cleaner, ladder, camping tent) for neighbors to borrow.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="glass-panel" 
              style={{ 
                padding: '1.5rem', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                background: 'rgba(30,41,59,0.25)',
                border: item.is_available ? '1px solid var(--border-glass)' : '1px solid rgba(255,255,255,0.03)',
                opacity: item.is_available ? 1 : 0.6
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(6,182,212,0.1)', color: 'var(--secondary)', padding: '0.25rem 0.6rem', borderRadius: '20px', fontWeight: 'bold' }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Lender: {item.owner_username}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.5rem' }}>{item.title}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1.25rem' }}>
                  {item.description}
                </p>
              </div>

              <div>
                {/* Avoided Carbon Tag */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  fontSize: '0.8rem', 
                  color: 'var(--primary)',
                  marginBottom: '1rem',
                  background: 'rgba(34,197,94,0.06)',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px'
                }}>
                  <Leaf size={14} />
                  <span>Saves <strong>{item.co2_avoided} kg CO₂</strong> manufacturing debt</span>
                </div>

                {item.is_available ? (
                  item.owner_username === username ? (
                    <button className="btn-secondary" style={{ width: '100%', opacity: 0.5, cursor: 'default' }} disabled>
                      Your Listed Item
                    </button>
                  ) : (
                    <button onClick={() => handleBorrow(item.id)} className="btn-primary" style={{ width: '100%' }}>
                      Request to Borrow
                    </button>
                  )
                ) : (
                  <button className="btn-secondary" style={{ width: '100%', color: 'var(--text-muted)', cursor: 'not-allowed' }} disabled>
                    Borrowed by {item.borrower_username}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal Overlay */}
      {showPostModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Post Sharing Item</h3>
            
            <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Item Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Black & Decker Drill, Camping Tent" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Short Description</label>
                <textarea 
                  placeholder="Mention availability, tool conditions, or contact info..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ width: '100%', minHeight: '80px', resize: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Category</label>
                  <select 
                    value={newCat} 
                    onChange={(e) => setNewCat(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Tools">Tools & Hardware</option>
                    <option value="Outdoor">Outdoor / Camping</option>
                    <option value="Kitchen">Kitchen Appliances</option>
                    <option value="Cleaning">Cleaning & Utility</option>
                    <option value="Books">Books & Media</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Production Offset</label>
                  <select 
                    value={newAvoidedCO2} 
                    onChange={(e) => setNewAvoidedCO2(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value={10.0}>Small Item (~10 kg)</option>
                    <option value={25.0}>Medium Tool (~25 kg)</option>
                    <option value={50.0}>Large Device (~50 kg)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowPostModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1.5 }}>
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
