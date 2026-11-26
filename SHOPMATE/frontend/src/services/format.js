export const currency = amount => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
export const shippingFor = subtotal => subtotal >= 2999 ? 0 : 99;
export const getProductImage = product => product?.image || '/image-fallback.svg';
