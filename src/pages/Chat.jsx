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

  // Otomatis gulir chat ke baris paling bawah saat ada pesan baru masuk
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 1. CEK SESI LOGIN USER AKTIF
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

  // 2. TARIK DAFTAR KONTAK OBROLAN (THREADS) SECARA RIIL DARI SUPABASE
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
            // Deteksi apakah user login bertindak sebagai pembeli atau penjual di dalam kamar chat ini
            const isBuyer = thread.buyer?.id === currentUserId
            const lawanBicara = isBuyer ? thread.seller : thread.buyer
            
            return {
              id: thread.id,
              name: lawanBicara?.full_name || lawanBicara?.username || 'Pengguna Revivo',
              avatar: lawanBicara?.avatar_url || null,
              location: thread.listings?.location || 'Indonesia',
              preview: `Diskusi produk: ${thread.listings?.name || 'Gawai'}`,
              time: new Date(thread.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            }
          })

          setThreads(formattedThreads)
          
          // Set kontak pertama sebagai kontak aktif jika belum ada yang dipilih
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

  // 3. AMBIL HISTORI PESAN & AKTIFKAN LIVE WEBSOCKET SUBSCRIPTION
  useEffect(() => {
    if (!activeThreadId || !currentUserId) return

    // Fungsi mengambil riwayat obrolan terdahulu
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

    // 🌟 KUNCI UTAMA REALTIME: Dengarkan tabel chat_messages menggunakan WebSocket secara live
    const chatChannel = supabase
      .channel(`realtime-room-${activeThreadId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages', 
          filter: `thread_id=eq.${activeThreadId}` 
        },
        (payload) => {
          // Masukkan pesan baru yang ditangkap dari cloud secara live ke dalam state array screen
          setMessages((prev) => {
            // Hindari duplikasi render jika id pesan sudah ada di layar
            if (prev.some(msg => msg.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    // Bersihkan jalur koneksi WebSocket saat komponen ditutup/pindah halaman
    return () => {
      supabase.removeChannel(chatChannel)
    }
  }, [activeThreadId, currentUserId])

  const activeThread = threads.find((thread) => thread.id === activeThreadId)

  // 4. FUNGSI KIRIM PESAN RIIL KE SERVER CLOUD SUPABASE
  async function sendMessage(event) {
    event.preventDefault()
    const text = draft.trim()
    
    if (!text || !activeThreadId || !currentUserId) return

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            thread_id: activeThreadId,
            sender_id: currentUserId,
            body: text
          }
        ])

      if (error) throw error
      setDraft('') // Kosongkan kolom input teks setelah sukses terkirim
    } catch (err) {
      alert('Gagal mengirim pesan siber: ' + err.message)
    }
  }

  // Pengaman jika user mengakses halaman obrolan tapi belum login sama sekali
  if (!isAuthenticated) {
    return (
      <StoreLayout isAuthenticated={false} onNavigate={onNavigate} showPromo={false}>
        <div className="store-message" style={{ margin: '80px auto', textAlign: 'center' }}>
          <h2>Akses Ditolak 🚫</h2>
          <p>Silakan masuk ke akun REVIVO Anda terlebih dahulu untuk memulai obrolan riil antar-user.</p>
          <button type="button" className="button button--orange" onClick={() => onNavigate('login')} style={{ marginTop: '15px' }}>
            MASUK SEKARANG
          </button>
        </div>
      </StoreLayout>
    )
  }

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div className="chat-page">
        
        {/* SIDEBAR DAFTAR KONTAK */}
        <aside className="chat-sidebar">
          <h1>Obrolan Riil</h1>
          {loadingThreads ? (
            <p className="shop-empty" style={{ padding: '20px' }}>Menyelaraskan kontak server...</p>
          ) : threads.length === 0 ? (
            <p className="shop-empty" style={{ padding: '20px', fontSize: '0.9rem', color: '#718096' }}>
              Belum ada riwayat pesan. Klik tombol "Hubungi Penjual" di halaman Detail Produk untuk memulai obrolan baru!
            </p>
          ) : (
            <ul>
              {threads.map((thread) => (
                <li key={thread.id}>
                  <button
                    type="button"
                    className={thread.id === activeThreadId ? 'active' : ''}
                    onClick={() => setActiveThreadId(thread.id)}
                  >
                    <span className="chat-sidebar__avatar" aria-hidden="true">
                      {thread.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="chat-sidebar__meta">
                      <strong>{thread.name}</strong>
                      <span>{thread.preview}</span>
                      <small>{thread.time}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* PANEL UTAMA PESAN CHAT */}
        <section className="chat-panel">
          {activeThread ? (
            <>
              <header className="chat-panel__header">
                <span className="chat-sidebar__avatar" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                  {activeThread.name.slice(0, 1).toUpperCase()}
                </span>
                <div style={{ marginLeft: '12px' }}>
                  <h2>{activeThread.name}</h2>
                  <p className="chat-panel__location" style={{ margin: '2px 0' }}>📍 {activeThread.location}</p>
                  <span className="chat-online" style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 'bold' }}>● Realtime Connected</span>
                </div>
              </header>

              <div className="chat-messages" style={{ flex: '1', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.map((message) => {
                  // Bandingkan sender_id pesan dengan id user login untuk menentukan posisi bubble
                  const isMe = message.sender_id === currentUserId
                  return (
                    <div
                      key={message.id}
                      className={`chat-bubble chat-bubble--${isMe ? 'me' : 'them'}`}
                    >
                      <p>{message.body}</p>
                      <time>
                        {new Date(message.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-compose" onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder="Ketik pesan negosiasi riil disini..."
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
                <button type="submit">KIRIM</button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#718096' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>Silakan pilih salah satu percakapan di bilah kiri.</p>
            </div>
          )}
        </section>

      </div>
    </StoreLayout>
  )
}

export default Chat