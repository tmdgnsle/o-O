package com.ssafy.workspaceservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "workspace_member",
        uniqueConstraints = @UniqueConstraint(name = "uk_workspace_user", columnNames = {"workspace_id","user_id"}),
        indexes = {
                @Index(name = "idx_workspace_member_workspace", columnList = "workspace_id"),
                @Index(name = "idx_workspace_member_user", columnList = "user_id")
        })
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkspaceMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @Column(name = "user_id", nullable = false)
    private Long userId;                     // 외부 user-service PK

    @Column(nullable = false, length = 20)   // ex) OWNER / ADMIN / MEMBER / VIEWER
    private String role;

    @CreationTimestamp
    @Column(name = "enter_time", nullable = false, updatable = false)
    private LocalDateTime enterTime;

    @Column(name = "pointer_color", length = 20)
    private String pointerColor;

    public void changeRole(String role) { this.role = role; }
    public void changePointerColor(String color) { this.pointerColor = color; }
}
