import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// .env.local dosyasındaki API key'i çekiyoruz
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const data = await resend.emails.send({
      // Resend test aşamasındayken sadece onboarding@resend.dev adresinden mail atmana izin verir.
      // Kendi domainini (hikamse.com gibi) aldığında burayı degistirebilirsin.
      from: 'Hikamse <onboarding@resend.dev>', 
      to: [email],
      subject: '🎉 Hikamse Bültenine Hoş Geldin!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #111827; color: #ffffff; border-radius: 12px; border: 1px solid #374151;">
          <h1 style="color: #ec4899; text-align: center; margin-bottom: 20px;">Hikamse'ye Hoş Geldin! 🍿</h1>
          <p style="font-size: 16px; color: #d1d5db; line-height: 1.6;">
            Selam!<br><br>
            Dünyanın dizisini incelediğimiz Hikamse bültenine başarıyla abone oldun. 
            Artık en yeni incelemeler, gizli kalmış şaheserler ve "Haftanın Favorisi" seçtiğimiz diziler ilk senin e-posta kutuna düşecek.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://blog-rho-nine-34.vercel.app/" style="background-color: #db2777; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Dizilere Göz At</a>
          </div>
          <p style="font-size: 16px; color: #d1d5db; line-height: 1.6;">
            Şimdiden keyifli okumalar!<br>
            <strong>- Hikamse Ekibi</strong>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}