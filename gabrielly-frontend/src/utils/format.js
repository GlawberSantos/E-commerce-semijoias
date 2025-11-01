/*format.js*/
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const calculateInstallments = (price, totalInstallments, maxInstallmentsNoInterest, interestRatePerMonth = 0.025) => {
  const installments = [];
  let remainingPrice = price;

  for (let i = 1; i <= totalInstallments; i++) {
    let installmentAmount;
    let hasInterest = false;

    if (i <= maxInstallmentsNoInterest) {
      installmentAmount = price / totalInstallments;
    } else {
      hasInterest = true;
      // Calcula o valor da parcela com juros compostos
      // Simplificação: aplica juros sobre o valor restante para cada parcela com juros
      // Uma implementação mais precisa envolveria cálculo de juros sobre o saldo devedor
      const monthlyInterest = remainingPrice * interestRatePerMonth;
      installmentAmount = (remainingPrice + monthlyInterest) / (totalInstallments - i + 1);
      remainingPrice -= installmentAmount;
    }

    installments.push({
      number: i,
      amount: installmentAmount,
      hasInterest: hasInterest,
    });
  }

  return installments;
};