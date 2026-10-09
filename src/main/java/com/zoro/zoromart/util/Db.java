package com.zoro.zoromart.util;
import com.zaxxer.hikari.HikariDataSource;import javax.servlet.ServletContext;import java.sql.Connection;import java.sql.SQLException;
/** Retrieves the single application-managed connection pool. */
public final class Db {private Db(){} public static Connection connection(ServletContext c)throws SQLException{return ((HikariDataSource)c.getAttribute("dataSource")).getConnection();}}
