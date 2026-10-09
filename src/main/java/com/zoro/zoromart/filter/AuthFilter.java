package com.zoro.zoromart.filter;
import com.zoro.zoromart.util.JsonUtil;import javax.servlet.*;import javax.servlet.http.*;import java.io.IOException;
/** Protects buyer-specific API routes using the server session. */
public class AuthFilter implements Filter {public void doFilter(ServletRequest req,ServletResponse res,FilterChain chain)throws IOException,ServletException{HttpServletRequest r=(HttpServletRequest)req;HttpServletResponse s=(HttpServletResponse)res;HttpSession session=r.getSession(false);if(session==null||session.getAttribute("userId")==null){JsonUtil.write(s,401,JsonUtil.error("UNAUTHENTICATED","Please log in"));return;}chain.doFilter(req,res);}}
