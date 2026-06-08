# Mal & Alım Takip — Wareneingang & Einkauf

Fırın için **sade muhasebe / mal-alım takip** uygulaması. Tedarikçilerden (Kainz, Simitçi,
Metro…) gelen malı kaydet, fişi ekle, aylık toplam masrafı ve **net kârı** (ciro − maliyet) gör.
Kağıt irsaliyeleri tek tek toplama derdini bitirir.

**Tamamen yerel çalışır:** canlı/web yayını yoktur. Tek bir çalıştırılabilir dosyadır
(Node gömülü); Mac veya Windows'ta **çift tıklayınca kendi yerel sunucusunu başlatır** ve
tarayıcıyı otomatik açar. Kurulum/internet gerekmez.

**Veri güvenli — diskte gerçek dosyada + otomatik yedek:** Tüm kayıtlar tarayıcı hafızasında
**değil**, sunucu tarafından diske yazılır:
- `~/MalAlimTakip/veriler.json` — ana veri dosyası (her değişiklikte otomatik güncellenir)
- `~/MalAlimTakip/yedekler/` — her kayıtta **tarihli otomatik yedek** (son 60 sürüm saklanır)

Tarayıcı temizlense bile veri durur; istersen `veriler.json`'u başka makineye kopyalayıp devam
edersin. (Veri klasörünü değiştirmek için `MALTAKIP_DIR` ortam değişkenini ayarla.)

## Teknoloji
- **Vite + React 18** (JSX) → `vite-plugin-singlefile` ile tek HTML; sunucuya gömülür
- Veri katmanı: **Node yerleşik HTTP sunucusu** (`server/server.cjs`) → diske JSON + yedek
- Paketleme: **Node SEA** (Single Executable) → tek `.exe` / `.app`, kurulum gerekmez
- Açık & profesyonel tasarım (Inter + Fraunces), TR / DE

## Çalıştırma (kurulumsuz)
GitHub → **Actions** sekmesi → son "Tek-tıklık uygulamayı hazırla" çalışması → işletim sistemine
uygun artefaktı indir. (Sürüm etiketi `v1.0` gönderirsen dosyalar **Releases** altında da çıkar.)

**Mac** (`mal-alim-takip-mac` → `MalAlimTakip-mac.zip`):
1. Zip'i aç → **`MalAlimTakip.app`** çıkar.
2. İlk seferde: app'e **sağ tık → Aç → Aç** (imzasız uygulama uyarısı bir kez çıkar).
3. Çift tıkla → Terminal açılmadan arka planda başlar, tarayıcı otomatik gelir.
4. Kapatmak için sayfadaki üst çubukta **⏻ Kapat** düğmesine bas.

> Apple Silicon (M1–M4) **ve** Intel Mac'lerin ikisinde de çalışır (evrensel/universal paket).

**Windows** (`mal-alim-takip-windows` → `mal-alim-takip.exe`):
1. `.exe`'yi **çift tıkla** → bir konsol penceresi açılır, sunucu başlar, tarayıcı gelir.
   (SmartScreen çıkarsa: "Daha fazla bilgi" → *Yine de çalıştır*.)
2. Kapatmak için sayfadaki **⏻ Kapat** düğmesi (ya da konsol penceresini kapat).

Her iki durumda kayıtların `~/MalAlimTakip/` (Windows'ta `C:\Users\<sen>\MalAlimTakip`) klasörüne
otomatik kaydedilir.

## Geliştirme
```bash
npm install
npm run dev        # http://localhost:5173 (Vite geliştirme)
npm run build      # frontend → dist/index.html
npm run start      # yerel sunucu (dist'i sunar) → http://localhost:4178
npm run build:app  # tek-tıklık çalıştırılabilir üret (bu OS için)
```

## 4 Modül
1. **Mal Girişi** — Tedarikçi seç → ürünler standart siparişten otomatik dolar → sadece **fiilen gelen** adedi düzelt (sipariş ≠ gelen satır vurgulanır). Fiş/irsaliye fotoğrafı ekle.
2. **Kayıtlar** — Tüm girişler; ay/tedarikçi filtresi; tıkla → detay, **fişi görüntüle**, düzenle, sil.
3. **Aylık Rapor / Net** — Tarih aralığı (Bu ay / Geçen ay) → ürün veya tedarikçi bazında toplam adet + €. **Net = Ciro − Alım maliyeti** (ciro elle girilir). Yazdır / PDF.
4. **Tanımlar** — Tedarikçi/ürün ekle-düzenle (Art.Nr, fiyat, standart sipariş). JSON yedek al / geri yükle. Sıfırla.

## Notlar
- Başlangıç ürünleri Kainz Lieferschein'ından; **fiyatlar tahminîdir, Tanımlar'dan düzelt.**
- Veri `~/MalAlimTakip/veriler.json` dosyasında durur; ayrıca uygulama içinden Tanımlar → "Dışa aktar (JSON)" ile de yedek alınabilir. Çoklu cihaz/senkron istenirse ileride uzak bir sunucuya taşınabilir.
- `legacy/index.html` — eski tek-dosya sürüm (referans).
