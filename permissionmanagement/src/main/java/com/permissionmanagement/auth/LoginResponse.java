package com.permissionmanagement.auth;

public class LoginResponse {
    private String token;
    private Long userId;
    private String username;
    private Long departmentId;
    private Long designationId;

    public LoginResponse(String token, Long userId, String username, Long departmentId, Long designationId) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.departmentId = departmentId;
        this.designationId = designationId;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public Long getDesignationId() { return designationId; }
    public void setDesignationId(Long designationId) { this.designationId = designationId; }
}