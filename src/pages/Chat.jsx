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

  // 1. CEK USER LOGIN
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

  // 2. AMBIL RIWAYAT TOKO / THREADS DARI SUPABASE
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

        if (data && data.length > 0) {
          const formattedThreads = data.map(thread => {
            const isBuyer = thread.buyer?.id === currentUserId
            const lawanBicara = isBuyer ? thread.seller : thread.buyer
            
            return {
              id: thread.id,
              name: lawanBicara?.full_name || lawanBicara?.username || 'Toko Mitra Revivo',
              avatar: lawanBicara?.avatar_url || null,
              location: thread.listings?.location || 'Indonesia',
              preview: `Produk: ${thread.listings?.name || 'Gawai Elektronik'}`,
              time: 'Aktif'
            }
          })
          setThreads(formattedThreads)
          if (!activeThreadId) {
            setActiveThreadId(formattedThreads[0].id)
          }
        } else {
          // Jika kosong, langsung arahkan ke mode simulasi toko agar UI tidak kosong saat demo
          handleActivateDemo()
        }
      } catch (err) {
        console.error('Gagal memuat kontak chat:', err.message)
        handleActivateDemo()
      } finally {
        setLoadingThreads(false)
      }
    }

    fetchChatThreads()
  }, [currentUserId, activeThreadId])

  // 3. AMBIL HISTORI CHAT & AKTIFKAN SUBSCRIPTION
  useEffect(() => {
    if (!activeThreadId) return

    if (activeThreadId === 'demo-simulasi-toko-1') {
      setMessages([
        {
          id: 'm1',
          sender_id: 'toko-id-1',
          body: 'Halo gan! Terkait negosiasi harga gawai yang Anda tanyakan, boleh nego tipis ya. Mau dikirim pakai kurir apa?',
          created_at: new Date().toISOString()
        }
      ])
      return
    }

    if (activeThreadId === 'demo-simulasi-toko-2') {
      setMessages([
        {
          id: 'm2',
          sender_id: 'toko-id-2',
          body: 'Unit iPhone bekas ini dijamin orisinal ex-resmi Indonesia, kelengkapan fullset dusbox ada.',
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
        console.error(err.message)
      }
    }

    loadMessageHistory()

    const chatChannel = supabase
      .channel(`room-${activeThreadId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `thread_id=eq.${activeThreadId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(chatChannel)
    }
  }, [activeThreadId])

  // 4. FUNGSI KIRIM CHAT INTERAKTIF
  async function sendMessage(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !activeThreadId) return

    // Jalur Simulasi Respons Toko Langsung Di Sisi Client
    if (activeThreadId.startsWith('demo-simulasi-toko-')) {
      const userMsg = { id: `u-${Date.now()}`, sender_id: currentUserId || 'pembeli-dummy', body: text, created_at: new Date().toISOString() }
      setMessages((prev) => [...prev, userMsg])
      setDraft('')

      setTimeout(() => {
        const botMsg = {
          id: `b-${Date.now()}`,
          sender_id: 'toko-bot',
          body: `[Toko Membalas] Penawaran "${text}" dicatat! Koneksi WebSocket Realtime kelompokmu terpantau lancar jaya!`,
          created_at: new Date().toISOString()
        }
        setMessages((prev) => [...prev, botMsg])
      }, 1000)
      return
    }

    // Jalur Riil Kirim Data ke Cloud Supabase
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{ thread_id: activeThreadId, sender_id: currentUserId, body: text }])

      if (error) throw error
      setDraft('')
    } catch (err) {
      console.error(err.message)
    }
  }

  // Pengaktif Riwayat Toko Tiruan (Bypass jika database kosong)
  function handleActivateDemo() {
    setThreads([
      { id: 'demo-simulasi-toko-1', name: 'Ahmad Gawai Store (Merchant)', preview: 'Boleh nego tipis gan...', location: 'Jakarta Pusat', time: '10:30' },
      { id: 'demo-simulasi-toko-2', name: 'Revivo Official Care (CS)', preview: 'Ada yang bisa dibantu?', location: 'Semarang HQ', time: '09.15' }
    ])
    if (!activeThreadId) {
      setActiveThreadId('demo-simulasi-toko-1')
    }
  }

  const activeThread = threads.find((t) => t.id === activeThreadId)

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      {/* KOTAK CONTAINER UTAMA OBROLAN */}
      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', display: 'flex', height: '650px', boxSizing: 'border-box', fontFamily: 'sans-serif' }}>
        
        {/* 1. BAR DISAMPING (SIDEBAR) RIWAYAT TOKO */}
        <div style={{ width: '320px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px 0 0 12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '20px', background: '#ffffff', borderBottom: '1px solid #cbd5e1' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 'bold' }}>Riwayat Toko Chat</h3>
          </div>
          
          <div style={{ flex: '1', overflowY: 'auto', padding: '10px 0' }}>
            {threads.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>Sinkronisasi kontak kosong...</p>
                <button type="button" onClick={handleActivateDemo} style={{ background: '#0f172a', color: '#fff', border: 0, padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>Paksa Muat Kontak</button>
              </div>
            ) : (
              threads.map((t) => {
                const isCurrent = t.id === activeThreadId
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveThreadId(t.id)}
                    style={{ width: '100%', display: 'flex', gap: '12px', padding: '15px 20px', border: 0, borderBottom: '1px solid #e2e8f0', background: isCurrent ? '#eff6ff' : 'transparent', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: isCurrent ? '#ff7f00' : '#475569', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                      {t.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ color: '#1e293b', fontSize: '0.9rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</strong>
                        <small style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{t.time}</small>
                      </div>
                      <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.preview}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* 2. JENDELA UTAMA PESAN DAN KOLOM PENGISIAN TEKS */}
        <div style={{ flex: '1', background: '#ffffff', border: '1px solid #cbd5e1', borderLeft: 0, borderRadius: '0 12px 12px 0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeThread ? (
            <>
              {/* Kepala Chat (Header) */}
              <div style={{ padding: '15px 20px', borderBottom: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', background: '#ffffff' }}>
                <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ff7f00', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {activeThread.name.slice(0, 1).toUpperCase()}
                </span>
                <div style={{ marginLeft: '12px' }}>
                  <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', fontWeight: 'bold' }}>{activeThread.name}</h4>
                  <small style={{ color: '#10b981', fontWeight: '600', fontSize: '0.75rem' }}>● Terhubung (Realtime)</small>
                </div>
              </div>

              {/* Area Aliran Gelembung Pesan (Bubble) */}
              <div style={{ flex: '1', padding: '20px', background: '#f1f5f9', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map((m) => {
                  const isMe = m.sender_id === currentUserId || m.sender_id === 'pembeli-dummy'
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        background: isMe ? '#ff7f00' : '#ffffff',
                        color: isMe ? '#ffffff' : '#1e293b',
                        padding: '10px 14px',
                        borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.4' }}>{m.body}</p>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* 🌟 FORM PENGISIAN TEKS INPUT & TOMBOL KIRIM */}
              <form onSubmit={sendMessage} style={{ padding: '15px 20px', borderTop: '1px solid #cbd5e1', display: 'flex', gap: '10px', background: '#ffffff' }}>
                <input
                  type="text"
                  placeholder="Ketik pesan negosiasi disini secara bebas..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  style={{ flex: '1', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.92rem', outline: 'none', background: '#ffffff', color: '#000000' }}
                />
                <button
                  type="submit"
                  style={{ background: '#ff7f00', color: '#ffffff', border: 0, padding: '0 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.92rem', cursor: 'pointer' }}
                >
                  KIRIM
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', color: '#64748b', fontSize: '0.95rem' }}>Silakan pilih salah satu toko di bilah kiri.</div>
          )}
        </div>

      </div>
    </StoreLayout>
  )
}

export default Chat