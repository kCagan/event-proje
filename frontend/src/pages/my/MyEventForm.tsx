import type { FormEvent } from "react";
// hook’lar normal:
import { useEffect, useState /* ... */ } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  create, getById, update, remove_, uploadImage
} from "../../api/events";
import type { EventUpsert } from "../../api/events";

type EventUpsertEx = EventUpsert & { imagePath?: string };

const toISO = (d: string) => new Date(d).toISOString(); // input datetime-local → ISO

export default function AdminEventForm() {
  const { id } = useParams(); // "new" veya ":id"
  const isEdit = !!id && id !== "new";
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [start, setStart] = useState(""); // yyyy-MM-ddTHH:mm
  const [end, setEnd] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("<p></p>");
  const [isActive, setIsActive] = useState(true);
  const [imagePath, setImagePath] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  

  // Düzenleme ise veriyi çek
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const ev = await getById(Number(id));
        setTitle(ev.title);
        setStart(ev.startDate.slice(0,16));
        setEnd(ev.endDate.slice(0,16));
        setShortDesc(ev.shortDescription ?? "");
        setLongDesc(ev.longDescription ?? "<p></p>");
        setIsActive(!!ev.isActive);
        setImagePath(ev.imagePath ?? null);
      } catch (e: any) {
        setErr(e?.response?.data ?? e.message ?? "Kayıt getirilemedi.");
      }
    })();
  }, [id, isEdit]);

  async function handleUpload(f: File) {
    // jpg/jpeg/png, max 2MB
    if (!["image/png", "image/jpeg", "image/jpg"].includes(f.type)) {
      setErr("Sadece jpg, jpeg, png yükleyin.");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setErr("Maksimum dosya boyutu 2 MB.");
      return;
    }

    // API: uploadImage(id:number, file:File) — yeni kayıtta id olmadığı için
    // "Önce kaydedin" uyarısı veriyoruz. (İstersen sonra: create -> id -> upload akışı kurarız)
    if (!isEdit) {
      setErr("Görseli yüklemek için önce etkinliği kaydedin.");
      return;
    }

    try {
      setErr(null);
      const path = await uploadImage(f);
      setImagePath(path);
    } catch (e: any) {
      setErr(e?.response?.data ?? e.message ?? "Yükleme başarısız.");
    }
  }


  // Basit doğrulamalar (doküman şartlarına göre) 
  function validate(): string | null {
    if (!title.trim()) return "Başlık gerekli.";
    if (title.length > 255) return "Başlık 255 karakteri geçemez.";
    if (!start || !end) return "Başlangıç/bitiş tarihini seçin.";
    if (new Date(start) > new Date(end)) return "Bitiş, başlangıçtan önce olamaz.";
    if (shortDesc.length > 512) return "Kısa açıklama 512 karakteri geçemez.";
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

     const payload: EventUpsertEx = {
      title: title.trim(),
      startDate: toISO(start),
      endDate: toISO(end),
      shortDescription: shortDesc || undefined,
      longDescription: longDesc || undefined,
      imagePath: imagePath ?? undefined,
      isActive,
    };
    
     try {
        setBusy(true);
        setErr(null);
        if (isEdit) {
            await update(Number(id), payload);
        } else {
            await create(payload);
            // Not: create dönüşü id vermiyorsa görseli kayıttan SONRA yüklemek için
            // ayrı bir akış gerekir. Şimdilik yeni kayıtta görsel yükleme devre dışı.
        }
        nav("/admin/events");
        } catch (e: any) {
        setErr(e?.response?.data ?? e.message ?? "Kaydedilemedi.");
        } finally {
        setBusy(false);
        }
    }

  async function onDelete() {
    if (!isEdit) return;
    if (!confirm("Bu etkinliği silmek istediğinize emin misiniz?")) return;
    try {
      setBusy(true);
      await remove_(Number(id));
      nav("/admin/events");
    } catch (e: any) {
      setErr(e?.response?.data ?? e.message ?? "Silinemedi.");
    } finally { setBusy(false); }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>{isEdit ? "Etkinlik Düzenle" : "Yeni Etkinlik"}</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 640 }}>
        <label>Başlık
          <input value={title} onChange={e=>setTitle(e.target.value)} maxLength={255} required/>
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <label>Başlangıç
            <input type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} required/>
          </label>
          <label>Bitiş
            <input type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)} required/>
          </label>
        </div>

        <label>Kısa Açıklama (max 512)
          <textarea value={shortDesc} onChange={e=>setShortDesc(e.target.value)} maxLength={512} rows={3}/>
        </label>

        <label>Uzun Açıklama (HTML)
          <textarea value={longDesc} onChange={e=>setLongDesc(e.target.value)} rows={6}/>
        </label>

        <label>Resim (jpg/png max 2MB)
          <input type="file" accept=".jpg,.jpeg,.png" onChange={e=>{
            const f = e.target.files?.[0]; if (f) handleUpload(f);
          }} />
          {imagePath ? <div style={{ fontSize: 12, opacity: .8 }}>Yüklendi: {imagePath}</div> : null}
        </label>

        <label style={{ display:"flex", gap:8, alignItems:"center" }}>
          <input type="checkbox" checked={isActive} onChange={e=>setIsActive(e.target.checked)} />
          Aktif
        </label>

        {err && <div style={{ color: "crimson" }}>{err}</div>}

        <div style={{ display:"flex", gap:8 }}>
          <button disabled={busy} type="submit">{busy ? "Kaydediliyor..." : "Kaydet"}</button>
          <Link to="/admin/events"><button type="button">İptal</button></Link>
          {isEdit && <button type="button" onClick={onDelete} style={{ marginLeft:"auto", background:"#300", color:"#fff" }}>Sil</button>}
        </div>
      </form>
    </div>
  );
}
