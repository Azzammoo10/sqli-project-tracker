package com.sqli.stage.backendsqli.exception;

public class AccessdeniedException extends RuntimeException {
    public AccessdeniedException(String message) {
        super(message);
    }
}
