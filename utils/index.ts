import { CarProps, FilterProps } from "@/types";

export async function fetchCars(filters: FilterProps) {
  const { manufacturer, year, model, fuel } = filters;

  const headers = {
    "x-rapidapi-key": "ce8451183emshf681ec32d41028ap13ffabjsnacb842e7cbfe",
    "x-rapidapi-host": "cars-by-api-ninjas.p.rapidapi.com",
  };

  // dacă utilizatorul selectează un an -> doar acel an
  // dacă nu -> căutăm mai mulți ani ca să obținem destule mașini
  const years = year ? [year] : [2018, 2019, 2020, 2021, 2022, 2023, 2024];

  let allCars: any[] = [];

  for (const y of years) {
    const url = new URL("https://cars-by-api-ninjas.p.rapidapi.com/v1/cars");

    if (manufacturer) url.searchParams.append("make", manufacturer);
    if (model) url.searchParams.append("model", model);
    if (fuel) url.searchParams.append("fuel_type", fuel); // doar "gas" sau "electricity"
    url.searchParams.append("year", y.toString());

    try {
      const response = await fetch(url.toString(), { headers });
      const result = await response.json();

      if (Array.isArray(result)) {
        const carsWithExtras = result.map((car) => {
          const carAge = new Date().getFullYear() - car.year;
          const price = Math.max(5000, 40000 - carAge * 1500);
          const city_mpg = Math.max(15, 25 + (car.year - 2010) * 0.5);

          return { ...car, price, city_mpg };
        });

        allCars = [...allCars, ...carsWithExtras];
      }
    } catch (error) {
      console.error("API error:", error);
    }

    // oprim dacă avem deja minim 9 mașini
    if (allCars.length >= 9) break;
  }

  return allCars.slice(0, 9);
}

export const calculateCarRent = (city_mpg: number, year: number) => {
  const basePricePerDay = 50;
  const mileageFactor = 0.1;
  const ageFactor = 0.05;

  const safeMpg = city_mpg || 25;

  const mileageRate = safeMpg * mileageFactor;
  const ageRate = (new Date().getFullYear() - year) * ageFactor;

  const rentalRatePerDay = basePricePerDay + mileageRate + ageRate;

  return rentalRatePerDay.toFixed(0);
};

export const generateCarImageUrl = (car: CarProps, angle?: string) => {
  const url = new URL("https://cdn.imagin.studio/getimage");
  const { make, model, year } = car;

  url.searchParams.append("customer", "img");
  url.searchParams.append("make", make);
  url.searchParams.append("modelFamily", model.split(" ")[0]);
  url.searchParams.append("zoomType", "fullscreen");
  url.searchParams.append("modelYear", `${year}`);
  url.searchParams.append("angle", `${angle}`);

  return `${url}`;
};

export const updateSearchParams = (type: string, value: string) => {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(type, value);
  const newPathname = `${window.location.pathname}?${searchParams.toString()}`;
  return newPathname;
};
