package com.gabrielly.chatbolt.frete.services;

import com.gabrielly.chatbolt.frete.models.ShippingRequest;
import com.gabrielly.chatbolt.frete.config.MelhorEnvioConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

@Service
public class ShippingService {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final MelhorEnvioConfig config;

    // CEP de Origem (Petrolina, PE) - FIXO E USADO NO PAYLOAD
    private static final String ORIGIN_CEP = "56318620";

    // O Spring injeta a classe de configuração
    public ShippingService(MelhorEnvioConfig config) {
        this.config = config;
    }

    public Map<String, Double> calculateShipping(ShippingRequest request) throws Exception {

        // O CEP de destino já deve estar limpo pelo Controller, mas garantimos:
        String cleanCepDestino = request.getCepDestino().replaceAll("\\D", "");

        // 1. Montar o JSON de cálculo no formato aninhado exigido pelo Melhor Envio
        String jsonPayload = buildMelhorEnvioPayload(cleanCepDestino, request);

        // 2. Fazer a requisição POST com autenticação Bearer
        HttpResponse<String> response = sendMelhorEnvioRequest(jsonPayload);

        // 3. Processar a resposta e extrair os preços
        return processMelhorEnvioResponse(response);
    }

    // Método que constrói o JSON no formato: {"from": {"postal_code": "..."}, "to":
    // {"postal_code": "..."}}
    private String buildMelhorEnvioPayload(String cepDestino, ShippingRequest request) throws Exception {

        // CEPs limpos
        String originCep = ORIGIN_CEP.replaceAll("\\D", "");

        // 1. Criar o objeto JSON completo (ROOT)
        ObjectNode rootNode = objectMapper.createObjectNode();

        // 2. Criar e adicionar o objeto 'from' (ORIGEM)
        ObjectNode fromNode = objectMapper.createObjectNode()
                .put("postal_code", originCep);
        rootNode.set("from", fromNode);

        // 3. Criar e adicionar o objeto 'to' (DESTINO)
        ObjectNode toNode = objectMapper.createObjectNode()
                .put("postal_code", cepDestino);
        rootNode.set("to", toNode);

        // 4. Adicionar os dados do pacote (obrigatórios)
        ArrayNode productsArray = objectMapper.createArrayNode();

        // O Melhor Envio exige que as dimensões estejam DENTRO de um array de produtos.
        ObjectNode productNode = objectMapper.createObjectNode()
                .put("name", "Produto Checkout")
                .put("quantity", 1) // Quantidade de volumes (simplificado para 1)
                .put("weight", request.getPesoTotal()) // KG
                .put("height", request.getAltura()) // CM
                .put("width", request.getLargura()) // CM
                .put("length", request.getComprimento()) // CM
                .put("insurance_value", 100.00); // Valor do seguro (opcional)

        productsArray.add(productNode);
        rootNode.set("products", productsArray);

        // 5. Adicionar opções adicionais (obrigatórias para evitar erros 422 em
        // produção)
        rootNode.put("receipt", false);
        rootNode.put("own_hand", false);
        rootNode.put("platform", "ChatBolt E-commerce"); // Identifica a plataforma

        return objectMapper.writeValueAsString(rootNode);
    }

    private HttpResponse<String> sendMelhorEnvioRequest(String jsonPayload) throws Exception {

        String url = config.getBaseUrl() + "/me/shipment/calculate";

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                // AUTORIZAÇÃO: Usa o Access Token configurado no application.properties
                .header("Authorization", "Bearer " + config.getAccessToken())
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        return httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
    }

    private Map<String, Double> processMelhorEnvioResponse(HttpResponse<String> response) throws Exception {

        Map<String, Double> results = new HashMap<>();

        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());

            if (root.isArray()) {
                for (JsonNode serviceNode : root) {
                    // Ignora erros retornados no array (ex: um serviço não está disponível)
                    if (serviceNode.has("error"))
                        continue;

                    if (serviceNode.has("price")) {
                        String serviceName = serviceNode.path("name").asText().toLowerCase();
                        double price = serviceNode.path("price").asDouble();

                        // Mapeia para os nomes que o Front-end React espera (pac, sedex)
                        if (serviceName.contains("pac")) {
                            results.put("pac", price);
                        } else if (serviceName.contains("sedex")) {
                            results.put("sedex", price);
                        }
                    }
                }
            }
        } else {
            // Em caso de falha de autenticação (401) ou formato (422)
            System.err.println("--- ERRO MELHOR ENVIO FATAL ---");
            System.err.println("Status: " + response.statusCode());
            System.err.println("Resposta: " + response.body());
            System.err.println("---------------------------------");
        }

        // Adiciona Retirada na loja (Gratuita)
        results.put("pickup", 0.0);

        return results;
    }
}