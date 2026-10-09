package com.zoro.zoromart.service;
/** Strategy interface for selecting an AI provider without changing chat orchestration. */
public interface ChatProvider {String getReply(String userMessage,String context) throws Exception;}
