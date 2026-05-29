import gambarHeadphone from '../assets/gambar-headphone.jpg'
import gambarIpad from '../assets/gambar-ipad.png'
import avatarAmba from '../assets/gambar-amba.jpg'
import avatarGraham from '../assets/gambar-graham-coxon.jpg'
import avatarJim from '../assets/gambar-jim-morrison.jpg'
import avatarJyp from '../assets/gambar-JYP.jpg'
import gambarLenovo from '../assets/gambar-lenovo.png'
import gambarMacbook from '../assets/gambar-macbook.jpg'
import gambarMonitor from '../assets/gambar-monitor.jpg'
import gambarMonitorDell from '../assets/gambar-monitor-dell.jpg'
import gambarRog from '../assets/gambar-rog-zephyrus.jpeg'
import gambarSamsung from '../assets/gambar-samsung.png'
import { formatRupiah } from '../utils/formatPrice.js'
import { getUserListingProducts } from './userListings.js'

export const sellers = [
  {
    id: 'mas-amba',
    name: 'Mas Amba',
    shopName: 'Barang Second Mas Amba',
    avatar: avatarAmba,
    location: 'Ngawi Selatan, Jawa Timur',
  },
  {
    id: 'graham-coxon',
    name: 'Graham Coxon',
    shopName: 'Graham Coxon Store',
    avatar: avatarGraham,
    location: 'Bandung, Jawa Barat',
  },
  {
    id: 'jim-morrison',
    name: 'Jim Morrison',
    shopName: 'Jim Morrison Gadget',
    avatar: avatarJim,
    location: 'Surabaya, Jawa Timur',
  },
  {
    id: 'jyp',
    name: 'JYP',
    shopName: 'JYP Elektronik',
    avatar: avatarJyp,
    location: 'Sleman, DI Yogyakarta',
  },
]

export function getSellerById(id) {
  return sellers.find((seller) => seller.id === id) ?? null
}

/** Ongkir flat untuk ringkasan keranjang */
export const SHIPPING_FEE = 10000

export const shopCategories = [
  { id: 'all', label: 'Semua Produk' },
  { id: 'laptop', label: 'Laptop & Notebook' },
  { id: 'monitor', label: 'Monitor Desktop' },
  { id: 'phone', label: 'Handphone' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'audio', label: 'Audio' },
]

export const listingFormCategories = shopCategories.filter((item) => item.id !== 'all')

/** Gambar per kategori — pakai key spesifik atau fallback sesama tipe */
const productImages = {
  laptop: {
    macbook: gambarMacbook,
    lenovo: gambarLenovo,
    rog: gambarRog,
    default: gambarLenovo,
  },
  phone: {
    samsung: gambarSamsung,
    default: gambarSamsung,
  },
  tablet: {
    ipad: gambarIpad,
    default: gambarIpad,
  },
  monitor: {
    dell: gambarMonitorDell,
    lg: gambarMonitor,
    default: gambarMonitor,
  },
  audio: {
    headphone: gambarHeadphone,
    default: gambarHeadphone,
  },
}

function resolveImage(category, imageKey = 'default') {
  const group = productImages[category] ?? productImages.laptop
  return group[imageKey] ?? group.default ?? gambarLenovo
}

function buildGallery(category, imageKey, mainImage) {
  const group = productImages[category]
  if (!group) return [mainImage]

  const pool = [...new Set(Object.values(group))]
  const rest = pool.filter((src) => src !== mainImage)
  return [mainImage, ...rest].slice(0, 4)
}

function product({
  id,
  name,
  category,
  priceValue,
  oldPriceValue,
  badge,
  score,
  imageKey = 'default',
  sellerId = 'mas-amba',
  stock = 1,
  description = '',
  features = [],
  specs = [],
  similarIds = [],
}) {
  const image = resolveImage(category, imageKey)
  const seller = getSellerById(sellerId)

  return {
    id,
    name,
    category,
    priceValue,
    oldPriceValue,
    price: formatRupiah(priceValue),
    oldPrice: formatRupiah(oldPriceValue),
    badge,
    score,
    image,
    gallery: buildGallery(category, imageKey, image),
    stock,
    sellerId,
    seller,
    description,
    features,
    specs,
    similarIds,
  }
}

export const products = [
  product({
    id: 'macbook-pro-13-2019',
    name: 'MacBook Pro 13" 2019 Refurbish Space Grey',
    category: 'laptop',
    priceValue: 8750000,
    oldPriceValue: 12500000,
    badge: 'REFURBISH',
    score: '85%',
    imageKey: 'macbook',
    stock: 1,
    description:
      'Unit refurbish hasil quality check Revivo. Body rapi, layar mulus, charger original masih ikut. Cocok buat editing ringan sampai office daily.',
    features: [
      'Touch Bar dan Touch ID',
      'True Tone display',
      'Force Touch trackpad',
      'Stereo speakers dengan wider stereo sound',
      'Three-mic array',
      'Thunderbolt 3 (USB-C) ports',
    ],
    specs: [
      { label: 'Processor', value: 'Intel Core i5 Gen 8' },
      { label: 'RAM', value: '8GB DDR3' },
      { label: 'Storage', value: '256GB SSD' },
      { label: 'Display', value: '13.3" Retina Display' },
      { label: 'Graphics', value: 'Intel Iris Plus Graphics 645' },
      { label: 'Battery', value: 'Up to 10 hours' },
    ],
    similarIds: ['asus-rog-g14-2020', 'dell-xps-13-9310', 'lenovo-x1-carbon-gen-8', 'hp-spectre-x360-14'],
    sellerId: 'mas-amba',
  }),
  product({
    id: 'lenovo-thinkpad-t14-gen-3',
    name: 'ThinkPad T14 Gen 3 Bekas Minus Penggunaan',
    category: 'laptop',
    priceValue: 5320000,
    oldPriceValue: 5999999,
    badge: 'BEKAS',
    score: '90%',
    imageKey: 'lenovo',
    description: 'Laptop kantoran bekas terawat. Keyboard ThinkPad masih enak, baterai masih oke buat meeting sampai sore.',
    similarIds: ['macbook-pro-13-2019', 'lenovo-x1-carbon-gen-8', 'dell-xps-13-9310'],
    sellerId: 'graham-coxon',
  }),
  product({
    id: 'samsung-galaxy-a55-5g',
    name: 'Galaxy A55 5G Second Dijual karena BU',
    category: 'phone',
    priceValue: 3500000,
    oldPriceValue: 5999999,
    badge: 'BEKAS',
    score: '85%',
    imageKey: 'samsung',
    description: 'HP second mulus, kamera masih tajam, cocok buat konten atau daily driver tanpa nguras kantong.',
    similarIds: ['iphone-12-pro-max-256gb'],
    sellerId: 'jyp',
  }),
  product({
    id: 'ipad-pro-97-wifi',
    name: 'iPad Pro 9.7" Refurbish Abu-abu Original Kamboja',
    category: 'tablet',
    priceValue: 5320000,
    oldPriceValue: 5999999,
    badge: 'REFURBISH',
    score: '90%',
    imageKey: 'ipad',
    description: 'Tablet refurbish ringan buat baca, gambar, atau second display. Wifi-only, siap pakai.',
    similarIds: ['macbook-pro-13-2019'],
    sellerId: 'jim-morrison',
  }),
  product({
    id: 'iphone-12-pro-max-256gb',
    name: 'iPhone 12 Pro Max 256GB Unit Refurbish Gold IMEI Aman',
    category: 'phone',
    priceValue: 10999000,
    oldPriceValue: 18999000,
    badge: 'REFURBISH',
    score: '90%',
    imageKey: 'samsung',
    description: 'Flagship refurbish dengan storage lega. Kamera masih juara, body ada baret tipis tapi fungsi normal semua.',
    similarIds: ['samsung-galaxy-a55-5g'],
    sellerId: 'jyp',
  }),
  product({
    id: 'sony-wh-1000xm4',
    name: 'Sony WH-1000XM4 Bekas Suara Jernih Bass-Boosted',
    category: 'audio',
    priceValue: 2450000,
    oldPriceValue: 4299000,
    badge: 'BEKAS',
    score: '92%',
    imageKey: 'headphone',
    description: 'Headphone second perawatan apik. ANC masih kuat, busa earpad masih empuk.',
    similarIds: [],
    sellerId: 'graham-coxon',
  }),
  product({
    id: 'asus-rog-g14-2020',
    name: 'ROG Zephyrus G14 Bekas Gamer',
    category: 'laptop',
    priceValue: 11200000,
    oldPriceValue: 18999000,
    badge: 'BEKAS',
    score: '90%',
    imageKey: 'rog',
    description: 'Laptop gaming second yang masih kencang. Sudah dibersihkan dan tes stress singkat di Revivo.',
    similarIds: ['macbook-pro-13-2019', 'dell-xps-13-9310'],
    sellerId: 'jim-morrison',
  }),
  product({
    id: 'dell-xps-13-9310',
    name: 'Dell XPS 13 Refurbish Silver Recommended buat Kuliah',
    category: 'laptop',
    priceValue: 9450000,
    oldPriceValue: 15999000,
    badge: 'REFURBISH',
    score: '88%',
    imageKey: 'macbook',
    description: 'Ultrabook refurbish tipis dan ringan. Layar tajam, cocok dibawa bolak-balik kampus.',
    similarIds: ['macbook-pro-13-2019', 'lenovo-x1-carbon-gen-8'],
    sellerId: 'mas-amba',
  }),
  product({
    id: 'lenovo-x1-carbon-gen-8',
    name: 'ThinkPad X1 Carbon Gen 8 Second Murah',
    category: 'laptop',
    priceValue: 10500000,
    oldPriceValue: 18500000,
    badge: 'BEKAS',
    score: '86%',
    imageKey: 'lenovo',
    description: 'Executive laptop bekas yang bobotnya ringan. Port lengkap, performa office masih gesit.',
    similarIds: ['lenovo-thinkpad-t14-gen-3', 'dell-xps-13-9310'],
    sellerId: 'graham-coxon',
  }),
  product({
    id: 'hp-spectre-x360-14',
    name: 'HP Spectre x360 Refurbish 2021 Layar Sentuh',
    category: 'laptop',
    priceValue: 12750000,
    oldPriceValue: 19999000,
    badge: 'REFURBISH',
    score: '91%',
    imageKey: 'lenovo',
    description: 'Convertible refurbish cakep buat presentasi atau sketsa ringan. Engsel masih kokoh.',
    similarIds: ['macbook-pro-13-2019', 'asus-rog-g14-2020'],
    sellerId: 'jim-morrison',
  }),
  product({
    id: 'lg-ultrawide-34',
    name: 'Monitor LG UltraWide Bekas Kualitas Mulus',
    category: 'monitor',
    priceValue: 4200000,
    oldPriceValue: 6500000,
    badge: 'BEKAS',
    score: '87%',
    imageKey: 'lg',
    description: 'Monitor ultrawide second buat coding atau editing. Panel masih bersih, minim dead pixel.',
    similarIds: ['dell-ultrasharp-27'],
    sellerId: 'jyp',
  }),
  product({
    id: 'dell-ultrasharp-27',
    name: 'Dell UltraSharp 27" Refurbish 4K',
    category: 'monitor',
    priceValue: 5100000,
    oldPriceValue: 8200000,
    badge: 'REFURBISH',
    score: '89%',
    imageKey: 'dell',
    description: 'Monitor 4K refurbish buat desain atau foto. Sudah kalibrasi dasar sebelum dikirim.',
    similarIds: ['lg-ultrawide-34'],
    sellerId: 'mas-amba',
  }),
]

export function getAllProducts() {
  return [...getUserListingProducts(), ...products]
}

export function getProductById(id) {
  return getAllProducts().find((item) => item.id === id) ?? null
}

export function getProductsByIds(ids = []) {
  return ids.map((id) => getProductById(id)).filter(Boolean)
}

export function getCategoryLabel(categoryId) {
  const match = shopCategories.find((item) => item.id === categoryId)
  return match?.label ?? categoryId
}

export function countProductsByCategory(categoryId) {
  const all = getAllProducts()
  if (categoryId === 'all') return all.length
  return all.filter((item) => item.category === categoryId).length
}

export const categories = [
  { label: 'Laptop dan Notebook', icon: 'laptop', shopId: 'laptop' },
  { label: 'Monitor Desktop', icon: 'monitor', shopId: 'monitor' },
  { label: 'Handphone', icon: 'phone', shopId: 'phone' },
  { label: 'Audio', icon: 'audio', shopId: 'audio' },
]

export const footerGroups = [
  { title: 'Tentang', links: ['Tentang Kami', 'Cara Kerja', 'Blog', 'Karir'] },
  { title: 'Bantuan', links: ['Pusat Bantuan', 'Hubungi Kami', 'Lacak Pesanan', 'FAQ'] },
  {
    title: 'Kebijakan',
    links: ['Syarat & Ketentuan', 'Kebijakan Privasi', 'Kebijakan Pengembalian', 'Keamanan'],
  },
]

export const paymentMethods = ['VISA', 'MASTER', 'BCA', 'OVO', 'GOPAY']

export const chatThreads = [
  {
    id: 'mas-amba',
    name: sellers[0].shopName,
    avatar: sellers[0].avatar,
    location: sellers[0].location,
    unread: 2,
    online: true,
    preview: 'Baik, saya kirim foto kondisinya ya...',
    time: '10:30',
    messages: [
      { id: 'm1', sender: 'me', text: 'Halo, apakah MacBook-nya masih tersedia?', time: '10:15' },
      { id: 'm2', sender: 'them', text: 'Halo! Masih tersedia pak. Kondisi 85% sangat bagus.', time: '10:16' },
      { id: 'm3', sender: 'me', text: 'Boleh minta foto kondisi fisiknya?', time: '10:20' },
      { id: 'm4', sender: 'them', text: 'Baik, saya kirim foto kondisinya ya...', time: '10:30' },
    ],
  },
  {
    id: 'graham-coxon',
    name: sellers[1].shopName,
    avatar: sellers[1].avatar,
    location: sellers[1].location,
    unread: 0,
    online: false,
    preview: 'Harga nett ya pak',
    time: 'Kemarin',
    messages: [{ id: 'm1', sender: 'them', text: 'Harga nett ya pak', time: 'Kemarin' }],
  },
  {
    id: 'jim-morrison',
    name: sellers[2].shopName,
    avatar: sellers[2].avatar,
    location: sellers[2].location,
    unread: 0,
    online: true,
    preview: 'Unit masih ready, bisa COD area Surabaya',
    time: '09:12',
    messages: [
      {
        id: 'm1',
        sender: 'them',
        text: 'Unit masih ready, bisa COD area Surabaya kalau mau.',
        time: '09:12',
      },
    ],
  },
  {
    id: 'jyp',
    name: sellers[3].shopName,
    avatar: sellers[3].avatar,
    location: sellers[3].location,
    unread: 1,
    online: true,
    preview: 'Bisa nego tipis kalau ambil hari ini',
    time: '11:05',
    messages: [
      { id: 'm1', sender: 'them', text: 'Bisa nego tipis kalau ambil hari ini', time: '11:05' },
    ],
  },
]

export function getChatThreadById(id) {
  return chatThreads.find((thread) => thread.id === id) ?? null
}
