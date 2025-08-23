package com.sqli.stage.backendsqli.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class QRCodeService {

    /**
     * Génère un QR code pour un projet donné
     * @param projectId L'ID du projet
     * @param projectName Le nom du projet
     * @return Le QR code en format byte array
     */
    public byte[] generateProjectQRCode(Long projectId, String projectName) throws WriterException, IOException {
        // URL qui sera encodée dans le QR code - utiliser l'URL ngrok du frontend
        // Le frontend aura une page publique qui appelle l'API backend
        String projectUrl = "https://8ae1916d763c.ngrok-free.app/project/" + projectId;
        
        // Créer le contenu du QR code - juste l'URL de la page publique
        String qrContent = projectUrl;
        
        // Générer le QR code avec une taille plus grande pour une meilleure lisibilité
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, BarcodeFormat.QR_CODE, 400, 400);
        
        // Convertir en image
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        
        return outputStream.toByteArray();
    }

    /**
     * Génère un QR code avec une URL personnalisée
     * @param url L'URL à encoder
     * @param title Le titre à afficher
     * @return Le QR code en format byte array
     */
    public byte[] generateCustomQRCode(String url, String title) throws WriterException, IOException {
        // Créer le contenu du QR code
        String qrContent = String.format("%s\n%s", title, url);
        
        // Générer le QR code
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, BarcodeFormat.QR_CODE, 300, 300);
        
        // Convertir en image
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        
        return outputStream.toByteArray();
    }
}
