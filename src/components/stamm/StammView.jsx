import { useState } from "react";
import { useStore } from "../../lib/store";
import { useT } from "../../lib/useT";
import { eur, today, readFileAsText } from "../../lib/helpers";
import { Card, Button, Pill, toast } from "../ui";
import SupplierModal from "./SupplierModal.jsx";
import ProductModal from "./ProductModal.jsx";

export default function StammView() {
  const t = useT();
  const suppliers = useStore((s) => s.suppliers);
  const products = useStore((s) => s.products);
  const deleteSupplier = useStore((s) => s.deleteSupplier);
  const deleteProduct = useStore((s) => s.deleteProduct);
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const reset = useStore((s) => s.reset);

  const [supModal, setSupModal] = useState(undefined); // undefined kapalı, null=yeni, obj=düzenle
  const [prodModal, setProdModal] = useState(null); // {product, supplierId}

  const prodsOf = (sid) => products.filter((p) => p.supplierId === sid);

  const doExport = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mal-takip-" + today() + ".json";
    a.click();
  };
  const doImport = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const d = JSON.parse(await readFileAsText(f));
      if (importData(d)) toast(t("saved"));
      else toast("JSON ?");
    } catch {
      toast("JSON ?");
    }
    e.target.value = "";
  };

  return (
    <div>
      <div className="pagehead">
        <div>
          <h2>{t("stamm_h")}</h2>
          <p>{t("stamm_sub")}</p>
        </div>
      </div>

      {/* tedarikçiler */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span className="serif" style={{ fontSize: 18 }}>
            {t("suppliers")}
          </span>
          <Button sm variant="ghost" onClick={() => setSupModal(null)}>
            {t("addsupplier")}
          </Button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tb">
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("cat")}</th>
                <th className="num">{t("products")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>
                    <Pill cat={s.category}>{t("c_" + s.category)}</Pill>
                  </td>
                  <td className="num tnum">{prodsOf(s.id).length}</td>
                  <td className="num" style={{ whiteSpace: "nowrap" }}>
                    <Button sm variant="ghost" onClick={() => setSupModal(s)}>
                      ✏️
                    </Button>{" "}
                    <Button
                      sm
                      variant="red"
                      onClick={() => {
                        if (confirm(s.name + " — " + t("del") + "?")) deleteSupplier(s.id);
                      }}
                    >
                      🗑
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ürünler (tedarikçiye göre) */}
      {suppliers.map((s) => {
        const list = prodsOf(s.id);
        return (
          <Card key={s.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span className="serif" style={{ fontSize: 16, color: "var(--gold)" }}>
                {s.name} <span className="sub">· {t("products")}</span>
              </span>
              <Button sm variant="ghost" onClick={() => setProdModal({ product: null, supplierId: s.id })}>
                {t("addproduct")}
              </Button>
            </div>
            {list.length === 0 ? (
              <div className="sub" style={{ padding: "8px 2px" }}>
                {t("no_products")}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="tb">
                  <thead>
                    <tr>
                      <th>{t("artno")}</th>
                      <th>{t("name")}</th>
                      <th>{t("cat")}</th>
                      <th className="num">{t("unitprice")}</th>
                      <th className="num">{t("defaultqty")}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((p) => (
                      <tr key={p.id}>
                        <td className="sub tnum">{p.art || ""}</td>
                        <td>{p.name}</td>
                        <td>
                          <Pill cat={p.category}>{t("c_" + p.category)}</Pill>
                        </td>
                        <td className="num tnum">{eur(p.price)}</td>
                        <td className="num tnum">
                          {p.defaultQty} <span className="sub">{p.unit || ""}</span>
                        </td>
                        <td className="num" style={{ whiteSpace: "nowrap" }}>
                          <Button sm variant="ghost" onClick={() => setProdModal({ product: p, supplierId: s.id })}>
                            ✏️
                          </Button>{" "}
                          <Button
                            sm
                            variant="red"
                            onClick={() => {
                              if (confirm(p.name + " — " + t("del") + "?")) deleteProduct(p.id);
                            }}
                          >
                            🗑
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        );
      })}

      {/* yedek */}
      <Card>
        <span className="serif" style={{ fontSize: 16 }}>
          {t("backup")}
        </span>
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <Button sm variant="ghost" onClick={doExport}>
            ⬇ {t("export")}
          </Button>
          <label className="btn btn-ghost btn-sm" style={{ marginBottom: 0 }}>
            ⬆ {t("import")}
            <input type="file" accept="application/json" style={{ display: "none" }} onChange={doImport} />
          </label>
          <Button
            sm
            variant="red"
            onClick={() => {
              if (confirm(t("reset_confirm"))) reset();
            }}
          >
            ↺ {t("reset")}
          </Button>
        </div>
      </Card>

      {supModal !== undefined && <SupplierModal supplier={supModal} onClose={() => setSupModal(undefined)} />}
      {prodModal && (
        <ProductModal
          product={prodModal.product}
          supplierId={prodModal.supplierId}
          onClose={() => setProdModal(null)}
        />
      )}
    </div>
  );
}
