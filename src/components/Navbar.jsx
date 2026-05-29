import logoRevivo from "../assets/logo-revivo.svg"; 

export const Navbar = ({ value, onChange }) => {
  const menus = ["BELANJA", "OBROLAN", "JUAL PRODUK", "MASUK"];

  return (
    <div className="w-full bg-revivo-gray border-b border-gray-400">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between pt-4 pb-6 px-4 md:px-10 gap-4 lg:gap-8">
        
        {/* Logo Area */}
        <div className="flex justify-center lg:justify-start shrink-0">
          <img
            src={logoRevivo} 
            className="h-16 md:h-20 w-auto object-contain"
            alt="Revivo Logo"
          />
        </div>

        {/* Search Bar Container */}
        <div className="flex items-center bg-white pl-4 rounded-xl border border-solid border-black overflow-hidden flex-1 max-w-2xl mx-auto lg:mx-0 w-full font-arial">
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/o85xxu71tD/j2p7u7wh_expires_30_days.png" 
            className="w-5 h-5 shrink-0 opacity-70"
            alt="Search Icon"
          />
          <input
            type="text"
            placeholder="Cari produk..."
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="text-revivo-blue bg-transparent text-base md:text-lg w-full py-3 px-3 border-0 outline-none font-medium"
          />
          <button className="bg-revivo-orange py-4 px-8 border-l border-solid border-black font-audiowide text-revivo-blue text-sm md:text-base font-normal tracking-wider hover:bg-[#e0751f] transition active:bg-[#c26114]">
            CARI!!
          </button>
        </div>

        {/* Navigation Menus */}
        <div className="grid grid-cols-2 sm:flex sm:items-center bg-revivo-card p-1 rounded-xl border border-solid border-black w-full lg:w-auto gap-1 sm:gap-0">
          {menus.map((menu) => (
            <button 
              key={menu} 
              className="py-3 px-4 md:px-6 text-center font-audiowide text-black text-sm md:text-base font-normal tracking-wide rounded-lg hover:bg-revivo-blue-light hover:text-white transition active:scale-95 whitespace-nowrap"
            >
              {menu}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
