package com.zoro.zoromart.service;
import com.zoro.zoromart.dao.MarketplaceDAO;import com.zoro.zoromart.dto.OrderResponseDTO;import java.sql.SQLException;
/** Orchestrates mock payment confirmation and transactional order creation. */
public class OrderService {private final PaymentStrategy paymentStrategy;public OrderService(PaymentStrategy paymentStrategy){this.paymentStrategy=paymentStrategy;}public OrderResponseDTO checkout(MarketplaceDAO dao,long buyerId)throws SQLException{if(buyerId<=0)throw new IllegalArgumentException("A signed-in buyer is required");String payment=paymentStrategy.confirmPayment();long id=dao.checkout(buyerId);return OrderResponseDTO.builder().orderId(id).paymentStatus(payment).message("Mock payment confirmed; no real money was collected").build();}}
