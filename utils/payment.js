import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (totalAmount) => {
  const amountInCents = Math.round(totalAmount * 100);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'brl',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent.client_secret;
  } catch (error) {
    console.error('Erro ao criar PaymentIntent do Stripe:', error);
    throw new Error('Erro ao processar pagamento com Stripe');
  }
};