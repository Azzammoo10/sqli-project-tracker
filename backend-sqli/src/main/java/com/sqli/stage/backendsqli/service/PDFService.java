package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.dto.ProjectDTO.ProjectResponse;
import com.sqli.stage.backendsqli.entity.Enums.StatutProjet;
import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class PDFService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy", Locale.FRENCH);

    /**
     * Génère un PDF pour un projet public
     */
    public byte[] generateProjectPDF(ProjectResponse project) throws IOException {
        try {
            // Générer le HTML
            String htmlContent = generateProjectHTML(project);
            
            // Convertir HTML en PDF
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(baos);
            
            return baos.toByteArray();
        } catch (Exception e) {
            throw new IOException("Erreur lors de la génération du PDF", e);
        }
    }

    private String generateProjectHTML(ProjectResponse project) {
        StringBuilder html = new StringBuilder();
        
        // En-tête HTML avec styles CSS
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<title>Projet ").append(escapeHtml(project.getTitre())).append("</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; margin: 20px; color: #333; }");
        html.append(".header { text-align: center; border-bottom: 2px solid #221933; padding-bottom: 20px; margin-bottom: 30px; }");
        html.append(".title { font-size: 28px; font-weight: bold; color: #221933; margin-bottom: 10px; }");
        html.append(".subtitle { font-size: 16px; color: #666; }");
        html.append(".section { margin-bottom: 25px; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }");
        html.append(".section-title { font-size: 20px; font-weight: bold; color: #221933; margin-bottom: 15px; }");
        html.append(".info-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }");
        html.append(".info-table th, .info-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }");
        html.append(".info-table th { background-color: #f8f9fa; font-weight: bold; }");
        html.append(".progress-bar { width: 100%; height: 25px; background-color: #f0f0f0; border-radius: 12px; overflow: hidden; margin: 10px 0; }");
        html.append(".progress-fill { height: 100%; background: linear-gradient(90deg, #4f46e5, #7c3aed); transition: width 0.3s ease; }");
        html.append(".team-member { margin-bottom: 15px; padding: 15px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #4f46e5; }");
        html.append(".role { font-size: 12px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 5px; }");
        html.append(".name { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 5px; }");
        html.append(".email { font-size: 14px; color: #666; }");
        html.append(".footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");

        // En-tête
        html.append("<div class='header'>");
        html.append("<div class='title'>").append(escapeHtml(project.getTitre())).append("</div>");
        html.append("<div class='subtitle'>Statut: ").append(getStatusLabel(project.getStatut())).append("</div>");
        html.append("</div>");

        // Informations du projet
        html.append("<div class='section'>");
        html.append("<div class='section-title'>Informations du projet</div>");
        html.append("<table class='info-table'>");
        html.append("<tr><th>Type de projet</th><td>").append(escapeHtml(project.getTypeLabel() != null ? project.getTypeLabel() : project.getType().toString())).append("</td></tr>");
        if (project.getDateDebut() != null) {
            html.append("<tr><th>Date de début</th><td>").append(formatDate(project.getDateDebut())).append("</td></tr>");
        }
        if (project.getDateFin() != null) {
            html.append("<tr><th>Date de fin</th><td>").append(formatDate(project.getDateFin())).append("</td></tr>");
        }
        html.append("</table>");
        html.append("</div>");

        // Description
        if (project.getDescription() != null && !project.getDescription().trim().isEmpty()) {
            html.append("<div class='section'>");
            html.append("<div class='section-title'>Description du projet</div>");
            html.append("<p>").append(escapeHtml(project.getDescription())).append("</p>");
            html.append("</div>");
        }

        // Progression
        html.append("<div class='section'>");
        html.append("<div class='section-title'>Progression du projet</div>");
        int progression = project.getProgression() != null ? project.getProgression().intValue() : 0;
        html.append("<p><strong>Progression: ").append(progression).append("%</strong></p>");
        html.append("<div class='progress-bar'>");
        html.append("<div class='progress-fill' style='width: ").append(progression).append("%'></div>");
        html.append("</div>");
        html.append("</div>");

        // Équipe
        html.append("<div class='section'>");
        html.append("<div class='section-title'>Équipe du projet</div>");
        
        if (project.getClient() != null) {
            html.append("<div class='team-member'>");
            html.append("<div class='role'>Client</div>");
            html.append("<div class='name'>").append(escapeHtml(project.getClient().getNom())).append("</div>");
            html.append("<div class='email'>").append(escapeHtml(project.getClient().getEmail())).append("</div>");
            html.append("</div>");
        }

        if (project.getCreatedBy() != null) {
            html.append("<div class='team-member'>");
            html.append("<div class='role'>Chef de projet</div>");
            html.append("<div class='name'>").append(escapeHtml(project.getCreatedBy().getNom())).append("</div>");
            html.append("<div class='email'>").append(escapeHtml(project.getCreatedBy().getEmail())).append("</div>");
            html.append("</div>");
        }

        if (project.getDeveloppeurs() != null && !project.getDeveloppeurs().isEmpty()) {
            for (var dev : project.getDeveloppeurs()) {
                html.append("<div class='team-member'>");
                html.append("<div class='role'>Développeur</div>");
                html.append("<div class='name'>").append(escapeHtml(dev.getNom())).append("</div>");
                html.append("<div class='email'>").append(escapeHtml(dev.getEmail())).append("</div>");
                html.append("</div>");
            }
        }
        html.append("</div>");

        // Tâches
        if (project.getTotalTasks() > 0) {
            html.append("<div class='section'>");
            html.append("<div class='section-title'>Résumé des tâches</div>");
            html.append("<table class='info-table'>");
            html.append("<tr><th>Métrique</th><th>Valeur</th><th>Pourcentage</th></tr>");
            
            int total = project.getTotalTasks();
            int completed = project.getCompletedTasks();
            int inProgress = project.getInProgressTasks();
            
            html.append("<tr><td>Total des tâches</td><td>").append(total).append("</td><td>100%</td></tr>");
            html.append("<tr><td>Tâches terminées</td><td>").append(completed).append("</td><td>")
                .append(total > 0 ? String.format("%.1f%%", (completed * 100.0 / total)) : "0%").append("</td></tr>");
            html.append("<tr><td>Tâches en cours</td><td>").append(inProgress).append("</td><td>")
                .append(total > 0 ? String.format("%.1f%%", (inProgress * 100.0 / total)) : "0%").append("</td></tr>");
            
            html.append("</table>");
            html.append("</div>");
        }

        // Pied de page
        html.append("<div class='footer'>");
        html.append("Document généré le ").append(formatDate(LocalDate.now()));
        html.append("</div>");

        html.append("</body>");
        html.append("</html>");

        return html.toString();
    }

    private String getStatusLabel(StatutProjet status) {
        if (status == null) return "Non défini";
        
        return switch (status) {
            case EN_COURS -> "En cours";
            case TERMINE -> "Terminé";
            case EN_ATTENTE -> "En attente";
            case BLOQUE -> "Bloqué";
            default -> status.toString();
        };
    }

    private String formatDate(LocalDate date) {
        if (date == null) return "Non définie";
        return date.format(DATE_FORMATTER);
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                  .replace("<", "&lt;")
                  .replace(">", "&gt;")
                  .replace("\"", "&quot;")
                  .replace("'", "&#39;");
    }
}
