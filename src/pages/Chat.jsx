import { useEffect, useState, useRef } from 'react'
import StoreLayout from '../components/StoreLayout.jsx'
import { supabase } from '../integrations/supabase/client.js'

function Chat({ isAuthenticated, onNavigate, initialThreadId = null, initialProductId = null, initialSellerId = null }) {
  const [threads, setThreads] = useState([])
  const [activeThreadId, setActiveThreadId] = useState(initialThreadId)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  
  // 🌟 TAMBAHAN: State untuk menyimpan jumlah pesan baru (unread)
  const [unreadCounts, setUnreadCounts] = useState({})
  
  const messagesEndRef = useRef(null)
  const activeThreadRef = useRef(activeThreadId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Menyimpan ID thread aktif ke Ref agar bisa dibaca oleh fungsi Realtime
  useEffect(() => {
    activeThreadRef.current = activeThreadId;
    if (activeThreadId) {
      // Reset jumlah pesan baru menjadi 0 jika obrolan sedang dibuka
      setUnreadCounts(prev => ({ ...prev, [activeThreadId]: 0 }));
    }
  }, [activeThreadId])

  // 1. CEK USER LOGIN
  useEffect(() => {
    async function getUserId() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      } else {
        setLoadingThreads(false)
        if (!isAuthenticated) {
            alert('Silakan login untuk mengakses obrolan.');
            onNavigate('login');
        }
      }
    }
    getUserId()
  }, [isAuthenticated, onNavigate])

  // 2. AMBIL ATAU BUAT THREAD (Berdasarkan Produk) & MUAT RIWAYAT
  useEffect(() => {
    async function initChat() {
      if (!currentUserId) return;
      setLoadingThreads(true);

      try {
        if (initialProductId && initialSellerId) {
          const { data: existingThread, error: searchError } = await supabase
            .from('chat_threads')
            .select('id')
            .eq('buyer_id', currentUserId)
            .eq('seller_id', initialSellerId)
            .eq('listing_id', initialProductId)
            .maybeSingle();

          if (searchError && searchError.code !== 'PGRST116') throw searchError;

          if (existingThread) {
            setActiveThreadId(existingThread.id);
          } else {
            const { data: newThread, error: createError } = await supabase
              .from('chat_threads')
              .insert([{
                buyer_id: currentUserId,
                seller_id: initialSellerId,
                listing_id: initialProductId
              }])
              .select('id')
              .single();

            if (createError) throw createError;
            setActiveThreadId(newThread.id);
          }
        }

        const { data: threadsData, error: threadsError } = await supabase
          .from('chat_threads')
          .select(`
            id,
            created_at,
            listings(id, name, location, image_url),
            buyer:profiles!chat_threads_buyer_id_fkey(id, username, full_name, avatar_url),
            seller:profiles!chat_threads_seller_id_fkey(id, username, full_name, avatar_url)
          `)
          .or(`buyer_id.eq.${currentUserId},seller_id.eq.${currentUserId}`)
          .order('created_at', { ascending: false });

        if (threadsError) throw threadsError;

        if (threadsData && threadsData.length > 0) {
          const formattedThreads = threadsData.map(thread => {
            const isBuyer = thread.buyer?.id === currentUserId;
            const lawanBicara = isBuyer ? thread.seller : thread.buyer;
            
            return {
              id: thread.id,
              name: lawanBicara?.full_name || lawanBicara?.username || 'Toko Mitra Revivo',
              avatar: lawanBicara?.avatar_url || null,
              location: thread.listings?.location || 'Indonesia',
              productName: thread.listings?.name || 'Produk Tanpa Nama',
              productImage: thread.listings?.image_url || '/placeholder.svg',
              preview: `Terkait: ${thread.listings?.name || 'Gawai Elektronik'}`,
              time: 'Aktif'
            };
          });
          
          setThreads(formattedThreads);
          
          if (!activeThreadId && !initialProductId) {
            setActiveThreadId(formattedThreads[0].id);
          }
        } else {
          handleActivateDemo();
        }

      } catch (err) {
        console.error('Error saat inisialisasi chat:', err.message);
        handleActivateDemo();
      } finally {
        setLoadingThreads(false);
      }
    }

    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, initialProductId, initialSellerId]);

  // 3. AMBIL HISTORI PESAN DARI THREAD YANG AKTIF
  useEffect(() => {
    if (!activeThreadId) return;

    if (activeThreadId === 'demo-simulasi-toko-1') {
      setMessages([{ id: 'm1', sender_id: 'toko-id-1', body: 'Halo gan! Terkait negosiasi harga gawai yang Anda tanyakan, boleh nego tipis ya.', created_at: new Date().toISOString() }]); return;
    }
    if (activeThreadId === 'demo-simulasi-toko-2') {
      setMessages([{ id: 'm2', sender_id: 'toko-id-2', body: 'Unit iPhone bekas ini dijamin orisinal.', created_at: new Date().toISOString() }]); return;
    }

    async function loadMessageHistory() {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('thread_id', activeThreadId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        if (data) setMessages(data);
      } catch (err) {
        console.error(err.message);
      }
    }

    loadMessageHistory();
  }, [activeThreadId]);

  // 🌟 TAMBAHAN: SUBSCRIPTION REALTIME GLOBAL UNTUK INDIKATOR PESAN BARU
  useEffect(() => {
    if (!currentUserId) return;

    const globalChannel = supabase
      .channel('global-chat-channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new;
          
          if (newMsg.thread_id === activeThreadRef.current) {
            // Jika pesan untuk obrolan yang sedang dibuka, langsung munculkan
            setMessages((prev) => [...prev, newMsg]);
          } else {
            // Jika pesan untuk obrolan lain, tambahkan lencana (badge) belum dibaca
            setUnreadCounts(prev => ({
              ...prev,
              [newMsg.thread_id]: (prev[newMsg.thread_id] || 0) + 1
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [currentUserId]);

  // 4. FUNGSI KIRIM CHAT INTERAKTIF
  async function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeThreadId) return;

    if (activeThreadId.startsWith('demo-simulasi-toko-')) {
      const userMsg = { id: `u-${Date.now()}`, sender_id: currentUserId || 'pembeli-dummy', body: text, created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, userMsg]);
      setDraft('');

      setTimeout(() => {
        const botMsg = { id: `b-${Date.now()}`, sender_id: 'toko-bot', body: `[Toko Membalas] "${text}" - Pesan diterima.`, created_at: new Date().toISOString() };
        if (activeThreadId === activeThreadRef.current) {
           setMessages((prev) => [...prev, botMsg]);
        }
      }, 1000);
      return;
    }

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{ thread_id: activeThreadId, sender_id: currentUserId, body: text }]);

      if (error) throw error;
      setDraft('');
    } catch (err) {
      console.error(err.message);
    }
  }

  // 🌟 TAMBAHAN: FUNGSI UNTUK MENGHAPUS RIWAYAT OBROLAN
  async function handleDeleteThread() {
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus obrolan ini secara permanen?');
    if (!confirmDelete || !activeThreadId) return;

    if (activeThreadId.startsWith('demo-simulasi-toko-')) {
      alert('Mode simulasi tidak bisa dihapus.');
      return;
    }

    try {
      const { error } = await supabase
        .from('chat_threads')
        .delete()
        .eq('id', activeThreadId);

      if (error) throw error;

      // Hapus dari tampilan lokal (UI)
      setThreads(prev => prev.filter(t => t.id !== activeThreadId));
      setActiveThreadId(null);
      setMessages([]);
      alert('Obrolan berhasil dihapus.');
    } catch (err) {
      console.error('Gagal menghapus obrolan:', err.message);
      alert('Gagal menghapus obrolan. Silakan coba lagi.');
    }
  }

  function handleActivateDemo() {
    setThreads([
      { id: 'demo-simulasi-toko-1', name: 'Ahmad Gawai Store (Merchant)', productName: 'iPhone 13 Pro Max Bekas', productImage: '/placeholder.svg', preview: 'Terkait: iPhone 13 Pro Max Bekas', location: 'Jakarta Pusat', time: '10:30' },
      { id: 'demo-simulasi-toko-2', name: 'Revivo Official Care (CS)', productName: 'Layanan Bantuan', productImage: '/placeholder.svg', preview: 'Terkait: Layanan Bantuan', location: 'Semarang HQ', time: '09.15' }
    ]);
    if (!activeThreadId) setActiveThreadId('demo-simulasi-toko-1');
  }

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', display: 'flex', height: '650px', boxSizing: 'border-box', fontFamily: 'sans-serif' }}>
        
        {/* 1. BAR DISAMPING (SIDEBAR) */}
        <div style={{ width: '320px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px 0 0 12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '20px', background: '#ffffff', borderBottom: '1px solid #cbd5e1' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 'bold' }}>Pesan Masuk</h3>
          </div>
          
          <div style={{ flex: '1', overflowY: 'auto', padding: '10px 0' }}>
            {threads.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>Sinkronisasi kontak kosong...</p>
                <button type="button" onClick={handleActivateDemo} style={{ background: '#0f172a', color: '#fff', border: 0, padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>Paksa Muat Kontak</button>
              </div>
            ) : (
              threads.map((t) => {
                const isCurrent = t.id === activeThreadId;
                const unreadCount = unreadCounts[t.id] || 0;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveThreadId(t.id)}
                    style={{ width: '100%', display: 'flex', gap: '12px', padding: '15px 20px', border: 0, borderBottom: '1px solid #e2e8f0', background: isCurrent ? '#eff6ff' : 'transparent', textAlign: 'left', cursor: 'pointer', alignItems: 'center' }}
                  >
                    <img src={t.productImage} alt={t.productName} style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid #cbd5e1' }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ color: '#1e293b', fontSize: '0.9rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</strong>
                        
                        {/* 🌟 PERBAIKAN: Menampilkan lencana pesan baru di sebelah waktu */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {unreadCount > 0 && (
                            <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                              {unreadCount} Baru
                            </span>
                          )}
                          <small style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{t.time}</small>
                        </div>

                      </div>
                      <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: unreadCount > 0 ? 'bold' : 'normal' }}>
                        {t.preview}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* 2. JENDELA UTAMA PESAN */}
        <div style={{ flex: '1', background: '#ffffff', border: '1px solid #cbd5e1', borderLeft: 0, borderRadius: '0 12px 12px 0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeThread ? (
            <>
              {/* Header Chat menampilkan produk yang sedang dibahas */}
              <div style={{ padding: '15px 20px', borderBottom: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '15px', background: '#ffffff' }}>
                <img src={activeThread.productImage} alt={activeThread.productName} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem', fontWeight: 'bold' }}>{activeThread.productName}</h4>
                  <small style={{ color: '#64748b', fontSize: '0.85rem' }}>Penjual: {activeThread.name}</small>
                </div>

                {/* 🌟 PERBAIKAN: Tombol Hapus Riwayat */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <small style={{ color: '#10b981', fontWeight: '600', fontSize: '0.8rem', display: 'block' }}>● Terhubung</small>
                  <button 
                    onClick={handleDeleteThread}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    🗑️ Hapus Obrolan
                  </button>
                </div>
              </div>

              {/* Area Aliran Gelembung Pesan */}
              <div style={{ flex: '1', padding: '20px', background: '#f1f5f9', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map((m) => {
                  const isMe = m.sender_id === currentUserId || m.sender_id === 'pembeli-dummy';
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

              {/* FORM PENGISIAN TEKS INPUT */}
              <form onSubmit={sendMessage} style={{ padding: '15px 20px', borderTop: '1px solid #cbd5e1', display: 'flex', gap: '10px', background: '#ffffff' }}>
                <input
                  type="text"
                  placeholder="Ketik pesan negosiasi disini secara bebas..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  style={{ flex: '1', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.92rem', outline: 'none', background: '#ffffff', color: '#000000' }}
                />
                <button type="submit" style={{ background: '#ff7f00', color: '#ffffff', border: 0, padding: '0 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.92rem', cursor: 'pointer' }}>
                  KIRIM
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', color: '#64748b', fontSize: '0.95rem' }}>Silakan pilih salah satu percakapan di bilah kiri.</div>
          )}
        </div>
      </div>
    </StoreLayout>
  )
}

export default Chat