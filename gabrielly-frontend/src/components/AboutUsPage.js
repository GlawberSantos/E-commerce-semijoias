/* AboutUsPage.js */
import React from 'react';
import '../styles/pages.css';

const AboutUsPage = () => {
  return (
    <div className="about-us-page">
      <h2 className="page-title">QUEM SOMOS</h2> {/* Adicionei a classe page-title */}
      <p className="intro-text"> {/* Adicionei a classe intro-text */}
        A Gabrielly Semijoias é uma loja especializada em joias e semijoias de alta qualidade.
        Nosso objetivo é oferecer produtos elegantes, com design exclusivo, e um atendimento
        que garanta a satisfação de nossos clientes.
      </p>

      <section className="about-us-section">
        <h3>Nossa História</h3>
        <p>
          A Gabrielly Semi Joias, presente no mercado desde 2013 na cidade de Campina Grande - PB, preocupa-se em oferecer para os seus clientes o que há de melhor em joias em prata e semi joias, aliando design diferenciado com qualidade incomparável.
          Existem jóias para todos os gostos, estilos, ocasiões e bolsos!Fabricantes se esmeram em produzir as jóias que mais encantem as mulheres, agradem os homens e se adequem às crianças.A Gabrielly Semi joias trabalha com peças em Ouro, Prata e Semi joias.Alem desses materiais a Gabrielly Semi Joias oferece alta qualidade em suas legítimas pedras brasileiras.
          - Qualidade: Nossos produtos são confeccionados dentro do mais alto padrão joalheiro, visando sempre a satisfação de nossos clientes;
          - Variedade: Temos uma das maiores variedades de jóias do ramo, produtos constantemente atualizados com as tendências da moda além de coleções exclusivas e jóias tradicionais.
          - Garantia: Avaliada pela nossa tradição de anos no ramo joalheiro, Oferecemos a garantia permanente da nossa qualidade, com a troca e consertos de peças que apresentem eventualmente defeitos de fabricação, exceto para joias amassadas ou que apresentem desgastes naturais pelo seu uso excessivo ou de forma inadequada.
          Não deixe de visitar nossa página para se informar sobre as novidades mais recentes em joalheria e as melhores dicas para comprar a joia dos seus sonhos.
        </p>
      </section>

      <section className="about-us-section">
        <h3>Nossa Missão</h3>
        <p>
          Oferecer produtos de qualidade, que inspirem confiança e beleza,
          promovendo uma experiência de compra única e satisfatória.
        </p>
      </section>

      <section className="about-us-section">
        <h3>Nossa Visão</h3>
        <p>
          Ser referência no mercado de semijoias, reconhecida pela excelência, inovação
          e compromisso com o cliente.
        </p>
      </section>

      <section className="about-us-section">
        <img
          src="/assets/about-us-estudio.webp"
          alt="Equipe Gabrielly Semijoias"
          loading="lazy"
          style={{ maxWidth: '100%', borderRadius: '8px' }}
        />
      </section>
    </div>
  );
};

export default AboutUsPage;