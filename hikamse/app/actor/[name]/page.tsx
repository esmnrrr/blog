import { db } from '@/app/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

// URL'den gelen oyuncu ismini alıyoruz (params.name)
export default async function ActorPage({ params }: { params: { name: string } }) {
  // Linklerdeki %20 gibi boşluk karakterlerini normal metne çeviriyoruz
  const actorName = decodeURIComponent(params.name);

  // 1. Veritabanındaki TÜM dizileri çek
  const querySnapshot = await getDocs(collection(db, "dramas"));
  
  // 2. SADECE bu oyuncunun oynadığı dizileri filtrele (cast içinde arıyoruz)
  const actorDramas = querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() as any }))
    .filter(drama => {
      const castString = drama.cast || "";
      return castString.toLowerCase().includes(actorName.toLowerCase());
    });

  // --- ANA SAYFADAKİ KUSURSUZ VE SABİT KART TASARIMI ---
  const DramaCard = ({ drama }: { drama: any }) => (
    <Link 
      href={`/drama/${drama.id}`} 
      className="flex-none w-40 h-60 md:w-48 md:h-72 snap-start group block relative bg-gray-800 rounded-xl overflow-hidden hover:scale-105 hover:z-10 transition-all duration-300 shadow-lg cursor-pointer border border-gray-700 hover:border-pink-500"
    >
      <div className="w-full h-full bg-gray-700 relative">
         {drama?.posterImage || drama?.backdropImage ? (
           <img src={drama.posterImage || drama.backdropImage} alt={drama?.title} className="w-full h-full object-cover" />
         ) : (
           <div className="flex items-center justify-center h-full text-gray-500 text-sm">Görsel Yok</div>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform">
        <h3 className="font-bold text-sm md:text-base text-white truncate drop-shadow-md">{drama?.title}</h3>
        <div className="flex justify-between items-center text-xs text-gray-300 mt-1">
          <span className="truncate mr-2">{drama?.releaseYear}</span>
          <span className="text-yellow-400 font-bold shrink-0">★ {drama?.ratingAvg}</span>
        </div>
      </div>
    </Link>
  );

  return (
    <main className="min-h-screen bg-gray-900 text-white pb-20 pt-10">
      <div className="container mx-auto px-6 md:px-12">
        
        {/* OYUNCU PROFİL KARTI (VİTRİN) */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-pink-500/30 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-8 mb-12 relative overflow-hidden">
          {/* Arka plan deseni */}
          <div className="absolute -right-10 -top-10 text-[200px] text-pink-500/5 select-none pointer-events-none font-black">
            {actorName.charAt(0)}
          </div>
          
          <div className="shrink-0 relative z-10">
            {/* Şimdilik otomatik avatar oluşturuyoruz (UI-Avatars) */}
            <img 
              src={`https://ui-avatars.com/api/?name=${actorName}&background=db2777&color=fff&size=200&bold=true`} 
              alt={actorName} 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.4)] object-cover"
            />
          </div>
          
          <div className="text-center md:text-left relative z-10">
            <span className="bg-pink-900/40 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
              Güney Koreli Oyuncu
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4">
              {actorName}
            </h1>
            <p className="text-gray-400 max-w-2xl leading-relaxed text-sm md:text-base">
              HIKAMSE veritabanında <b>{actorName}</b> isimli oyuncunun yer aldığı toplam <strong className="text-pink-500">{actorDramas.length}</strong> dizi/film kaydı bulundu.
            </p>
          </div>
        </div>

        {/* OYUNCUNUN DİZİLERİ (GRİD TASARIM) */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-3">
            <span className="text-3xl">🎬</span> Filmografi (Rol Aldığı Yapımlar)
          </h2>
          
          {actorDramas.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {actorDramas.map((drama: any) => (
                <DramaCard key={drama.id} drama={drama} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-xl p-10 text-center border border-gray-700">
              <span className="text-4xl mb-3 block">🕵️‍♂️</span>
              <h3 className="text-xl font-bold text-gray-300 mb-2">Henüz Kayıt Yok</h3>
              <p className="text-gray-500">Sitemizde bu oyuncuya ait bir yapım henüz eklenmemiş gibi görünüyor.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}