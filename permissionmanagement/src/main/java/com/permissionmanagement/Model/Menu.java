package com.permissionmanagement.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;

@Entity
public class Menu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String menuName;

    @NotBlank
    private String subMenu;

    @NotBlank
    private String link;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMenuName() { return menuName; }
    public void setMenuName(String menuName) { this.menuName = menuName; }
    public String getSubMenu() { return subMenu; }
    public void setSubMenu(String subMenu) { this.subMenu = subMenu; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
}
