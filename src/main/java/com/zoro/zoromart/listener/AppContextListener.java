package com.zoro.zoromart.listener;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.mindrot.jbcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.zoro.zoromart.service.ChatService;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.Statement;
import java.nio.file.Files;
import java.nio.file.Path;

/** Owns the application's single pooled database connection source. */
public class AppContextListener implements ServletContextListener {
 private static final Logger log=LoggerFactory.getLogger(AppContextListener.class);
 @Override public void contextInitialized(ServletContextEvent event) {
  String url=env("ZOROMART_JDBC_URL","jdbc:h2:./data/zoromart;AUTO_SERVER=TRUE");
  if(url.startsWith("jdbc:h2:./data/")){try{Files.createDirectories(Path.of("data"));}catch(Exception e){throw new IllegalStateException("Cannot create database directory",e);}}
  HikariConfig cfg=new HikariConfig(); cfg.setJdbcUrl(url); cfg.setDriverClassName("org.h2.Driver");
  cfg.setUsername(env("ZOROMART_DB_USER","sa")); cfg.setPassword(env("ZOROMART_DB_PASSWORD",""));
  cfg.setMaximumPoolSize(10); cfg.setPoolName("ZoroMartPool");
  HikariDataSource ds=new HikariDataSource(cfg); event.getServletContext().setAttribute("dataSource",ds); event.getServletContext().setAttribute("chatService",new ChatService());
  try(Connection c=ds.getConnection()) { runSql(c,"/db/migrations/V1__init_schema.sql"); runSql(c,"/db/migrations/V2__add_reviews_table.sql"); runSql(c,"/db/migrations/V3__add_index_orders_status.sql"); runSql(c,"/db/migrations/V4__add_listing_active_flag.sql"); ensureAdmin(c); log.info("ZoroMart database initialized"); }
  catch(Exception e){log.error("Database initialization failed",e); throw new IllegalStateException("Cannot initialize ZoroMart database",e);}
 }
 private static String env(String k,String d){String v=System.getenv(k);return v==null||v.isBlank()?d:v;}
 private void runSql(Connection c,String resource)throws Exception {try(InputStream in=getClass().getResourceAsStream(resource)){if(in==null)throw new IllegalStateException("Missing "+resource);String sql=new String(in.readAllBytes(),StandardCharsets.UTF_8).replaceAll("(?m)^[ \t]*--.*$", "");try(Statement st=c.createStatement()){for(String part:sql.split(";")){if(!part.isBlank())st.execute(part);}}}}
 private void ensureAdmin(Connection c)throws Exception {try(var p=c.prepareStatement("SELECT id FROM users WHERE email=?")){p.setString(1,env("ZOROMART_ADMIN_EMAIL","admin@zoromart.in"));try(var r=p.executeQuery()){if(r.next())return;}}try(var p=c.prepareStatement("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)")){p.setString(1,"ZoroMart Admin");p.setString(2,env("ZOROMART_ADMIN_EMAIL","admin@zoromart.in"));p.setString(3,BCrypt.hashpw(env("ZOROMART_ADMIN_PASSWORD","ChangeMe@123"),BCrypt.gensalt(12)));p.setString(4,"ADMIN");p.executeUpdate();}}
 @Override public void contextDestroyed(ServletContextEvent event){Object ds=event.getServletContext().getAttribute("dataSource");if(ds instanceof HikariDataSource h)h.close();}
}
