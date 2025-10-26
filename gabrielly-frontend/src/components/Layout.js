import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Layout.css';
import logo from '../assets/logoGS.webp';
import linkedinIcon from '../assets/icons/logo-linkedin.svg';
import facebookIcon from '../assets/icons/logo-facebook.svg';
import whatsappIcon from '../assets/icons/logo-whatsapp.svg';
import instagramIcon from '../assets/icons/logo-instagram.svg';
import youtubeIcon from '../assets/icons/logo-youtube.svg';
import SearchBar from './SearchBar';
import AuthModal from './AuthModal';
import { useAuth } from '../contexts/AuthContext';

function Layout({ children }) {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [isNavbarActive, setIsNavbarActive] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Link do WhatsApp (use seu número real)
  const whatsappLink = "https://wa.me/5583987855966";

  const getMenuItemClass = (path) => {
    if (path === '/') {
      return location.pathname === '/' ? 'nav-item active' : 'nav-item';
    }
    return location.pathname.startsWith(path) ? 'nav-item active' : 'nav-item';
  };

  const toggleSubmenu = () => {
    setIsSubmenuOpen(!isSubmenuOpen);
  };

  const closeSubmenu = () => setIsSubmenuOpen(false);

  return (
    <div className="layout-container">
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
                {/* Botão acessível que abre/fecha o submenu */}
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
                  {/* Link para a página principal do catálogo */}
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

          {/* FIM DO NOVO BLOCO */}
          <div className="header-center">
            <SearchBar />
          </div>

          <div className="header-right">
            {user ? (
              <div className="user-menu">
                <button className="user-button">
                  <i className="fas fa-user"></i>
                  <span>{user.name.split(' ')[0]}</span>
                </button>
                <div className="user-dropdown">
                  <Link to="/minha-conta">Minha Conta</Link>
                  <Link to="/meus-pedidos">Meus Pedidos</Link>
                  <button onClick={logout}>Sair</button>
                </div>
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
          </div>

        </div>
        {/* NOVO BLOCO: FALE CONOSCO (substitui o carrinho) */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fale-conosco-link"
          aria-label="Fale Conosco pelo WhatsApp"
        >
          <i className="fas fa-headset" aria-hidden="true"></i>
          <span className="fale-conosco-text">FALE CONOSCO</span>
        </a>
      </header>

      <main className="main-content" role="main">
        {children}
      </main>

      <footer className="footer" role="contentinfo">
        <div className="footer-content">
          <div className="footer-section social-media">
            <p>Redes Sociais</p>
            <div className="social-icons">
              <a href="https://www.linkedin.com/company/gabriellysemijoias" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><img src={linkedinIcon} alt="LinkedIn" /></a>
              <a href="https://www.facebook.com/gabriellysemijoias" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><img src={facebookIcon} alt="Facebook" /></a>
              <a href="https://wa.me/5583987855966" aria-label="Whatsapp" target="_blank" rel="noopener noreferrer"><img src={whatsappIcon} alt="Whatsapp" /></a>
              <a href="https://www.instagram.com/gabriellysemijoias9215" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><img src={instagramIcon} alt="Instagram" /></a>
              <a href="https://www.youtube.com/@gabriellysemijoias3517" aria-label="YouTube" target="_blank" rel="noopener noreferrer"><img src={youtubeIcon} alt="YouTube" /></a>
            </div>
          </div>
          <p className="copyright">Todos os direitos reservados &copy; 2023</p>
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