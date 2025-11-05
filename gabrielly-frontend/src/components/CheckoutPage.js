import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import '../styles/CheckoutPage.css';
import { formatCurrency } from '../utils/format';
import { FaArrowRight, FaCreditCard, FaBarcode, FaBolt } from 'react-icons/fa';
import CartSummary from '../components/CartSummary';
import { mercadoEnviosAPI, ordersAPI } from '../api';

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

const fetchShippingFromMercadoEnvios = async (cepDestinoLimpo, cartItems, setShippingCosts) => {
    if (!cepDestinoLimpo || cepDestinoLimpo.length !== 8) {
        console.log('CEP inválido:', cepDestinoLimpo);
        return;
    }

    const CEP_ORIGEM_PETROLINA = '56304000'; // CEP de Petrolina, PE

    // Calcula dimensões e peso total dos produtos
    const totalWeight = cartItems.reduce((sum, item) => {
        return sum + ((item.weight || 0.5) * (item.quantity || 1));
    }, 0) || 0.5; // Peso mínimo de 0.5kg

    // Dimensões padrão do pacote (pode ser ajustado conforme necessário)
    const dimensions = {
        height: 10, // altura em cm
        width: 15,  // largura em cm
        length: 20  // comprimento em cm
    };

    try {
        const payload = {
            cepOrigem: CEP_ORIGEM_PETROLINA,
            cepDestino: cepDestinoLimpo,
            comprimento: dimensions.length,
            largura: dimensions.width,
            altura: dimensions.height,
            pesoTotal: totalWeight
        };

        console.log('📦 Consultando Mercado Envios:', payload);

        const data = await mercadoEnviosAPI.calculate(payload);
        console.log('✅ Opções de frete do Mercado Envios:', data);

        if (Array.isArray(data) && data.length > 0) {
            setShippingCosts(data);
        } else {
            console.warn('⚠️ Nenhuma opção de frete retornada');
            setShippingCosts([]);
        }
    } catch (error) {
        console.error('❌ Erro ao buscar frete no Mercado Envios:', error);
        console.error('❌ Mensagem:', error.message);
        console.error('❌ Response:', error.response?.data);
        setShippingCosts([]);
    }
};

const fetchAddressByCep = async (cep8Digits, setFormData, cartItems, setShippingCosts) => {
    if (cep8Digits.length !== 8) {
        console.log('CEP precisa ter 8 dígitos:', cep8Digits);
        return;
    }

    console.log('🔍 Buscando endereço para CEP:', cep8Digits);

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep8Digits}/json/`);
        const data = await response.json();

        console.log('📍 Resposta ViaCEP:', data);

        if (!data.erro) {
            setFormData(prev => ({
                ...prev,
                address: data.logradouro || '',
                neighborhood: data.bairro || '',
                city: data.localidade || '',
                state: data.uf || '',
                cep: formatCEP(cep8Digits)
            }));

            console.log('🚚 Consultando opções de envio...');
            await fetchShippingFromMercadoEnvios(cep8Digits, cartItems, setShippingCosts);
        } else {
            alert('CEP não encontrado.');
            setShippingCosts([]);
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert('Erro ao buscar CEP.');
        setShippingCosts([]);
    }
};

let cepDebounceTimeout;

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

            clearTimeout(cepDebounceTimeout);
            cepDebounceTimeout = setTimeout(() => {
                if (valueWithoutHyphen.length === 8) {
                    fetchAddressByCep(valueWithoutHyphen, setFormData, cartItems, setShippingCosts);
                }
            }, 300); // Debounce por 300ms
            break;
        default:
            return;
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
        <input
            type="email"
            placeholder="E-mail"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
        />
        <input
            type="text"
            placeholder="Celular / WhatsApp"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            required
        />
        <div className="input-row name-group">
            <input
                type="text"
                placeholder="Nome"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                placeholder="Sobrenome"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
            />
        </div>
        <input
            type="text"
            placeholder="CPF ou CNPJ"
            name="cpfCnpj"
            value={formData.cpfCnpj}
            onChange={handleChange}
            onBlur={handleBlur}
            required
        />
    </form>
);

const AddressForm = ({ formData, handleChange, handleBlur }) => (
    <form className="address-form">
        <input
            type="text"
            placeholder="CEP"
            name="cep"
            value={formData.cep}
            onChange={handleChange}
            onBlur={handleBlur}
            required
        />
        <input
            type="text"
            placeholder="Endereço"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
        />
        <div className="input-row">
            <input
                type="text"
                placeholder="Número"
                name="number"
                value={formData.number}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                placeholder="Complemento (Opcional)"
                name="complement"
                value={formData.complement}
                onChange={handleChange}
            />
        </div>
        <input
            type="text"
            placeholder="Bairro"
            name="neighborhood"
            value={formData.neighborhood}
            onChange={handleChange}
            required
        />
        <div className="input-row name-group">
            <input
                type="text"
                placeholder="Cidade"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                placeholder="Estado (Ex: PE)"
                name="state"
                value={formData.state}
                onChange={handleChange}
                maxLength="2"
                required
            />
        </div>
    </form>
);

const ShippingOptions = ({ shippingCosts, selectedShipping, handleShippingChange, cep }) => {
    const cleanedCep = cleanCep(cep);

    if (!cleanedCep || cleanedCep.length < 8) {
        return (
            <div className="shipping-info">
                <p>ℹ️ Informe o CEP no passo anterior para calcular o frete.</p>
            </div>
        );
    }

    if (shippingCosts === null) {
        return (
            <div className="shipping-info">
                <p>⏳ Calculando opções de frete...</p>
            </div>
        );
    }

    if (shippingCosts.length === 0) {
        return (
            <div className="shipping-info">
                <p>⚠️ Nenhuma opção de frete encontrada para o CEP informado.</p>
                <p>Verifique se o CEP está correto ou entre em contato conosco.</p>
            </div>
        );
    }

    return (
        <div className="shipping-options">
            {shippingCosts.map((option, index) => (
                <label key={index} className="shipping-option">
                    <input
                        type="radio"
                        name="shippingMethod"
                        value={option.name || option.shipping_method_id}
                        checked={selectedShipping === (option.name || option.shipping_method_id)}
                        onChange={() => handleShippingChange(option)}
                    />
                    <div className="option-details">
                        <span className="shipping-name">
                            {SHIPPING_NAME_MAP[option.name] || option.name || option.description || 'Mercado Envios'}
                        </span>
                        <span className="price">
                            {formatCurrency(parseFloat(option.price || option.cost || 0))}
                        </span>
                        <span className="delivery-time">
                            Entrega em até {option.delivery_time === 0 ? '0' : (option.delivery_time || option.estimated_delivery_time || 'N/A')} dias úteis
                        </span>
                    </div>
                </label>
            ))}
        </div>
    );
};

const PaymentOptions = ({ formData, handleChange }) => (
    <div className="payment-options">
        <label className="payment-option">
            <input
                type="radio"
                name="paymentMethod"
                value="credit_card"
                checked={formData.paymentMethod === 'credit_card'}
                onChange={handleChange}
            />
            <div className="option-details">
                <FaCreditCard />
                <span>Cartão de Crédito</span>
            </div>
        </label>

        <label className="payment-option">
            <input
                type="radio"
                name="paymentMethod"
                value="pix"
                checked={formData.paymentMethod === 'pix'}
                onChange={handleChange}
            />
            <div className="option-details">
                <FaBolt />
                <span>PIX (Aprovação Imediata)</span>
            </div>
        </label>

        <label className="payment-option">
            <input
                type="radio"
                name="paymentMethod"
                value="boleto"
                checked={formData.paymentMethod === 'boleto'}
                onChange={handleChange}
            />
            <div className="option-details">
                <FaBarcode />
                <span>Boleto Bancário</span>
            </div>
        </label>

        {/* Renderiza o conteúdo específico do método de pagamento */}
        <div className="payment-details">
            {formData.paymentMethod === 'credit_card' && <CreditCardForm />}
            {formData.paymentMethod === 'pix' && <PixPayment />}
            {formData.paymentMethod === 'boleto' && <BoletoPayment />}
        </div>
    </div>
);

const CreditCardForm = () => (
    <div className="credit-card-form">
        <p>Preencha os dados do seu cartão de crédito:</p>
        <input type="text" placeholder="Número do Cartão" />
        <input type="text" placeholder="Nome no Cartão" />
        <div className="card-details-group">
            <input type="text" placeholder="Validade (MM/AA)" />
            <input type="text" placeholder="CVV" />
        </div>
    </div>
);

const PixPayment = () => (
    <div className="pix-payment">
        <p>Pague com PIX e receba aprovação imediata:</p>
        <div className="pix-qr-code">
            {/* Simulação de QR Code */}
            <img src="/path-to-qr-code.png" alt="QR Code PIX" style={{ width: '150px', height: '150px', margin: '0 auto', display: 'block' }} />
        </div>
        <button className="copy-pix-key-button">Copiar Chave PIX</button>
    </div>
);

const BoletoPayment = () => (
    <div className="boleto-payment">
        <p>O boleto será gerado após a finalização do pedido.</p>
        <button className="generate-boleto-button">Gerar Boleto</button>
    </div>
);

const SHIPPING_NAME_MAP = {
    'PAC': 'PAC (Correios)',
    'SEDEX': 'SEDEX (Correios)',
    '.Package': 'Melhor Envio - Pacote',
    '.Com': 'Melhor Envio - Encomenda',
    'éFácil': 'Melhor Envio - éFácil',
    'Retirada na Loja': 'Retirada na Loja',
    'PAC (Simulado)': 'PAC (Correios - Simulado)',
    'SEDEX (Simulado)': 'SEDEX (Correios - Simulado)',
    'PAC (Simulado - Erro API)': 'PAC (Correios - Simulado - Erro API)',
    'SEDEX (Simulado - Erro API)': 'SEDEX (Correios - Simulado - Erro API)',
    'PAC (Simulado - Erro Geral)': 'PAC (Correios - Simulado - Erro Geral)',
    'SEDEX (Simulado - Erro Geral)': 'SEDEX (Correios - Simulado - Erro Geral)',
};

function CheckoutPage() {
    const { cartItems, totalItems, clearCart } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [shippingCost, setShippingCost] = useState(null);
    const [shippingCosts, setShippingCosts] = useState(null);
    const [shippingOption, setShippingOption] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        firstName: '',
        lastName: '',
        cpfCnpj: '',
        cep: '',
        address: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        shippingMethod: '',
        paymentMethod: 'pix', // PIX como padrão
    });

    const totalProducts = useMemo(() =>
        cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0),
        [cartItems]
    );

    const totalWithShipping = useMemo(() =>
        totalProducts + (shippingCost || 0),
        [totalProducts, shippingCost]
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => handleBlurLogic(e, setFormData, cartItems, setShippingCosts);

    const handleShippingChange = (option) => {
        const shippingMethodId = option.name || option.shipping_method_id;
        const shippingPrice = parseFloat(option.price || option.cost || 0);

        setFormData(prev => ({ ...prev, shippingMethod: shippingMethodId }));
        setShippingCost(shippingPrice);
        setShippingOption(option);

        console.log('✅ Frete selecionado:', {
            method: shippingMethodId,
            price: shippingPrice,
            option: option
        });
    };

    const validateStep = (stepNumber) => {
        switch (stepNumber) {
            case 1:
                if (!formData.email || !formData.phone || !formData.firstName || !formData.lastName || !formData.cpfCnpj) {
                    setError('Por favor, preencha todos os campos de contato.');
                    return false;
                }
                break;
            case 2:
                if (!formData.cep || !formData.address || !formData.number || !formData.neighborhood || !formData.city || !formData.state) {
                    setError('Por favor, preencha todos os campos de endereço.');
                    return false;
                }
                break;
            case 3:
                if (!formData.shippingMethod) {
                    setError('Por favor, selecione uma opção de frete.');
                    return false;
                }
                break;
            case 4:
                if (!formData.paymentMethod) {
                    setError('Por favor, selecione uma forma de pagamento.');
                    return false;
                }
                break;
        }
        setError(null);
        return true;
    };

    const finalizeOrder = async () => {
        if (!validateStep(4)) return;

        setIsLoading(true);
        setError(null);

        const orderData = {
            items: cartItems.map(item => ({
                id: item.id,
                title: item.name,
                quantity: item.quantity,
                unit_price: item.price,
                currency_id: 'BRL'
            })),
            payer: {
                name: formData.firstName,
                surname: formData.lastName,
                email: formData.email,
                phone: {
                    number: formData.phone.replace(/\D/g, '')
                },
                identification: {
                    type: formData.cpfCnpj.replace(/\D/g, '').length === 11 ? 'CPF' : 'CNPJ',
                    number: formData.cpfCnpj.replace(/\D/g, '')
                },
                address: {
                    zip_code: formData.cep.replace(/\D/g, ''),
                    street_name: formData.address,
                    street_number: formData.number,
                    neighborhood: formData.neighborhood,
                    city: formData.city,
                    federal_unit: formData.state
                }
            },
            shipments: {
                cost: shippingCost,
                mode: 'custom',
                receiver_address: {
                    zip_code: formData.cep.replace(/\D/g, ''),
                    street_name: formData.address,
                    street_number: formData.number,
                    floor: formData.complement || '',
                    apartment: formData.complement || '',
                    city_name: formData.city,
                    state_name: formData.state,
                    country_name: 'Brasil'
                }
            },
            payment_methods: {
                excluded_payment_types: [],
                installments: 12
            },
            back_urls: {
                success: `${window.location.origin}/success`,
                failure: `${window.location.origin}/checkout`,
                pending: `${window.location.origin}/pending`
            },
            auto_return: 'approved',
            external_reference: `ORDER-${Date.now()}`,
            notification_url: `${process.env.REACT_APP_API_URL}/webhooks/mercadopago`
        };

        console.log('📦 Criando pedido no Mercado Pago:', orderData);

        try {
            const preference = await ordersAPI.createMercadoPagoPreference(orderData);

            console.log('✅ Preference criada:', preference);

            if (preference.init_point) {
                // Redireciona para o checkout do Mercado Pago
                window.location.href = preference.init_point;
            } else {
                throw new Error('Link de pagamento não foi gerado');
            }
        } catch (error) {
            console.error('❌ Erro ao criar preferência de pagamento:', error);
            setError(error.message || 'Erro ao processar pagamento. Tente novamente.');
            setIsLoading(false);
        }
    };

    const handleContinue = () => {
        if (!validateStep(step)) return;

        if (step < 4) {
            setStep(step + 1);
        } else {
            finalizeOrder();
        }
    };

    return (
        <div className="checkout-page-container">
            <div className="checkout-grid">
                <div className="form-column">
                    {error && <div className="error-message">⚠️ {error}</div>}

                    <div className={`checkout-step step-1 ${step >= 1 ? 'active' : ''}`}>
                        <StepHeader
                            stepNumber={1}
                            title="CONTATO"
                            isCompleted={step > 1}
                            setStep={setStep}
                        />
                        {step === 1 && (
                            <div className="step-content">
                                <ContactForm
                                    formData={formData}
                                    handleChange={handleChange}
                                    handleBlur={handleBlur}
                                />
                                <button
                                    className="continue-button"
                                    onClick={handleContinue}
                                >
                                    CONTINUAR <FaArrowRight />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={`checkout-step step-2 ${step >= 2 ? 'active' : ''}`}>
                        <StepHeader
                            stepNumber={2}
                            title="ENTREGA"
                            isCompleted={step > 2}
                            setStep={setStep}
                        />
                        {step === 2 && (
                            <div className="step-content">
                                <AddressForm
                                    formData={formData}
                                    handleChange={handleChange}
                                    handleBlur={handleBlur}
                                />
                                <button
                                    className="continue-button"
                                    onClick={handleContinue}
                                >
                                    CONTINUAR <FaArrowRight />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={`checkout-step step-3 ${step >= 3 ? 'active' : ''}`}>
                        <StepHeader
                            stepNumber={3}
                            title="FRETE (Mercado Envios)"
                            isCompleted={step > 3}
                            setStep={setStep}
                        />
                        {step === 3 && (
                            <div className="step-content">
                                <ShippingOptions
                                    shippingCosts={shippingCosts}
                                    selectedShipping={formData.shippingMethod}
                                    handleShippingChange={handleShippingChange}
                                    cep={formData.cep}
                                />
                                <button
                                    className="continue-button"
                                    onClick={handleContinue}
                                    disabled={!formData.shippingMethod}
                                >
                                    CONTINUAR PARA PAGAMENTO <FaArrowRight />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={`checkout-step step-4 ${step === 4 ? 'active' : ''}`}>
                        <StepHeader
                            stepNumber={4}
                            title="PAGAMENTO (Mercado Pago)"
                            isCompleted={step > 4}
                            setStep={setStep}
                        />
                        {step === 4 && (
                            <div className="step-content">
                                <PaymentOptions
                                    formData={formData}
                                    handleChange={handleChange}
                                />
                                <button
                                    className="continue-button finalize-button"
                                    onClick={handleContinue}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>⏳ PROCESSANDO...</>
                                    ) : (
                                        <>FINALIZAR PEDIDO <FaArrowRight /></>
                                    )}
                                </button>
                                <div className="payment-security-info">
                                    <small>🔒 Pagamento seguro processado pelo Mercado Pago</small>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <CartSummary
                    total={totalWithShipping}
                    subtotal={totalProducts}
                    shippingCost={shippingCost}
                    installments={12}
                    totalItems={totalItems}
                    cartItems={cartItems}
                />
            </div>
        </div>
    );
}

export default CheckoutPage;