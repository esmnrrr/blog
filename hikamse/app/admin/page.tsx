"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/app/firebase";
import { collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const router = useRouter();

  // Dizi Ekleme Formunun Hafızası
  const [formData, setFormData] = useState({
    title: "",
    releaseYear: "",
    ratingAvg: "",
    genre: "romantik", // Varsayılan tür
    posterImage: "",
    backdropImage: "",
    trailerUrl: "",
    reviewIntro: "",
    reviewSpoiler: ""
  });

  // 1. GÜVENLİK DUVARI: Sadece Sen Girebilirsin!
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // DİKKAT: Aşağıdaki mail adresini kendi tam Gmail adresinle değiştir!
      if (currentUser && currentUser.email === "esmanurttk7@gmail.com") {
        setUser(currentUser);
      } else {
        alert("Yetkisiz Giriş! Sadece Esmanur bu sayfayı görebilir. 🛑");
        router.push("/"); // Kov ve Ana sayfaya yolla
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Kutulara yazı yazıldıkça hafızayı güncelleyen fonksiyon
  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. KAYDET BUTONUNA BASILINCA ÇALIŞACAK SİHİR
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      // Firebase "dramas" koleksiyonuna yeni belge ekle
      await addDoc(collection(db, "dramas"), {
        ...formData,
        createdAt: new Date(),
      });
      
      alert("Dizi başarıyla eklendi! 🎉 Ana sayfaya düşmüştür.");
      
      // Eklendikten sonra formu tertemiz yap
      setFormData({
        title: "", releaseYear: "", ratingAvg: "", genre: "romantik",
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

        {/* Ekleme Formu */}
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

          {/* 2. Satır: Tür, Poster, Arka Plan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Tür (Kategori)</label>
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
              <label className="block text-sm font-bold text-gray-400 mb-2">Afiş Linki (Dikey) *</label>
              <input required type="text" name="posterImage" value={formData.posterImage} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none transition" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Arka Plan Linki (Yatay)</label>
              <input type="text" name="backdropImage" value={formData.backdropImage} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none transition" placeholder="https://..." />
            </div>
          </div>

          {/* 3. Satır: Fragman */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Fragman Linki (Youtube)</label>
            <input type="text" name="trailerUrl" value={formData.trailerUrl} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-pink-500 outline-none transition" placeholder="Örn: https://www.youtube.com/watch?v=..." />
          </div>

          {/* 4. Satır: İnceleme & Spoiler */}
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

      </div>
    </main>
  );
}