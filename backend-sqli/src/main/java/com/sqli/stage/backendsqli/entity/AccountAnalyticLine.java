package com.sqli.stage.backendsqli.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "account_analytic_line")
public class AccountAnalyticLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private User employee; // ou `Employee` selon ta structure

    private BigDecimal hours;

    private LocalDate date;
}

