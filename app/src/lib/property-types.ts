export interface PropertyTypeConfig {
  value: string;
  labelKey: string;
}

/**
 * Source unique de vérité pour les types de logement.
 * Utilisée identiquement par : le panneau "Modifier", la sidebar de filtres
 * et l'API /api/search/filters.
 */
export const PROPERTY_TYPES: PropertyTypeConfig[] = [
  { value: "chambre", labelKey: "home.typeChambre" },
  { value: "chambre_avec_salon", labelKey: "home.typeChambreAvecSalon" },
  { value: "studio", labelKey: "home.typeStudio" },
  { value: "appartement_meuble", labelKey: "home.typeAppartementMeuble" },
  { value: "suite", labelKey: "home.typeSuite" },
  { value: "villa", labelKey: "home.typeVilla" },
  { value: "duplex", labelKey: "home.typeDuplex" },
  { value: "maison_entiere", labelKey: "home.typeMaisonEntiere" },
];

export const PROPERTY_TYPE_MAP: Record<string, string> = Object.fromEntries(
  PROPERTY_TYPES.map((pt) => [pt.value, pt.labelKey])
);