import { useEffect, useState } from 'react'
import StoreLayout from '../components/StoreLayout.jsx'
import { listingFormCategories } from '../data/localData.js'
import { readImageFiles } from '../data/userListings.js'
// Import jembatan Supabase Client yang sudah dibuat
import { supabase } from '../integrations/supabase/client.js'

const BADGE_OPTIONS = ['BEKAS', 'REFURBISH']
const SCORE_OPTIONS = ['95%', '92%', '90%', '88%', '85%', '80%']

const INITIAL_FORM = {
  name: '',
  description: '',
  category: 'laptop',
  badge: 'BEKAS',
  score: '85%',
  priceValue: '',
  oldPriceValue: '',
  stock: '1',
  location: '',
  tech_spec: '' 
}

// 🌟 DIOPTIMALKAN: Ditambahkan props 'productId' untuk mendeteksi Mode Edit secara dinamis
function JualBarang({ productId, user, isAuthenticated, onNavigate, onListingCreated }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [images, setImages] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  // Menentukan status mode halaman saat ini
  const isEditMode = !!productId

  // 🌟 BARU: Jika dalam Mode Edit, tarik data lama dari Supabase Cloud saat halaman dibuka
  useEffect(() => {
    async function loadListingToEdit() {
      if (!productId || !user?.id) return
      setLoadingData(true)
      try {
        const { data, error: fetchError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', productId)
          .single()

        if (fetchError) throw fetchError

        // VALIDASI PROTEKSI: Cegah user lain mengedit barang lewat modifikasi URL parameter
        if (data && data.seller_id !== user.id) {
          alert('Akses Ditolak! Anda bukan pemilik sah dari iklan gawai ini.')
          onNavigate('shop')
          return
        }

        if (data) {
          setForm({
            name: data.name || '',
            description: data.description || '',
            category: data.category || 'laptop',
            badge: data.badge || 'BEKAS',
            score: data.score || '85%',
            priceValue: data.price_value ? data.price_value.toString() : '',
            oldPriceValue: data.old_price_value ? data.old_price_value.toString() : '',
            stock: data.stock ? data.stock.toString() : '1',
            location: data.location || '',
            tech_spec: data.tech_spec || ''
          })
          
          if (data.image_url) {
            setPreviewUrls([data.image_url])
            setImages([data.image_url]) // Simpan data gambar lama sebagai fallback
          }
        }
      } catch (err) {
        console.error('Gagal memuat data spesifikasi lama:', err.message)
        setError('Gagal mengunduh informasi spesifikasi produk dari server cloud.')
      } finally {
        setLoadingData(false)
      }
    }

    if (isEditMode) {
      loadListingToEdit()
    } else {
      setForm(INITIAL_FORM)
      setPreviewUrls([])
      setImages([])
    }
  }, [productId, isEditMode, user])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  async function handlePhotos(event) {
    const { files } = event.target
    if (!files?.length) return

    setError('')
    try {
      const dataUrls = await readImageFiles(files)
      setImages(dataUrls)
      setPreviewUrls(dataUrls)
    } catch (photoError) {
      setError(photoError.message)
      event.target.value = ''
    }
  }

  function removePhoto(index) {
    setImages((current) => current.filter((_, i) => i !== index))
    setPreviewUrls((current) => current.filter((_, i) => i !== index))
  }

  // LOGIKA SUBMIT DINAMIS: BISA INSERT (BARANG BARU) ATAUPUN UPDATE (BARANG LAMA)
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    // --- Validasi Input Standar ---
    if (!form.name.trim() || !form.description.trim() || !form.location.trim()) {
      setError('Mohon lengkapi seluruh kolom wajib di atas.')
      return
    }
    if (images.length === 0) {
      setError('Unggah minimal satu foto pratinjau gawai Anda.')
      return
    }

    const priceValue = Number(form.priceValue)
    if (!priceValue || priceValue < 1000) {
      setError('Harga jual harus diisi (minimal Rp 1.000).')
      return
    }

    setIsSubmitting(true)

    try {
      if (!user?.id) throw new Error('Sesi masuk kedaluwarsa. Silakan login ulang.')

      // Objek data yang akan dikirim ke PostgreSQL Supabase
      const payload = {
        seller_id: user.id,
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        badge: form.badge,
        score: form.score,
        price_value: priceValue,
        old_price_value: form.oldPriceValue ? Number(form.oldPriceValue) : null,
        stock: parseInt(form.stock) || 1,
        location: form.location.trim(),
        image_url: images[0] || null,
        tech_spec: form.tech_spec.trim()
      }

      let currentListingId = productId

      if (isEditMode) {
        // 🌟 AKSI MODE EDIT: Melakukan query UPDATE di PostgreSQL cloud
        const { error: updateError } = await supabase
          .from('listings')
          .update(payload)
          .eq('id', productId)
          .eq('seller_id', user.id) // Kunci keamanan berlapis di sisi backend

        if (updateError) throw updateError
        setSuccess('Spesifikasi gawai Anda berhasil diperbarui di server cloud REVIVO!')
      } else {
        // 🌟 AKSI MODE TAMBAH: Melakukan query INSERT data barang baru
        const { data: newListing, error: insertError } = await supabase
          .from('listings')
          .insert([{ ...payload, status: 'available' }])
          .select()
          .single()

        if (insertError) throw insertError
        currentListingId = newListing.id
        setSuccess('Produk gawai baru berhasil diterbitkan ke toko!')
      }

      // Memicu trigger refresh state katalog utama di App.jsx
      onListingCreated?.(currentListingId)

      window.setTimeout(() => {
        onNavigate('product-detail', { productId: currentListingId })
      }, 900)

    } catch (submitError) {
      setError(submitError.message || 'Gagal menyelaraskan transaksi data dengan cloud.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <StoreLayout isAuthenticated={false} onNavigate={onNavigate} showPromo={false}>
        <div className="jual-page">
          <div className="store-message jual-gate">
            <h1>Akses Terbatas</h1>
            <p>Silakan masuk ke akun Revivo Anda untuk mengelola etalase toko.</p>
            <button type="button" className="button button--orange" onClick={() => onNavigate('login')}>MASUK SEKARANG</button>
          </div>
        </div>
      </StoreLayout>
    )
  }

  if (loadingData) {
    return (
      <StoreLayout isAuthenticated onNavigate={onNavigate} showPromo={false}>
        <div className="jual-page">
          <p className="shop-empty">Mendekripsi riwayat spesifikasi perangkat dari cloud...</p>
        </div>
      </StoreLayout>
    )
  }

  return (
    <StoreLayout isAuthenticated onNavigate={onNavigate} showPromo={false}>
      <div className="jual-page">
        <header className="jual-page__header">
          {/* Judul adaptif mengikuti status mode halaman */}
          <h1>{isEditMode ? 'PERBARUI DETAIL GAWAI' : 'JUAL BARANG'}</h1>
          <p>
            {isEditMode 
              ? 'Ubah rincian spesifikasi teknis, sesuaikan harga, atau perbarui sisa kuantitas stok barang Anda.' 
              : `Halo, ${user?.username || 'Pengguna'}! Silahkan isi detail gawai baru Anda untuk diterbitkan ke katalog toko.`
            }
          </p>
        </header>

        <form className="jual-form" onSubmit={handleSubmit}>
          {/* SECTION FOTO */}
          <section className="jual-form__section">
            <h2>Foto Produk</h2>
            <p className="jual-form__hint">Format JPG/PNG, maks. 2,5 MB per file.</p>
            <label className="jual-upload">
              <input type="file" accept="image/*" multiple onChange={handlePhotos} aria-label="Unggah foto produk" />
              <span>Pilih foto gawai baru</span>
            </label>

            {previewUrls.length > 0 && (
              <div className="jual-preview-grid">
                {previewUrls.map((src, index) => (
                  <figure key={src}>
                    <img src={src} alt={`Pratinjau ${index + 1}`} />
                    <button type="button" onClick={() => removePhoto(index)}>Hapus</button>
                  </figure>
                ))}
              </div>
            )}
          </section>

          {/* SECTION INFORMASI UTAMA */}
          <section className="jual-form__section">
            <h2>Informasi Produk</h2>
            <label className="jual-field">
              <span>Nama produk</span>
              <input name="name" value={form.name} onChange={updateField} placeholder="Contoh: ThinkPad T14 Bekas — Siap Kerja" required />
            </label>

            <label className="jual-field">
              <span>Deskripsi</span>
              <textarea name="description" value={form.description} onChange={updateField} rows={4} placeholder="Ceritakan kondisi, minus, dan kelengkapan barang..." required />
            </label>

            <div className="jual-field-row">
              <label className="jual-field">
                <span>Kategori</span>
                <select name="category" value={form.category} onChange={updateField}>
                  {listingFormCategories.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </label>

              <label className="jual-field">
                <span>Kondisi</span>
                <select name="badge" value={form.badge} onChange={updateField}>
                  {BADGE_OPTIONS.map((badge) => (
                    <option key={badge} value={badge}>{badge}</option>
                  ))}
                </select>
              </label>

              <label className="jual-field">
                <span>Skor kondisi</span>
                <select name="score" value={form.score} onChange={updateField}>
                  {SCORE_OPTIONS.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="jual-field" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <span>Spesifikasi Teknis Tambahan (Opsional)</span>
              <textarea name="tech_spec" value={form.tech_spec} onChange={updateField} rows={4} placeholder="Masukkan rincian komponen hardware gawai secara bebas." />
            </label>
          </section>

          {/* SECTION HARGA & STOK */}
          <section className="jual-form__section">
            <h2>Harga & Stok</h2>
            <div className="jual-field-row">
              <label className="jual-field">
                <span>Harga jual (Rp)</span>
                <input type="number" name="priceValue" min="1000" step="1" value={form.priceValue} onChange={updateField} placeholder="5320000" required />
              </label>

              <label className="jual-field">
                <span>Harga coret (Rp)</span>
                <input type="number" name="oldPriceValue" min="1000" step="1" value={form.oldPriceValue} onChange={updateField} placeholder="5999999" />
              </label>

              <label className="jual-field">
                <span>Stok (unit)</span>
                <input type="number" name="stock" min="1" max="99" value={form.stock} onChange={updateField} required />
              </label>
            </div>

            <label className="jual-field">
              <span>Lokasi penjual</span>
              <input name="location" value={form.location} onChange={updateField} placeholder="Contoh: Jakarta Selatan, DKI Jakarta" required />
            </label>
          </section>

          {error && <p className="jual-form__error" role="alert">{error}</p>}
          {success && <p className="jual-form__success" role="status">{success}</p>}

          <div className="jual-form__actions">
            <button type="submit" className="button button--orange" disabled={isSubmitting}>
              {isSubmitting ? 'MENYIMPAN...' : isEditMode ? 'SIMPAN PERUBAHAN' : 'PASANG PRODUK'}
            </button>
            <button type="button" className="button button--outline" onClick={() => onNavigate(isEditMode ? 'product-detail' : 'shop', { productId })}>
              BATAL
            </button>
          </div>
        </form>
      </div>
    </StoreLayout>
  )
}

export default JualBarang