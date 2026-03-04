const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const buildFlagUrl = (countryCode = "") => {
  const code = String(countryCode).toLowerCase();
  if (!/^[a-z]{2}$/.test(code)) return "";
  return `https://flagcdn.com/w80/${code}.png`;
};

export const toFlagEmoji = (countryCode = "") => {
  const code = String(countryCode).toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...[...code].map((char) => 127397 + char.charCodeAt(0))
  );
};

export const getCountryOptions = () => {
  try {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    const countries = [];

    for (const first of letters) {
      for (const second of letters) {
        const code = `${first}${second}`;
        const name = regionNames.of(code);
        if (name && name !== code) {
          countries.push({
            code,
            name,
            flag: toFlagEmoji(code),
            flagUrl: buildFlagUrl(code),
          });
        }
      }
    }

    return countries.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [
      { code: "IN", name: "India", flag: toFlagEmoji("IN"), flagUrl: buildFlagUrl("IN") },
      { code: "US", name: "United States", flag: toFlagEmoji("US"), flagUrl: buildFlagUrl("US") },
      { code: "GB", name: "United Kingdom", flag: toFlagEmoji("GB"), flagUrl: buildFlagUrl("GB") },
      { code: "CA", name: "Canada", flag: toFlagEmoji("CA"), flagUrl: buildFlagUrl("CA") },
      { code: "AU", name: "Australia", flag: toFlagEmoji("AU"), flagUrl: buildFlagUrl("AU") },
    ];
  }
};

export const getCurrencyOptions = () => {
  try {
    if (typeof Intl.supportedValuesOf === "function") {
      return Intl.supportedValuesOf("currency");
    }
  } catch {
    // fallback below
  }
  return ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "AED", "SGD"];
};

export const getPhoneCodeOptions = () => [
  { code: "+91", label: "+91 (India)" },
  { code: "+1", label: "+1 (USA/Canada)" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+61", label: "+61 (Australia)" },
  { code: "+971", label: "+971 (UAE)" },
  { code: "+65", label: "+65 (Singapore)" },
  { code: "+81", label: "+81 (Japan)" },
  { code: "+49", label: "+49 (Germany)" },
  { code: "+33", label: "+33 (France)" },
  { code: "+39", label: "+39 (Italy)" },
];
