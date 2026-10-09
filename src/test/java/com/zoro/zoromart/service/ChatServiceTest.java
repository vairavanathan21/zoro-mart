package com.zoro.zoromart.service;
import org.junit.jupiter.api.Test;import static org.junit.jupiter.api.Assertions.*;
/** Tests chatbot scope, safe FAQ fallback and input validation. */
class ChatServiceTest {@Test void answersProductFaq(){ChatService chat=new ChatService(new MockChatProvider());assertTrue(chat.reply("session-1","How does payment work for checkout?").toLowerCase().contains("mock payment"));}@Test void redirectsOutOfScopeQuestions(){ChatService chat=new ChatService(new MockChatProvider());assertTrue(chat.reply("session-2","Tell me a joke").contains("I can help with ZoroMart"));}@Test void rejectsOverlongInput(){ChatService chat=new ChatService(new MockChatProvider());assertThrows(IllegalArgumentException.class,()->chat.reply("session-3","x".repeat(501)));}}
