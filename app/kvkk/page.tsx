import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni | Zolarr',
  description: 'Zolarr Kişisel Verilerin Korunması Kanunu (KVKK) aydınlatma metni ve gizlilik politikası.',
};

export default function KvkkPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold">KVKK Aydınlatma Metni</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">Son güncelleme: 7 Mayıs 2026</p>
      </header>

      <article className="prose prose-invert max-w-none space-y-6 text-[15px] leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-semibold">1. Veri Sorumlusu</h2>
          <p>Zolarr (&quot;Şirket&quot;), 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusu sıfatıyla, kullanıcılarına ait kişisel verileri aşağıda açıklanan amaçlar doğrultusunda işlemektedir.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">2. İşlenen Kişisel Veriler</h2>
          <p>Aşağıdaki kişisel veri kategorileri toplanır ve işlenir:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Kimlik bilgileri:</strong> ad, soyad</li>
            <li><strong>İletişim bilgileri:</strong> e-posta, telefon, şehir, adres</li>
            <li><strong>Hesap bilgileri:</strong> şifre (hashlenmiş), profil fotoğrafı, hesap rolü</li>
            <li><strong>İşlem bilgileri:</strong> teklif talepleri, favori ürünler, stok uyarıları, kayıt geçmişi</li>
            <li><strong>Pazarlama tercihleri:</strong> e-posta abonelik durumları</li>
            <li><strong>Teknik veriler:</strong> IP adresi (sunucu loglarında), kullanılan tarayıcı bilgisi (anonim analiz için)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">3. Kişisel Verilerin İşlenme Amaçları</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Hizmetin sağlanması (kayıt, giriş, teklif yönetimi)</li>
            <li>Müşteri ile iletişim (teklif geri dönüşleri, destek)</li>
            <li>Bayi başvurularının değerlendirilmesi</li>
            <li>Stok uyarıları ve sipariş süreçleri</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi (Vergi, KDV, ticari defterler)</li>
            <li>Tercih edilirse pazarlama iletişimi (kullanıcı opt-in onayıyla)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">4. Kişisel Verilerin Aktarımı</h2>
          <p>Kişisel verileriniz aşağıdaki üçüncü taraflarla paylaşılabilir:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase (DB sağlayıcısı):</strong> AB veri merkezleri (Frankfurt). Verileriniz şifreli olarak saklanır.</li>
            <li><strong>Resend (e-posta sağlayıcısı):</strong> ABD merkezli. E-posta adresiniz ve isminiz iletişim için iletilir.</li>
            <li><strong>Vercel (barındırma):</strong> ABD merkezli. Sunucu logları geçici olarak saklanır.</li>
            <li><strong>Yetkili kamu kurumları:</strong> Yasal yükümlülük durumunda.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">5. Kişisel Veri Saklama Süreleri</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Hesap aktif olduğu sürece + hesap silindiğinde 30 gün arşiv (yedeklerde).</li>
            <li>Teklif kayıtları: 10 yıl (Vergi Usul Kanunu).</li>
            <li>İletişim mesajları: 5 yıl.</li>
            <li>E-posta logları: 90 gün (Resend tarafında).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">6. Veri Sahibi Hakları (KVKK Madde 11)</h2>
          <p>Veri sahibi olarak aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenen kişisel verileriniz hakkında bilgi talep etme</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Eksik/yanlış işlenmişse düzeltilmesini isteme</li>
            <li>Verilerinizin silinmesini veya yok edilmesini isteme</li>
            <li>İşlemlere itiraz etme</li>
            <li>Zarar halinde tazminat talep etme</li>
          </ul>
          <p className="mt-3">
            Bu hakları kullanmak için:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><Link href="/hesap/kvkk" className="text-[var(--color-brand)] hover:underline">/hesap/kvkk</Link> sayfasından verilerinizi indirebilir veya hesabınızı silebilirsiniz.</li>
            <li>E-posta tercihlerinizi <Link href="/ayarlar/eposta" className="text-[var(--color-brand)] hover:underline">/ayarlar/eposta</Link> sayfasından yönetebilirsiniz.</li>
            <li>Ek talepler için <Link href="/iletisim" className="text-[var(--color-brand)] hover:underline">iletişim sayfasından</Link> bize yazabilirsiniz.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">7. Çerezler</h2>
          <p>Site çalışması için zorunlu çerezler (oturum, güvenlik) ve isteğe bağlı analiz çerezleri kullanılır. Çerez tercihlerinizi <Link href="/ayarlar" className="text-[var(--color-brand)] hover:underline">ayarlar sayfasından</Link> yönetebilirsiniz.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">8. Değişiklikler</h2>
          <p>Bu metin gerektiğinde güncellenebilir. Önemli değişiklikler için kayıtlı kullanıcılara e-posta ile bilgi verilir. Son güncelleme tarihi sayfanın başında belirtilmiştir.</p>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 text-sm text-[var(--color-text-muted)]">
          <p>
            <strong>Not:</strong> Bu metin genel bir aydınlatma örneğidir. Kuruluşunuzun spesifik veri işleme süreçleri için bir avukatla nihai metni hazırlamanız önerilir.
          </p>
        </section>
      </article>
    </div>
  );
}
