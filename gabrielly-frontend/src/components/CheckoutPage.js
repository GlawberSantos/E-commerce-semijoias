
import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import '../styles/CheckoutPage.css';
import { formatCurrency } from '../utils/format';
import { FaArrowRight, FaCreditCard, FaBarcode, FaBolt } from 'react-icons/fa';
import CartSummary from '../components/CartSummary';
import { shippingAPI, ordersAPI } from '../api';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

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

const cleanCep = (cep) => cep.replace(/\D/g, '');

const fetchShippingFromBackend = async (cepDestinoLimpo, cartItems, setShippingCosts) => {
    if (!cepDestinoLimpo || cepDestinoLimpo.length !== 8) return;
    const totalWeight = cartItems.reduce((sum, item) => sum + ((item.weight || 0) * (item.quantity || 0)), 0) || 1.0;
    const dimensions = { comprimento: 20.0, largura: 15.0, altura: 10.0 };
    try {
        const payload = { cepDestino: cepDestinoLimpo, pesoTotal: totalWeight, ...dimensions };
        const data = await shippingAPI.calculate(payload);
        setShippingCosts(data);
    } catch (error) {
        console.error('❌ Erro detalhado ao buscar frete:', error);
        setShippingCosts(null);
    }
};

const fetchAddressByCep = async (cep8Digits, setFormData, cartItems, setShippingCosts) => {
    if (cep8Digits.length !== 8) return;
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep8Digits}/json/`);
        const data = await response.json();
        if (!data.erro) {
            setFormData(prev => ({ ...prev, address: data.logradouro || '', neighborhood: data.bairro || '', city: data.localidade || '', state: data.uf || '', cep: formatCEP(cep8Digits) }));
            fetchShippingFromBackend(cep8Digits, cartItems, setShippingCosts);
        } else {
            alert('CEP não encontrado.');
        }
    } catch (error) {
        alert('Erro ao buscar CEP.');
    }
};

const handleBlurLogic = (e, setFormData, cartItems, setShippingCosts) => {
    const { name, value } = e.target;
    let formattedValue = value;
    switch (name) {
        case 'phone': formattedValue = formatPhone(value); break;
        case 'cpfCnpj': formattedValue = formatCPFCNPJ(value); break;
        case 'cep':
            const valueWithoutHyphen = cleanCep(value);
            formattedValue = formatCEP(valueWithoutHyphen);
            fetchAddressByCep(valueWithoutHyphen, setFormData, cartItems, setShippingCosts);
            break;
        default: return;
    }
    if (formattedValue !== value) {
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    }
};

const StepHeader = ({ stepNumber, title, isCompleted, setStep }) => (
    <div className={`step-header ${isCompleted ? 'completed' : ''}`}>
        <div className="step-number">{stepNumber}</div>
        <h3>{title}</h3>
        {isCompleted && <span className="edit-link" onClick={() => setStep(stepNumber)}>Editar</span>}
    </div>
);

const ContactForm = ({ formData, handleChange, handleBlur }) => (
    <form className="contact-form">
        <input type="email" placeholder="E-mail" name="email" value={formData.email} onChange={handleChange} required />
        <input type="text" placeholder="Celular / WhatsApp" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} required />
        <div className="input-row name-group">
            <input type="text" placeholder="Nome" name="firstName" value={formData.firstName} onChange={handleChange} required />
            <input type="text" placeholder="Sobrenome" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>
        <input type="text" placeholder="CPF ou CNPJ" name="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange} onBlur={handleBlur} required />
    </form>
);

const AddressForm = ({ formData, handleChange, handleBlur }) => (
    <form className="address-form">
        <input type="text" placeholder="CEP" name="cep" value={formData.cep} onChange={handleChange} onBlur={handleBlur} required />
        <input type="text" placeholder="Endereço" name="address" value={formData.address} onChange={handleChange} required />
        <div className="input-row">
            <input type="text" placeholder="Número" name="number" value={formData.number} onChange={handleChange} required />
            <input type="text" placeholder="Complemento (Opcional)" name="complement" value={formData.complement} onChange={handleChange} />
        </div>
        <input type="text" placeholder="Bairro" name="neighborhood" value={formData.neighborhood} onChange={handleChange} required />
        <div className="input-row name-group">
            <input type="text" placeholder="Cidade" name="city" value={formData.city} onChange={handleChange} required />
            <input type="text" placeholder="Estado (Ex: PE)" name="state" value={formData.state} onChange={handleChange} maxLength="2" required />
        </div>
    </form>
);

const ShippingOptions = ({ shippingCosts, selectedShipping, handleShippingChange }) => {
    if (!shippingCosts) return <p>Informe o CEP para calcular o frete.</p>;
    if (shippingCosts.error) return <p>{shippingCosts.error}</p>;

    return (
        <div className="shipping-options">
            {shippingCosts.map((option, index) => (
                <label key={index} className="shipping-option">
                    <input
                        type="radio"
                        name="shippingMethod"
                        value={option.name}
                        checked={selectedShipping === option.name}
                        onChange={() => handleShippingChange(option)}
                    />
                    <div className="option-details">
                        <span>{option.name}</span>
                        <span className="price">{formatCurrency(parseFloat(option.price))}</span>
                        <span className="delivery-time">Entrega em até {option.delivery_time} dias úteis</span>
                    </div>
                </label>
            ))}
        </div>
    );
};

const PaymentOptions = ({ formData, handleChange }) => (
    <div className="payment-options">
        <label className="payment-option">
            <input type="radio" name="paymentMethod" value="stripe" checked={formData.paymentMethod === 'stripe'} onChange={handleChange} />
            <div className="option-details"><FaCreditCard /> <span>Cartão de Crédito</span></div>
        </label>

        <label className="payment-option">
            <input type="radio" name="paymentMethod" value="pix" checked={formData.paymentMethod === 'pix'} onChange={handleChange} />
            <div className="option-details"><FaBolt /> <span>Pix</span></div>
        </label>

        <label className="payment-option">
            <input type="radio" name="paymentMethod" value="boleto" checked={formData.paymentMethod === 'boleto'} onChange={handleChange} />
            <div className="option-details"><FaBarcode /> <span>Boleto Bancário</span></div>
        </label>

        <label className="payment-option">
            <input type="radio" name="paymentMethod" value="mercadopago" checked={formData.paymentMethod === 'mercadopago'} onChange={handleChange} />
            <div className="option-details"><img src="https://img.icons8.com/color/48/000000/mercado-pago.png" alt="Mercado Pago" style={{width: '24px', height: '24px', marginRight: '10px'}}/> <span>Mercado Pago</span></div>
        </label>
    </div>
);

function CheckoutPage() {
    const { cartItems, totalItems, clearCart } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [shippingCost, setShippingCost] = useState(null);
    const [shippingCosts, setShippingCosts] = useState(null);
    const [clientSecret, setClientSecret] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        email: '', phone: '', firstName: '', lastName: '', cpfCnpj: '',
        cep: '', address: '', number: '', complement: '', neighborhood: '', city: '', state: '',
        shippingMethod: '',
        paymentMethod: 'stripe',
    });

    const totalProducts = useMemo(() => cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0), [cartItems]);
    const totalWithShipping = useMemo(() => totalProducts + (shippingCost || 0), [totalProducts, shippingCost]);

    useEffect(() => {
        if (totalWithShipping > 0 && formData.paymentMethod === 'stripe') {
            setIsLoading(true);
            ordersAPI.createPaymentIntent({ totalAmount: totalWithShipping })
                .then(data => {
                    setClientSecret(data.clientSecret);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error("Failed to create payment intent", error);
                    setError("Não foi possível iniciar o pagamento. Tente novamente.");
                    setIsLoading(false);
                });
        }
    }, [totalWithShipping, formData.paymentMethod]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => handleBlurLogic(e, setFormData, cartItems, setShippingCosts);

    const handleShippingChange = (option) => {
        setFormData(prev => ({ ...prev, shippingMethod: option.name }));
        setShippingCost(parseFloat(option.price));
    };

    const validateForm = () => {
        const requiredFields = ['email', 'phone', 'firstName', 'lastName', 'cpfCnpj', 'cep', 'address', 'number', 'neighborhood', 'city', 'state', 'shippingMethod', 'paymentMethod'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                setError(`O campo ${field} é obrigatório.`);
                return false;
            }
        }
        setError(null);
        return true;
    };

    const finalizeOrder = async (paymentData = {}) => {
        if (!validateForm()) return;

        setIsLoading(true);
        setError(null);

        const orderData = {
            items: cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
                name: item.name
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
                    state: formData.state,
                }
            },
            shippingMethod: formData.shippingMethod,
            shippingCost: shippingCost,
            paymentMethod: formData.paymentMethod,
            totalAmount: totalWithShipping,
            ...paymentData
        };

        try {
            const order = await ordersAPI.create(orderData);
            if (formData.paymentMethod === 'mercadopago') {
                const preference = await ordersAPI.createMercadoPagoPreference({ ...orderData, orderId: order.orderId });
                window.location.href = preference.init_point;
            } else {
                clearCart();
                navigate('/success', { state: { orderNumber: order.orderNumber, orderId: order.orderId } });
            }
        } catch (error) {
            console.error('Erro ao finalizar pedido:', error);
            setError(error.message || 'Ocorreu um erro ao finalizar o pedido. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinue = async () => {
        if (step < 4) {
            setStep(step + 1);
            return;
        }

        if (step === 4) {
            if (formData.paymentMethod === 'stripe') {
                // The payment is handled by the PaymentForm component
                return;
            }
            await finalizeOrder();
        }
    };

    const appearance = { theme: 'stripe' };
    const options = { clientSecret, appearance };

    return (
        <div className="checkout-page-container">
            <div className="checkout-grid">
                <div className="form-column">
                    {error && <div className="error-message">{error}</div>}
                    {isLoading && <div className="loading-spinner">Carregando...</div>}

                    <div className={`checkout-step step-1 ${step >= 1 ? 'active' : ''}`}>
                        <StepHeader stepNumber={1} title="CONTATO" isCompleted={step > 1} setStep={setStep} />
                        {step === 1 && (
                            <div className="step-content">
                                <ContactForm formData={formData} handleChange={handleChange} handleBlur={handleBlur} />
                                <button className="continue-button" onClick={() => setStep(2)}>CONTINUAR <FaArrowRight /></button>
                            </div>
                        )}
                    </div>

                    <div className={`checkout-step step-2 ${step >= 2 ? 'active' : ''}`}>
                        <StepHeader stepNumber={2} title="ENTREGA" isCompleted={step > 2} setStep={setStep} />
                        {step === 2 && (
                            <div className="step-content">
                                <AddressForm formData={formData} handleChange={handleChange} handleBlur={handleBlur} />
                                <button className="continue-button" onClick={() => setStep(3)}>CONTINUAR <FaArrowRight /></button>
                            </div>
                        )}
                    </div>

                    <div className={`checkout-step step-3 ${step >= 3 ? 'active' : ''}`}>
                        <StepHeader stepNumber={3} title="FRETE" isCompleted={step > 3} setStep={setStep} />
                        {step === 3 && (
                            <div className="step-content">
                                <ShippingOptions shippingCosts={shippingCosts} selectedShipping={formData.shippingMethod} handleShippingChange={handleShippingChange} />
                                <button className="continue-button" onClick={() => setStep(4)}>CONTINUAR PARA PAGAMENTO <FaArrowRight /></button>
                            </div>
                        )}
                    </div>

                    <div className={`checkout-step step-4 ${step === 4 ? 'active' : ''}`}>
                        <StepHeader stepNumber={4} title="PAGAMENTO" isCompleted={step > 4} setStep={setStep} />
                        <div className="step-content">
                            {step === 4 && (
                                <>
                                    <PaymentOptions formData={formData} handleChange={handleChange} />
                                    {formData.paymentMethod === 'stripe' && clientSecret && (
                                        <Elements options={options} stripe={stripePromise}>
                                            <PaymentForm clientSecret={clientSecret} onSuccessfulPayment={finalizeOrder} />
                                        </Elements>
                                    )}
                                    {formData.paymentMethod !== 'stripe' && (
                                        <button className="continue-button" onClick={handleContinue} disabled={isLoading}>
                                            {isLoading ? 'FINALIZANDO...' : 'FINALIZAR PEDIDO'} <FaArrowRight />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <CartSummary
                    total={totalWithShipping}
                    subtotal={totalProducts}
                    shippingCost={shippingCost}
                    installments={6}
                    totalItems={totalItems}
                    cartItems={cartItems}
                />
            </div>
        </div>
    );
}

export default CheckoutPage;
