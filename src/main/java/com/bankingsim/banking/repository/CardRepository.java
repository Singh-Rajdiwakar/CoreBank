package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.Card;
import com.bankingsim.banking.entity.enums.CardStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByAccountId(Long accountId);
    Optional<Card> findByMaskedNumber(String maskedNumber);
    List<Card> findByStatus(CardStatus status);
}
