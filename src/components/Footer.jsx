import logoRevivo from "../assets/logo-revivo.svg"; 

export const Footer = () => {
  const footerLinks = [
    { title: "Tentang", items: ["Tentang Kami", "Cara Kerja", "Blog", "Karir"] },
    { title: "Bantuan", items: ["Pusat Bantuan", "Hubungi Kami", "Lacak Pesanan", "FAQ"] },
    { title: "Kebijakan", items: ["Syarat & Ketentuan", "Kebijakan Privasi", "Kebijakan Pengembalian", "Keamanan"] }
  ];

  const paymentMethods = ["VISA", "MASTER", "BCA", "OVO", "GOPAY"];

  return (
    <footer className="w-full bg-revivo-blue-light text-white pt-16 pb-8 px-4 md:px-12 mt-auto font-arial">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Upper Grid Link Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-6 pb-12 border-b border-white/20">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col items-start gap-4">
            <img
              src={logoRevivo} 
              className="h-12 md:h-16 w-auto object-contain brightness-0 invert"
              alt="Footer Logo"
            />
            <p className="text-white/80 text-base md:text-lg max-w-sm font-medium leading-relaxed mt-2">
              Marketplace elektronik bekas terpercaya dengan garansi kualitas dan harga terbaik.
            </p>
          </div>

          {/* Links Generator Map */}
          {footerLinks.map((group) => (
            <div key={group.title} className="flex flex-col items-start gap-4">
              <h4 className="text-white text-xl font-bold tracking-wide">{group.title}</h4>
              <div className="flex flex-col gap-2.5">
                {group.items.map((link) => (
                  <span 
                    key={link} 
                    className="text-white/70 text-base hover:text-white cursor-pointer transition-colors font-medium"
                  >
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
          
          {/* Payment Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 order-1 md:order-2">
            <span className="text-white/90 text-sm md:text-base font-bold">
              Metode Pembayaran:
            </span>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((brand) => (
                <div 
                  key={brand}
                  className="bg-white py-1.5 px-4 rounded-md shadow-sm select-none border border-gray-200"
                >
                  <span className="text-revivo-blue text-xs font-normal font-audiowide tracking-widest">
                    {brand}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
