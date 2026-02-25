/**
 * Returns true when a product is created within the last 7 days.
 * @param {string|Date} createdAt Product creation date.
 * @returns {boolean} Product newness state.
 */
export const isNewMarketProduct = (createdAt) => {
  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) return false;

  const diffMs = Date.now() - createdDate.getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  return diffMs <= sevenDaysMs;
};

/**
 * Resolves market product badge by stock and creation date.
 * @param {{quantity:number,createdAt:string|Date}} product Product data.
 * @returns {{label:string,type:string}|null} Badge descriptor.
 */
export const getMarketProductBadge = (product) => {
  if (!product) return null;

  if (Number(product.quantity) <= 0) {
    return { label: "Qolmagan", type: "neutral" };
  }

  if (isNewMarketProduct(product.createdAt)) {
    return { label: "Yangi", type: "primary" };
  }

  return null;
};
