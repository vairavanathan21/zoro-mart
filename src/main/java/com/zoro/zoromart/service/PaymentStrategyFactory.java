package com.zoro.zoromart.service;
/** Factory for the configured payment confirmation strategy. Real gateways are intentionally out of scope. */
public final class PaymentStrategyFactory {private PaymentStrategyFactory(){}public static PaymentStrategy create(){return new MockPaymentStrategy();}}
