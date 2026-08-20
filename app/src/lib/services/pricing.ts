import { prisma } from "@/lib/prisma";

export interface PriceCalculation {
  nightsOrUnits: number;
  baseRate: number;
  unitPrice: number;
  subtotal: number;
  cleaningFee: number;
  cityTax: number;
  supplements: number;
  discount: number;
  total: number;
  currency: string;
  breakdown: string[];
}

function nightsBetween(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}

function hoursBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TarifRow = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PromoRow = any;

function findBestNightlyRate(tarifs: TarifRow[], nights: number, date: Date): number {
  const nightlyTarifs = tarifs.filter(
    (t: TarifRow) => t.typeTarif === "standard" || t.typeTarif === "nuee"
  );

  if (nightlyTarifs.length === 0) return 0;

  let bestRate = Infinity;

  for (const tarif of nightlyTarifs) {
    if (date >= tarif.dateDebut && date <= tarif.dateFin) {
      const price = Number(tarif.prix);
      if (price < bestRate) bestRate = price;
    }
  }

  if (bestRate === Infinity && nightlyTarifs.length > 0) {
    bestRate = Number(nightlyTarifs[0].prix);
  }

  const weeklyTarif = tarifs.find((t: TarifRow) => t.typeTarif === "hebdomadaire");
  if (weeklyTarif && nights >= 7) {
    const weeklyPerNight = Number(weeklyTarif.prix) / 7;
    if (weeklyPerNight < bestRate) bestRate = weeklyPerNight;
  }

  const monthlyTarif = tarifs.find((t: TarifRow) => t.typeTarif === "mensuel");
  if (monthlyTarif && nights >= 30) {
    const monthlyPerNight = Number(monthlyTarif.prix) / 30;
    if (monthlyPerNight < bestRate) bestRate = monthlyPerNight;
  }

  return bestRate;
}

function findRateByType(tarifs: TarifRow[], type: string): number {
  const tarif = tarifs.find((t: TarifRow) => t.typeTarif === type);
  return tarif ? Number(tarif.prix) : 0;
}

function findBestPromotion(promotions: PromoRow[], subtotal: number, date: Date, nights: number) {
  let bestPromotion: PromoRow | null = null;
  let bestDiscount = 0;

  for (const promo of promotions) {
    if (date < promo.dateDebut || date > promo.dateFin) continue;
    if (promo.dureeMinimaleNuits && nights < promo.dureeMinimaleNuits) continue;

    let discount = 0;
    if (promo.typeReduction === "pourcentage") {
      discount = subtotal * (Number(promo.valeur) / 100);
    } else {
      discount = Number(promo.valeur);
    }

    if (discount > bestDiscount) {
      bestDiscount = discount;
      bestPromotion = promo;
    }
  }

  return bestPromotion;
}

export async function calculatePrice(params: {
  propertyId: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  typeReservation: string;
  adults: number;
  children: number;
  babies: number;
}): Promise<PriceCalculation> {
  const {
    propertyId,
    startDate,
    endDate,
    typeReservation,
    adults,
    children,
    babies,
  } = params;

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      tarifs: { where: { actif: true } },
      promotions: { where: { actif: true } },
    },
  });

  if (!property) {
    throw new Error("Logement introuvable");
  }

  const totalGuests = adults + children;
  const currency = property.devise;

  let nightsOrUnits = 0;
  let unitPrice = 0;
  let baseRate = 0;

  const applicableTarifs = property.tarifs;

  switch (typeReservation) {
    case "nuee": {
      nightsOrUnits = nightsBetween(startDate, endDate);
      baseRate = findBestNightlyRate(applicableTarifs, nightsOrUnits, startDate);
      unitPrice = baseRate;
      break;
    }
    case "vingt_quatre_heures": {
      nightsOrUnits = hoursBetween(startDate, endDate);
      const rate = findRateByType(applicableTarifs, "vingt_quatre_heures");
      unitPrice = rate;
      baseRate = rate;
      break;
    }
    case "heure": {
      nightsOrUnits = hoursBetween(startDate, endDate);
      const rate = findRateByType(applicableTarifs, "heure");
      unitPrice = rate;
      baseRate = rate;
      break;
    }
    case "demi_journee": {
      nightsOrUnits = Math.max(1, Math.ceil(hoursBetween(startDate, endDate) / 4));
      const rate = findRateByType(applicableTarifs, "demi_journee");
      unitPrice = rate;
      baseRate = rate;
      break;
    }
    case "journee": {
      nightsOrUnits = Math.max(1, nightsBetween(startDate, endDate));
      const rate = findRateByType(applicableTarifs, "journee");
      unitPrice = rate;
      baseRate = rate;
      break;
    }
    case "semaine": {
      const totalNights = nightsBetween(startDate, endDate);
      nightsOrUnits = Math.floor(totalNights / 7);
      const weeklyRate = findRateByType(applicableTarifs, "semaine");
      const nightlyRate = findBestNightlyRate(applicableTarifs, totalNights, startDate);
      unitPrice = weeklyRate;
      baseRate = nightlyRate;
      break;
    }
    case "mois": {
      const totalNights = nightsBetween(startDate, endDate);
      nightsOrUnits = Math.floor(totalNights / 30);
      const monthlyRate = findRateByType(applicableTarifs, "mensuel");
      const nightlyRate = findBestNightlyRate(applicableTarifs, totalNights, startDate);
      unitPrice = monthlyRate;
      baseRate = nightlyRate;
      break;
    }
    default: {
      nightsOrUnits = nightsBetween(startDate, endDate);
      baseRate = findBestNightlyRate(applicableTarifs, nightsOrUnits, startDate);
      unitPrice = baseRate;
    }
  }

  let subtotal = 0;

  if (typeReservation === "semaine" && nightsOrUnits > 0) {
    const weeklyRate = findRateByType(applicableTarifs, "semaine");
    const totalNights = nightsBetween(startDate, endDate);
    const remainingNights = totalNights % 7;
    const nightlyRate = findBestNightlyRate(applicableTarifs, totalNights, startDate);
    subtotal = weeklyRate * nightsOrUnits + nightlyRate * remainingNights;
  } else if (typeReservation === "mois" && nightsOrUnits > 0) {
    const monthlyRate = findRateByType(applicableTarifs, "mensuel");
    const totalNights = nightsBetween(startDate, endDate);
    const remainingNights = totalNights % 30;
    const nightlyRate = findBestNightlyRate(applicableTarifs, totalNights, startDate);
    subtotal = monthlyRate * nightsOrUnits + nightlyRate * remainingNights;
  } else {
    subtotal = unitPrice * nightsOrUnits;
  }

  const cleaningFee = 0;

  const cityTaxPerNight = 2;
  const nightsForTax = typeReservation === "heure" || typeReservation === "demi_journee" || typeReservation === "journee"
    ? 0
    : nightsBetween(startDate, endDate);
  const cityTax = cityTaxPerNight * totalGuests * nightsForTax;

  const supplements = 0;

  let discount = 0;
  const bestPromotion = findBestPromotion(property.promotions, subtotal, startDate, nightsOrUnits);
  if (bestPromotion) {
    if (bestPromotion.typeReduction === "pourcentage") {
      discount = subtotal * (Number(bestPromotion.valeur) / 100);
    } else {
      discount = Number(bestPromotion.valeur);
    }
  }

  const total = Math.max(0, subtotal + cleaningFee + cityTax + supplements - discount);

  const breakdown: string[] = [];
  breakdown.push(`${unitPrice} ${currency} x ${nightsOrUnits} unite(s) = ${subtotal} ${currency}`);
  if (cleaningFee > 0) breakdown.push(`Frais de menage = ${cleaningFee} ${currency}`);
  if (cityTax > 0) breakdown.push(`Taxe de sejour = ${cityTax} ${currency}`);
  if (discount > 0) breakdown.push(`Reduction = -${discount} ${currency}`);

  return {
    nightsOrUnits,
    baseRate,
    unitPrice,
    subtotal: Number(subtotal.toFixed(2)),
    cleaningFee,
    cityTax: Number(cityTax.toFixed(2)),
    supplements,
    discount: Number(discount.toFixed(2)),
    total: Number(total.toFixed(2)),
    currency,
    breakdown,
  };
}
