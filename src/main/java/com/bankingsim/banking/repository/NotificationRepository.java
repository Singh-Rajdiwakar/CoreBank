package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.Notification;
import com.bankingsim.banking.entity.enums.NotificationChannel;
import com.bankingsim.banking.entity.enums.NotificationStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Optional<Notification> findByIdAndUserId(Long id, Long userId);
    long countByUserIdAndReadFlagFalse(Long userId);
    List<Notification> findByUserIdAndReadFlagFalse(Long userId);
    Page<Notification> findByStatusOrderByCreatedAtDesc(NotificationStatus status, Pageable pageable);
    long countByStatus(NotificationStatus status);
    long countByStatusAndNextRetryAtLessThanEqual(NotificationStatus status, LocalDateTime nextRetryAt);
    Page<Notification> findByStatusAndChannelOrderByCreatedAtDesc(NotificationStatus status, NotificationChannel channel, Pageable pageable);
    Page<Notification> findByStatusAndChannelInOrderByCreatedAtDesc(NotificationStatus status, List<NotificationChannel> channels, Pageable pageable);

    @Modifying
    @Query("""
            update Notification n
            set n.readFlag = true, n.readAt = :readAt
            where n.user.id = :userId and n.readFlag = false
            """)
    int markAllAsReadByUserId(@Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);

    List<Notification> findByStatusAndNextRetryAtLessThanEqualOrderByCreatedAtAsc(
            NotificationStatus status,
            LocalDateTime nextRetryAt,
            Pageable pageable
    );

    List<Notification> findByStatusAndChannelAndNextRetryAtLessThanEqualOrderByCreatedAtAsc(
            NotificationStatus status,
            NotificationChannel channel,
            LocalDateTime nextRetryAt,
            Pageable pageable
    );

    long deleteByStatusAndCreatedAtBefore(NotificationStatus status, LocalDateTime createdAtBefore);
}
