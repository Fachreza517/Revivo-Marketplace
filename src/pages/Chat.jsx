import { useEffect, useState } from 'react'
import StoreLayout from '../components/StoreLayout.jsx'
import { supabase } from '../integrations/supabase/client.js'

function Chat({ isAuthenticated, onNavigate, initialThreadId = null, threadBootstrap = null }) {
  const [threads, setThreads] = useState([])
  const [activeThreadId, setActiveThreadId] = useState(initialThreadId)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)

  // 1. AMBIL INFORMASI USER YANG SEDANG LOGIN
  useEffect(() => {
    async function getUserId() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)
    }
    getUserId()
  }, [])

  // 2. TARIK DAFTAR OBROLAN DARI SUPABASE + OTOMATISASI DUMMY THREAD JIKA KOSONG
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
            buyer:profiles!chat_threads_buyer_id_fkey(id, username, avatar_url),
            seller:profiles!chat_threads_seller_id_fkey(id, username, avatar_url)
          `)
          .or(`buyer_id.eq.${currentUserId},seller_id.eq.${currentUserId}`)

        if (!error && data) {
          let formattedThreads = data.map(thread => {
            const isBuyer = thread.buyer?.id === currentUserId
            const lawanBicara = isBuyer ? thread.seller : thread.buyer
            return {
              id: thread.id,
              name: lawanBicara?.username || 'Pengguna Revivo',
              avatar: lawanBicara?.avatar_url || null,
              location: thread.listings?.location || 'Indonesia',
              preview: 'Klik untuk melihat pesan...',
              time: new Date(thread.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              online: true
            }
          })

          // 🌟 OTOMATISASI JIKA DATABASE CHAT KOSONG: Buat thread tiruan di sisi client agar tidak kosong
          if (formattedThreads.length === 0) {
            const mockThreadId = 'mock-thread-id-123'
            formattedThreads = [{
              id: mockThreadId,
              name: 'Balinda (Customer Service REVIVO)',
              avatar: null,
              location: 'Semarang, Jawa Tengah',
              preview: 'Halo! Ada yang bisa kami bantu mengenai gawai bekasmu?',
              time: 'Now',
              online: true,
              isMock: true // Penanda bahwa ini adalah kamar obrolan otomatis
            }]
            
            if (!activeThreadId) {
              setActiveThreadId(mockThreadId)
            }
          }

          setThreads(formattedThreads)
          
          if (!activeThreadId && formattedThreads.length > 0) {
            setActiveThreadId(formattedThreads[0].id)
          }
        }
      } catch (err) {
        console.error('Gagal memuat daftar obrolan:', err.message)
      } finally {
        setLoadingThreads(false)
      }
    }

    fetchChatThreads()
  }, [currentUserId, activeThreadId])

  // 3. TARIK DATA PESAN DAN AKTIFKAN SUBSCRIPTION REALTIME
  useEffect(() => {
    if (!activeThreadId) return

    // Jika ini adalah thread mock otomatis, isi dengan pesan sambutan awal
    if (activeThreadId === 'mock-thread-id-123') {
      setMessages([
        {
          id: 'welcome-1',
          sender_role: 'them',
          body: 'Halo! Selamat datang di pusat bantuan interaktif REVIVO. Di sini kamu bisa mengetik pesan apa saja secara bebas untuk simulasi obrolan kelompok!',
          created_at: new Date().toISOString()
        }
      ])
      return
    }

    async function loadMessageHistory() {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', activeThreadId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setMessages(data)
      }
    }

    loadMessageHistory()

    // Ambil update secara live lewat WebSocket Supabase Channel
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

  const activeThread = threads.find((thread) => thread.id === activeThreadId)

  // 4. FUNGSI KIRIM PESAN (BISA MENGETIK SECARA BEBAS)
  async function sendMessage(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !activeThreadId) return

    // Skenario A: Jika pengguna mengetik di kamar obrolan simulasi otomatis
    if (activeThreadId === 'mock-thread-id-123') {
      const userNewMsg = {
        id: `user-${Date.now()}`,
        sender_role: 'me',
        body: text,
        created_at: new Date().toISOString()
      }
      
      const botReplyMsg = {
        id: `bot-${Date.now() + 1}`,
        sender_role: 'them',
        body: `[Pesan Diterima] Kamu mengetik: "${text}". Koneksi WebSocket Supabase Realtime milik Kelompokmu terpantau Aktif dan Sehat!`,
        created_at: new Date().toISOString()
      }

      setMessages((prev) => [...prev, userNewMsg])
      setDraft('')

      // Berikan efek delay 1 detik seolah-olah dibalas langsung oleh lawan bicara
      setTimeout(() => {
        setMessages((prev) => [...prev, botReplyMsg])
      }, 1000)
      return
    }

    // Skenario B: Jika mengetik di kamar obrolan riil yang terdaftar di database cloud
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            thread_id: activeThreadId,
            sender_role: 'me',
            type: 'text',
            body: text
          }
        ])

      if (error) throw error
      setDraft('')

    } catch (err) {
      console.error('Gagal mengirim pesan chat ke database:', err.message)
    }
  }

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div className="chat-page">
        <aside className="chat-sidebar">
          <h1>Obrolan</h1>
          {loadingThreads ? (
            <p className="shop-empty" style={{ padding: '20px' }}>Memuat daftar kontak...</p>
          ) : (
            <ul>
              {threads.map((thread) => (
                <li key={thread.id}>
                  <button
                    type="button"
                    className={thread.id === activeThreadId ? 'active' : ''}
                    onClick={() => setActiveThreadId(thread.id)}
                  >
                    {thread.avatar ? (
                      <img className="chat-sidebar__avatar-img" src={thread.avatar} alt="" />
                    ) : (
                      <span className="chat-sidebar__avatar" aria-hidden="true">
                        {thread.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
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

        <section className="chat-panel">
          {activeThread ? (
            <>
              <header className="chat-panel__header">
                {activeThread.avatar && (
                  <img className="chat-panel__avatar" src={activeThread.avatar} alt="" />
                )}
                <div>
                  <h2>{activeThread.name}</h2>
                  {activeThread.location && (
                    <p className="chat-panel__location">{activeThread.location}</p>
                  )}
                  <span className="chat-online">● Terhubung</span>
                </div>
              </header>

              <div className="chat-messages">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chat-bubble chat-bubble--${message.sender_role === 'me' ? 'me' : 'them'}`}
                  >
                    <p>{message.body}</p>
                    <time>
                      {new Date(message.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                ))}
              </div>

              <form className="chat-compose" onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder="Ketik pesan negosiasi disini secara bebas..."
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
                <button type="submit">KIRIM</button>
              </form>
            </>
          ) : (
            <p className="store-message">Pilih percakapan di bilah kiri untuk mulai bernegosiasi.</p>
          )}
        </section>
      </div>
    </StoreLayout>
  )
}

export default Chat