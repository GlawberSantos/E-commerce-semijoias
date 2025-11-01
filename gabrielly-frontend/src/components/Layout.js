import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import logo from '../assets/logoGS.webp';
import SearchBar from './SearchBar';
import AuthModal from './AuthModal';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDinersClub } from 'react-icons/fa';
import { FaPix } from 'react-icons/fa6';
import '../styles/Layout.css';
import '../styles/PaymentMethods.css';

const messages = [
  "Pague com Pix e ganhe 10% de desconto. Aproveite!",
  "Frete grátis a partir de R$499 *Ver Condições.",
];

function Layout({ children }) {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [isNavbarActive, setIsNavbarActive] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { totalItems } = useCart(); // Obtém o total de itens do carrinho
  const { theme, toggleTheme } = useTheme(); // Obtém o tema e a função de toggle

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getMenuItemClass = (path) => {
    if (path === '/') {
      return 'nav-item';
    }
    return location.pathname.startsWith(path) ? 'nav-item active' : 'nav-item';
  };

  const toggleSubmenu = () => {
    setIsSubmenuOpen(!isSubmenuOpen);
  };

  const closeSubmenu = () => setIsSubmenuOpen(false);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <div className="layout-container">
      <div className="sliding-banner">
        <div key={currentMessageIndex} className="banner-message">
          {messages[currentMessageIndex]}
        </div>
      </div>

      <header className="header" role="banner">
        <div className="header-content">
          <Link to="/" className="logo-link" aria-label="Ir para a página inicial">
            <img src={logo} alt="Logo da Gabrielly Semijoias" className="logo-icon" />
          </Link>

          <button
            className="hamburger"
            onClick={() => setIsNavbarActive(!isNavbarActive)}
            aria-label="Abrir ou fechar menu de navegação"
            aria-expanded={isNavbarActive}
          >
            ☰
          </button>

          <nav className={`navbar ${isNavbarActive ? 'active' : ''}`} role="navigation">
            <ul className="nav-list">
              <li className={getMenuItemClass('/')}><Link to="/">INÍCIO</Link></li>

              <li
                className={`nav-item catalog-menu ${isSubmenuOpen ? 'open' : ''}`}
                onMouseEnter={() => setIsSubmenuOpen(true)}
                onMouseLeave={() => setIsSubmenuOpen(false)}
              >
                <button
                  type="button"
                  className="catalog-toggle"
                  aria-haspopup="true"
                  aria-controls="catalog-submenu"
                  aria-expanded={isSubmenuOpen}
                  onClick={toggleSubmenu}
                  onKeyDown={(e) => { if (e.key === 'Escape') closeSubmenu(); }}
                >
                  CATÁLOGO ▼
                </button>

                <ul id="catalog-submenu" className="submenu" role="menu" aria-label="Submenu do catálogo" hidden={!isSubmenuOpen}>
                  <li role="none"><Link role="menuitem" to="/catalogo" onClick={closeSubmenu}>TODOS</Link></li>
                  <li role="none"><Link role="menuitem" to="/catalogo/aneis" onClick={closeSubmenu}>ANÉIS</Link></li>
                  <li role="none"><Link role="menuitem" to="/catalogo/brincos" onClick={closeSubmenu}>BRINCOS</Link></li>
                  <li role="none"><Link role="menuitem" to="/catalogo/colares" onClick={closeSubmenu}>COLARES</Link></li>
                  <li role="none"><Link role="menuitem" to="/catalogo/pulseiras" onClick={closeSubmenu}>PULSEIRAS</Link></li>
                </ul>
              </li>

              <li className={getMenuItemClass('/quem-somos')}><Link to="/quem-somos">QUEM SOMOS</Link></li>
            </ul>
          </nav>

          <div className="header-right">
            <SearchBar />

            {user ? (
              <div 
                className="user-menu"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <button className="user-button">
                  <i className="fas fa-user"></i>
                  <span className="user-name">{(user.name || '').split(' ')[0]}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <i className="fas fa-user-circle"></i>
                      <span>{user.name || ''}</span>
                    </div>
                    <Link to="/minha-conta" onClick={() => setIsUserMenuOpen(false)}>
                      <i className="fas fa-user-cog"></i>
                      Minha Conta
                    </Link>
                    <Link to="/meus-pedidos" onClick={() => setIsUserMenuOpen(false)}>
                      <i className="fas fa-box"></i>
                      Meus Pedidos
                    </Link>
                    <button onClick={handleLogout} className="logout-dropdown-btn">
                      <i className="fas fa-sign-out-alt"></i>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="login-button"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <i className="fas fa-user"></i>
                <span>Entrar</span>
              </button>
            )}

            <Link to="/carrinho" className="cart-icon-link" aria-label="Ver carrinho de compras">
              <i className="fas fa-shopping-cart"></i>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>

            <button onClick={toggleTheme} className="theme-toggle-button">
              {theme === 'dark' ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
            </button>
          </div>
        </div>
      </header>

      <main className="main-content" role="main">
        {children}
      </main>

      <footer className="footer" role="contentinfo">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Institucional</h3>
            <ul>
              <li><Link to="/quem-somos">Quem Somos</Link></li>
              <li><Link to="/politica-de-privacidade">Política de Privacidade</Link></li>
              <li><Link to="/termos-de-uso">Termos de Uso</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Ajuda</h3>
            <ul>
              <li><Link to="/faq">Perguntas Frequentes</Link></li>
              <li><Link to="/como-comprar">Como Comprar</Link></li>
              <li><Link to="/envio-e-entrega">Envio e Entrega</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Atendimento</h3>
            <p>Segunda a Sexta, das 9h às 18h</p>
            <p>Email: contato@gabriellysemijoias.com</p>
            <p>WhatsApp: (83) 98785-5966</p>
          </div>

          <div className="footer-section social-media">
            <h3>Redes Sociais</h3>
            <div className="social-icons">
              <a href="https://www.linkedin.com/company/gabriellysemijoias" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <span className="social-icon linkedin-icon"></span>
              </a>
              <a href="https://www.facebook.com/gabri.bab" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <span className="social-icon facebook-icon"></span>
              </a>
              <a href="https://wa.me/5583987855966" aria-label="Whatsapp" target="_blank" rel="noopener noreferrer">
                <span className="social-icon whatsapp-icon"></span>
              </a>
              <a href="https://www.instagram.com/gabriellysemijoias9215" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <span className="social-icon instagram-icon"></span>
              </a>
              <a href="https://www.youtube.com/@gabriellysemijoias3517" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <span className="social-icon youtube-icon"></span>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="payment-methods">
            <h3>Formas de Pagamento</h3>
            <div className="payment-icons">
              <FaCcVisa className="payment-icon visa" title="Visa" />
              <FaCcMastercard className="payment-icon mastercard" title="Mastercard" />
              <FaCcAmex className="payment-icon amex" title="American Express" />
              <FaCcDinersClub className="payment-icon diners" title="Diners Club" />
              <FaPix className="payment-icon pix" title="Pix" />
            </div>
          </div>
          <p className="copyright">
            Todos os direitos reservados &copy; 2023 - Aviso: Todos os preços e condições deste site são válidos apenas para compras na loja online e não se aplica à loja Física.
          </p>
        </div>
      </footer>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Layout;