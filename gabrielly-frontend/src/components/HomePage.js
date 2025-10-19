import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

// Importações de imagens (VERIFIQUE AS EXTENSÕES .webp)
import heroImage1 from '../assets/hero-carousel-1.webp';
import heroImage2 from '../assets/hero-carousel-2.webp';
import heroImage3 from '../assets/hero-carousel-3.webp';
import aneisCategory from '../assets/categories/category-aneis.webp';
import brincosCategory from '../assets/categories/category-brincos.webp';
import colaresCategory from '../assets/categories/category-colares.webp';
import pulseirasCategory from '../assets/categories/category-pulseiras.webp';
import conjuntosCategory from '../assets/categories/category-conjunto.webp';

const carouselImages = [
  heroImage1,
  heroImage2,
  heroImage3,
];

// IDs dos seus vídeos para a reprodução em sequência (agora com 5 vídeos)
const videoIds = '53c27ouLAnk,M0PR5tB3nVY';

// URL de incorporação para reprodução sequencial e infinita
// Inicia no primeiro vídeo e usa a lista completa para o loop
const videoSrc = `https://www.youtube.com/embed/${videoIds.split(',')[0]}?rel=0&autoplay=1&loop=1&playlist=${videoIds}`;


function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Lógica de transição automática do carrossel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % carouselImages.length
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex + 1) % carouselImages.length
    );
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex - 1 + carouselImages.length) % carouselImages.length
    );
  };

  return (
    <div className="homepage-container">
      {/* 1. SEÇÃO PRINCIPAL - CARROSSEL DE DESTAQUE */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${carouselImages[currentImageIndex]})` }}
        aria-label="Carrossel de imagens promocionais"
      >
        <div className="hero-overlay">
          <button className="nav-arrow left-arrow" onClick={goToPreviousImage} aria-label="Imagem anterior do carrossel">{'<'}</button>
          <div className="hero-content">
            <h1 className="hero-title">NOVA COLEÇÃO</h1>
            <p className="hero-subtitle">GANHE R$50 em sua primeira compra</p>
            <div className="coupon-code">
              CUPOM: <span className="coupon-value">PRIMEIRAS50</span>
            </div>
            <Link to="/catalogo" className="explore-button" aria-label="Explorar a nova coleção">Explore a Coleção</Link>
          </div>
          <button className="nav-arrow right-arrow" onClick={goToNextImage} aria-label="Próxima imagem do carrossel">{'>'}</button>

          <div className="carousel-indicators">
            {carouselImages.map((_, index) => (
              <span
                key={index}
                className={index === currentImageIndex ? 'active' : ''}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. BARRA DE SELOS DE CONFIANÇA */}
      <section className="trust-bar-section">
        <div className="trust-bar-content">

          <div className="trust-item">
            <i className="fas fa-percent"></i>
            <p><strong>DESCONTO NO BOLETO</strong></p>
            <p>5% acima de R$100,00</p>
          </div>

          <div className="trust-item">
            <i className="fas fa-credit-card"></i>
            <p><strong>PARCELE SUAS COMPRAS</strong></p>
            <p>em até 4x sem juros</p>
          </div>

          <div className="trust-item">
            <i className="fas fa-truck"></i>
            <p><strong>ENVIAMOS PARA TODO O BRASIL</strong></p>
            <p>com comodidade e segurança</p>
          </div>

          <div className="trust-item">
            <i className="fas fa-shield-alt"></i>
            <p><strong>LOJA SEGURA</strong></p>
            <p>confiança e segurança</p>
          </div>

        </div>
      </section>

      {/* 3.  BLOCO WHATSAPP BANNER E VANTAGENS (Mantido e Integrado) */}
      <section className="whatsapp-banner-section">
        <div className="whatsapp-banner-content">
          <div className="whatsapp-text">
            <h2>Compre pelo WhatsApp e receba em casa.</h2>
            <p>Personalize sua experiência com um atendimento exclusivo para tirar dúvidas, encontrar a joia ideal e finalize sua compra com praticidade e segurança.</p>
            <p className="whatsapp-hours">*Horário de atendimento 9h às 18h</p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
            NOVA SEÇÃO: VÍDEOS DE DESTAQUE DO YOUTUBE
            -------------------------------------------------------------------------------- */}
      <section className="youtube-highlight-section">

        <div className="video-gallery">

          {/* Iframe ÚNICO para a lista de reprodução sequencial */}
          <iframe
            width="100%"
            height="450"
            src={videoSrc} /*URL de sequência infinita */
            title="Vídeos de Apresentação de Joias"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          ></iframe>

        </div>
        <Link to="https://www.youtube.com/@gabriellysemijoias3517" target="_blank" className="explore-button consult-button">
          Ver mais vídeos no YouTube
        </Link>
      </section>

      <div className="homepage-content-wrapper">
        {/* 5. SEÇÃO CATEGORIAS EM DESTAQUE */}
        <section className="featured-categories">
          <h2>CATEGORIAS EM DESTAQUE</h2>
          <div className="categories-grid">
            <div className="category-card">
              <Link to="/catalogo/aneis" aria-label="Ver categoria de anéis">
                <img src={aneisCategory} alt="Imagem representando anéis" loading="lazy" />
                <h3>Aneis</h3>
              </Link>
            </div>
            <div className="category-card">
              <Link to="/catalogo/brincos" aria-label="Ver categoria de brincos">
                <img src={brincosCategory} alt="Imagem representando brincos" loading="lazy" />
                <h3>Brincos</h3>
              </Link>
            </div>
            <div className="category-card">
              <Link to="/catalogo/colares" aria-label="Ver categoria de colares">
                <img src={colaresCategory} alt="Imagem representando colares" loading="lazy" />
                <h3>Colares</h3>
              </Link>
            </div>
            <div className="category-card">
              <Link to="/catalogo/pulseiras" aria-label="Ver categoria de pulseiras">
                <img src={pulseirasCategory} alt="Imagem representando pulseiras" loading="lazy" />
                <h3>Pulseiras</h3>
              </Link>
            </div>
            <div className="category-card">
              <Link to="/catalogo/conjuntos" aria-label="Ver categoria de conjunto">
                <img src={conjuntosCategory} alt="Imagem representando conjunto" loading="lazy" />
                <h3>Conjuntos</h3>
              </Link>
            </div>
          </div>
        </section>

        {/* 6. SEÇÃO VANTAGENS (No final do wrapper) */}
        <section className="advantages-section">
          <h3>VANTAGENS</h3>
          <div className="advantages-grid">
            <div className="advantage-item">
              <i className="fas fa-user-circle"></i>
              <h4>Atendimento personalizado</h4>
              <p>Fale com consultores especializados e descubra a joia ideal para brilhar em qualquer ocasião.</p>
            </div>
            <div className="advantage-item">
              <i className="fas fa-book-open"></i>
              <h4>Catálogo de produtos</h4>
              <p>Receba sugestões exclusivas, com fotos, vídeos e todos os detalhes do produto que despertou seu interesse.</p>
            </div>
            <div className="advantage-item">
              <i className="fas fa-gift"></i>
              <h4>Dicas de presente</h4>
              <p>Ajudamos você a encontrar opções que combinam com diferentes estilos e ocasiões.</p>
            </div>
            <div className="advantage-item">
              <i className="fas fa-shipping-fast"></i>
              <h4>Rápido e prático</h4>
              <p>Tire dúvidas, consulte disponibilidade e finalize sua compra com agilidade, segurança e comodidade.</p>
            </div>
          </div>
          <Link to="https://wa.me/83987855966" target="_blank" className="explore-button consult-button">conversar com um especialista</Link>
        </section>
      </div>
    </div>
  );

}

export default HomePage;