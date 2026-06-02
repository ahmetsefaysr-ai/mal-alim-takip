# Mal & Alım Takip — Wareneingang & Einkauf

Fırın için **sade muhasebe / mal-alım takip** uygulaması. Tedarikçilerden (Kainz, Simitçi,
Metro…) gelen malı kaydet, fişi ekle, aylık toplam masrafı ve **net kârı** (ciro − maliyet) gör.
Kağıt irsaliyeleri tek tek toplama derdini bitirir.

## Teknoloji
- **Vite + React 18** (JSX)
- **zustand** + `persist` → veriler tarayıcıda (**localStorage**) saklanır, hesap/internet gerekmez
- Açık & profesyonel tasarım (Inter + Fraunces), TR / DE

## Geliştirme
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # üretim derlemesi → dist/
npm run preview  # dist önizleme
```

## 4 Modül
1. **Mal Girişi** — Tedarikçi seç → ürünler standart siparişten otomatik dolar → sadece **fiilen gelen** adedi düzelt (sipariş ≠ gelen satır vurgulanır). Fiş/irsaliye fotoğrafı ekle.
2. **Kayıtlar** — Tüm girişler; ay/tedarikçi filtresi; tıkla → detay, **fişi görüntüle**, düzenle, sil.
3. **Aylık Rapor / Net** — Tarih aralığı (Bu ay / Geçen ay) → ürün veya tedarikçi bazında toplam adet + €. **Net = Ciro − Alım maliyeti** (ciro elle girilir). Yazdır / PDF.
4. **Tanımlar** — Tedarikçi/ürün ekle-düzenle (Art.Nr, fiyat, standart sipariş). JSON yedek al / geri yükle. Sıfırla.

## Notlar
- Başlangıç ürünleri Kainz Lieferschein'ından; **fiyatlar tahminîdir, Tanımlar'dan düzelt.**
- Veri tek tarayıcıda durur. Yedek: Tanımlar → "Dışa aktar (JSON)". Çoklu cihaz/senkron istenirse ileride Supabase'e taşınabilir.
- `legacy/index.html` — eski tek-dosya sürüm (referans).
