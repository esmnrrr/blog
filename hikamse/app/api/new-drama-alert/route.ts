import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/app/firebase';
import { collection, getDocs } from 'firebase/firestore';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Admin panelinden gelen dizi bilgilerini alıyoruz
    const drama = await request.json(); 

    // 1. Firebase'den tüm abonelerin maillerini çekiyoruz
    const snapshot = await getDocs(collection(db, "subscribers"));
    const emails = snapshot.docs.map(doc => doc.data().email);

    if (emails.length === 0) {
      return NextResponse.json({ message: "Henüz abone yok, mail atılmadı." });
    }

    // 2. Toplu Maili Gönder (Gizlilik için 'bcc' kullanıyoruz, böylece kimse diğerinin mailini görmez)
    const data = await resend.emails.send({
      from: 'Hikamse <onboarding@resend.dev>', // İleride kendi domainini ekleyince değiştirebilirsin
      to: emails,
      //to: ['delivered@resend.dev'], // Resend zorunlu tuttuğu için ana alıcıyı gizli tutuyoruz
      //bcc: emails, // Bütün aboneleri "Gizli Kopya" kısmına ekliyoruz
      subject: `🚨 Yeni Dizi Eklendi: ${drama.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #111827; color: #ffffff; border-radius: 12px; border: 1px solid #374151;">
          <h2 style="color: #ec4899; text-align: center; margin-bottom: 20px;">Hikamse'ye Yeni Bir Dizi Eklendi! 🍿</h2>
          
          <img src="${drama.posterImage}" alt="${drama.title}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;" />
          
          <h1 style="font-size: 24px; margin-bottom: 10px; color: #ffffff;">${drama.title}</h1>
          <p style="color: #d1d5db; font-size: 16px; line-height: 1.6;">
            ${drama.reviewIntro || "Bu dizinin tüm detayları, oyuncuları ve spoilerlı incelemesi sitede seni bekliyor. Hemen tıkla ve okumaya başla!"}
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://blog-rho-nine-34.vercel.app/drama/${drama.id}" style="background-color: #db2777; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">İncelemeyi Oku ➔</a>
          </div>
        </div>
      `
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}