package com.zoro.zoromart.service;
import java.util.*;import java.util.concurrent.ConcurrentHashMap;
/** Enforces chatbot scope, input length, per-session limits, caching and degraded responses. */
public class ChatService {
 private final ChatProvider provider;
 private final Map<String,Map<String,String>> cache=new ConcurrentHashMap<>();
 private final Map<String,Deque<Long>> limits=new ConcurrentHashMap<>();
 public ChatService(){this(ChatProviderFactory.create());}
 public ChatService(ChatProvider provider){this.provider=provider;}
 public String reply(String session,String message){
  if(message==null||message.isBlank()||message.length()>500)throw new IllegalArgumentException("Message must contain 1–500 characters");
  long now=System.currentTimeMillis();Deque<Long> q=limits.computeIfAbsent(session,k->new ArrayDeque<>());
  synchronized(q){while(!q.isEmpty()&&now-q.peekFirst()>60000)q.removeFirst();if(q.size()>=10)throw new IllegalArgumentException("Rate limit reached. Please wait a minute.");q.addLast(now);}
  String m=message.toLowerCase(Locale.ROOT).trim();
  if(!(m.contains("product")||m.contains("cart")||m.contains("order")||m.contains("return")||m.contains("seller")||m.contains("payment")||m.contains("stock")||m.contains("review")||m.contains("delivery")||m.contains("price")||m.contains("category")||m.contains("buy")||m.contains("zoromart")||m.contains("checkout")||m.contains("listing")))return "I can help with ZoroMart products, cart, checkout, orders, sellers and reviews. What would you like to know?";
  Map<String,String> sessionCache=cache.computeIfAbsent(session,k->new ConcurrentHashMap<>());if(sessionCache.containsKey(m))return sessionCache.get(m);
  String answer;try{answer=provider.getReply(message,"ZoroMart marketplace FAQ");}catch(Exception e){answer=new MockChatProvider().getReply(message,"ZoroMart marketplace FAQ");}
  sessionCache.put(m,answer);return answer;
 }
}
