import { useEffect, useState } from 'react'
import { CartProvider } from './context/CartContext.jsx'
import AuthPage from './pages/AuthPage.jsx'
import Cart from './pages/Cart.jsx'
import Chat from './pages/Chat.jsx'
import Checkout from './pages/Checkout.jsx'
import Landing from './pages/Landing.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import JualBarang from './pages/JualBarang.jsx'
import Shop from './pages/Shop.jsx'

// Import modul utama halaman dashboard profil & pengaturan
import LacakPesanan from './pages/LacakPesanan.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Bandingkan from './pages/Bandingkan.jsx'
import KartuAlamat from './pages/KartuAlamat.jsx'
import Pengaturan from './pages/Pengaturan.jsx'
import PengaturanKeamanan from './pages/PengaturanKeamanan.jsx'
import EditAkun from './pages/EditAkun.jsx'

// Import Halaman Dinamis Konten Footer & Toko
import FooterContentPage from './pages/FooterContentPage.jsx'
import StorePage from './pages/StorePage.jsx'

import { supabase } from './integrations/supabase/client.js'

function App() {
  const [page, setPage] = useState('landing')
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [selectedSellerId, setSelectedSellerId] = useState(null) 
  const [shopCategory, setShopCategory] = useState('all')
  const [shopSearch, setShopSearch] = useState('')
  const [activeChatThreadId, setActiveChatThreadId] = useState(null)
  const [chatBootstrap, setChatBootstrap] = useState(null)
  const [listingsVersion, setListingsVersion] = useState(0)
  const [authUser, setAuthUser] = useState(null)
  const [message, setMessage] = useState('')
  const [footerTab, setFooterTab] = useState('tentang-kami')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserState(session.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUserState(session.user)
      else setAuthUser(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  function setUserState(user) {
    setAuthUser({
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username || user.email.split('@')[0],
      avatar: user.user_metadata?.avatar_url || null
    })
  }

  function navigate(nextPage, options = {}) {
    setMessage('')
    if (options.productId) setSelectedProductId(options.productId)
    if (options.sellerId) setSelectedSellerId(options.sellerId)
    if (options.category) setShopCategory(options.category)
    if (options.search !== undefined) setShopSearch(options.search)
    if (options.threadId) setActiveChatThreadId(options.threadId)
    if (options.footerTab) setFooterTab(options.footerTab)
    if (options.chatBootstrap) setChatBootstrap(options.chatBootstrap)
    else if (nextPage !== 'chat') setChatBootstrap(null)

    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 🌟 TAMBAHAN: Fungsi untuk menangani proses Login
  async function handleLogin({ identifier, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier, 
        password: password
      });

      if (error) throw error;
      
      setAuthUser(data.user);
      navigate('landing'); 
      alert('Berhasil masuk!');
    } catch (err) {
      console.error(err);
      setMessage('Gagal masuk: Email atau kata sandi salah.');
    }
  }

  // 🌟 TAMBAHAN: Fungsi untuk menangani proses Register/Daftar
  async function handleSignup(formData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username
          }
        }
      });

      if (error) throw error;
      
      alert('Pendaftaran berhasil! Silakan periksa kotak masuk email Anda (termasuk folder spam) untuk konfirmasi.');
      navigate('login');
    } catch (err) {
      console.error(err);
      setMessage(`Gagal mendaftar: ${err.message}`);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setAuthUser(null)
    setPage('landing')
  }

  const isAuthenticated = Boolean(authUser)

  let content
  if (page === 'login' || page === 'signup') {
    // 🌟 PERBAIKAN: Menambahkan properti onLogin dan onSignup ke AuthPage
    content = (
      <AuthPage 
        mode={page} 
        message={message} 
        isAuthenticated={isAuthenticated} 
        onNavigate={navigate}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    )
  } else if (page === 'profile') {
    content = <ProfilePage user={authUser} onNavigate={navigate} onLogout={handleLogout} listingsVersion={listingsVersion} />
  } else if (page === 'shop') {
    content = <Shop isAuthenticated={isAuthenticated} onNavigate={navigate} initialCategory={shopCategory} initialSearch={shopSearch} listingsVersion={listingsVersion} />
  } else if (page === 'jual-barang' || page === 'edit-barang') {
    content = <JualBarang productId={page === 'edit-barang' ? selectedProductId : null} user={authUser} isAuthenticated={isAuthenticated} onNavigate={navigate} onListingCreated={() => setListingsVersion(v => v + 1)} />
  } else if (page === 'product-detail') {
    content = <ProductDetail productId={selectedProductId} isAuthenticated={isAuthenticated} user={authUser} onNavigate={navigate} />
  } else if (page === 'cart') {
    content = <Cart isAuthenticated={isAuthenticated} onNavigate={navigate} onCheckout={() => { if(!authUser) setPage('login'); else setPage('checkout') }} />
  } else if (page === 'chat') {
    content = (
      <Chat 
        isAuthenticated={isAuthenticated} 
        onNavigate={navigate} 
        initialThreadId={activeChatThreadId} 
        initialProductId={selectedProductId} 
        initialSellerId={selectedSellerId}
        threadBootstrap={chatBootstrap} 
      />
    )
  } else if (page === 'checkout') {
    content = <Checkout isAuthenticated={isAuthenticated} onNavigate={navigate} />
  } else if (page === 'footer-content') {
    content = <FooterContentPage contentType={footerTab} isAuthenticated={isAuthenticated} onNavigate={navigate} />
  } else if (page === 'lacak-pesanan') {
    content = <LacakPesanan isAuthenticated={isAuthenticated} onNavigate={navigate} />
  } else if (page === 'wishlist') {
    content = <Wishlist isAuthenticated={isAuthenticated} onNavigate={navigate} />
  } else if (page === 'bandingkan') {
    content = <Bandingkan isAuthenticated={isAuthenticated} onNavigate={navigate} />
  } else if (page === 'kartu-alamat') {
    content = <KartuAlamat isAuthenticated={isAuthenticated} onNavigate={navigate} />
  } else if (page === 'pengaturan') {
    content = <Pengaturan isAuthenticated={isAuthenticated} onNavigate={navigate} />
  } else if (page === 'pengaturan-keamanan') {
    content = <PengaturanKeamanan isAuthenticated={isAuthenticated} onNavigate={navigate} />
  } else if (page === 'edit-akun') {
    content = <EditAkun isAuthenticated={isAuthenticated} onNavigate={navigate} />
  } else if (page === 'toko') {
    content = <StorePage sellerId={selectedSellerId} isAuthenticated={isAuthenticated} onNavigate={navigate} />
  } else {
    content = <Landing isAuthenticated={isAuthenticated} onNavigate={navigate} listingsVersion={listingsVersion} />
  }

  return <CartProvider>{content}</CartProvider>
}

export default App