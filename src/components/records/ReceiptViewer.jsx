import { useT } from "../../lib/useT";
import { Modal, Button } from "../ui";

export default function ReceiptViewer({ entry, onClose }) {
  const t = useT();
  const url = entry.receipt;
  const isPdf = (url || "").startsWith("data:application/pdf");

  const openNewTab = () => {
    const w = window.open();
    if (w)
      w.document.write(
        `<iframe src="${url}" style="border:0;width:100vw;height:100vh"></iframe>`
      );
  };

  return (
    <Modal
      title={t("receipt_title")}
      subtitle={entry.receiptName || ""}
      onClose={onClose}
      maxW={isPdf ? 820 : 640}
      footer={
        <>
          <Button variant="ghost" onClick={openNewTab}>
            ↗ {t("open_new_tab")}
          </Button>
          <a className="btn btn-gold" href={url} download={entry.receiptName || "fis"}>
            ⬇ {t("download")}
          </a>
        </>
      }
    >
      {isPdf ? (
        <iframe
          src={url}
          title="receipt"
          style={{ width: "100%", height: "70vh", border: "1px solid var(--line)", borderRadius: 10 }}
        />
      ) : (
        <img
          src={url}
          alt={entry.receiptName || "fiş"}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 10,
            border: "1px solid var(--line)",
            display: "block",
          }}
        />
      )}
    </Modal>
  );
}
