package com.sqli.stage.backendsqli.controller;

import com.sqli.stage.backendsqli.dto.ProjectDTO.ProjectResponse;
import com.sqli.stage.backendsqli.service.PDFService;
import com.sqli.stage.backendsqli.service.ProjetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PDFController {

    private final PDFService pdfService;
    private final ProjetService projetService;

    /**
     * Télécharger le PDF d'un projet public
     */
    @GetMapping("/projects/{id}/pdf")
    public ResponseEntity<byte[]> downloadProjectPDF(@PathVariable Integer id) {
        try {
            // Récupérer les détails du projet
            ProjectResponse project = projetService.getProjectById(id);
            if (project == null) {
                return ResponseEntity.notFound().build();
            }

            // Générer le PDF
            byte[] pdfContent = pdfService.generateProjectPDF(project);

            // Configurer les headers pour le téléchargement
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                "projet-" + project.getTitre().replaceAll("[^a-zA-Z0-9]", "-") + ".pdf");
            headers.setContentLength(pdfContent.length);
            
            // Headers pour éviter les problèmes ngrok
            headers.set("X-Content-Type-Options", "nosniff");
            headers.set("X-Frame-Options", "DENY");
            headers.set("X-XSS-Protection", "1; mode=block");
            headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.set("Pragma", "no-cache");
            headers.set("Expires", "0");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfContent);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Endpoint alternatif pour tester la génération PDF
     */
    @GetMapping("/projects/{id}/pdf-test")
    public ResponseEntity<String> testPDFGeneration(@PathVariable Integer id) {
        try {
            ProjectResponse project = projetService.getProjectById(id);
            if (project == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok("PDF généré avec succès pour le projet: " + project.getTitre());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }
}
