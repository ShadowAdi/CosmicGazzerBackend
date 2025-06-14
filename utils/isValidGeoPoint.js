export const isValidGeoPoint = (location) => {
  if (!location || location.type !== "Point") return false;
  const [lng, lat] = location.coordinates || [];
  return (
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2 &&
    typeof lng === "number" &&
    typeof lat === "number" &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
};
