package com.zoro.zoromart.filter;
import javax.servlet.*;import javax.servlet.http.HttpServletResponse;import java.io.IOException;
/** Enforces UTF-8 request and response encoding. */
public class EncodingFilter implements Filter { @Override public void doFilter(ServletRequest req,ServletResponse res,FilterChain chain)throws IOException,ServletException{req.setCharacterEncoding("UTF-8");res.setCharacterEncoding("UTF-8");if(res instanceof HttpServletResponse h)h.setHeader("X-Content-Type-Options","nosniff");chain.doFilter(req,res);} }
