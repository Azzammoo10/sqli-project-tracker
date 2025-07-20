package com.sqli.stage.backendsqli.exception;

public class UserDisabledException extends RuntimeException {
  public UserDisabledException(String message) {
    super(message);
  }
}
