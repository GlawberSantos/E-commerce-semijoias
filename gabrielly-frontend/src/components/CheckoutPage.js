import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import '../styles/CheckoutPage.css';
import { formatCurrency } from '../utils/format';
import { FaArrowRight, FaCreditCard, FaBarcode, FaBolt } from 'react-icons/fa';
import CartSummary from '../components/CartSummary';
import { shippingAPI, ordersAPI } from '../api'; // ← IMPORTAÇÕES DO NOVO API

// =================================================================
//                 FUNÇÕES DE FORMATAÇÃO (mantidas)
// =================================================================

const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

const formatCPFCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

const formatCEP = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

const formatCardExpiry = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.length >= 3 ? numbers.replace(/(\d{2})(\d{0,2})/, '$1/$2') : numbers;
};

const cleanCep = (cep) => cep.replace(/\D/g, '');

// ATUALIZADA: Função que chama o backend Node.js para calcular o frete
const fetchShippingFromBackend = async (cepDestinoLimpo, cartItems, setShippingCosts) => {
    const numbers = cepDestinoLimpo;
    if (numbers.length !== 8) return;

    const totalWeight = cartItems.reduce((sum, item) => sum + (item.weight || 0) * (item.quantity || 0), 0) || 1.0;
    const dimensions = { comprimento: 20.0, largura: 15.0, altura: 10.0 };

    try {
        // USA A NOVA API
        const data = await shippingAPI.calculate({
            cepDestino: numbers,
            pesoTotal: totalWeight,
            comprimento: dimensions.comprimento,
            largura: dimensions.largura,
            altura: dimensions.altura
        });

        setShippingCosts(data);

    } catch (error) {
        console.error('Erro ao buscar frete:', error);
        setShippingCosts(null);
    }
};

const fetchAddressByCep = async (cep8Digits, setFormData, cartItems, setShippingCosts) => {
    const numbers = cep8Digits;
    if (numbers.length !== 8) return;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${numbers}/json/`);
        const data = await response.json();

        if (!data.erro) {
            setFormData(prev => ({
                ...prev,
                address: data.logradouro || '',
                neighborhood: data.bairro || '',
                city: data.localidade || '',
                state: data.uf || '',
                cep: formatCEP(numbers),
            }));

            fetchShippingFromBackend(numbers, cartItems, setShippingCosts);

        } else {
            console.error('CEP não encontrado ou inválido.');
            setFormData(prev => ({ ...prev, address: '', neighborhood: '', city: '', state: '', }));
            alert('CEP não encontrado ou inválido. Por favor, preencha o endereço manualmente.');
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert('Erro de conexão ao buscar CEP. Tente novamente.');
    }
};

const handleBlurLogic = (e, setFormData, cartItems, setShippingCosts) => {
    const { name, value } = e.target;
    let formattedValue = value;

    switch (name) {
        case 'phone':
            formattedValue = formatPhone(value);
            break;
        case 'cpfCnpj':
            formattedValue = formatCPFCNPJ(value);
            break;
        case 'cep':
            const valueWithoutHyphen = cleanCep(value);
            formattedValue = formatCEP(valueWithoutHyphen);
            fetchAddressByCep(valueWithoutHyphen, setFormData, cartItems, setShippingCosts);
            break;
        case 'cardNumber':
            formattedValue = formatCardNumber(value);
            break;
        case 'cardExpiry':
            formattedValue = formatCardExpiry(value);
            break;
        case 'cardCvv':
            formattedValue = value.replace(/\D/g, '').slice(0, 4);
            break;
        default:
            return;
    }

    if (formattedValue !== value) {
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    }
};

// =================================================================
//                 COMPONENTES DE FORMULÁRIO (mantidos)
// =================================================================

const StepHeader = ({ stepNumber, title, isCompleted, setStep }) => (
    <div className={`step-header ${isCompleted ? 'completed' : ''}`}>
        <div className="step-number">{stepNumber}</div>
        <h3>{title}</h3>
        {isCompleted && <span className="edit-link" onClick={() => setStep(stepNumber)}>Editar</span>}
    </div>
);

const ContactForm = ({ formData, handleChange, handleBlur, phoneRef, cpfCnpjRef }) => (
    <form className="contact-form">
        <label className="input-row">
            <input type="email" placeholder="Digite o seu e-mail" name="email" value={formData.email} onChange={handleChange} required />
        </label>
        <label className="input-row">
            <input type="text" placeholder="Celular / WhatsApp" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} required ref={phoneRef} />
        </label>
        <div className="input-row name-group">
            <input type="text" placeholder="Nome" name="firstName" value={formData.firstName} onChange={handleChange} required />
            <input type="text" placeholder="Sobrenome" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>
        <label className="input-row">
            <input type="text" placeholder="CPF ou CNPJ" name="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange} onBlur={handleBlur} required ref={cpfCnpjRef} />
        </label>
    </form>
);

const AddressForm = ({ formData, handleChange, handleBlur, cepRef }) => (
    <form className="address-form">
        <label className="input-row">
            <input type="text" placeholder="CEP" name="cep" value={formData.cep} onChange={handleChange} onBlur={handleBlur} required ref={cepRef} />
        </label>
        <label className="input-row">
            <input type="text" placeholder="Endereço" name="address" value={formData.address} onChange={handleChange} required />
        </label>
        <div className="input-row">
            <input type="text" placeholder="Número" name="number" value={formData.number} onChange={handleChange} required />
            <input type="text" placeholder="Complemento (Opcional)" name="complement" value={formData.complement} onChange={handleChange} />
        </div>
        <label className="input-row">
            <input type="text" placeholder="Bairro" name="neighborhood" value={formData.neighborhood} onChange={handleChange} required />
        </label>
        <div className="input-row name-group">
            <input type="text" placeholder="Cidade" name="city" value={formData.city} onChange={handleChange} required />
            <input type="text" placeholder="Estado (Ex: SP)" name="state" value={formData.state} onChange={handleChange} maxLength="2" required />
        </div>
    </form>
);

const ShippingOptions = ({ formData, handleChange, shippingCosts, setShippingCost }) => {
    const handleShippingChange = (e) => {
        const { value } = e.target;
        handleChange(e);
        setShippingCost(shippingCosts[value] || 0);
    };

    const isValidCosts = shippingCosts && Object.keys(shippingCosts).length > 0;

    useEffect(() => {
        if (isValidCosts && formData.shippingMethod && shippingCosts[formData.shippingMethod] === undefined) {
            setShippingCost(null);
            handleChange({ target: { name: 'shippingMethod', value: '' } });
        }
    }, [isValidCosts, shippingCosts, formData.shippingMethod, handleChange, setShippingCost]);

    return (
        <div className="shipping-options">
            {isValidCosts ? (
                <>
                    {shippingCosts.sedex !== undefined && (
                        <label className="shipping-option">
                            <input type="radio" name="shippingMethod" value="sedex" checked={formData.shippingMethod === 'sedex'} onChange={handleShippingChange} />
                            <div className="option-details">
                                <span>SEDEX</span>
                                <span>Entrega em 3-5 dias úteis - {formatCurrency(shippingCosts.sedex)}</span>
                            </div>
                        </label>
                    )}
                    {shippingCosts.pac !== undefined && (
                        <label className="shipping-option">
                            <input type="radio" name="shippingMethod" value="pac" checked={formData.shippingMethod === 'pac'} onChange={handleShippingChange} />
                            <div className="option-details">
                                <span>PAC</span>
                                <span>Entrega em 7-10 dias úteis - {formatCurrency(shippingCosts.pac)}</span>
                            </div>
                        </label>
                    )}
                    {shippingCosts.pickup !== undefined && (
                        <label className="shipping-option">
                            <input type="radio" name="shippingMethod" value="pickup" checked={formData.shippingMethod === 'pickup'} onChange={handleShippingChange} />
                            <div className="option-details">
                                <span>Retirada na Loja</span>
                                <span>Disponível em 1 dia útil - Grátis</span>
                            </div>
                        </label>
                    )}
                </>
            ) : (
                <p>Calculando frete... Certifique-se de que o endereço foi preenchido.</p>
            )}
        </div>
    );
};

const PaymentOptions = ({ formData, handleChange, handleBlur, cardNumberRef, cardExpiryRef, cardCvvRef }) => (
    <div className="payment-options">
        <label className="payment-option">
            <input type="radio" name="paymentMethod" value="creditCard" checked={formData.paymentMethod === 'creditCard'} onChange={handleChange} />
            <div className="option-details"><FaCreditCard /> <span>Cartão de Crédito</span></div>
        </label>

        {formData.paymentMethod === 'creditCard' && (
            <div className="credit-card-fields">
                <input type="text" placeholder="Número do Cartão" name="cardNumber" value={formData.cardNumber} onChange={handleChange} onBlur={handleBlur} required ref={cardNumberRef} />
                <input type="text" placeholder="Nome no Cartão" name="cardName" value={formData.cardName} onChange={handleChange} required />
                <div className="card-details-group">
                    <input type="text" placeholder="MM/AA" name="cardExpiry" value={formData.cardExpiry} onChange={handleChange} onBlur={handleBlur} required ref={cardExpiryRef} />
                    <input type="text" placeholder="CVV" name="cardCvv" value={formData.cardCvv} onChange={handleChange} onBlur={handleBlur} maxLength="4" required ref={cardCvvRef} />
                </div>
            </div>
        )}

        <label className="payment-option">
            <input type="radio" name="paymentMethod" value="pix" checked={formData.paymentMethod === 'pix'} onChange={handleChange} />
            <div className="option-details"><FaBolt /> <span>Pix</span></div>
        </label>
        {formData.paymentMethod === 'pix' && <p>Você será redirecionado para concluir o pagamento via Pix.</p>}

        <label className="payment-option">
            <input type="radio" name="paymentMethod" value="boleto" checked={formData.paymentMethod === 'boleto'} onChange={handleChange} />
            <div className="option-details"><FaBarcode /> <span>Boleto Bancário</span></div>
        </label>
        {formData.paymentMethod === 'boleto' && <p>O boleto será gerado após a finalização do pedido.</p>}
    </div>
);

// =================================================================
//                 COMPONENTE PRINCIPAL
// =================================================================

function CheckoutPage() {
    const { cartItems, totalItems, clearCart } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [shippingCost, setShippingCost] = useState(null);
    const [shippingCosts, setShippingCosts] = useState(null);

    const [formData, setFormData] = useState({
        email: '', phone: '', firstName: '', lastName: '', cpfCnpj: '',
        cep: '', address: '', number: '', complement: '', neighborhood: '', city: '', state: '',
        shippingMethod: '',
        paymentMethod: '',
        cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '',
    });

    const totalProducts = useMemo(() => cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0), [cartItems]);
    const installments = 6;

    const totalWithShipping = useMemo(() => {
        return totalProducts + (shippingCost !== null ? shippingCost : 0);
    }, [totalProducts, shippingCost]);

    const phoneRef = useRef(null);
    const cpfCnpjRef = useRef(null);
    const cepRef = useRef(null);
    const cardNumberRef = useRef(null);
    const cardExpiryRef = useRef(null);
    const cardCvvRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => handleBlurLogic(e, setFormData, cartItems, setShippingCosts);

    useEffect(() => {
        if (!formData.cep || formData.cep.replace(/\D/g, '').length < 8) {
            setShippingCost(null);
            setShippingCosts(null);
        }
    }, [formData.cep]);

    // ATUALIZADA: Função que finaliza o pedido usando a API
    const finalizeOrder = async () => {
        try {
            const orderData = {
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                customerInfo: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    cpfCnpj: formData.cpfCnpj,
                    address: {
                        cep: formData.cep,
                        street: formData.address,
                        number: formData.number,
                        complement: formData.complement,
                        neighborhood: formData.neighborhood,
                        city: formData.city,
                        state: formData.state
                    }
                },
                shippingMethod: formData.shippingMethod,
                shippingCost: shippingCost,
                paymentMethod: formData.paymentMethod,
                totalAmount: totalWithShipping
            };

            console.log('Enviando pedido:', orderData);

            // USA A NOVA API
            const result = await ordersAPI.create(orderData);

            console.log('Pedido criado com sucesso:', result);
            alert('Pedido Finalizado com Sucesso!');
            
            clearCart(); // Limpa o carrinho
            navigate('/success', { state: { orderNumber: result.orderNumber } });
            
        } catch (error) {
            console.error('Erro ao finalizar pedido:', error);
            alert(`Erro ao finalizar pedido: ${error.message}`);
        }
    };

    const handleContinue = async (currentStep) => {
        let isValid = true;
        let alertMessage = 'Por favor, preencha todos os campos obrigatórios.';

        switch (currentStep) {
            case 1:
                if (!formData.email || !formData.phone || !formData.firstName || !formData.lastName || !formData.cpfCnpj) isValid = false;
                break;
            case 2:
                if (!formData.cep || !formData.address || !formData.number || !formData.neighborhood || !formData.city || !formData.state) {
                    isValid = false;
                    alertMessage = 'Por favor, preencha o endereço completo, incluindo o CEP.';
                } else if (shippingCosts === null) {
                    isValid = false;
                    alertMessage = 'Aguarde o cálculo do frete ser concluído.';
                }
                break;
            case 3:
                if (!formData.shippingMethod || shippingCost === null) {
                    isValid = false;
                    alertMessage = 'Selecione uma forma de entrega.';
                }
                break;
            case 4:
                if (!formData.paymentMethod) isValid = false;
                if (formData.paymentMethod === 'creditCard') {
                    if (!formData.cardNumber || !formData.cardName || !formData.cardExpiry || !formData.cardCvv) {
                        isValid = false;
                        alertMessage = 'Preencha todos os dados do cartão.';
                    }
                }
                if (isValid) {
                    await finalizeOrder();
                    return;
                }
                break;
            default:
                break;
        }

        if (!isValid) alert(alertMessage);
        else if (currentStep < 4) setStep(currentStep + 1);
    };

    return (
        <div className="checkout-page-container">
            <div className="checkout-grid">
                <div className="form-column">
                    <div className={`checkout-step step-1 ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                        <StepHeader stepNumber={1} title="DADOS DE CONTATO" isCompleted={step > 1} setStep={setStep} />
                        <div className="step-content">
                            {step === 1 && <ContactForm formData={formData} handleChange={handleChange} handleBlur={handleBlur} phoneRef={phoneRef} cpfCnpjRef={cpfCnpjRef} />}
                            {step === 1 && <button className="continue-button" onClick={() => handleContinue(1)}>CONTINUAR <FaArrowRight /></button>}
                            {step > 1 && <div className="step-summary" onClick={() => setStep(1)}><p className="summary-text">{formData.email} - {formData.phone}</p></div>}
                        </div>
                    </div>

                    <div className={`checkout-step step-2 ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                        <StepHeader stepNumber={2} title="ENDEREÇO DE ENTREGA" isCompleted={step > 2} setStep={setStep} />
                        <div className="step-content">
                            {step === 2 && <AddressForm formData={formData} handleChange={handleChange} handleBlur={handleBlur} cepRef={cepRef} />}
                            {step === 2 && <button className="continue-button" onClick={() => handleContinue(2)}>IR PARA O FRETE <FaArrowRight /></button>}
                            {step > 2 && <div className="step-summary" onClick={() => setStep(2)}><p className="summary-text">{formData.address}, {formData.number} - {formData.neighborhood}</p></div>}
                        </div>
                    </div>

                    <div className={`checkout-step step-3 ${step === 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                        <StepHeader stepNumber={3} title="FORMA DE ENTREGA" isCompleted={step > 3} setStep={setStep} />
                        <div className="step-content">
                            {step === 3 && <ShippingOptions formData={formData} handleChange={handleChange} shippingCosts={shippingCosts} setShippingCost={setShippingCost} />}
                            {step === 3 && <button className="continue-button" onClick={() => handleContinue(3)}>IR PARA O PAGAMENTO <FaArrowRight /></button>}
                            {step > 3 && <div className="step-summary" onClick={() => setStep(3)}><p className="summary-text">Entrega: {formData.shippingMethod.toUpperCase()} ({formatCurrency(shippingCost)})</p></div>}
                        </div>
                    </div>

                    <div className={`checkout-step step-4 ${step === 4 ? 'active' : ''}`}>
                        <StepHeader stepNumber={4} title="PAGAMENTO" isCompleted={step > 4} setStep={setStep} />
                        <div className="step-content">
                            {step === 4 && <PaymentOptions formData={formData} handleChange={handleChange} handleBlur={handleBlur} cardNumberRef={cardNumberRef} cardExpiryRef={cardExpiryRef} cardCvvRef={cardCvvRef} />}
                            {step === 4 && <button className="continue-button" onClick={() => handleContinue(4)}>FINALIZAR PEDIDO <FaArrowRight /></button>}
                        </div>
                    </div>
                </div>

                <CartSummary
                    total={totalWithShipping}
                    subtotal={totalProducts}
                    shippingCost={shippingCost}
                    installments={installments}
                    totalItems={totalItems}
                    cartItems={cartItems}
                />
            </div>
        </div>
    );
}

export default CheckoutPage;