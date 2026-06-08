import { useEffect, useState, useRef } from 'react'
import StoreLayout from '../components/StoreLayout.jsx'
import { supabase } from '../integrations/supabase/client.js'

function Chat({ isAuthenticated, onNavigate, initialThreadId = null }) {
  const [threads, setThreads] = useState([])
  const [activeThreadId, setActiveThreadId] = useState(initialThreadId)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 1. CEK SESI LOGIN USER
  useEffect(() => {
    async function getUserId() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      } else {
        setLoadingThreads(false)
      }
    }
    getUserId()
  }, [])

  // 2. AMBIL DATA CHAT THREADS
  useEffect(() => {
    async function fetchChatThreads() {
      if (!currentUserId) return
      setLoadingThreads(true)
      try {
        const { data, error } = await supabase
          .from('chat_threads')
          .select(`
            id,
            created_at,
            listings(id, name, location, image_url),
            buyer:profiles!chat_threads_buyer_id_fkey(id, username, full_name, avatar_url),
            seller:profiles!chat_threads_seller_id_fkey(id, username, full_name, avatar_url)
          `)
          .or(`buyer_id.eq.${currentUserId},seller_id.eq.${currentUserId}`)

        if (error) throw error

        if (data) {
          const formattedThreads = data.map(thread => {
            const isBuyer = thread.buyer?.id === currentUserId
            const lawanBicara = isBuyer ? thread.seller : thread.buyer
            
            return {
              id: thread.id,
              name: lawanBicara?.full_name || lawanBicara?.username || 'Pengguna Revivo',
              avatar: lawanBicara?.avatar_url || null,
              location: thread.listings?.location || 'Indonesia',
              preview: `Diskusi gawai: ${thread.listings?.name || 'Elektronik Bekas'}`,
              time: new Date(thread.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            }
          })

          setThreads(formattedThreads)
          if (!activeThreadId && formattedThreads.length > 0) {
            setActiveThreadId(formattedThreads[0].id)
          }
        }
      } catch (err) {
        console.error('Gagal memuat kontak chat:', err.message)
      } finally {
        setLoadingThreads(false)
      }
    }

    fetchChatThreads()
  }, [currentUserId, activeThreadId])

  // 3. LOAD MESSAGE HISTORY & REALTIME CHANNELS
  useEffect(() => {
    if (!activeThreadId || !currentUserId) return

    // Penanganan khusus jika mengaktifkan demo simulasi tanpa database
    if (activeThreadId === 'demo-simulasi-id') {
      setMessages([
        {
          id: 'demo-welcome-1',
          sender_id: 'sistem-bot',
          body: 'Halo! Ini adalah ruang simulasi interaktif REVIVO. Ketik pesan penawaran hargamu di kolom bawah untuk menguji respons sistem siber kami!',
          created_at: new Date().toISOString()
        }
      ])
      return
    }

    async function loadMessageHistory() {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('thread_id', activeThreadId)
          .order('created_at', { ascending: true })

        if (error) throw error
        if (data) setMessages(data)
      } catch (err) {
        console.error('Gagal mengambil histori pesan:', err.message)
      }
    }

    loadMessageHistory()

    const chatChannel = supabase
      .channel(`realtime-room-${activeThreadId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `thread_id=eq.${activeThreadId}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some(msg => msg.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(chatChannel)
    }
  }, [activeThreadId, currentUserId])

  const activeThread = threads.find((thread) => thread.id === activeThreadId) || 
    (activeThreadId === 'demo-simulasi-id' ? { name: 'Pusat Bantuan & Simulasi (Bot)', location: 'Semarang HQ' } : null)

  // 4. FUNGSI KIRIM OBROLAN
  async function sendMessage(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !activeThreadId || !currentUserId) return

    if (activeThreadId === 'demo-simulasi-id') {
      const userMsg = { id: `user-${Date.now()}`, sender_id: currentUserId, body: text, created_at: new Date().toISOString() }
      const replyMsg = { id: `bot-${Date.now() + 1}`, sender_id: 'sistem-bot', body: `[Pesan Terkirim] Jaringan WebSocket Realtime Siap! Anda mengetik: "${text}"`, created_at: new Date().toISOString() }
      
      setMessages((prev) => [...prev, userMsg])
      setDraft('')
      setTimeout(() => setMessages((prev) => [...prev, replyMsg]), 800)
      return
    }

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{ thread_id: activeThreadId, sender_id: currentUserId, body: text }])

      if (error) throw error
      setDraft('')
    } catch (err) {
      alert('Gagal mengirim pesan: ' + err.message)
    }
  }

  // Jembatan pembuat obrolan contoh jika etalase database masih kosong
  function handleActivateDemo() {
    setThreads([
      {
        id: 'demo-simulasi-id',
        name: 'Pusat Bantuan & Simulasi (Bot)',
        preview: 'Uji coba penawaran harga...',
        location: 'Semarang HQ',
        time: 'Now'
      }
    ])
    setActiveThreadId('demo-simulasi-id')
  }

  if (!isAuthenticated) {
    return (
      <StoreLayout isAuthenticated={false} onNavigate={onNavigate} showPromo={false}>
        <div style={{ maxWidth: '450px', margin: '100px auto', padding: '30px', textAlign: 'center', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h2 style={{ color: '#0f172a', fontWeight: '800', marginBottom: '10px' }}>Akses Terkunci 🚫</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>Silakan login ke akun REVIVO kelompokmu terlebih dahulu untuk menggunakan fitur pesan riil antar-user.</p>
          <button type="button" className="button button--orange" onClick={() => onNavigate('login')} style={{ marginTop: '20px', width: '100%', fontWeight: 'bold' }}>
            MASUK SEKARANG
          </button>
        </div>
      </StoreLayout>
    )
  }

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div className="chat-page" style={{ maxWidth: '1200px', margin: '30px auto', display: 'flex', height: 'calc(100vh - 180px)', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        
        {/* PANEL KIRI: DAFTAR KONTAK OBROLAN */}
        <aside className="chat-sidebar" style={{ width: '320px', borderRight: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Obrolan Riil</h1>
          </div>
          
          <div style={{ flex: '1', overflowY: 'auto' }}>
            {loadingThreads ? (
              <p style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>Menyelaraskan server cloud...</p>
            ) : threads.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '15px' }}>Belum ada obrolan terdaftar di cloud database.</p>
                <button type="button" onClick={handleActivateDemo} style={{ background: '#0f172a', color: '#fff', border: '0', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                  💡 Aktifkan Room Simulasi
                </button>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {threads.map((thread) => {
                  const isCurrentActive = thread.id === activeThreadId
                  return (
                    <li key={thread.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <button
                        type="button"
                        onClick={() => setActiveThreadId(thread.id)}
                        style={{ width: '100%', display: 'flex', gap: '12px', padding: '15px', border: '0', background: isCurrentActive ? '#eff6ff' : 'transparent', textAlign: 'left', cursor: 'pointer', transition: 'background 0.2s' }}
                      >
                        <span style={{ width: '42px', height: '42px', borderRadius: '50%', background: isCurrentActive ? '#3b82f6' : '#94a3b8', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', flexShrink: 0 }}>
                          {thread.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div style={{ flex: '1', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <strong style={{ color: '#1e293b', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{thread.name}</strong>
                            <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{thread.time}</small>
                          </div>
                          <span style={{ color: '#64748b', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{thread.preview}</span>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* PANEL KANAN: JENDELA UTAMA PESAN PERCAKAPAN */}
        <section className="chat-panel" style={{ flex: '1', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
          {activeThread ? (
            <>
              {/* Header Kepala Pesan */}
              <header className="chat-panel__header" style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', background: '#ffffff' }}>
                <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ff7f00', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {activeThread.name.slice(0, 1).toUpperCase()}
                </span>
                <div style={{ marginLeft: '12px' }}>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>{activeThread.name}</h2>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '2px 0 0 0' }}>📍 {activeThread.location} • <span style={{ color: '#10b981', fontWeight: '600' }}>Live Connected</span></p>
                </div>
              </header>

              {/* Area Aliran Pesan Masuk (Bubble Area) */}
              <div className="chat-messages" style={{ flex: '1', padding: '20px', overflowY: 'auto', background: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map((message) => {
                  const isMe = message.sender_id === currentUserId
                  return (
                    <div
                      key={message.id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        background: isMe ? '#ff7f00' : '#ffffff',
                        color: isMe ? '#ffffff' : '#1e293b',
                        padding: '10px 14px',
                        borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4', wordBreak: 'break-word' }}>{message.body}</p>
                      <small style={{ alignSelf: 'flex-end', fontSize: '0.7rem', color: isMe ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>
                        {new Date(message.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Form Baris Pengiriman Pesan */}
              <form onSubmit={sendMessage} style={{ padding: '15px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', background: '#ffffff' }}>
                <input
                  type="text"
                  placeholder="Ketik tawaran negosiasi hargamu secara bebas disini..."
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  style={{ flex: '1', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#ff7f00'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
                <button
                  type="submit"
                  style={{ background: '#ff7f00', color: '#ffffff', border: '0', padding: '0 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#e06f00'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#ff7f00'}
                >
                  KIRIM
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', padding: '20px' }}>
              <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>Silakan pilih atau buat percakapan terlebih dahulu.</p>
            </div>
          )}
        </section>
      </div>
    </StoreLayout>
  )
}

export default Chat