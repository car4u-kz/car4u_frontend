const LONG_DASH = "\u2014";

export const formatPrice = (price: number): string => {
  if (typeof price !== "number") return "н/д";
  if (price <= 0) return "0";

  const millions = price / 1_000_000;
  const formatted = millions
    .toFixed(2)
    .replace(/\.?0+$/, "")
    .replace(".", ",");

  return `${formatted} млн. тг`;
};
export const formatDistance = (distance: number) => {
  if (typeof distance !== "number") return "н/д";
  if (distance <= 0) return "0 км";

  const strValue = distance.toString();
  const valLength = strValue.length;
  let formattedValue = "";
  if (valLength >= 1 && valLength <= 3) {
    formattedValue = strValue;
  }

  if (valLength === 4) {
    formattedValue = strValue.slice(0, 1) + " " + strValue.slice(1);
  }

  if (valLength === 5) {
    formattedValue = strValue.slice(0, 2) + " " + strValue.slice(2);
  }

  if (valLength === 6) {
    formattedValue = strValue.slice(0, 3) + " " + strValue.slice(3);
  }

  if (strValue.length === 7) {
    formattedValue =
      strValue.slice(0, 1) +
      " " +
      strValue.slice(1, 4) +
      " " +
      strValue.slice(4);
  }

  return formattedValue ? `${formattedValue} км` : LONG_DASH;
};

export const getInternalApiUrl = (): string => {
  const url = process.env.INTERNAL_API_URL;

  if (!url) {
    throw new Error("INTERNAL_API_URL is not defined");
  }
  return url;
};

export const getAdIdFromUrl = (url: string): string => {
  return url.split("/").pop() ?? "";
};
