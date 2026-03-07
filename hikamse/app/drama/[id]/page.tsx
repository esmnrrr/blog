"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/app/firebase"; 
import { doc, getDoc, getDocs, setDoc, deleteDoc, collection, addDoc, query, orderBy, onSnapshot, collectionGroup, where, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams } from "next/navigation";

export default function DramaDetail() {
  const { id } = useParams();
  const [drama, setDrama] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSpoiler, setShowSpoiler] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  // YENİ EKLENEN DURUMLAR (State)
  const [userStatus, setUserStatus] = useState("Plan to Watch"); 
  const [userRating, setUserRating] = useState<number>(0); 
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // 1. Kullanıcıyı, Diziyi ve Yorumları Çek
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && id) {
        checkIfAdded(currentUser.uid, id as string);
      }
    });

    async function fetchDrama() {
      if (!id) return;
      const docRef = doc(db, "dramas", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setDrama(docSnap.data());
      }
      setLoading(false);
    }

    // Yorumları Canlı (Real-time) Dinle!
    function fetchComments() {
      if (!id) return;
      const q = query(collection(db, "dramas", id as string, "comments"), orderBy("createdAt", "desc"));
      const unsubscribeComments = onSnapshot(q, (snapshot) => {
        const commentsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setComments(commentsList);
      });
      return unsubscribeComments;
    }

    fetchDrama();
    const unsubComments = fetchComments(); // Yorumları başlat

    return () => {
      unsubscribeAuth();
      if (unsubComments) unsubComments(); // Sayfadan çıkınca dinlemeyi durdur
    };
  }, [id]);

  // 2. Listede Ekli mi Kontrol Et
  const checkIfAdded = async (uid: string, dramaId: string) => {
    const docRef = doc(db, "users", uid, "library", dramaId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setIsAdded(true);
      const data = docSnap.data();
      setUserStatus(data.status || "Plan to Watch");
      setUserRating(data.rating || 0);
    }
  };

  // 3. LİSTEYE KAYDET VEYA GÜNCELLE FONKSİYONU
  const handleSaveToList = async () => {
    if (!user) {
      alert("Listeye eklemek için önce giriş yapmalısın!");
      return;
    }
    
    setBtnLoading(true);
    const dramaId = id as string;
    const docRef = doc(db, "users", user.uid, "library", dramaId);

    try {
      await setDoc(docRef, {
        title: drama.title || "İsimsiz",
        posterImage: drama.posterImage || "",
        addedAt: new Date(),
        status: userStatus, 
        rating: userRating  
      }, { merge: true }); 
      
      setIsAdded(true);
      alert(isAdded ? "Listen güncellendi! ✅" : "Listene eklendi! 🎉");
    } catch (error) {
      console.error("Hata:", error);
      alert("Bir hata oluştu :(");
    }
    setBtnLoading(false);
  };

  // 4. LİSTEDEN TAMAMEN SİLME FONKSİYONU
  const handleRemoveFromList = async () => {
    if (!confirm("Bu diziyi listenden tamamen silmek istediğine emin misin?")) return;
    
    setBtnLoading(true);
    const dramaId = id as string;
    try {
      await deleteDoc(doc(db, "users", user.uid, "library", dramaId));
      setIsAdded(false);
      setUserStatus("Plan to Watch"); 
      setUserRating(0); 
      alert("Listeden çıkarıldı.");
    } catch (error) {
      console.error("Hata:", error);
    }
    setBtnLoading(false);
  };
  
  // ROZET BELİRLEME MOTORU
  const getUserBadgeAndUpdateOlds = async (uid: string) => {
    let newBadge = "🐣 Yeni İzleyici";

    // 1. VIP Kontrolü
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    const isVip = userDocSnap.exists() && userDocSnap.data().role === "vip";

    // 2. Tüm eski yorumları çek
    const commentsQuery = query(collectionGroup(db, "comments"), where("userId", "==", uid));
    const commentsSnapshot = await getDocs(commentsQuery);

    if (isVip) {
      newBadge = "💎 VIP Üye";
    } else {
      const totalComments = commentsSnapshot.docs.length + 1; // Yeni atacağı ile birlikte
      if (totalComments >= 50) newBadge = "👑 K-Drama Üstadı";
      else if (totalComments >= 10) newBadge = "🍿 Dizi Kurdu";
    }

    // 3. SİHİRLİ KISIM: Eski yorumları GARANTİLİ HACKER YÖNTEMİ ile güncelle!
    let needScreenUpdate = false; 
    const updatePromises: any[] = [];
    
    commentsSnapshot.docs.forEach((commentDoc) => {
      // Eğer eski yorumun üstündeki rozet, şu an hak ettiğimiz rozetten farklıysa:
      if (commentDoc.data().badge !== newBadge) {
        
        // İŞTE SİHİR BURADA: Dosya yolunu zorla parçalayıp tam ve kusursuz adresi buluyoruz!
        const pathParts = commentDoc.ref.path.split('/'); 
        if (pathParts.length >= 4) {
          const dramaId = pathParts[1];
          const commentId = commentDoc.id;
          
          // Kusursuz adresi oluştur
          const safeRef = doc(db, "dramas", dramaId, "comments", commentId);
          updatePromises.push(updateDoc(safeRef, { badge: newBadge }));
          needScreenUpdate = true;
        }
      }
    });

    // Varsa güncellemeleri arka planda saniyeler içinde hallet
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    // EKRANI ANINDA GÜNCELLE
    if (needScreenUpdate) {
      const updatedComments = comments.map(c => 
        c.userId === uid ? { ...c, badge: newBadge } : c
      );
      setComments(updatedComments);
    }

    return newBadge;
  };

  // 5. YORUM EKLEME FONKSİYONU
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Yorum yapmak için giriş yapmalısın!");
      return;
    }
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      // Rozeti hesapla
      const userBadge = await getUserBadgeAndUpdateOlds(user.uid);

      await addDoc(collection(db, "dramas", id as string, "comments"), {
        text: newComment,
        userId: user.uid,
        userName: user.displayName || "Anonim Kullanıcı",
        userPhoto: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}&background=db2777&color=fff`,
        badge: userBadge, // Rozeti Mühürle
        createdAt: new Date()
      });
      setNewComment(""); // Yorum kutusunu temizle
    } catch (error) {
      console.error("Yorum eklenirken hata:", error);
      alert("Yorum eklenemedi :(");
    }
    setCommentLoading(false);
  };

  // 6. YORUMA CEVAP VERME FONKSİYONU
  const handleAddReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!user) {
      alert("Cevap yazmak için giriş yapmalısın!");
      return;
    }
    if (!replyText.trim()) return;

    setCommentLoading(true);
    try {
      // Rozeti hesapla
      const userBadge = await getUserBadgeAndUpdateOlds(user.uid);

      await addDoc(collection(db, "dramas", id as string, "comments"), {
        text: replyText,
        userId: user.uid,
        userName: user.displayName || "Anonim Kullanıcı",
        userPhoto: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}&background=db2777&color=fff`,
        badge: userBadge, // YENİ EKLENDİ: Rozeti Mühürle
        createdAt: new Date(),
        parentId: parentId 
      });
      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Cevap eklenirken hata:", error);
      alert("Cevap eklenemedi :(");
    }
    setCommentLoading(false);
  };

  if (loading) return <div className="text-white text-center mt-20">Yükleniyor...</div>;
  if (!drama) return <div className="text-white text-center mt-20">Dizi bulunamadı :(</div>;

  // Ruh hallerini şık yazılara çeviren sözlük
  const moodMap: { [key: string]: string } = {
    "cerezlik": "🍿 Çerezlik",
    "aglatanlar": "😭 Ağlatanlar",
    "beyin-yakan": "🤯 Beyin Yakanlar",
    "kalp-isitan": "🥰 Kalp Isıtanlar",
    "tirnak-yedirten": "💅 Tırnak Yedirten",
    "ilham-veren": "✨ İlham Veren"
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white pb-20">
      
      {/* ÜST KISIM (Kapak, Poster, Başlık) */}
      <div className="relative h-[50vh] w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${drama.backdropImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 container mx-auto flex items-end">
          <div className="hidden md:block w-48 h-72 rounded-lg overflow-hidden shadow-2xl border-4 border-gray-800 mr-8 relative z-10">
             {drama.posterImage ? (
                <img src={drama.posterImage} className="w-full h-full object-cover" />
             ) : <div className="bg-gray-700 w-full h-full"></div>}
          </div>
          
          <div className="mb-4 relative z-10">
            <h1 className="text-5xl font-bold mb-2">{drama.title}</h1>
            <div className="flex items-center space-x-4 text-gray-300 text-sm mb-4"> 
              <span className="bg-pink-600 text-white px-2 py-1 rounded font-bold">{drama.ratingAvg} / 10</span>
              <span>{drama.releaseYear}</span>
            </div>
            
            {/* KONTROL ÇUBUĞU */}
            <div className="mt-4 flex flex-wrap items-center gap-8 bg-black/40 backdrop-blur-md p-3 rounded-2xl w-fit shadow-2xl">
              
              {/* Durum Seçici */}
              <div className="relative">
                <select 
                  value={userStatus} 
                  onChange={(e) => setUserStatus(e.target.value)}
                  className="appearance-none bg-gray-800/80 hover:bg-gray-700 text-white text-sm font-semibold py-2.5 pl-4 pr-10 rounded-xl outline-none cursor-pointer transition-colors focus:ring-2 focus:ring-pink-500"
                >
                  <option value="Plan to Watch" className="bg-gray-900 text-white">📌 İzlenecekler</option>
                  <option value="Watching" className="bg-gray-900 text-white">📺 İzliyorum</option>
                  <option value="Completed" className="bg-gray-900 text-white">✅ Bitti</option>
                  <option value="Dropped" className="bg-gray-900 text-white">❌ Bıraktım</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              {/* Puan Seçici */}
              <div className="relative">
                <select 
                  value={userRating} 
                  onChange={(e) => setUserRating(Number(e.target.value))}
                  className="appearance-none bg-gray-800/80 hover:bg-gray-700 text-white text-sm font-semibold py-2.5 pl-4 pr-10 rounded-xl outline-none cursor-pointer transition-colors focus:ring-2 focus:ring-pink-500"
                >
                  <option value={0} className="bg-gray-900 text-white">⭐ Puanım</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num} className="bg-gray-900 text-white">⭐ {num} / 10</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              {/* Araya İnce Bir Çizgi */}
              {isAdded && <div className="w-px h-8 bg-white/20 hidden sm:block mx-1"></div>}

              {/* Akıllı Butonlar (GÜNCELLENDİ) */}
              {isAdded ? (
                <div className="flex items-center space-x-3">
                  {/* Güncelle Butonu */}
                  <button onClick={handleSaveToList} disabled={btnLoading} className="bg-pink-600 hover:bg-pink-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-pink-500/30 flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Güncelle
                  </button>
                  {/* Sil Butonu */}
                  <button onClick={handleRemoveFromList} disabled={btnLoading} className="bg-red-600 hover:bg-red-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Sil
                  </button>
                </div>
              ) : (
                <button onClick={handleSaveToList} disabled={btnLoading} className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-pink-500/30 flex items-center ml-1">
                  <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Listeme Ekle
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 container mx-auto px-8 mt-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* SOL TARAF: İnceleme ve Spoiler */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-pink-500 mb-4 border-b border-gray-700 pb-2">Genel Bakış</h2>
            <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
              {drama.reviewIntro || "Giriş yazısı yok."}
            </div>
          </section>

          {/* DİZİDEN KARELER */}
          {(drama.screenshot1 || drama.screenshot2 || drama.screenshot3) && (
            <section className="py-4">
              <h2 className="text-xl font-bold text-gray-300 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Diziden Kareler
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {drama.screenshot1 && (
                  <div className="aspect-video rounded-lg overflow-hidden border border-gray-700 shadow-md hover:border-pink-500 transition-colors">
                    <img src={drama.screenshot1} alt="Kare 1" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                )}
                {drama.screenshot2 && (
                  <div className="aspect-video rounded-lg overflow-hidden border border-gray-700 shadow-md hover:border-pink-500 transition-colors">
                    <img src={drama.screenshot2} alt="Kare 2" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                )}
                {drama.screenshot3 && (
                  <div className="aspect-video rounded-lg overflow-hidden border border-gray-700 shadow-md hover:border-pink-500 transition-colors">
                    <img src={drama.screenshot3} alt="Kare 3" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="bg-gray-800 p-6 rounded-xl border border-red-900/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-red-500 flex items-center">⚠️ Spoilerlı Bölge</h2>
              <button onClick={() => setShowSpoiler(!showSpoiler)} className="text-sm bg-gray-700 px-3 py-1 rounded">
                {showSpoiler ? "Gizle" : "Göster"}
              </button>
            </div>
            <div className={`transition-all duration-500 ${showSpoiler ? 'blur-0' : 'blur-md select-none'}`}>
               <p className="text-gray-300 leading-relaxed">{drama.reviewSpoiler || "Spoiler yok."}</p>
            </div>
          </section>
        </div>

        {/* SAĞ TARAF: Künye ve Fragman */}
        <div className="space-y-6">

          {/* DİZİ KÜNYESİ */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-pink-500 border-b border-gray-700 pb-2">Dizi Künyesi</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-400 block mb-1">🎭 Tür</span>
                <span className="font-semibold text-white capitalize">{drama.genre || "Belirtilmemiş"}</span>
              </div>
              
              <div>
                <span className="text-gray-400 block mb-1">✨ Ruh Hali</span>
                <span className="font-semibold text-purple-400">
                  {drama.mood ? moodMap[drama.mood] : "Belirtilmemiş"}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-1">📺 Bölüm Sayısı</span>
                <span className="font-semibold text-white">{drama.episodeCount || "Belirtilmemiş"}</span>
              </div>

              <div>
                <span className="text-gray-400 block mb-1">👥 Oyuncular</span>
                <span className="font-semibold text-gray-200 leading-relaxed block">
                  {drama.cast || "Belirtilmemiş"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
             <h3 className="text-xl font-bold mb-4 text-white">Fragman</h3>
             <div className="aspect-video bg-black rounded overflow-hidden">
                {drama.trailerUrl ? (
                  <iframe width="100%" height="100%" src={drama.trailerUrl.replace("watch?v=", "embed/")} allowFullScreen className="border-none"></iframe>
                ) : <div className="text-gray-500 text-center pt-10">Fragman Yok</div>}
             </div>
          </div>

        {/* YORUMLAR */}
        <div className="md:col-span-3 mt-4 mb-10">
          <h2 className="text-xl font-bold text-pink-500 mb-6 border-b border-gray-700 pb-2 flex items-center">
            <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            İzleyici Yorumları <span className="text-pink-500 ml-1">({comments.length})</span>
          </h2>

          {/* Yorum Yapma Formu */}
          {user ? (
            <form onSubmit={handleAddComment} className="mb-8 bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-start gap-3">
              <img src={user.photoURL || `...`} alt="Profil" className="w-8 h-8 rounded-full object-cover border border-pink-500 mt-1" />
              <div className="flex-1 flex flex-col items-end">
                <textarea 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  placeholder="Dizi hakkında ne düşünüyorsun? Düşüncelerini paylaş..." 
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white outline-none focus:border-pink-500 transition-colors resize-none mb-3"
                  rows={3}
                />
                <button type="submit" disabled={commentLoading} className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-pink-500/30 disabled:opacity-50">
                  {commentLoading ? "Gönderiliyor..." : "Yorumu Gönder"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700 text-center">
              <p className="text-gray-400 mb-2">Dizi hakkında yorum yapmak ve diğerleriyle tartışmak için giriş yapmalısın.</p>
              <button className="text-pink-500 font-bold hover:underline" onClick={() => alert("Sağ üstten Giriş Yap butonunu kullanabilirsin!")}>Giriş Yap</button>
            </div>
          )}

          {/* Yorumlar Listesi ve Cevaplar */}
          <div className="space-y-6">
            {comments.filter(c => !c.parentId).length === 0 ? (
              <p className="text-gray-500 text-center py-6 italic">Henüz yorum yapılmamış. İlk yorum yapan sen ol! 🎬</p>
            ) : (
              comments
                .filter(c => !c.parentId) // Sadece ana yorumları (cevap olmayanları) listele
                .map((comment) => (
                <div key={comment.id} className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm hover:border-gray-600 transition-colors">
                  
                  {/* ANA YORUM */}
                  <div className="flex items-start gap-3">
                    <img src={comment.userPhoto} alt={comment.userName} className="w-8 h-8 rounded-full object-cover mt-1" />
                    <div className="flex-1">
                      {/* ÜST BİLGİ ALANI (İsim + ROZET + Tarih) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1 sm:gap-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-pink-400">{comment.userName}</h4>
                          
                          {/* ROZET RENDER ALANI */}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold whitespace-nowrap ${
                            comment.badge?.includes("VIP") ? "bg-purple-900/50 text-purple-300 border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]" :
                            comment.badge?.includes("Üstadı") ? "bg-yellow-900/50 text-yellow-300 border-yellow-500" :
                            comment.badge?.includes("Kurdu") ? "bg-pink-900/50 text-pink-300 border-pink-500" :
                            "bg-gray-700/50 text-gray-300 border-gray-600"
                          }`}>
                            {comment.badge || "🐣 Yeni İzleyici"}
                          </span>
                        </div>
                        
                        <span className="text-xs text-gray-500">
                          {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Şimdi"}
                        </span>
                      </div>
                      <p className="text-gray-300 whitespace-pre-line leading-relaxed text-sm mb-2">{comment.text}</p>
                      
                      {/* Cevapla Butonu */}
                      {user && (
                        <button 
                          onClick={() => {
                            setReplyingTo(replyingTo === comment.id ? null : comment.id);
                            setReplyText("");
                          }} 
                          className="text-xs text-pink-500 hover:text-pink-400 font-semibold transition"
                        >
                          {replyingTo === comment.id ? "İptal" : "Cevapla"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* CEVAP YAZMA KUTUSU (Sadece Cevapla butonuna basılınca açılır) */}
                  {replyingTo === comment.id && (
                    <form onSubmit={(e) => handleAddReply(e, comment.id)} className="mt-4 ml-16 flex gap-3">
                      <input 
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Cevabını yaz..."
                        className="flex-1 bg-gray-900 border border-gray-600 rounded-lg p-2 text-white text-sm outline-none focus:border-pink-500 transition-colors"
                        autoFocus
                      />
                      <button type="submit" disabled={commentLoading || !replyText.trim()} className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition disabled:opacity-50">
                        Gönder
                      </button>
                    </form>
                  )}

                  {/* ALT YORUMLAR / CEVAPLAR (Eskiden Yeniye Sıralı) */}
                  <div className="mt-4 ml-16 space-y-3">
                    {comments
                      .filter(c => c.parentId === comment.id)
                      .reverse() // Cevaplar kronolojik olsun diye tersine çevirdik
                      .map(reply => (
                        <div key={reply.id} className="flex gap-3 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                          <img src={reply.userPhoto} alt={reply.userName} className="w-8 h-8 rounded-full object-cover" />
                          <div className="flex-1">
                            
                            {/* CEVAP İÇİN ÜST BİLGİ ALANI (İsim + ROZET + Tarih) */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1 sm:gap-0">
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-sm text-purple-400">{reply.userName}</h5>
                                
                                {/* ROZET RENDER ALANI */}
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold whitespace-nowrap ${
                                  reply.badge?.includes("VIP") ? "bg-purple-900/50 text-purple-300 border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]" :
                                  reply.badge?.includes("Üstadı") ? "bg-yellow-900/50 text-yellow-300 border-yellow-500" :
                                  reply.badge?.includes("Kurdu") ? "bg-pink-900/50 text-pink-300 border-pink-500" :
                                  "bg-gray-700/50 text-gray-300 border-gray-600"
                                }`}>
                                  {reply.badge || "🐣 Yeni İzleyici"}
                                </span>
                              </div>
                              
                              <span className="text-[10px] text-gray-500">
                                {reply.createdAt?.toDate ? reply.createdAt.toDate().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Şimdi"}                              </span>
                            </div>
                            
                            <p className="text-gray-300 text-sm">{reply.text}</p>
                          </div>
                        </div>
                    ))}
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}