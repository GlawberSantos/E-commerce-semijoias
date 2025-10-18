package com.gabrielly.chatbolt.frete.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MelhorEnvioConfig {

  // Configurado no application.properties
  @Value("${melhorenvio.client-id}")
  private String clientId;

  @Value("${melhorenvio.client-secret}")
  private String clientSecret;

  @Value("${melhorenvio.base-url}")
  private String baseUrl;

  // Você pode usar o Access Token que o Melhor Envio gerou, ou gerar um novo via
  // API.
  // Vamos usar a chave de acesso gerada na integração de terceiros (o seu
  // "secret").
  @Value("${melhorenvio.access-token}")
  private String accessToken;

  // Getters
  public String getClientId() {
    return clientId;
  }

  public String getClientSecret() {
    return clientSecret;
  }

  public String getAccessToken() {
    return accessToken;
  }

  public String getBaseUrl() {
    return baseUrl;
  }
}