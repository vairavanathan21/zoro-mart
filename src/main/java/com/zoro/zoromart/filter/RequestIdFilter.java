package com.zoro.zoromart.filter;
import org.slf4j.MDC;import javax.servlet.*;import javax.servlet.http.*;import java.io.IOException;import java.util.UUID;
/** Adds a request ID to logs and response headers. */
public class RequestIdFilter implements Filter {public void doFilter(ServletRequest req,ServletResponse res,FilterChain chain)throws IOException,ServletException{String id=UUID.randomUUID().toString();MDC.put("requestId",id);if(res instanceof HttpServletResponse h)h.setHeader("X-Request-ID",id);try{chain.doFilter(req,res);}finally{MDC.remove("requestId");}}}
