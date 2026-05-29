import { formatRupiah } from '../utils/formatPrice.js'

export const LISTINGS_STORAGE_KEY = 'revivo-user-listings'

const EMPTY_FEATURES = []
const EMPTY_SPECS = []

export function loadRawListings() {
  try {
    const raw = window.localStorage.getItem(LISTINGS_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveRawListing(listing) {
  const current = loadRawListings()
  window.localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify([listing, ...current]))
  return listing
}

function buildSellerFromUser(user, location) {
  const email = user?.email ?? 'penjual@revivo.id'
  const username = user?.username ?? 'Penjual Revivo'

  return {
    id: `user-${email}`,
    name: username,
    shopName: `Toko ${username}`,
    avatar: user?.avatar ?? null,
    location: location || 'Indonesia',
  }
}

export function listingToProduct(raw) {
  const image = raw.images?.[0] ?? ''
  const gallery = raw.images?.length ? raw.images : [image]
  const seller = buildSellerFromUser(
    { email: raw.sellerEmail, username: raw.sellerName, avatar: raw.sellerAvatar },
    raw.location,
  )

  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    priceValue: raw.priceValue,
    oldPriceValue: raw.oldPriceValue,
    price: formatRupiah(raw.priceValue),
    oldPrice: formatRupiah(raw.oldPriceValue),
    badge: raw.badge,
    score: raw.score,
    image,
    gallery,
    stock: raw.stock,
    sellerId: seller.id,
    seller,
    description: raw.description,
    features: raw.features ?? EMPTY_FEATURES,
    specs: raw.specs ?? EMPTY_SPECS,
    similarIds: [],
    isUserListing: true,
    listedAt: raw.listedAt,
  }
}

export function getUserListingProducts() {
  return loadRawListings().map(listingToProduct)
}

export function readImageFiles(files) {
  const list = Array.from(files).slice(0, 4)

  return Promise.all(
    list.map(
      (file) =>
        new Promise((resolve, reject) => {
          if (!file.type.startsWith('image/')) {
            reject(new Error('File harus berupa gambar.'))
            return
          }
          if (file.size > 2_500_000) {
            reject(new Error(`"${file.name}" terlalu besar. Maksimal 2,5 MB per foto.`))
            return
          }
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () => reject(new Error('Gagal membaca foto.'))
          reader.readAsDataURL(file)
        }),
    ),
  )
}

export function createListingFromForm(form, user) {
  const id = `listing-${Date.now()}`
  const priceValue = Number(form.priceValue)
  const oldPriceValue = Number(form.oldPriceValue) || priceValue
  const stock = Math.max(1, Number(form.stock) || 1)

  return {
    id,
    sellerEmail: user.email,
    sellerName: user.username,
    sellerAvatar: user.avatar ?? null,
    name: form.name.trim(),
    description: form.description.trim(),
    category: form.category,
    badge: form.badge,
    score: form.score,
    priceValue,
    oldPriceValue: Math.max(oldPriceValue, priceValue),
    stock,
    location: form.location.trim(),
    images: form.images,
    listedAt: new Date().toISOString(),
  }
}
