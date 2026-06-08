# Mal & Alım Takip — Wareneingang & Einkauf

Fırın için **sade muhasebe / mal-alım takip** uygulaması. Tedarikçilerden (Kainz, Simitçi,
Metro…) gelen malı kaydet, fişi ekle, aylık toplam masrafı ve **net kârı** (ciro − maliyet) gör.
Kağıt irsaliyeleri tek tek toplama derdini bitirir.

**Tamamen yerel çalışır:** canlı/web yayını yoktur. Uygulama tek bir HTML dosyasıdır;
Mac veya Windows'ta **çift tıklayınca tarayıcıda açılır**, kurulum/internet gerekmez.

**Veri güvenli — diskte gerçek bir dosyada:** Açılışta üstteki çubuktan bir **veri dosyası
(`.json`) oluşturur ya da mevcut dosyanı açarsın. Tüm kayıtlar o dosyaya **otomatik** yazılır;
tarayıcı hafızası temizlense bile veri dosyada durur. (Bu özellik **Chrome / Edge** ister; başka
tarayıcıda uygulama yine çalışır ama yedeği elle **Tanımlar → Dışa aktar** ile almalısın.)

## Teknoloji
- **Vite + React 18** (JSX) → `vite-plugin-singlefile` ile **tek dosyalık** build
- **zustand** + `persist` → veriler **localStorage**'ta saklanır, hesap/sunucu gerekmez
- Açık & profesyonel tasarım (Inter + Fraunces), TR / DE

## Yerelde çalıştırma (kurulumsuz)
1. **Hazır dosyayı indir:** GitHub'da **Actions** sekmesi → son "Yerel uygulama dosyasını hazırla"
   çalışması → `mal-alim-takip-uygulama` artefaktını indir (içinden `mal-alim-takip.html` çıkar).
   (Bir sürüm etiketi `v1.0` gönderirsen dosya **Releases** altında da yer alır.)
2. `mal-alim-takip.html` dosyasını **çift tıkla** → uygulama açılır (Chrome/Edge önerilir).
3. Üstteki çubuktan **"Veri dosyası oluştur"** ile bir `.json` seç → kayıtlar artık o dosyaya
   otomatik kaydedilir. Sonraki açılışlarda **"Bağlan"** ile aynı dosyaya devam edersin.

> Not: Yazı tipleri çevrimiçiyken Google Fonts'tan gelir; internet yoksa sistem fontuna düşer,
> uygulama yine çalışır. Ek güvenlik için **Tanımlar → Dışa aktar (JSON)** ile de yedek alabilirsin.

## Geliştirme
```bash
npm install
npm run dev      # http://localhost:5173 (geliştirme)
npm run build    # tek dosyalık üretim → dist/index.html
npm run preview  # dist önizleme
```

## 4 Modül
1. **Mal Girişi** — Tedarikçi seç → ürünler standart siparişten otomatik dolar → sadece **fiilen gelen** adedi düzelt (sipariş ≠ gelen satır vurgulanır). Fiş/irsaliye fotoğrafı ekle.
2. **Kayıtlar** — Tüm girişler; ay/tedarikçi filtresi; tıkla → detay, **fişi görüntüle**, düzenle, sil.
3. **Aylık Rapor / Net** — Tarih aralığı (Bu ay / Geçen ay) → ürün veya tedarikçi bazında toplam adet + €. **Net = Ciro − Alım maliyeti** (ciro elle girilir). Yazdır / PDF.
4. **Tanımlar** — Tedarikçi/ürün ekle-düzenle (Art.Nr, fiyat, standart sipariş). JSON yedek al / geri yükle. Sıfırla.

## Notlar
- Başlangıç ürünleri Kainz Lieferschein'ından; **fiyatlar tahminîdir, Tanımlar'dan düzelt.**
- Veri tek tarayıcıda durur. Yedek: Tanımlar → "Dışa aktar (JSON)". Çoklu cihaz/senkron istenirse ileride bir sunucuya (ör. Supabase) taşınabilir.
- `legacy/index.html` — eski tek-dosya sürüm (referans).
