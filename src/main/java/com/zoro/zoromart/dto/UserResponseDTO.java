package com.zoro.zoromart.dto;
/** Public user response that deliberately excludes password hashes. */
public class UserResponseDTO {private final long id;private final String name,email,role;public UserResponseDTO(long id,String name,String email,String role){this.id=id;this.name=name;this.email=email;this.role=role;}public long getId(){return id;}public String getName(){return name;}public String getEmail(){return email;}public String getRole(){return role;}}
