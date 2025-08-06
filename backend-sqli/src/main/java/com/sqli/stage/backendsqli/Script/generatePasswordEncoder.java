package com.sqli.stage.backendsqli.Script;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class generatePasswordEncoder {
        public static void main(String[] args) {
            System.out.println(new BCryptPasswordEncoder().encode("azerty1234"));
        }
    }

