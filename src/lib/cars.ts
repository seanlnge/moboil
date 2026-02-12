/** Curated list of common car makes in the US market. */
export const carMakes = [
  "Acura",
  "Alfa Romeo",
  "Audi",
  "BMW",
  "Buick",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Dodge",
  "Fiat",
  "Ford",
  "Genesis",
  "GMC",
  "Honda",
  "Hyundai",
  "Infiniti",
  "Jaguar",
  "Jeep",
  "Kia",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Mazda",
  "Mercedes-Benz",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Porsche",
  "Ram",
  "Rivian",
  "Subaru",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
  "Other",
];

// ---------------------------------------------------------------------------
// NHTSA vPIC API – fetch models for a make + year
// ---------------------------------------------------------------------------

const NHTSA_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

interface NHTSAModelResult {
  Make_ID: number;
  Make_Name: string;
  Model_ID: number;
  Model_Name: string;
}

interface NHTSAModelsResponse {
  Count: number;
  Message: string;
  Results: NHTSAModelResult[];
}

const VEHICLE_TYPES = ["car", "truck"] as const;

/**
 * Fetch models from the NHTSA vPIC API for a given make and year.
 * Queries both "car" and "truck" vehicle types and merges the results.
 * Returns a sorted, deduplicated array of model names.
 * Returns an empty array on error so the UI can degrade gracefully.
 */
export async function fetchModels(
  make: string,
  year: string,
): Promise<string[]> {
  if (!make || !year) return [];

  try {
    const requests = VEHICLE_TYPES.map(async (type) => {
      const url = `${NHTSA_BASE}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${encodeURIComponent(year)}/vehicletype/${type}?format=json`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data: NHTSAModelsResponse = await res.json();
      return data.Results.map((r) => r.Model_Name).filter(Boolean);
    });

    const results = await Promise.all(requests);
    const merged = results.flat();

    // Deduplicate and sort
    return [...new Set(merged)].sort((a, b) => a.localeCompare(b));
  } catch (err) {
    console.error("Error fetching models:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// fueleconomy.gov API – fetch trims for a year/make/model
// ---------------------------------------------------------------------------

/** A trim option returned by the fueleconomy.gov API. */
export interface TrimOption {
  text: string;  // e.g. "Auto (S6), 6 cyl, 3.5 L"
  value: string; // e.g. "25275"
}

const FUEL_ECONOMY_BASE = "https://fueleconomy.gov/ws/rest/vehicle/menu/options";

/**
 * Fetch available trims from the fueleconomy.gov API for a given year/make/model.
 * Returns an empty array on error so the UI can degrade gracefully.
 */
export async function fetchTrims(
  year: string,
  make: string,
  model: string,
): Promise<TrimOption[]> {
  if (!year || !make || !model) return [];

  const params = new URLSearchParams({ year, make, model });
  const url = `${FUEL_ECONOMY_BASE}?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];

    const xml = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");

    const items = doc.querySelectorAll("menuItem");
    const trims: TrimOption[] = [];

    items.forEach((item) => {
      const text = item.querySelector("text")?.textContent?.trim() ?? "";
      const value = item.querySelector("value")?.textContent?.trim() ?? "";
      if (text && value) {
        trims.push({ text, value });
      }
    });

    return trims;
  } catch (err) {
    console.error("Error fetching trims:", err);
    return [];
  }
}
