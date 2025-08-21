package com.sqli.stage.backendsqli.controller;

import com.sqli.stage.backendsqli.service.QRCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/qrcode")
@CrossOrigin(origins = "*")
public class QRCodeController {

    @Autowired
    private QRCodeService qrCodeService;

    /**
     * Génère un QR code pour un projet spécifique
     * @param projectId L'ID du projet
     * @param projectName Le nom du projet
     * @return Le QR code en format PNG
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<byte[]> generateProjectQRCode(
            @PathVariable Long projectId,
            @RequestParam String projectName) {
        
        try {
            byte[] qrCode = qrCodeService.generateProjectQRCode(projectId, projectName);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(qrCode);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Génère un QR code personnalisé
     * @param url L'URL à encoder
     * @param title Le titre à afficher
     * @return Le QR code en format PNG
     */
    @GetMapping("/custom")
    public ResponseEntity<byte[]> generateCustomQRCode(
            @RequestParam String url,
            @RequestParam String title) {
        
        try {
            byte[] qrCode = qrCodeService.generateCustomQRCode(url, title);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(qrCode);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
