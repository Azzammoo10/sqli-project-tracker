//package com.sqli.stage.backendsqli.config;
//
//import io.swagger.v3.oas.models.OpenAPI;
//import io.swagger.v3.oas.models.info.Info;
//import org.springdoc.core.models.GroupedOpenApi;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//@Configuration
//public class SwaggerConfig {
//
//    @Bean
//    public OpenAPI apiInfo() {
//        return new OpenAPI()
//                .info(new Info()
//                        .title("Portail SQLI Tracker API")
//                        .description("Documentation interactive pour tester l'API")
//                        .version("1.0.0"));
//    }
//
//    // (optionnel) si tu veux grouper ou filtrer certaines routes
//    @Bean
//    public GroupedOpenApi publicApi() {
//        return GroupedOpenApi.builder()
//                .group("public")
//                .pathsToMatch("/api/**")
//                .build();
//    }
//}
