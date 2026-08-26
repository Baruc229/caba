export function SkeletonCard() {
  return (
    <article className="property-card property-card--skeleton" aria-hidden="true">
      <div className="skeleton property-card-photo-skeleton" />
      <div className="property-card-body">
        <div className="skeleton" style={{ height: 20, width: "70%", marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 14, width: "55%", marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          <div className="skeleton" style={{ height: 24, width: 60 }} />
          <div className="skeleton" style={{ height: 24, width: 60 }} />
          <div className="skeleton" style={{ height: 24, width: 60 }} />
        </div>
        <div className="skeleton" style={{ height: 14, width: "35%", marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 18, width: "60%", marginBottom: 14 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <div className="skeleton" style={{ height: 36, flex: 1 }} />
          <div className="skeleton" style={{ height: 36, flex: 1 }} />
        </div>
      </div>
    </article>
  );
}
