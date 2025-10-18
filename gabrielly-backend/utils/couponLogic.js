// utils/couponLogic.js
import { CustomError } from './CustomError.js';

// Configuração de cupons (Manter aqui até mover para o DB)
const VALID_COUPONS = {
    'PRIMEIRAS50': { type: 'fixed', value: 50.00, min_value: 100.00 },
    'DESC10': { type: 'percent', value: 0.10, min_value: 0 },
};

export function calculateDiscount(couponCode, subtotal) {
    if (!couponCode) return { discount: 0, coupon: null, applied: false };

    const coupon = VALID_COUPONS[couponCode.toUpperCase()];
    if (!coupon) {
        throw new CustomError("Cupom inválido ou expirado.", 400); // Bad Request
    }

    if (subtotal < coupon.min_value) {
        const requiredAmount = coupon.min_value.toFixed(2).replace('.', ',');
        throw new CustomError(`O cupom ${couponCode.toUpperCase()} requer um pedido mínimo de R$ ${requiredAmount}.`, 400);
    }

    let discountValue = 0;

    if (coupon.type === 'fixed') {
        discountValue = coupon.value;
    } else if (coupon.type === 'percent') {
        discountValue = subtotal * coupon.value;
    }
    
    // Arredonda o desconto para 2 casas decimais para evitar problemas de ponto flutuante
    discountValue = parseFloat(discountValue.toFixed(2));

    return { discount: discountValue, coupon: couponCode.toUpperCase(), applied: true };
}