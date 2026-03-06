export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-10 mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center">
        
        {/* Logo ve Kısa Açıklama */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 tracking-tight mb-2">
            HIKAMSE
          </h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Asya dizilerinin büyüleyici dünyasına açılan kapın. En sevdiğin dizileri keşfet, incele ve kendi kütüphaneni oluştur.
          </p>
        </div>

        {/* Sosyal Medya İkonları (Minimal Çizgi Tasarım - Asla Bozulmaz) */}
        <div className="flex space-x-6 mb-8">
          
          {/* Instagram */}
          <a 
            href="https://www.instagram.com/hikamse/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-400 hover:text-pink-500 transition-colors transform hover:scale-110"
          >
            {/* Genişlik ve yükseklik ZORLA 28px yapıldı */}
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>

          {/* YouTube */}
          <a 
            href="https://www.youtube.com/@hikamse" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-400 hover:text-red-500 transition-colors transform hover:scale-110"
          >
            {/* Genişlik ve yükseklik ZORLA 32px yapıldı */}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
          </a>
        </div>

        {/* Telif Hakkı */}
        <div className="text-center">
          <p className="text-gray-500 text-xs font-medium">
            &copy; {new Date().getFullYear()} HIKAMSE. Tüm hakları saklıdır.
          </p>
        </div>
        
      </div>
    </footer>
  );
}