package com.zoro.zoromart.service;
/** Academic demo payment strategy; it never charges a real payment method. */
public class MockPaymentStrategy implements PaymentStrategy {public String confirmPayment(){return "MOCK_CONFIRMED";}}
