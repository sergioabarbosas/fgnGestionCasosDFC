
export function getBadgeColor(count) {
  if (count === 0) return "error";
  if (count > 999) return "secondary";
  return "success";
};

// cantidad por fuentes
export const getCount = (arr) => (Array.isArray(arr) ? arr.length : 0);