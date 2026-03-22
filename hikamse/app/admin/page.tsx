"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/app/firebase";
import { collection, addDoc, doc, getDoc, setDoc} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [quoteData, setQuoteData] = useState({ text: "", author: "" });
  const [actorData, setActorData] = useState({ name: "", photoURL: "", birthDate: "", birthPlace: "", bio: "" });
  const [actorLoading, setActorLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);  const router = useRouter();

  // Dizi Ekleme Formunun Hafızası
  const [formData, setFormData] = useState({
    title: "",
    releaseYear: "",
    ratingAvg: "",
    genre: "romantik", 
    mood: "cerezlik",  
    cast: "",          
    episodeCount: "",
    screenshot1: "",
    screenshot2: "",
    screenshot3: "",
    posterImage: "",
    backdropImage: "",
    trailerUrl: "",
    reviewIntro: "",
    reviewSpoiler: ""
  });

  // 1. ZEKİ GÜVENLİK DUVARI: Sadece Admin ve VIP'ler Girebilir!
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      
      if (currentUser) {
        try {
          // Kullanıcının veritabanındaki "role" (yetki) belgesini çekiyoruz
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          // Eğer dosyası varsa ve yetkisi 'admin' VEYA 'vip' ise kapıyı aç:
          if (userDocSnap.exists() && (userDocSnap.data().role === "admin" || userDocSnap.data().role === "vip")) {
            setUser(currentUser);
          } else {
            // Dosyası yoksa veya normal "user" ise kov:
            alert("Yetkisiz Giriş! Bu sayfaya sadece Yöneticiler ve VIP üyeler girebilir. 🛑");
            router.push("/"); 
          }
        } catch (error) {
          console.error("Güvenlik kontrolü hatası:", error);
          router.push("/");
        }
      } else {
        // Hiç giriş yapmamışsa zaten giremez:
        router.push("/");
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [router]);

  // Kutulara yazı yazıldıkça hafızayı güncelleyen fonksiyon
  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // HAFTANIN SÖZÜ
  const handleQuoteSubmit = async (e: any) => {
    e.preventDefault();
    setQuoteLoading(true);
    try {
      await setDoc(doc(db, "settings", "homepage"), {
        quoteText: quoteData.text,
        quoteAuthor: quoteData.author,
        updatedAt: new Date()
      }, { merge: true }); // Varsa üstüne yazar, yoksa yeni oluşturur
      
      alert("Haftanın Sözü başarıyla ana ekrana asıldı! 🌟");
      setQuoteData({ text: "", author: "" });
    } catch (error) {
      console.error("Söz ekleme hatası:", error);
      alert("Bir hata oluştu :(");
    }
    setQuoteLoading(false);
  };

  // OYUNCU BILGILERI EKLEME
  const handleActorSubmit = async (e: any) => {
    e.preventDefault();
    setActorLoading(true);
    try {
      // Oyuncunun ismini ID olarak kaydediyoruz ki bulması kolay olsun
      await setDoc(doc(db, "actors", actorData.name.trim()), {
        photoURL: actorData.photoURL,
        birthDate: actorData.birthDate,
        birthPlace: actorData.birthPlace,
        bio: actorData.bio
      }, { merge: true });
      alert("Oyuncu başarıyla eklendi/güncellendi! 📸");
      setActorData({ name: "", photoURL: "", birthDate: "", birthPlace: "", bio: "" });
    } catch (error) {
      console.error("Oyuncu ekleme hatası:", error);
      alert("Bir hata oluştu :(");
    }
    setActorLoading(false);
  };

  // 2. KAYDET
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      // 1. Önce Firebase "dramas" koleksiyonuna yeni belge ekle (Burada 'docRef' ile ID'sini yakalıyoruz)
      const docRef = await addDoc(collection(db, "dramas"), {
        ...formData,
        createdAt: new Date(),
        // Editör Mührü
        addedByUserId: user.uid,
        addedByUserName: user.displayName || "Gizemli Editör",
        addedByUserPhoto: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'E'}&background=db2777&color=fff`
      });
      
      // 2. YENİ: Dizi başarıyla eklendi, şimdi abonelere mail at!
      try {
        await fetch('/api/new-drama-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: docRef.id,
            title: formData.title,
            posterImage: formData.posterImage,
            reviewIntro: formData.reviewIntro
          })
        });
      } catch (mailError) {
        console.error("Mail atarken hata oluştu:", mailError);
        // Mail gitmese bile dizi eklendiği için süreci durdurmuyoruz.
      }

      alert("Dizi başarıyla eklendi! 🎉 Ana sayfaya düşmüştür ve abonelere mail fırlatılmıştır!");
      
      // Eklendikten sonra formu tertemiz yap
      setFormData({
        title: "", releaseYear: "", ratingAvg: "", genre: "romantik", 
        mood: "cerezlik", cast: "", episodeCount: "", 
        screenshot1: "", screenshot2: "", screenshot3: "",
        posterImage: "", backdropImage: "", trailerUrl: "", reviewIntro: "", reviewSpoiler: ""
      });
    } catch (error) {
      console.error("Ekleme hatası:", error);
      alert("Bir hata oluştu, konsola bak :(");
    }
    setSubmitLoading(false);
  };

  if (loading) return <div className="text-white text-center mt-20 font-bold text-xl">Kapı Kontrol Ediliyor... 🕵️‍♀️</div>;
  if (!user) return null; 

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 pb-20">
      <div className="container mx-auto max-w-4xl mt-6">
        
        {/* Başlık */}
        <div className="mb-10 border-b border-pink-500/30 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 drop-shadow-lg">
              Yönetim Paneli 👑
            </h1>
            <p className="text-gray-400 mt-2">Sisteme yeni bir dizi ekliyorsunuz.</p>
          </div>
          <div className="text-sm bg-pink-600/20 text-pink-400 px-4 py-2 rounded-lg font-bold">
            Yetkili: {user.displayName}
          </div>
        </div>

        {/* HAFTANIN SÖZÜ DÜZENLEME FORMU */}
        <form onSubmit={handleQuoteSubmit} className="bg-gray-800/50 backdrop-blur-md p-6 rounded-2xl border border-purple-500/50 shadow-2xl mb-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-purple-400 mb-2">Haftanın Sözü ✨</label>
            <input required type="text" value={quoteData.text} onChange={(e) => setQuoteData({...quoteData, text: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition" placeholder="Örn: Kendini haklı çıkarmaya çalışmak..." />
          </div>
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-bold text-purple-400 mb-2">Kimin Sözü? (Karakter)</label>
            <input required type="text" value={quoteData.author} onChange={(e) => setQuoteData({...quoteData, author: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition" placeholder="Örn: Vincenzo Cassano" />
          </div>
          <button type="submit" disabled={quoteLoading} className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-purple-500/40 disabled:opacity-50 h-[50px]">
            {quoteLoading ? "⏳" : "Ana Ekrana As!"}
          </button>
        </form>

        {/* Dizi Ekleme Formu */}
        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl border border-gray-700 shadow-2xl space-y-6">
          
          {/* 1. Satır: İsim, Yıl, Puan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Dizi Adı *</label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none transition" placeholder="Örn: Vincenzo" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Çıkış Yılı</label>
              <input type="text" name="releaseYear" value={formData.releaseYear} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none transition" placeholder="Örn: 2021" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Ortalama Puan</label>
              <input type="text" name="ratingAvg" value={formData.ratingAvg} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none transition" placeholder="Örn: 8.5" />
            </div>
          </div>

          {/* 2. Satır: Tür, Ruh Hali, Bölüm Sayısı */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Ana Tür (Kategori) *</label>
              <select name="genre" value={formData.genre} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none transition">
                <option value="romantik">Romantik / Komedi</option>
                <option value="korku">Korku / Gerilim</option>
                <option value="gizem">Gizem</option>
                <option value="polisiye">Polisiye</option>
                <option value="fantastik">Fantastik</option>
                <option value="bilim-kurgu">Bilim Kurgu</option>
                <option value="dram">Dram</option>
                <option value="aksiyon">Aksiyon</option>
                <option value="aile">Aile</option>
                <option value="tarihi">Tarihi</option>
                <option value="program">Program</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-purple-400 mb-2">Ruh Hali (Yan Tür) *</label>
              <select name="mood" value={formData.mood} onChange={handleChange} className="w-full bg-gray-900 border border-purple-500/50 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition">
                <option value="cerezlik">🍿 Çerezlik (Kafa Dağıtmalık)</option>
                <option value="aglatanlar">😭 Ağlatanlar (Mendil Tüketen)</option>
                <option value="beyin-yakan">🤯 Beyin Yakanlar</option>
                <option value="kalp-isitan">🥰 Kalp Isıtanlar</option>
                <option value="tirnak-yedirten">💅 Tırnak Yedirten (Gerilim)</option>
                <option value="ilham-veren">✨ İlham Veren (Motive Edici)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Bölüm Sayısı</label>
              <input type="text" name="episodeCount" value={formData.episodeCount} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none transition" placeholder="Örn: 16 Bölüm" />
            </div>
          </div>

          {/* 3. Satır: Oyuncular (Cast) */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Oyuncular (Cast)</label>
            <input type="text" name="cast" value={formData.cast} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none transition" placeholder="Örn: Song Joong-ki, Jeon Yeo-been (Virgülle ayırın)" />
          </div>

          {/* 4. Satır: Poster, Arka Plan, Fragman */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Afiş Linki (Dikey) *</label>
              <input required type="text" name="posterImage" value={formData.posterImage} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none transition" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Arka Plan Linki (Yatay)</label>
              <input type="text" name="backdropImage" value={formData.backdropImage} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none transition" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Fragman Linki (Youtube)</label>
              <input type="text" name="trailerUrl" value={formData.trailerUrl} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none transition" placeholder="Örn: https://youtube.com/..." />
            </div>
          </div>

          {/* Ekran Görüntüleri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Ekran Görüntüsü 1 (Link)</label>
              <input type="text" name="screenshot1" value={formData.screenshot1} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none transition" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Ekran Görüntüsü 2 (Link)</label>
              <input type="text" name="screenshot2" value={formData.screenshot2} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none transition" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Ekran Görüntüsü 3 (Link)</label>
              <input type="text" name="screenshot3" value={formData.screenshot3} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none transition" placeholder="https://..." />
            </div>
          </div>

          {/* 5. Satır: İnceleme & Spoiler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">İnceleme (Genel Bakış)</label>
              <textarea name="reviewIntro" value={formData.reviewIntro} onChange={handleChange} rows={5} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none transition" placeholder="Dizi ne hakkında?"></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-red-400 mb-2">Spoilerlı İnceleme (Gizli Alan)</label>
              <textarea name="reviewSpoiler" value={formData.reviewSpoiler} onChange={handleChange} rows={5} className="w-full bg-gray-900 border border-red-900/50 rounded-lg p-3 text-white focus:border-red-500 outline-none transition" placeholder="Sonunda ne oluyor?"></textarea>
            </div>
          </div>

          {/* Kaydet Butonu */}
          <button 
            type="submit" 
            disabled={submitLoading}
            className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-pink-500/40 flex justify-center items-center mt-4"
          >
            {submitLoading ? "Veritabanına Yazılıyor..." : "🚀 Diziyi Siteye Ekle"}
          </button>
          
        </form>

        {/* OYUNCU BIO */}
        <form onSubmit={handleActorSubmit} className="bg-gray-800/50 backdrop-blur-md p-6 rounded-2xl border border-blue-500/50 shadow-2xl mb-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-bold text-blue-400 mb-2">Oyuncu Adı</label>
            <input required type="text" value={actorData.name} onChange={(e) => setActorData({...actorData, name: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition" placeholder="Örn: Song Joong-ki" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-blue-400 mb-2">Fotoğraf Linki</label>
            <input required type="text" value={actorData.photoURL} onChange={(e) => setActorData({...actorData, photoURL: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition" placeholder="https://..." />
          </div>
          <div className="w-full flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-blue-400 mb-2">Doğum Tarihi 🗓️</label>
              <input type="date" value={actorData.birthDate} onChange={(e) => setActorData({...actorData, birthDate: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-blue-400 mb-2">Doğum Yeri</label>
              <input type="text" value={actorData.birthPlace} onChange={(e) => setActorData({...actorData, birthPlace: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition" placeholder="Örn: Daejeon, Güney Kore" />
            </div>
          </div>
          <div className="w-full mt-4 mb-4">
            <label className="block text-sm font-bold text-blue-400 mb-2">Hakkında</label>
            <textarea rows={3} value={actorData.bio} onChange={(e) => setActorData({...actorData, bio: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition" placeholder="Oyuncunun kariyeri, başarıları, hayat hikayesi..."></textarea>
          </div>
          <button type="submit" disabled={actorLoading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white text-sm whitespace-nowrap font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/40 disabled:opacity-50 h-[50px]">
            {actorLoading ? "⏳" : "Oyuncuyu Kaydet"}
          </button>
        </form>

      </div>
    </main>
  );
}