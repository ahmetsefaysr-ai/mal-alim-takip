import { useState } from "react";
import { useStore } from "../../lib/store";
import { useT } from "../../lib/useT";
import { Modal, Button, Field, Input, Select } from "../ui";

const CATS = ["brot", "gebaeck", "lebensmittel", "sonstige"];

export default function ProductModal({ product, supplierId, onClose }) {
  const t = useT();
  const suppliers = useStore((s) => s.suppliers);
  const addProduct = useStore((s) => s.addProduct);
  const updateProduct = useStore((s) => s.updateProduct);
  const sup = suppliers.find((s) => s.id === supplierId) || {};

  const [f, setF] = useState({
    art: product ? product.art || "" : "",
    name: product ? product.name : "",
    category: product ? product.category : sup.category || "brot",
    unit: product ? product.unit || "Stk" : "Stk",
    price: product ? product.price : 0,
    defaultQty: product ? product.defaultQty : 0,
  });
  const up = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const save = () => {
    const name = f.name.trim();
    if (!name) return;
    const data = {
      art: f.art.trim(),
      name,
      category: f.category,
      unit: f.unit.trim() || "Stk",
      price: Number(f.price) || 0,
      defaultQty: parseInt(f.defaultQty, 10) || 0,
    };
    if (product) updateProduct(product.id, data);
    else addProduct(supplierId, data);
    onClose();
  };

  return (
    <Modal
      title={product ? t("edit_product") : t("new_product")}
      subtitle={sup.name}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button variant="gold" onClick={save}>
            {t("save")}
          </Button>
        </>
      }
    >
      <Field label={t("artno")} style={{ marginBottom: 14 }}>
        <Input value={f.art} onChange={(e) => up("art", e.target.value)} />
      </Field>
      <Field label={t("name")} style={{ marginBottom: 14 }}>
        <Input value={f.name} onChange={(e) => up("name", e.target.value)} autoFocus />
      </Field>
      <Field label={t("cat")} style={{ marginBottom: 14 }}>
        <Select value={f.category} onChange={(e) => up("category", e.target.value)}>
          {CATS.map((c) => (
            <option key={c} value={c}>
              {t("c_" + c)}
            </option>
          ))}
        </Select>
      </Field>
      <div className="row">
        <Field label={t("unit")}>
          <Input value={f.unit} onChange={(e) => up("unit", e.target.value)} />
        </Field>
        <Field label={t("unitprice")}>
          <Input type="number" step="0.01" min="0" value={f.price} onChange={(e) => up("price", e.target.value)} />
        </Field>
        <Field label={t("defaultqty")}>
          <Input type="number" min="0" value={f.defaultQty} onChange={(e) => up("defaultQty", e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
