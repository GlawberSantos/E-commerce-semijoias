import { query } from '../db.js';
import { CustomError } from './CustomError.js';

/**
 * Calcula o desconto de um cupom aplicado.
 * @param {string} couponCode - Código do cupom
 * @param {number} subtotal - Valor total dos produtos
 * @returns {Promise<{discount: number, coupon: string, applied: boolean}>}
 */
export async function calculateDiscount(couponCode, subtotal) {
  if (!couponCode) return { discount: 0, coupon: null, applied: false };

  const result = await query(
    'SELECT * FROM coupons WHERE code = $1 AND active = true',
    [couponCode.toUpperCase()]
  );

  if (result.rows.length === 0) {
    throw new CustomError("Cupom inválido ou expirado.", 400);
  }

  const coupon = result.rows[0];

  if (subtotal < parseFloat(coupon.min_value)) {
    throw new CustomError(
      `O cupom ${coupon.code} requer pedido mínimo de R$ ${parseFloat(coupon.min_value).toFixed(2)}`,
      400
    );
  }

  let discount = 0;

  if (coupon.type === 'fixed') discount = parseFloat(coupon.value);
  else if (coupon.type === 'percent') discount = subtotal * parseFloat(coupon.value);

  discount = parseFloat(discount.toFixed(2)); // arredonda 2 casas decimais

  return { discount, coupon: coupon.code, applied: true };
}
