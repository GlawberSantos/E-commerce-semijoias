package com.gabrielly.chatbolt.frete.models;

// Se você estiver usando Lombok, adicione:
// import lombok.Data;
// @Data
public class ShippingRequest {

  // Removi cepOrigem daqui, pois ele deve ser fixo no Service
  private String cepDestino;

  private double pesoTotal;
  private double comprimento;
  private double altura;
  private double largura;

  // Se VOCÊ NÃO USA LOMBOK, adicione estes métodos (GETTERS e SETTERS):

  public String getCepDestino() {
    return cepDestino;
  }

  public void setCepDestino(String cepDestino) {
    this.cepDestino = cepDestino;
  }

  public double getPesoTotal() {
    return pesoTotal;
  }

  public void setPesoTotal(double pesoTotal) {
    this.pesoTotal = pesoTotal;
  }

  // Repita o padrão para getComprimento/setComprimento, getAltura/setAltura, etc.
  // É provável que este seja o SEU principal erro de sintaxe.

  public double getComprimento() {
    return comprimento;
  }

  public void setComprimento(double comprimento) {
    this.comprimento = comprimento;
  }

  public double getAltura() {
    return altura;
  }

  public void setAltura(double altura) {
    this.altura = altura;
  }

  public double getLargura() {
    return largura;
  }

  public void setLargura(double largura) {
    this.largura = largura;
  }

}