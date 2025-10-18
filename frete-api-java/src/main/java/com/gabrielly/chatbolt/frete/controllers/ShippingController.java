package com.gabrielly.chatbolt.frete.controllers;

import com.gabrielly.chatbolt.frete.models.ShippingRequest;
import com.gabrielly.chatbolt.frete.services.ShippingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/frete")
@CrossOrigin(origins = "http://localhost:3000")
public class ShippingController {

  private final ShippingService shippingService;

  public ShippingController(ShippingService shippingService) {
    this.shippingService = shippingService;
  }

  @PostMapping("/calcular")
  public ResponseEntity<?> calculate(@RequestBody ShippingRequest request) {

    // CORREÇÃO CRÍTICA: Limpar o CEP de destino assim que ele chega.
    // O Front-end pode estar enviando o hífen, vamos removê-lo aqui.
    String cleanCepDestino = request.getCepDestino() != null ? request.getCepDestino().replaceAll("\\D", "") : null;

    // Atualiza o objeto de requisição com o CEP limpo (opcional, mas seguro)
    request.setCepDestino(cleanCepDestino);

    // Validação básica
    if (cleanCepDestino == null || cleanCepDestino.isEmpty() || cleanCepDestino.length() != 8) {
      return ResponseEntity.badRequest().body("CEP de destino é inválido ou obrigatório.");
    }

    // Garante que o Front-end está enviando dimensões (necessárias para o cálculo
    // real)
    if (request.getPesoTotal() <= 0 || request.getComprimento() <= 0 || request.getLargura() <= 0
        || request.getAltura() <= 0) {
      request.setPesoTotal(1.0);
      request.setComprimento(20.0);
      request.setLargura(15.0);
      request.setAltura(10.0);
    }

    try {
      Map<String, Double> results = shippingService.calculateShipping(request);

      results.values().removeIf(cost -> cost < 0);

      if (results.isEmpty()) {
        return ResponseEntity.notFound().build();
      }

      return ResponseEntity.ok(results);

    } catch (Exception e) {
      System.err.println("Erro ao calcular frete: " + e.getMessage());
      return ResponseEntity.internalServerError().body("Erro interno no cálculo de frete.");
    }
  }
}