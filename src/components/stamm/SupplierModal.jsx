import { useState } from "react";
import { useStore } from "../../lib/store";
import { useT } from "../../lib/useT";
import { Modal, Button, Field, Input, Select } from "../ui";

const CATS = ["brot", "gebaeck", "lebensmittel", "sonstige"];

export default function SupplierModal({ supplier, onClose }) {
  const t = useT();
  const addSupplier = useStore((s) => s.addSupplier);
  const updateSupplier = useStore((s) => s.updateSupplier);
  const [name, setName] = useState(supplier ? supplier.name : "");
  const [category, setCategory] = useState(supplier ? supplier.category : "brot");

  const save = () => {
    const n = name.trim();
    if (!n) return;
    if (supplier) updateSupplier(supplier.id, { name: n, category });
    else addSupplier({ name: n, category });
    onClose();
  };

  return (
    <Modal
      title={supplier ? t("edit_supplier") : t("new_supplier")}
      onClose={onClose}
      maxW={460}
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
      <Field label={t("name")} style={{ marginBottom: 14 }}>
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      <Field label={t("cat")}>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATS.map((c) => (
            <option key={c} value={c}>
              {t("c_" + c)}
            </option>
          ))}
        </Select>
      </Field>
    </Modal>
  );
}
