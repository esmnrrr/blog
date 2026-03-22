import { db } from './firebase';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import Hero from '@/components/Hero'; 
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getDramas() {
  const querySnapshot = await getDocs(collection(db, "dramas"));
  
  const dramasData = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : 0
    };
  });

  dramasData.sort((a: any, b: any) => b.createdAt - a.createdAt);
  return dramasData;
}

async function getQuote() {
  try {
    const docRef = doc(db, "settings", "homepage");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    // Firebase yetki vermezse veya dosya yoksa siteyi çökertme, boş dön!
    console.error("Söz çekilirken güvenlik duvarına takıldı:", error);
    return null; 
  }
}

async function getActors() {
  try {
    const querySnapshot = await getDocs(collection(db, "actors"));
    const actorsData = querySnapshot.docs.map((doc) => ({
      name: doc.id, // ID olarak ismi kaydetmiştik
      ...doc.data()
    }));
    return actorsData;
  } catch (error) {
    console.error("Oyuncular çekilemedi:", error);
    return [];
  }
}

export default async function Home() {
  const dramas: any[] = await getDramas();
  const quote = await getQuote();
  const actors = await getActors();

  // 1. EDİTÖRÜN SEÇİMİ 
  const editorPick: any = dramas.find((d: any) => d.isEditorPick) || 
    [...dramas].sort((a: any, b: any) => parseFloat(b.ratingAvg || "0") - parseFloat(a.ratingAvg || "0"))[0];

  // 2. SON EKLENENLER 
  const latestDramas = dramas.slice(0, 10);

  // 3. TOP 10 TREND 
  const trendingDramas = [...dramas]
    .sort((a: any, b: any) => parseFloat(b.ratingAvg || "0") - parseFloat(a.ratingAvg || "0"))
    .slice(0, 10);

  // 4. YAKINDA GELECEKLER
  const comingSoonDramas = dramas.filter((d: any) => {
    const yearStr = String(d.releaseYear || "");
    return yearStr.toLowerCase().includes('yakında') || parseInt(yearStr) > 2026;
  });

  // --- KART TASARIMI ---
  const DramaCard = ({ drama, rank, isComingSoon }: { drama: any, rank?: number, isComingSoon?: boolean }) => (
    <Link 
      href={`/drama/${drama.id}`} 
      className="flex-none w-40 h-60 md:w-48 md:h-72 snap-start group block relative bg-gray-800 rounded-xl overflow-hidden hover:scale-105 hover:z-10 transition-all duration-300 shadow-lg cursor-pointer border border-gray-700 hover:border-pink-500"
    >
      {/* Sıralama Numarası (Sadece Top 10 için) */}
      {rank && (
        <span className="absolute top-0 left-0 z-20 bg-yellow-500/90 backdrop-blur-sm text-gray-900 font-black text-lg px-3 py-1 rounded-br-lg shadow-xl">
          #{rank}
        </span>
      )}
      
      <div className="w-full h-full bg-gray-700 relative">
         {drama?.posterImage || drama?.backdropImage ? (
           <img src={drama.posterImage || drama.backdropImage} alt={drama?.title} className="w-full h-full object-cover" />
         ) : (
           <div className="flex items-center justify-center h-full text-gray-500 text-sm">Görsel Yok</div>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
         
         {/* Yakında Etiketi */}
         {isComingSoon && (
           <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition flex items-center justify-center">
              <span className="bg-blue-600/90 text-white px-4 py-1.5 rounded-full font-bold text-sm backdrop-blur-md shadow-lg border border-blue-400">Yakında</span>
           </div>
         )}
      </div>
      
      {/* Kartın Altındaki Yazılar */}
      <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform">
        <h3 className="font-bold text-sm md:text-base text-white truncate drop-shadow-md">{drama?.title}</h3>
        <div className="flex justify-between items-center text-xs text-gray-300 mt-1">
          <span className="truncate mr-2">{isComingSoon ? (drama?.genre || "Dizi") : drama?.releaseYear}</span>
          {!isComingSoon && <span className="text-yellow-400 font-bold shrink-0">★ {drama?.ratingAvg}</span>}
        </div>
      </div>
    </Link>
  );

  // --- OYUNCU KARTI TASARIMI ---
  const ActorCard = ({ actor }: { actor: any }) => (
    <Link 
      href={`/actor/${encodeURIComponent(actor.name)}`} 
      className="flex-none w-40 h-60 md:w-48 md:h-72 snap-start group block relative bg-gray-800 rounded-xl overflow-hidden hover:scale-105 hover:z-10 transition-all duration-300 shadow-lg cursor-pointer border border-gray-700 hover:border-blue-500"
    >
      <div className="w-full h-full bg-gray-700 relative">
         {actor?.photoURL ? (
           <img src={actor.photoURL} alt={actor?.name} className="w-full h-full object-cover" />
         ) : (
           <div className="flex items-center justify-center h-full text-gray-500 text-sm">Görsel Yok</div>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform">
        <h3 className="font-bold text-sm md:text-base text-white truncate drop-shadow-md">{actor?.name}</h3>
        {actor?.birthDate && (
           <span className="text-xs text-gray-300 mt-1 block truncate">
             {new Date(actor.birthDate).getFullYear()}
           </span>
        )}
      </div>
    </Link>
  );

  return (
    <main className="min-h-screen bg-gray-900 text-white pb-20 overflow-x-hidden">
      
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* HERO SECTION */}
      <Hero dramas={dramas.slice(0, 5)} />

      {/* HAFTANIN SÖZÜ ŞERİDİ */}
      {quote && quote.quoteText && (
        <div className="container mx-auto px-4 md:px-12 mt-8 mb-2">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-purple-500/30 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center gap-4 md:gap-6 relative overflow-hidden group hover:border-purple-500/60 transition-colors">
            
            {/* Dekoratif Tırnak */}
            <div className="absolute -left-2 -top-4 text-8xl text-purple-500/10 font-serif select-none pointer-events-none">"</div>

            {/* Sol/Üst Kısım: Rozet */}
            <div className="shrink-0 z-10">
              <span className="bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-sm">✨</span> Haftanın Repliği
              </span>
            </div>

            {/* Orta: Söz */}
            <p className="flex-1 text-center md:text-left text-gray-300 italic text-sm md:text-base leading-relaxed z-10">
              "{quote.quoteText}"
            </p>

            {/* Sağ/Alt: Yazar */}
            <div className="shrink-0 flex items-center gap-2 z-10 mt-2 md:mt-0">
              <div className="w-6 h-[1px] bg-pink-500/50 hidden md:block"></div>
              <span className="text-pink-400 font-bold text-sm drop-shadow-md whitespace-nowrap">
                — {quote.quoteAuthor}
              </span>
            </div>
            
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 md:px-12 mt-12 space-y-12">
        
        {/* SON EKLENENLER */}
        {latestDramas.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-2">
              <span className="text-3xl">🆕</span>
              <h2 className="text-2xl font-bold text-pink-500 tracking-wide">Son Eklenenler</h2>
            </div>
            <div className="flex overflow-x-auto gap-4 md:gap-6 pt-4 pb-8 snap-x snap-mandatory hide-scroll">
              {latestDramas.map((drama: any) => (
                <DramaCard key={drama.id} drama={drama} />
              ))}
            </div>
          </section>
        )}

        {/* EDİTÖRÜN SEÇİMİ */}
        {editorPick && (
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-2">
              <span className="text-3xl">💎</span>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 tracking-wide">
                Haftanın Favorisi
              </h2>
            </div>
            <Link href={`/drama/${editorPick?.id}`} className="group relative flex flex-col md:flex-row w-full bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 hover:border-purple-500 transition-all duration-300 min-h-[300px]">
              <div className="w-full md:w-5/12 h-64 md:h-auto relative bg-gray-700 shrink-0">
                <img src={editorPick?.posterImage || editorPick?.backdropImage} alt={editorPick?.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-gray-900 to-transparent" />
              </div>
              <div className="w-full md:w-7/12 p-6 md:p-10 flex flex-col justify-center relative z-10">
                <h3 className="text-3xl md:text-4xl font-black mb-2 text-white">{editorPick?.title}</h3>
                <div className="flex gap-4 items-center mb-4">
                  <span className="text-yellow-400 font-bold bg-black/30 px-2 py-1 rounded">⭐ {editorPick?.ratingAvg}</span>
                  <span className="text-gray-400 text-sm">{editorPick?.releaseYear}</span>
                  <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-xs font-bold uppercase">{editorPick?.genre}</span>
                </div>
                <p className="text-gray-300 line-clamp-3 mb-6 leading-relaxed">
                  {editorPick?.reviewIntro || "Editörümüzün bu haftaki favori dizisi! Hemen tıkla ve incelemeyi oku."}
                </p>
                <div className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-lg font-bold transition w-max shadow-lg shadow-purple-500/20">
                  Diziyi İncele
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* TREND */}
        {trendingDramas.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-2">
              <span className="text-3xl">🔥</span>
              <h2 className="text-2xl font-bold text-yellow-500 tracking-wide">Trendler</h2>
            </div>
            <div className="flex overflow-x-auto gap-4 md:gap-6 pt-4 pb-8 snap-x snap-mandatory hide-scroll">
              {trendingDramas.map((drama: any, idx: number) => (
                <DramaCard key={drama.id} drama={drama} rank={idx + 1} />
              ))}
            </div>
          </section>
        )}

        {/* YAKINDA GELECEKLER */}
        {comingSoonDramas.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-2">
              <span className="text-3xl">⏳</span>
              <h2 className="text-2xl font-bold text-blue-400 tracking-wide">Yakında Gelecekler</h2>
            </div>
            <div className="flex overflow-x-auto gap-4 md:gap-6 pt-4 pb-8 snap-x snap-mandatory hide-scroll">
              {comingSoonDramas.map((drama: any) => (
                <DramaCard key={drama.id} drama={drama} isComingSoon={true} />
              ))}
            </div>
          </section>
        )}

        {/* POPÜLER OYUNCULAR */}
        {actors && actors.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-2">
              <span className="text-3xl">🌟</span>
              <h2 className="text-2xl font-bold text-blue-400 tracking-wide">Oyuncular</h2>
            </div>
            <div className="flex overflow-x-auto gap-4 md:gap-6 pt-4 pb-8 snap-x snap-mandatory hide-scroll">
              {actors.map((actor: any, idx: number) => (
                <ActorCard key={idx} actor={actor} />
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}