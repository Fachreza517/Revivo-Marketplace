import logoRevivo from "../assets/logo-revivo.svg"; 
import { paymentMethods } from "../data/localData.js";

// Import gambar-gambar logo pembayaran
import visaLogo from "../assets/gambar-visa.png";
import masterLogo from "../assets/gambar-mastercard.png";
import bcaLogo from "../assets/gambar-bca.png";
import ovoLogo from "../assets/gambar-ovo.png";
import gopayLogo from "../assets/gambar-gopay.png";

export const Footer = () => {
  // Mapping untuk menghubungkan teks dari localData ke file gambar
  const logoMap = {
    'VISA': visaLogo,
    'MASTER': masterLogo,
    'BCA': bcaLogo,
    'OVO': ovoLogo,
    'GOPAY': gopayLogo
  };

  const footerLinks = [
    { title: "Tentang", items: ["Tentang Kami", "Cara Kerja", "Blog", "Karir"] },
    { title: "Bantuan", items: ["Pusat Bantuan", "Hubungi Kami", "Lacak Pesanan", "FAQ"] },
    { title: "Kebijakan", items: ["Syarat & Ketentuan", "Kebijakan Privasi", "Kebijakan Pengembalian", "Keamanan"] }
  ];

  return (
    <footer className="w-full bg-revivo-blue-light text-white pt-16 pb-8 px-4 md:px-12 mt-auto font-arial">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Upper Grid Link Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-6 pb-12 border-b border-white/20">
          <div className="lg:col-span-2 flex flex-col items-start gap-4">
            <img src={logoRevivo} className="h-12 md:h-16 w-auto object-contain brightness-0 invert" alt="Footer Logo" />
            <p className="text-white/80 text-base md:text-lg max-w-sm font-medium leading-relaxed mt-2">
              Marketplace elektronik bekas terpercaya dengan garansi kualitas dan harga terbaik.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title} className="flex flex-col items-start gap-4">
              <h4 className="text-white text-xl font-bold tracking-wide">{group.title}</h4>
              <div className="flex flex-col gap-2.5">
                {group.items.map((link) => (
                  <span key={link} className="text-white/70 text-base hover:text-white cursor-pointer transition-colors font-medium">
                    {link}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Lower Meta/Payment Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-6">
          <p className="text-white/70 text-sm md:text-base order-2 md:order-1 text-center md:text-left">
            © 2026 Revivo. Hak Cipta Dilindungi.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 order-1 md:order-2">
            <span className="text-white/90 text-sm md:text-base font-bold">
              Metode Pembayaran:
            </span>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((name) => (
                <div 
                  key={name}
                  className="bg-white py-1.5 px-3 rounded-md shadow-sm border border-gray-200 flex items-center justify-center"
                >
                  <img 
                    src={logoMap[name]} 
                    alt={name} 
                    className="h-6 w-auto object-contain block" 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};