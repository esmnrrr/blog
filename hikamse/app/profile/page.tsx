"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/app/firebase";
import { collection, getDocs, collectionGroup, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [library, setLibrary] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]); // YENİ: Yorumlar için state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // 1. KULLANICININ İZLEME KÜTÜPHANESİNİ ÇEK
        const q = collection(db, "users", currentUser.uid, "library");
        const querySnapshot = await getDocs(q);
        
        const userDramas = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLibrary(userDramas);

        // 2. KULLANICININ TÜM YORUMLARINI ÇEK (Sihirli Kısım)
        try {
          // Bütün 'comments' alt klasörlerinde 'userId'si benim olanları bul!
          const commentsQuery = query(collectionGroup(db, "comments"), where("userId", "==", currentUser.uid));
          const commentsSnapshot = await getDocs(commentsQuery);
          
          const userComments = commentsSnapshot.docs.map(doc => ({
            id: doc.id,
            dramaId: doc.ref.parent.parent?.id, // Yorumun yapıldığı dizinin ID'sini gizlice alıyoruz ki link verebilelim
            ...doc.data()
          }));

          // Yorumları en yeniden en eskiye sırala
          userComments.sort((a: any, b: any) => {
            const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return timeB - timeA;
          });

          setComments(userComments);
        } catch (error) {
          console.error("Yorumlar çekilirken hata:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-white text-center mt-20 font-bold text-xl">Profilin Yükleniyor... ⏳</div>;
  if (!user) return <div className="text-white text-center mt-20 font-bold text-xl">Bu sayfayı görmek için lütfen giriş yapın. 🛑</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 pb-20">
      <div className="container mx-auto max-w-6xl">
        
        {/* PROFİL KARTI (Üst Kısım) */}
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 bg-gray-800 p-8 rounded-xl mb-12 shadow-lg border border-gray-700">
          <img 
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}&background=db2777&color=fff`} 
            alt="Profil" 
            className="w-24 h-24 rounded-full border-4 border-pink-500 shadow-xl object-cover" 
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <p className="text-gray-400">{user.email}</p>
            <div className="mt-3 flex gap-2 justify-center md:justify-start">
              <span className="bg-pink-600/20 text-pink-400 text-sm font-bold px-4 py-1.5 rounded-full inline-block">
                🎬 {library.length} Dizi Kayıtlı
              </span>
              <span className="bg-purple-600/20 text-purple-400 text-sm font-bold px-4 py-1.5 rounded-full inline-block">
                💬 {comments.length} Yorum Yaptı
              </span>
            </div>
          </div>
        </div>

        {/* --- DİZİ KÜTÜPHANESİ --- */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-2">
          <h2 className="text-2xl font-bold text-pink-500 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
            İzleme Listem
          </h2>
        </div>
        
        {library.length === 0 ? (
          <div className="text-center text-gray-400 py-16 bg-gray-800 rounded-lg border border-dashed border-gray-600 mb-12">
            <p className="text-lg mb-2">Henüz listene hiçbir dizi eklemedin.</p>
            <Link href="/" className="text-pink-500 hover:text-pink-400 font-bold transition">Ana sayfaya dön ve dizi keşfet!</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-16">
            {library.map((drama) => (
              <Link href={`/drama/${drama.id}`} key={drama.id} className="group">
                <div className="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group-hover:border-pink-500 transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-pink-500/20">
                  <div className="relative h-64 w-full bg-gray-700">
                    <img 
                      src={drama.posterImage || drama.backdropImage || "https://via.placeholder.com/300x450"} 
                      alt={drama.title} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition" />
                  </div>
                  
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <h3 className="font-bold text-sm text-white line-clamp-2">{drama.title}</h3>
                    
                    {/* STATÜ VE PUAN KISMI */}
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-[11px] text-pink-400 font-semibold bg-pink-900/30 px-2 py-1 rounded truncate max-w-[60%]">
                        {drama.status}
                      </span>
                      {/* Puan 0'dan büyükse Yıldızı Göster */}
                      {drama.rating > 0 && (
                        <span className="text-xs font-bold text-yellow-500 bg-gray-900 px-2 py-1 rounded border border-yellow-500/30">
                          ⭐ {drama.rating}
                        </span>
                      )}
                    </div>
                  </div>
                  
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* --- YAPTIĞIM YORUMLAR --- */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-2">
          <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            Yaptığım Yorumlar
          </h2>
        </div>

        {comments.length === 0 ? (
          <div className="text-center text-gray-400 py-16 bg-gray-800 rounded-lg border border-dashed border-gray-600">
            <p className="text-lg">Henüz hiçbir diziye yorum yapmamışsın.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-800/80 p-5 rounded-xl border border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:border-purple-500/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {/* Eğer bu bir cevap (reply) ise küçük bir ok göster */}
                    {comment.parentId && (
                      <span className="bg-gray-700 text-xs px-2 py-0.5 rounded text-gray-300">Cevap</span>
                    )}
                    <span className="text-xs text-gray-500">
                      {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Şimdi"}
                    </span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-line text-sm font-medium">"{comment.text}"</p>
                </div>
                
                {/* Hangi diziye yorum yaptıysa o diziye giden buton */}
                {comment.dramaId && (
                  <Link href={`/drama/${comment.dramaId}`} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold transition shrink-0 flex items-center gap-1 shadow-lg shadow-purple-500/20 mt-3 sm:mt-0">
                    Diziye Git <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}