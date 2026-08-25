import { FaStar } from "react-icons/fa6";

/* Colonne droite (~45%) du panneau d'authentification : photo du
   complexe sous dégradé, badge verre, étoiles dorées, citation et
   statistiques sur trait translucide. Partagée par les 4 pages. */
export function PhotoAside() {
  return (
    <aside className="auth-aside">
      <span className="auth-badge">Caba Résidence · Bénin</span>
      <div className="auth-aside-bottom">
        <div className="auth-stars" role="img" aria-label="Note moyenne 4,8 sur 5">
          {Array.from({ length: 5 }).map((_, index) => (
            <FaStar key={index} aria-hidden="true" />
          ))}
        </div>
        <p className="auth-quote">
          «&nbsp;Ici, vous n&apos;êtes pas un numéro de réservation&nbsp;— vous êtes notre
          hôte.&nbsp;»
        </p>
        <div className="auth-aside-stats">
          <div className="auth-aside-stat">
            <strong>4.8/5</strong>
            <span>Note moyenne</span>
          </div>
          <div className="auth-aside-stat">
            <strong>240+</strong>
            <span>Séjours accueillis</span>
          </div>
          <div className="auth-aside-stat">
            <strong>7</strong>
            <span>Types de logements</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
