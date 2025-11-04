package com.ssafy.workspaceservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "workspace",
        indexes = @Index(name = "idx_workspace_visibility", columnList = "visibility"))
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workspace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "workspace_id")
    private Long id;

    @Column(nullable = false, length = 20)     // ex) TEAM / PERSONAL
    private String mode;

    @Column(nullable = false, length = 20)     // ex) PUBLIC / PRIVATE
    private String visibility;

    @Column(nullable = false, length = 100)
    private String subject;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(length = 300)
    private String thumbnail;

//    @UpdateTimestamp
//    @Column(nullable = false)
//    private LocalDateTime updatedAt;

    public void changeVisibility(String visibility) { this.visibility = visibility; }
    public void changeSubject(String subject) { this.subject = subject; }
    public void changeThumbnail(String thumbnail) { this.thumbnail = thumbnail; }
}
