"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/app/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
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

  // 1. Kullanıcıyı ve Diziyi Takip Et
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("AUTH DURUMU:", currentUser ? "Giriş Yapılmış" : "Çıkış Yapılmış"); // AJAN 1
      setUser(currentUser);
      if (currentUser && id) {
        checkIfAdded(currentUser.uid, id as string);
      }
    });

    async function fetchDrama() {
      if (!id) return;
      console.log("DİZİ ÇEKİLİYOR ID:", id); // AJAN 2
      const docRef = doc(db, "dramas", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setDrama(docSnap.data());
      } else {
        console.log("DİZİ BULUNAMADI!"); // AJAN 3
      }
      setLoading(false);
    }

    fetchDrama();
    return () => unsubscribe();
  }, [id]);

  // 2. Kontrol Fonksiyonu
  const checkIfAdded = async (uid: string, dramaId: string) => {
    console.log("KONTROL EDİLİYOR...", uid, dramaId); // AJAN 4
    try {
      const docRef = doc(db, "users", uid, "library", dramaId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("SONUÇ: Bu dizi zaten listede!"); // AJAN 5
        setIsAdded(true);
      } else {
        console.log("SONUÇ: Bu dizi listede YOK."); // AJAN 6
        setIsAdded(false);
      }
    } catch (error) {
      console.error("KONTROL HATASI:", error);
    }
  };

  // 3. BUTON FONKSİYONU
  const handleListToggle = async () => {
    console.log("BUTONA TIKLANDI!"); // AJAN 7
    
    if (!user) {
      console.log("HATA: Kullanıcı girişi yok!"); // AJAN 8
      alert("Lütfen önce giriş yapın.");
      return;
    }
    
    setBtnLoading(true);
    const dramaId = id as string;
    console.log("İŞLEM BAŞLIYOR... User:", user.uid, "Drama:", dramaId); // AJAN 9

    try {
      const docRef = doc(db, "users", user.uid, "library", dramaId);

      if (isAdded) {
        // SİLME
        console.log("SİLİNMEYE ÇALIŞILIYOR..."); // AJAN 10
        await deleteDoc(docRef);
        setIsAdded(false);
        console.log("BAŞARIYLA SİLİNDİ ✅"); // AJAN 11
        alert("Listeden çıkarıldı.");
      } else {
        // EKLEME
        console.log("EKLENMEYE ÇALIŞILIYOR..."); // AJAN 12
        await setDoc(docRef, {
          title: drama.title || "İsimsiz",
          posterImage: drama.posterImage || "",
          addedAt: new Date(),
          status: "Plan to Watch"
        });
        setIsAdded(true);
        console.log("BAŞARIYLA EKLENDİ 🎉"); // AJAN 13
        alert("Listene eklendi!");
      }
    } catch (error) {
      console.error("VERİTABANI YAZMA HATASI:", error); // AJAN 14 (En önemlisi bu!)
      alert("Bir hata oluştu: " + error);
    }
    setBtnLoading(false);
  };

  if (loading) return <div className="text-white text-center mt-20">Yükleniyor...</div>;
  if (!drama) return <div className="text-white text-center mt-20">Dizi bulunamadı :(</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-white pb-20">
      <div className="relative h-[50vh] w-full">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${drama.backdropImage})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 w-full p-8 container mx-auto flex items-end">
             <h1 className="text-5xl font-bold mb-2">{drama.title}</h1>
        </div>
      </div>

      <div className="relative z-20 container mx-auto px-8 mt-8">
          <button 
            onClick={handleListToggle}
            disabled={btnLoading}
            className={`w-full py-4 rounded-lg font-bold text-xl transition shadow-lg flex justify-center items-center border-2 border-white/20
              ${isAdded ? "bg-red-600 hover:bg-red-700 text-white" : "bg-pink-600 hover:bg-pink-700 text-white"}`}
          >
            {btnLoading ? "İşleniyor..." : isAdded ? "LİSTEDE EKLİ (ÇIKAR)" : "+ LİSTEME EKLE"}
          </button>
      </div>
    </main>
  );
}