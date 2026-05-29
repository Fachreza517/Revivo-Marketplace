import { useState } from 'react'
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
}

function JualBarang({ user, isAuthenticated, onNavigate, onListingCreated }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [images, setImages] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // INTEGRASI SUBMIT FORM LANGSUNG KE SUPABASE CLOUD DATABASE
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    // --- Validasi Bawaan Frontend ---
    if (!form.name.trim()) {
      setError('Nama produk wajib diisi.')
      return
    }
    if (!form.description.trim()) {
      setError('Deskripsi wajib diisi.')
      return
    }
    if (!form.location.trim()) {
      setError('Lokasi penjual wajib diisi.')
      return
    }
    if (images.length === 0) {
      setError('Unggah minimal satu foto produk.')
      return
    }

    const priceValue = Number(form.priceValue)
    if (!priceValue || priceValue < 1000) {
      setError('Harga jual harus diisi (minimal Rp 1.000).')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Pastikan ID pengguna aktif tersedia melalui props user
      if (!user?.id) {
        throw new Error('Sesi masuk tidak valid. Silakan masuk kembali.')
      }

      // 2. Simpan data masukan langsung ke PostgreSQL Supabase
      const { data: newListing, error: insertError } = await supabase
        .from('listings')
        .insert([
          {
            seller_id: user.id, // Relasi dengan tabel profiles akun penjual
            name: form.name,
            description: form.description,
            category: form.category,
            badge: form.badge,
            score: form.score,
            price_value: priceValue,
            old_price_value: form.oldPriceValue ? Number(form.oldPriceValue) : null,
            stock: parseInt(form.stock),
            location: form.location,
            image_url: images[0] || null // Simpan representasi gambar pertama ke kolom image_url
          }
        ])
        .select()
        .single()

      if (insertError) throw insertError

      // Pemicu pembaruan state versi katalog produk di App.jsx
      onListingCreated?.(newListing.id)

      setSuccess('Produk berhasil dipasang! Mengalihkan ke halaman produk...')
      setForm(INITIAL_FORM)
      setImages([])
      setPreviewUrls([])

      window.setTimeout(() => {
        onNavigate('product-detail', { productId: newListing.id })
      }, 900)
    } catch (submitError) {
      setError(submitError.message || 'Gagal menyimpan produk ke basis data cloud.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <StoreLayout isAuthenticated={false} onNavigate={onNavigate} showPromo={false}>
        <div className="jual-page">
          <div className="store-message jual-gate">
            <h1>Jual Barang di Revivo</h1>
            <p>Masuk dulu untuk mengunggah produk bekas atau refurbish kamu.</p>
            <button type="button" className="button button--orange" onClick={() => onNavigate('login')}>
              MASUK SEKARANG
            </button>
            <button type="button" className="button button--outline" onClick={() => onNavigate('signup')}>
              DAFTAR AKUN
            </button>
          </div>
        </div>
      </StoreLayout>
    )
  }

  return (
    <StoreLayout isAuthenticated onNavigate={onNavigate} showPromo={false}>
      <div className="jual-page">
        <header className="jual-page__header">
          <h1>JUAL BARANG</h1>
          <p>
            Halo, <strong>{user?.username || 'Pengguna'}</strong>! Silahkan isi detail produk dan foto. Listing langsung muncul di
            toko Revivo.
          </p>
        </header>

        <form className="jual-form" onSubmit={handleSubmit}>
          <section className="jual-form__section">
            <h2>Foto Produk</h2>
            <p className="jual-form__hint">Maks. 4 foto, format JPG/PNG, maks. 2,5 MB per file.</p>

            <label className="jual-upload">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotos}
                aria-label="Unggah foto produk"
              />
              <span>Pilih foto dari perangkat</span>
            </label>

            {previewUrls.length > 0 && (
              <div className="jual-preview-grid">
                {previewUrls.map((src, index) => (
                  <figure key={src}>
                    <img src={src} alt={`Pratinjau ${index + 1}`} />
                    <button type="button" onClick={() => removePhoto(index)}>
                      Hapus
                    </button>
                  </figure>
                ))}
              </div>
            )}
          </section>

          <section className="jual-form__section">
            <h2>Informasi Produk</h2>

            <label className="jual-field">
              <span>Nama produk</span>
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Contoh: ThinkPad T14 Bekas — Siap Kerja"
                required
              />
            </label>

            <label className="jual-field">
              <span>Deskripsi</span>
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                rows={4}
                placeholder="Ceritakan kondisi, minus, dan kelengkapan barang..."
                required
              />
            </label>

            <div className="jual-field-row">
              <label className="jual-field">
                <span>Kategori</span>
                <select name="category" value={form.category} onChange={updateField}>
                  {listingFormCategories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="jual-field">
                <span>Kondisi</span>
                <select name="badge" value={form.badge} onChange={updateField}>
                  {BADGE_OPTIONS.map((badge) => (
                    <option key={badge} value={badge}>
                      {badge}
                    </option>
                  ))}
                </select>
              </label>

              <label className="jual-field">
                <span>Skor kondisi</span>
                <select name="score" value={form.score} onChange={updateField}>
                  {SCORE_OPTIONS.map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="jual-form__section">
            <h2>Harga & Stok</h2>

            <div className="jual-field-row">
              <label className="jual-field">
                <span>Harga jual (Rp)</span>
                <input
                  type="number"
                  name="priceValue"
                  min="1000"
                  step="1000"
                  value={form.priceValue}
                  onChange={updateField}
                  placeholder="5320000"
                  required
                />
              </label>

              <label className="jual-field">
                <span>Harga coret (Rp)</span>
                <input
                  type="number"
                  name="oldPriceValue"
                  min="1000"
                  step="1000"
                  value={form.oldPriceValue}
                  onChange={updateField}
                  placeholder="5999999"
                />
              </label>

              <label className="jual-field">
                <span>Stok (unit)</span>
                <input
                  type="number"
                  name="stock"
                  min="1"
                  max="99"
                  value={form.stock}
                  onChange={updateField}
                  required
                />
              </label>
            </div>

            <label className="jual-field">
              <span>Lokasi penjual</span>
              <input
                name="location"
                value={form.location}
                onChange={updateField}
                placeholder="Contoh: Jakarta Selatan, DKI Jakarta"
                required
              />
            </label>
          </section>

          {error && (
            <p className="jual-form__error" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="jual-form__success" role="status">
              {success}
            </p>
          )}

          <div className="jual-form__actions">
            <button type="submit" className="button button--orange" disabled={isSubmitting}>
              {isSubmitting ? 'MENYIMPAN...' : 'PASANG PRODUK'}
            </button>
            <button type="button" className="button button--outline" onClick={() => onNavigate('shop')}>
              BATAL
            </button>
          </div>
        </form>
      </div>
    </StoreLayout>
  )
}

export default JualBarang