"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaPlus,
  FaXmark,
  FaPencil,
  FaTrash,
  FaImage,
} from "react-icons/fa6";

interface PropertyRow {
  id: string;
  nom: string;
  type: string;
  statut: string;
  capaciteMaximale: number;
  nombreChambres: number;
  ville: string;
  photo: string | null;
  tarifBase: string | null;
  devise: string;
  nombreAvis: number;
  note: number | null;
}

interface PropertyFull {
  id: string;
  nom: string;
  type: string;
  statut: string;
  superCategorie: string;
  descriptionCourte: string | null;
  descriptionComplete: string | null;
  capaciteMaximale: number;
  adultesMax: number;
  enfantsMax: number;
  bebesMax: number;
  nombreChambres: number;
  nombreLits: number;
  nombreSallesDeBains: number;
  superficieM2: number | null;
  adresse: string;
  ville: string;
  pays: string;
  codePostal: string | null;
  devise: string;
  photoPrincipale: string | null;
  tarifBase: string | null;
  typeTarif: string;
}

const PROPERTY_TYPES = [
  { value: "chambre", label: "Chambre" },
  { value: "chambre_avec_salon", label: "Chambre avec salon" },
  { value: "studio", label: "Studio" },
  { value: "appartement_meuble", label: "Appartement meublé" },
  { value: "suite", label: "Suite" },
  { value: "villa", label: "Villa" },
  { value: "duplex", label: "Duplex" },
  { value: "maison_entiere", label: "Maison entière" },
  { value: "personnalise", label: "Personnalisé" },
];

const STATUS_OPTIONS = [
  { value: "brouillon", label: "Brouillon" },
  { value: "publie", label: "Publié" },
  { value: "depublie", label: "Dépublié" },
  { value: "desactive", label: "Désactivé" },
  { value: "maintenance", label: "Maintenance" },
];

const CATEGORY_OPTIONS = [
  { value: "logement_entier", label: "Logement entier" },
  { value: "chambre_privee", label: "Chambre privée" },
];

const TARIF_TYPES = [
  { value: "nuee", label: "Nuitée" },
  { value: "journee", label: "Journée" },
  { value: "demi_journee", label: "Demi-journée" },
  { value: "horaire", label: "Horaire" },
  { value: "vingt_quatre_heures", label: "24 heures" },
  { value: "hebdomadaire", label: "Hebdomadaire" },
  { value: "mensuel", label: "Mensuel" },
];

const DEVISE_OPTIONS = [
  { value: "EUR", label: "EUR (€)" },
  { value: "FCFA", label: "FCFA" },
  { value: "USD", label: "USD ($)" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    publie: { cls: "bo-badge--green", label: "Publié" },
    brouillon: { cls: "bo-badge--gray", label: "Brouillon" },
    depublie: { cls: "bo-badge--orange", label: "Dépublié" },
    desactive: { cls: "bo-badge--red", label: "Désactivé" },
    maintenance: { cls: "bo-badge--blue", label: "Maintenance" },
  };
  const s = map[status] ?? { cls: "bo-badge--gray", label: status };
  return <span className={`bo-badge ${s.cls}`}>{s.label}</span>;
}

function typeLabel(type: string) {
  return PROPERTY_TYPES.find((t) => t.value === type)?.label ?? type;
}

const emptyForm = {
  nom: "",
  type: "chambre",
  statut: "brouillon",
  superCategorie: "logement_entier",
  descriptionCourte: "",
  descriptionComplete: "",
  capaciteMaximale: "1",
  adultesMax: "1",
  enfantsMax: "0",
  bebesMax: "0",
  nombreChambres: "1",
  nombreLits: "1",
  nombreSallesDeBains: "1",
  superficieM2: "",
  adresse: "",
  ville: "",
  pays: "Bénin",
  codePostal: "",
  devise: "EUR",
  tarifPrix: "",
  typeTarif: "nuee",
  photoUrl: "",
};

interface FormState {
  nom: string;
  type: string;
  statut: string;
  superCategorie: string;
  descriptionCourte: string;
  descriptionComplete: string;
  capaciteMaximale: string;
  adultesMax: string;
  enfantsMax: string;
  bebesMax: string;
  nombreChambres: string;
  nombreLits: string;
  nombreSallesDeBains: string;
  superficieM2: string;
  adresse: string;
  ville: string;
  pays: string;
  codePostal: string;
  devise: string;
  tarifPrix: string;
  typeTarif: string;
  photoUrl: string;
}

interface GalleryPhoto {
  id: string;
  url: string;
  urlThumbnail: string | null;
  ordre: number;
  estPrincipale: boolean;
  legende: string | null;
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bo-field">
      <label htmlFor={htmlFor} className="bo-label">
        {label} {required && <span style={{ color: "var(--bo-accent)" }}>*</span>}
      </label>
      {children}
      {hint && <p className="bo-form-hint">{hint}</p>}
    </div>
  );
}

export function PropertiesManager({ initialRows }: { initialRows: PropertyRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<PropertyRow[]>(initialRows);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [galleryState, setGalleryState] = useState<"idle" | "working">("idle");

  async function reload() {
    const res = await fetch("/api/admin/properties");
    if (res.ok) {
      const data = await res.json();
      setRows(data.properties);
    }
    router.refresh();
  }

  const setField = useCallback(
    (field: keyof FormState, value: string) =>
      setForm((f) => ({ ...f, [field]: value })),
    []
  );

  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState("");

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadState("uploading");
    setUploadError("");

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setUploadState("error");
        setUploadError(data.error ?? "Upload échoué.");
        return;
      }
      setForm((f) => ({ ...f, photoUrl: data.url }));
      setUploadState("idle");
    } catch {
      setUploadState("error");
      setUploadError("Erreur lors de l'upload.");
    }
  }

  async function handleGalleryUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    propertyId: string | null
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!propertyId) {
      setBanner({ type: "error", text: "Enregistrez d'abord le logement avant d'ajouter des photos." });
      return;
    }
    setGalleryState("working");

    const upBody = new FormData();
    upBody.append("file", file);
    try {
      const upRes = await fetch("/api/upload", { method: "POST", body: upBody });
      const upData = await upRes.json();
      if (!upRes.ok) {
        setBanner({ type: "error", text: upData.error ?? "Upload échoué." });
        setGalleryState("idle");
        return;
      }

      const addRes = await fetch("/api/admin/properties/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, url: upData.url }),
      });
      const addData = await addRes.json();
      if (!addRes.ok) {
        setBanner({ type: "error", text: addData.error ?? "Ajout de la photo échoué." });
        setGalleryState("idle");
        return;
      }
      setGallery((g) => [
        ...g,
        {
          id: addData.photo.id,
          url: addData.photo.url,
          urlThumbnail: addData.photo.urlThumbnail,
          ordre: addData.photo.ordre,
          estPrincipale: addData.photo.estPrincipale,
          legende: addData.photo.legende,
        },
      ]);
      setGalleryState("idle");
      event.target.value = "";
    } catch {
      setBanner({ type: "error", text: "Erreur lors de l'ajout de la photo." });
      setGalleryState("idle");
    }
  }

  async function gallerySetPrincipal(photoId: string) {
    setGalleryState("working");
    const res = await fetch("/api/admin/properties/photos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setPrincipal", photoId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setBanner({ type: "error", text: body.error ?? "Erreur." });
      setGalleryState("idle");
      return;
    }
    setGallery((g) =>
      g.map((p) => ({ ...p, estPrincipale: p.id === photoId }))
    );
    setGalleryState("idle");
  }

  async function galleryRemove(photoId: string) {
    setGalleryState("working");
    const res = await fetch(`/api/admin/properties/photos?photoId=${photoId}`, {
      method: "DELETE",
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBanner({ type: "error", text: body.error ?? "Erreur." });
      setGalleryState("idle");
      return;
    }
    setGallery((g) =>
      g
        .filter((p) => p.id !== photoId)
        .map((p, i) => ({ ...p, ordre: i }))
    );
    setGalleryState("idle");
  }

  async function galleryReorder(orderedIds: string[]) {
    const propertyId = editingId;
    if (!propertyId) return;
    const res = await fetch("/api/admin/properties/photos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", propertyId, orderedIds }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setBanner({ type: "error", text: body.error ?? "Erreur de réordonnancement." });
    }
  }

  async function galleryMove(photoId: string, dir: -1 | 1) {
    const index = gallery.findIndex((p) => p.id === photoId);
    const target = index + dir;
    if (index < 0 || target < 0 || target >= gallery.length) return;
    const next = [...gallery];
    [next[index], next[target]] = [next[target], next[index]];
    setGallery(next.map((p, i) => ({ ...p, ordre: i })));
    await galleryReorder(next.map((p) => p.id));
  }

  async function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setGallery([]);
    setBanner(null);
    setModalOpen(true);
  }

  async function openEdit(id: string) {
    setBanner(null);
    const res = await fetch(`/api/admin/properties?id=${id}`);
    if (!res.ok) {
      setBanner({ type: "error", text: "Impossible de charger le logement." });
      return;
    }
    const { property } = await res.json();
    setForm({
      nom: property.nom ?? "",
      type: property.type ?? "chambre",
      statut: property.statut ?? "brouillon",
      superCategorie: property.superCategorie ?? "logement_entier",
      descriptionCourte: property.descriptionCourte ?? "",
      descriptionComplete: property.descriptionComplete ?? "",
      capaciteMaximale: String(property.capaciteMaximale ?? 1),
      adultesMax: String(property.adultesMax ?? 1),
      enfantsMax: String(property.enfantsMax ?? 0),
      bebesMax: String(property.bebesMax ?? 0),
      nombreChambres: String(property.nombreChambres ?? 0),
      nombreLits: String(property.nombreLits ?? 0),
      nombreSallesDeBains: String(property.nombreSallesDeBains ?? 0),
      superficieM2: property.superficieM2 != null ? String(property.superficieM2) : "",
      adresse: property.adresse ?? "",
      ville: property.ville ?? "",
      pays: property.pays ?? "Bénin",
      codePostal: property.codePostal ?? "",
      devise: property.devise ?? "EUR",
      tarifPrix: property.tarifBase != null ? String(Number(property.tarifBase)) : "",
      typeTarif: property.typeTarif ?? "nuee",
      photoUrl: property.photoPrincipale ?? "",
    });
    setGallery(
      (property.photos ?? []).map((p: GalleryPhoto) => ({
        id: p.id,
        url: p.url,
        urlThumbnail: p.urlThumbnail,
        ordre: p.ordre,
        estPrincipale: p.estPrincipale,
        legende: p.legende,
      }))
    );
    setEditingId(id);
    setModalOpen(true);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setBanner(null);

    const payload = {
      nom: form.nom,
      type: form.type,
      statut: form.statut,
      superCategorie: form.superCategorie,
      descriptionCourte: form.descriptionCourte,
      descriptionComplete: form.descriptionComplete,
      capaciteMaximale: form.capaciteMaximale,
      adultesMax: form.adultesMax,
      enfantsMax: form.enfantsMax,
      bebesMax: form.bebesMax,
      nombreChambres: form.nombreChambres,
      nombreLits: form.nombreLits,
      nombreSallesDeBains: form.nombreSallesDeBains,
      superficieM2: form.superficieM2,
      adresse: form.adresse,
      ville: form.ville,
      pays: form.pays,
      codePostal: form.codePostal,
      devise: form.devise,
      tarifPrix: form.tarifPrix,
      typeTarif: form.typeTarif,
      photoUrl: form.photoUrl,
      ...(editingId ? { id: editingId } : {}),
    };

    const res = await fetch("/api/admin/properties", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json();

    if (!res.ok) {
      setBanner({ type: "error", text: body.error ?? "Erreur lors de l'enregistrement." });
      setStatus("idle");
      return;
    }

    setModalOpen(false);
    setStatus("idle");
    await reload();
    setBanner({
      type: "success",
      text: editingId ? "Logement mis à jour." : "Logement créé.",
    });
    setEditingId(null);
  }

  async function remove(id: string) {
    setBanner(null);
    const res = await fetch(`/api/admin/properties?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setBanner({ type: "error", text: body.error ?? "Erreur lors de la suppression." });
      setConfirmDelete(null);
      return;
    }
    setConfirmDelete(null);
    await reload();
    setBanner({ type: "success", text: "Logement supprimé." });
  }

  return (
    <div className="bo-card">
      <div className="bo-card-header">
        <h3 className="bo-card-title">Logements ({rows.length})</h3>
        <button type="button" className="bo-btn bo-btn--primary" onClick={openCreate}>
          <FaPlus aria-hidden="true" />
          Nouveau logement
        </button>
      </div>

      {banner && (
        <p
          className={`bo-form-${banner.type === "success" ? "success" : "error"}`}
          style={{ margin: "14px 18px 0" }}
        >
          {banner.text}
        </p>
      )}

      <div className="bo-table-wrap">
        <table className="bo-table">
          <thead>
            <tr>
              <th>Logement</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Capacité</th>
              <th>Ch.</th>
              <th>Ville</th>
              <th>Tarif</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="bo-table-cell-photo">
                    {row.photo ? (
                      <div className="bo-table-photo-wrap">
                        <img
                          src={row.photo}
                          alt={row.nom}
                          className="bo-table-photo"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="bo-table-photo-placeholder">
                        <FaImage aria-hidden="true" />
                      </div>
                    )}
                    <strong className="bo-table-property-name">{row.nom}</strong>
                  </div>
                </td>
                <td>{typeLabel(row.type)}</td>
                <td><StatusBadge status={row.statut} /></td>
                <td>{row.capaciteMaximale} p.</td>
                <td>{row.nombreChambres > 0 ? row.nombreChambres : "—"}</td>
                <td>{row.ville}</td>
                <td>
                  {row.tarifBase != null
                    ? `${Number(row.tarifBase)} ${row.devise}`
                    : "—"}
                </td>
                <td>{row.note != null ? `${row.note} (${row.nombreAvis})` : "—"}</td>
                <td>
                  <div className="bo-table-actions">
                    <button
                      type="button"
                      className="bo-btn bo-btn--secondary"
                      onClick={() => openEdit(row.id)}
                      aria-label={`Éditer ${row.nom}`}
                    >
                      <FaPencil aria-hidden="true" />
                      <span className="bo-btn-label">Éditer</span>
                    </button>
                    <button
                      type="button"
                      className="bo-btn bo-btn--danger"
                      onClick={() => setConfirmDelete(row.id)}
                      aria-label={`Supprimer ${row.nom}`}
                    >
                      <FaTrash aria-hidden="true" />
                      <span className="bo-btn-label">Suppr.</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="bo-empty">
                    <h3 className="bo-empty-title">Aucun logement</h3>
                    <p>Créez votre premier logement.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <>
          <button
            type="button"
            className="bo-backdrop bo-modal-backdrop"
            aria-label="Fermer"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="bo-modal" role="dialog" aria-modal="true">
            <div className="bo-modal-header">
              <h4 className="bo-card-title">Supprimer ce logement ?</h4>
            </div>
            <div className="bo-modal-body">
              <p>
                Cette action supprime définitivement le logement, ses photos, tarifs et
                réservations associées.
              </p>
            </div>
            <div className="bo-modal-footer">
              <button type="button" className="bo-btn bo-btn--secondary" onClick={() => setConfirmDelete(null)}>
                Annuler
              </button>
              <button type="button" className="bo-btn bo-btn--danger" onClick={() => remove(confirmDelete)}>
                Supprimer
              </button>
            </div>
          </div>
        </>
      )}

      {modalOpen && (
        <>
          <button
            type="button"
            className="bo-backdrop bo-modal-backdrop"
            aria-label="Fermer"
            onClick={() => setModalOpen(false)}
          />
          <div
            className="bo-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="property-form-title"
            style={{ maxWidth: 720 }}
          >
            <div className="bo-modal-header">
              <h4 id="property-form-title" className="bo-card-title">
                {editingId ? "Éditer le logement" : "Nouveau logement"}
              </h4>
              <button
                type="button"
                className="bo-icon-btn"
                aria-label="Fermer"
                onClick={() => setModalOpen(false)}
              >
                <FaXmark aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={save}>
              <div className="bo-modal-body">
                <div className="bo-form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <Field label="Nom du logement" htmlFor="pr-nom" required>
                    <input
                      id="pr-nom"
                      type="text"
                      className="bo-input"
                      value={form.nom}
                      onChange={(e) => setField("nom", e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Type" htmlFor="pr-type" required>
                    <select
                      id="pr-type"
                      className="bo-select"
                      value={form.type}
                      onChange={(e) => setField("type", e.target.value)}
                    >
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Catégorie" htmlFor="pr-super">
                    <select
                      id="pr-super"
                      className="bo-select"
                      value={form.superCategorie}
                      onChange={(e) => setField("superCategorie", e.target.value)}
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Statut" htmlFor="pr-statut">
                    <select
                      id="pr-statut"
                      className="bo-select"
                      value={form.statut}
                      onChange={(e) => setField("statut", e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Capacité max (personnes)" htmlFor="pr-cap" required>
                    <input
                      id="pr-cap"
                      type="number"
                      min={1}
                      className="bo-input"
                      value={form.capaciteMaximale}
                      onChange={(e) => setField("capaciteMaximale", e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Adultes max" htmlFor="pr-adultes">
                    <input
                      id="pr-adultes"
                      type="number"
                      className="bo-input"
                      value={form.adultesMax}
                      onChange={(e) => setField("adultesMax", e.target.value)}
                    />
                  </Field>
                  <Field label="Enfants max" htmlFor="pr-enfants">
                    <input
                      id="pr-enfants"
                      type="number"
                      className="bo-input"
                      value={form.enfantsMax}
                      onChange={(e) => setField("enfantsMax", e.target.value)}
                    />
                  </Field>
                  <Field label="Bébés max" htmlFor="pr-bebes">
                    <input
                      id="pr-bebes"
                      type="number"
                      className="bo-input"
                      value={form.bebesMax}
                      onChange={(e) => setField("bebesMax", e.target.value)}
                    />
                  </Field>
                  <Field label="Nb chambres" htmlFor="pr-chambres">
                    <input
                      id="pr-chambres"
                      type="number"
                      className="bo-input"
                      value={form.nombreChambres}
                      onChange={(e) => setField("nombreChambres", e.target.value)}
                    />
                  </Field>
                  <Field label="Nb lits" htmlFor="pr-lits">
                    <input
                      id="pr-lits"
                      type="number"
                      className="bo-input"
                      value={form.nombreLits}
                      onChange={(e) => setField("nombreLits", e.target.value)}
                    />
                  </Field>
                  <Field label="Nb salles de bain" htmlFor="pr-sdb">
                    <input
                      id="pr-sdb"
                      type="number"
                      className="bo-input"
                      value={form.nombreSallesDeBains}
                      onChange={(e) => setField("nombreSallesDeBains", e.target.value)}
                    />
                  </Field>
                  <Field label="Superficie (m²)" htmlFor="pr-superficie">
                    <input
                      id="pr-superficie"
                      type="number"
                      className="bo-input"
                      value={form.superficieM2}
                      onChange={(e) => setField("superficieM2", e.target.value)}
                    />
                  </Field>
                  <Field label="Ville" htmlFor="pr-ville" required>
                    <input
                      id="pr-ville"
                      type="text"
                      className="bo-input"
                      value={form.ville}
                      onChange={(e) => setField("ville", e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Pays" htmlFor="pr-pays">
                    <input
                      id="pr-pays"
                      type="text"
                      className="bo-input"
                      value={form.pays}
                      onChange={(e) => setField("pays", e.target.value)}
                    />
                  </Field>
                  <Field label="Adresse" htmlFor="pr-adresse" required>
                    <input
                      id="pr-adresse"
                      type="text"
                      className="bo-input"
                      value={form.adresse}
                      onChange={(e) => setField("adresse", e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Code postal" htmlFor="pr-cp">
                    <input
                      id="pr-cp"
                      type="text"
                      className="bo-input"
                      value={form.codePostal}
                      onChange={(e) => setField("codePostal", e.target.value)}
                    />
                  </Field>
                  <Field label="Devise" htmlFor="pr-devise">
                    <select
                      id="pr-devise"
                      className="bo-select"
                      value={form.devise}
                      onChange={(e) => setField("devise", e.target.value)}
                    >
                      {DEVISE_OPTIONS.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Tarif de base" htmlFor="pr-tarif">
                    <input
                      id="pr-tarif"
                      type="number"
                      step="any"
                      className="bo-input"
                      value={form.tarifPrix}
                      onChange={(e) => setField("tarifPrix", e.target.value)}
                    />
                  </Field>
                  <Field label="Type de tarif" htmlFor="pr-ttarif">
                    <select
                      id="pr-ttarif"
                      className="bo-select"
                      value={form.typeTarif}
                      onChange={(e) => setField("typeTarif", e.target.value)}
                    >
                      {TARIF_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Photo principale"
                    htmlFor="pr-photo-file"
                    hint="Formats acceptés : JPEG, PNG, WEBP, GIF, AVIF (max 5 Mo)."
                  >
                    {form.photoUrl && (
                      <img
                        src={form.photoUrl}
                        alt="Aperçu"
                        style={{
                          width: "100%",
                          maxHeight: 140,
                          objectFit: "cover",
                          borderRadius: 8,
                          marginBottom: 10,
                        }}
                      />
                    )}
                    <input
                      id="pr-photo-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                      onChange={handleFileUpload}
                      className="bo-input"
                      style={{ padding: 8 }}
                    />
                    {uploadState === "uploading" && (
                      <p className="bo-form-hint">Upload en cours…</p>
                    )}
                    {uploadState === "error" && (
                      <p className="bo-form-error">{uploadError}</p>
                    )}
                  </Field>
                  <Field label="…ou coller une URL d'image" htmlFor="pr-photo">
                    <input
                      id="pr-photo"
                      type="text"
                      className="bo-input"
                      value={form.photoUrl}
                      onChange={(e) => setField("photoUrl", e.target.value)}
                      placeholder="https://…"
                    />
                  </Field>
                  <Field label="Description courte" htmlFor="pr-descC" hint="Résumé affiché sur les cartes.">
                    <input
                      id="pr-descC"
                      type="text"
                      className="bo-input"
                      value={form.descriptionCourte}
                      onChange={(e) => setField("descriptionCourte", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="bo-field" style={{ marginTop: 14 }}>
                  <label htmlFor="pr-descL" className="bo-label">
                    Description complète
                  </label>
                  <textarea
                    id="pr-descL"
                    className="bo-textarea"
                    value={form.descriptionComplete}
                    onChange={(e) => setField("descriptionComplete", e.target.value)}
                    rows={4}
                  />
                </div>

                {editingId && (
                  <div className="bo-field" style={{ marginTop: 18 }}>
                    <span className="bo-label">Galerie ({gallery.length} photo{gallery.length > 1 ? "s" : ""})</span>
                    <p className="bo-form-hint">
                      Ajoutez plusieurs photos, définissez la photo principale et réordonnez-les.
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                      {gallery.map((photo, i) => (
                        <div
                          key={photo.id}
                          style={{
                            position: "relative",
                            width: 120,
                            border: photo.estPrincipale
                              ? "2px solid var(--bo-accent)"
                              : "1px solid var(--bo-border)",
                            borderRadius: 8,
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={photo.urlThumbnail ?? photo.url}
                            alt={photo.legende ?? `Photo ${i + 1}`}
                            style={{ width: "100%", height: 78, objectFit: "cover", display: "block" }}
                          />
                          <div style={{ padding: 6, display: "flex", gap: 4, justifyContent: "center" }}>
                            <button
                              type="button"
                              className="bo-btn bo-btn--ghost"
                              style={{ padding: "2px 6px", fontSize: 12 }}
                              onClick={() => galleryMove(photo.id, -1)}
                              disabled={i === 0}
                              aria-label="Monter"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="bo-btn bo-btn--ghost"
                              style={{ padding: "2px 6px", fontSize: 12 }}
                              onClick={() => galleryMove(photo.id, 1)}
                              disabled={i === gallery.length - 1}
                              aria-label="Descendre"
                            >
                              ↓
                            </button>
                          </div>
                          {!photo.estPrincipale && (
                            <button
                              type="button"
                              onClick={() => gallerySetPrincipal(photo.id)}
                              style={{
                                position: "absolute",
                                top: 4,
                                left: 4,
                                fontSize: 11,
                                padding: "2px 6px",
                                borderRadius: 4,
                                border: "none",
                                background: "rgba(0,0,0,0.55)",
                                color: "#fff",
                                cursor: "pointer",
                              }}
                            >
                              Définir principale
                            </button>
                          )}
                          {photo.estPrincipale && (
                            <span
                              style={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                fontSize: 11,
                                padding: "2px 6px",
                                borderRadius: 4,
                                background: "var(--bo-accent)",
                                color: "#fff",
                              }}
                            >
                              Principale
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => galleryRemove(photo.id)}
                            style={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              fontSize: 11,
                              padding: "2px 6px",
                              borderRadius: 4,
                              border: "none",
                              background: "var(--bo-danger, #dc2626)",
                              color: "#fff",
                              cursor: "pointer",
                              display: photo.estPrincipale ? "none" : "block",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <label
                        htmlFor="pr-gallery-file"
                        className="bo-btn bo-btn--secondary"
                        style={{ display: "inline-flex", cursor: "pointer" }}
                      >
                        {galleryState === "working" ? "Ajout…" : "+ Ajouter une photo"}
                      </label>
                      <input
                        id="pr-gallery-file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        onChange={(e) => handleGalleryUpload(e, editingId)}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="bo-modal-footer">
                <button type="button" className="bo-btn bo-btn--secondary" onClick={() => setModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="bo-btn bo-btn--primary" disabled={status === "loading"}>
                  {status === "loading"
                    ? "Enregistrement…"
                    : editingId
                      ? "Mettre à jour"
                      : "Créer le logement"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
