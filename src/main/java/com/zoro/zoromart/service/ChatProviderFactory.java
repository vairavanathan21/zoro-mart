package com.zoro.zoromart.service;
/** Factory selects the configured chatbot strategy, defaulting to safe offline FAQ answers. */
public final class ChatProviderFactory {private ChatProviderFactory(){}public static ChatProvider create(){String provider=System.getenv().getOrDefault("ZOROMART_CHAT_PROVIDER","mock");return "gemini".equalsIgnoreCase(provider)?new GeminiChatProvider():new MockChatProvider();}}
