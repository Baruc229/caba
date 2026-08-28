export type Lang = "fr" | "en";

export const rates = {
  // 1 EUR = 655.957 FCFA (fixe CFA)
  EUR_TO_FCFA: 655.957,
  FCFA_TO_EUR: 1 / 655.957,
} as const;

export const dictionaries = {
  fr: {
    nav: {
      accueil: "Accueil",
      chambres: "Chambres",
      aPropos: "À propos",
      contact: "Contact",
      maison: "Caba Résidence",
    },
    common: {
      connexion: "Connexion",
      inscription: "Inscription",
      reserver: "Réserver",
      deconnexion: "Déconnexion",
      monCompte: "Mon compte",
      backOffice: "Back-office",
      fermer: "Fermer",
      annuler: "Annuler",
      valider: "Valider",
      enregistrer: "Enregistrer",
      charger: "Chargement…",
      voirPlus: "Voir plus",
      prixNonDisponible: "Prix non disponible",
      aPartirDe: "à partir de",
      parNuit: "/nuit",
      pourNuits: "pour {n} nuit{s}",
      voyageurs: "{n} voyageurs",
      avis: "({n} avis)",
      voirLogement: "Voir le logement",
      ajouterFavoris: "Ajouter aux favoris",
      changerAdresse: "Changer d’adresse email",
    },
    menuUser: {
      mesReservations: "Mes réservations",
      mesFavoris: "Mes favoris",
      gererProfil: "Gérer mon profil",
      preferences: "Préférences",
    },
  },
  en: {
    nav: {
      accueil: "Home",
      chambres: "Rooms",
      aPropos: "About",
      contact: "Contact",
      maison: "Caba Résidence",
    },
    common: {
      connexion: "Log in",
      inscription: "Sign up",
      reserver: "Book",
      deconnexion: "Log out",
      monCompte: "My account",
      backOffice: "Back office",
      fermer: "Close",
      annuler: "Cancel",
      valider: "Confirm",
      enregistrer: "Save",
      charger: "Loading…",
      voirPlus: "See more",
      prixNonDisponible: "Price unavailable",
      aPartirDe: "from",
      parNuit: "/night",
      pourNuits: "for {n} night{s}",
      voyageurs: "{n} guests",
      avis: "({n} reviews)",
      voirLogement: "View property",
      ajouterFavoris: "Add to favorites",
      changerAdresse: "Change email address",
    },
    menuUser: {
      mesReservations: "My bookings",
      mesFavoris: "My favorites",
      gererProfil: "Manage my profile",
      preferences: "Preferences",
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)["en"];
