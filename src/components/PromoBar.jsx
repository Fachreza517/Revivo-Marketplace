export const PromotionBar = () => {
  return (
    <div className="w-full bg-[#3D4F97] text-white select-none">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between py-3 px-4 md:px-12 gap-4">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 flex-1">
          <div className="bg-[#FE8A24] py-1.5 px-6 rounded-sm">
            <span className="text-[#021D6B] text-xl md:text-2xl font-black tracking-wider">
              FLASH SALE
            </span>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap justify-center">
            <span className="text-white text-m md:text-l font-normal">Diskon hingga</span>
            <span className="text-[#FE8A24] text-4xl md:text-5xl font-normal font-audiowide leading-none">90%</span>
            <span className="text-white text-m md:text-l font-normal">untuk produk pilihan!</span>
          </div>
        </div>
        <button className="w-full md:w-auto bg-[#FE8A24] py-3 px-8 border-4 border-solid border-[#021D6B] font-y2k text-[#021D6B] text-lg font-black tracking-wide hover:bg-white transition-all active:scale-95 whitespace-nowrap">
          Belanja Sekarang
        </button>
      </div>
    </div>
  );
};
