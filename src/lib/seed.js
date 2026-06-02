// ── Başlangıç verisi (videodaki Kainz Lieferschein + Simitçi + Metro) ──
// Fiyatlar tahminîdir; Tanımlar'dan düzeltilebilir.
export function seed() {
  const KZ = "s_kainz",
    SM = "s_simit",
    MT = "s_metro";
  const P = (supplierId, art, name, category, unit, price, defaultQty) => ({
    id: "p_" + Math.random().toString(36).slice(2, 8),
    supplierId,
    art,
    name,
    category,
    unit,
    price,
    defaultQty,
  });
  const products = [
    // ---- Kainz Schwanen ----
    P(KZ, "50", "Schwarzbrot groß", "brot", "Stk", 3.18, 1),
    P(KZ, "60", "Schwarzbrot klein", "brot", "Stk", 1.89, 1),
    P(KZ, "250", "Kastenbrot 350g", "brot", "Stk", 2.8, 1),
    P(KZ, "300", "Wurzelbrot hell", "brot", "Stk", 1.4, 2),
    P(KZ, "410", "Salzstangen", "gebaeck", "Stk", 0.39, 2),
    P(KZ, "420", "Semmel", "gebaeck", "Stk", 0.39, 55),
    P(KZ, "481", "Pärle gr.", "gebaeck", "Stk", 0.98, 4),
    P(KZ, "486", "Dinkelbürli 4er HGB", "brot", "Stk", 1.95, 4),
    P(KZ, "645", "Brezel 9dag", "gebaeck", "Stk", 0.88, 8),
    P(KZ, "670", "Laugenweggle", "gebaeck", "Stk", 0.57, 20),
    P(KZ, "671", "Käselaugenweggle", "gebaeck", "Stk", 0.88, 1),
    P(KZ, "780", "Kornspitz m. Sesam", "brot", "Stk", 0.66, 13),
    P(KZ, "1215", "Vollkornmopa", "brot", "Stk", 3.12, 10),
    P(KZ, "2020", "Gipfel", "gebaeck", "Stk", 0.94, 8),
    P(KZ, "2030", "Haselnussgipfel", "gebaeck", "Stk", 1.3, 3),
    P(KZ, "2031", "Dinkel Hefenusskipfel", "gebaeck", "Stk", 1.85, 4),
    P(KZ, "2034", "Dinkel Hefetopfen", "gebaeck", "Stk", 1.85, 4),
    P(KZ, "2039", "Puddingschnecken", "gebaeck", "Stk", 1.2, 2),
    P(KZ, "2040", "Nußschnecke", "gebaeck", "Stk", 1.37, 3),
    P(KZ, "2050", "Topfentaschen", "gebaeck", "Stk", 1.43, 4),
    P(KZ, "2180", "Croissants", "gebaeck", "Stk", 0.78, 20),
    P(KZ, "2182", "Laugencroissant", "gebaeck", "Stk", 0.88, 12),
    P(KZ, "2220", "Edgar", "gebaeck", "Stk", 1.56, 8),
    P(KZ, "2251", "Rosinenbutterweggle", "gebaeck", "Stk", 1.3, 6),
    // ---- Simitçi ----
    P(SM, "", "Simit", "gebaeck", "Stk", 0.6, 30),
    P(SM, "", "Açma", "gebaeck", "Stk", 0.7, 15),
    P(SM, "", "Poğaça", "gebaeck", "Stk", 0.8, 15),
    P(SM, "", "Su Böreği", "gebaeck", "kg", 12.0, 2),
    P(SM, "", "Baklava (tepsi)", "gebaeck", "kg", 18.0, 1),
    // ---- Metro (market) ----
    P(MT, "", "Salami", "lebensmittel", "Pkg", 4.5, 2),
    P(MT, "", "Schinken", "lebensmittel", "Pkg", 5.2, 2),
    P(MT, "", "Tomaten", "lebensmittel", "kg", 1.8, 5),
    P(MT, "", "Gurken", "lebensmittel", "Stk", 1.2, 6),
    P(MT, "", "Champignons", "lebensmittel", "Pkg", 2.4, 3),
    P(MT, "", "Gouda", "lebensmittel", "kg", 6.9, 2),
    P(MT, "", "Eier (10er)", "lebensmittel", "Pkg", 3.2, 4),
  ];
  return {
    lang: "tr",
    suppliers: [
      { id: KZ, name: "Kainz Schwanen", category: "brot", color: "#9A7320" },
      { id: SM, name: "Simitçi", category: "gebaeck", color: "#B45309" },
      { id: MT, name: "Metro", category: "lebensmittel", color: "#15803D" },
    ],
    products,
    entries: [],
    revenues: [],
  };
}
