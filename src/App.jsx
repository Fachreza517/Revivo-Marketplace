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

// Import modul utama halaman baru dashboard profil
import LacakPesanan from './pages/LacakPesanan.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Bandingkan from './pages/Bandingkan.jsx'
import KartuAlamat from './pages/KartuAlamat.jsx'
import Pengaturan from './pages/Pengaturan.jsx'
import EditAkun from './pages/EditAkun.jsx'

// Import Halaman Dinamis Konten Footer Startup REVIVO
import FooterContentPage from './pages/FooterContentPage.jsx'

// 🌟 BARU: Import Halaman Toko Publik
import StorePage from './pages/StorePage.jsx'

// Import jembatan Supabase yang baru kamu buat di folder integrations
import { supabase } from './integrations/supabase/client.js'

function App() {
  const [page, setPage] = useState('landing')
  const [selectedProductId, setSelectedProductId] = useState(null)
  
  // 🌟 BARU: State untuk menampung ID Penjual/Toko yang akan dikunjungi
  const [selectedSellerId, setSelectedSellerId] = useState(null) 
  
  const [shopCategory, setShopCategory] = useState('all')
  const [shopSearch, setShopSearch] = useState('')
  const [activeChatThreadId, setActiveChatThreadId] = useState(null)
  const [chatBootstrap, setChatBootstrap] = useState(null)
  const [listingsVersion, setListingsVersion] = useState(0)
  const [authUser, setAuthUser] = useState(null)
  const [message, setMessage] = useState('')

  // State Pengendali Navigasi Konten Footer Khusus
  const [footerTab, setFooterTab] = useState('tentang-kami')

  // 1. PANTAU STATUS LOGIN SECARA LIVE DARI CLOUD SUPABASE
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        setAuthUser({
          id: session.user.id,
          email: session.user.email,
          username: session.user.user_metadata?.username || session.user.email.split('@')[0],
          avatar: session.user.user_metadata?.avatar_url || null
        })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        setAuthUser({
          id: session.user.id,
          email: session.user.email,
          username: session.user.user_metadata?.username || session.user.email.split('@')[0],
          avatar: session.user.user_metadata?.avatar_url || null
        })
      } else {
        setAuthUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  function navigate(nextPage, options = {}) {
    setMessage('')

    if (options.productId) {
      setSelectedProductId(options.productId)
    }

    // 🌟 BARU: Tangkap parameter sellerId jika ada
    if (options.sellerId) {
      setSelectedSellerId(options.sellerId)
    }

    if (options.category) {
      setShopCategory(options.category)
    }

    if (options.search !== undefined) {
      setShopSearch(options.search)
    }

    if (options.threadId) {
      setActiveChatThreadId(options.threadId)
    }

    if (options.footerTab) {
      setFooterTab(options.footerTab)
    }

    if (options.chatBootstrap) {
      setChatBootstrap(options.chatBootstrap)
    } else if (nextPage !== 'chat') {
      setChatBootstrap(null)
    }

    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 2. INTEGRASI REGISTRASI AKUN (SIGN UP) KE SUPABASE AUTH
  async function handleSignup(form) {
    setMessage('')
    const email = form.email.trim().toLowerCase()
    const username = form.username.trim()
    const password = form.password

    if (!email || !username || password.length < 6) {
      setMessage('Lengkapi data akun. Kata sandi minimal 6 karakter.')
      return
    }

    if (!/^[A-Za-z0-9]+( [A-Za-z0-9]+)*$/.test(username)) {
      setMessage('Nama pengguna boleh memakai spasi, contohnya Damon Albarn.')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username 
        }
      }
    })

    if (error) {
      setMessage(error.message)
    } else if (data.user) {
      alert('Pendaftaran akun REVIVO berhasil! Silakan periksa kotak masuk email Anda untuk verifikasi.')
      setPage('landing')
    }
  }

  // 3. INTEGRASI LOGIN AKUN KE CLOUD DATABASE SUPABASE
  async function handleLogin(form) {
    setMessage('')
    const inputEmail = (form.identifier || form.email || '').trim().toLowerCase()
    const inputPassword = form.password

    if (!inputEmail || !inputPassword) {
      setMessage('Email dan kata sandi wajib diisi.')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: inputEmail,
      password: inputPassword
    })

    if (error) {
      setMessage('Email atau kata sandi belum cocok dengan data server.')
    } else {
      setMessage('')
      setPage('landing')
    }
  }

  // 4. INTEGRASI LOGOUT DARI SERVER SUPABASE
  async function handleLogout() {
    await supabase.auth.signOut()
    setAuthUser(null)
    setMessage('')
    setPage('landing')
  }

  function handleCheckout() {
    if (!authUser) {
      setMessage('Masuk dulu untuk menyelesaikan checkout.')
      setPage('login')
      return
    }
    setPage('checkout')
  }

  const isAuthenticated = Boolean(authUser)

  let content

  if (page === 'login' || page === 'signup') {
    content = (
      <AuthPage
        mode={page}
        message={message}
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        onNavigate={navigate}
        onSignup={handleSignup}
      />
    )
  } else if (page === 'profile') {
    content = (
      <ProfilePage
        user={authUser}
        onNavigate={navigate}
        onLogout={handleLogout}
        listingsVersion={listingsVersion}
      />
    )
  } else if (page === 'shop') {
    content = (
      <Shop
        isAuthenticated={isAuthenticated}
        onNavigate={navigate}
        initialCategory={shopCategory}
        initialSearch={shopSearch}
        listingsVersion={listingsVersion}
      />
    )
  } else if (page === 'jual-barang') {
    content = (
      <JualBarang
        user={authUser}
        isAuthenticated={isAuthenticated}
        onNavigate={navigate}
        onListingCreated={() => setListingsVersion((version) => version + 1)}
      />
    )
  } else if (page === 'edit-barang') {
    content = (
      <JualBarang
        productId={selectedProductId}
        user={authUser}
        isAuthenticated={isAuthenticated}
        onNavigate={navigate}
        onListingCreated={() => setListingsVersion((version) => version + 1)}
      />
    )
  } else if (page === 'product-detail') {
    content = (
      <ProductDetail
        productId={selectedProductId}
        isAuthenticated={isAuthenticated}
        user={authUser} 
        onNavigate={navigate}
      />
    )
  } else if (page === 'cart') {
    content = (
      <Cart isAuthenticated={isAuthenticated} onNavigate={navigate} onCheckout={handleCheckout} />
    )
  } else if (page === 'chat') {
    content = (
      <Chat
        isAuthenticated={isAuthenticated}
        onNavigate={navigate}
        initialThreadId={activeChatThreadId}
        threadBootstrap={chatBootstrap}
      />
    )
  } else if (page === 'checkout') {
    content = <Checkout isAuthenticated={isAuthenticated} onNavigate={navigate} />
  } else if (page === 'footer-content') {
    content = (
      <FooterContentPage 
        contentType={footerTab}
        isAuthenticated={isAuthenticated}
        onNavigate={navigate}
      />
    )
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
  } else if (page === 'edit-akun') {
    content = <EditAkun isAuthenticated={isAuthenticated} onNavigate={navigate} />
  } 
  // 🌟 BARU: RUTE HALAMAN TOKO PUBLIK
  else if (page === 'toko') {
    content = (
      <StorePage 
        sellerId={selectedSellerId} 
        isAuthenticated={isAuthenticated} 
        onNavigate={navigate} 
      />
    )
  } 
  else {
    content = (
      <Landing
        isAuthenticated={isAuthenticated}
        onNavigate={navigate}
        listingsVersion={listingsVersion}
      />
    )
  }

  return <CartProvider>{content}</CartProvider>
}

export default App