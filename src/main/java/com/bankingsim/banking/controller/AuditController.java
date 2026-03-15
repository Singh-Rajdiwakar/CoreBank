package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.dto.common.AuditLogResponse;
import com.bankingsim.banking.dto.common.PageResponse;
import com.bankingsim.banking.service.AuditLogService;
import com.bankingsim.banking.util.PageMapper;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit/logs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','AUDITOR')")
public class AuditController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ApiResponse<PageResponse<AuditLogResponse>> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(PageMapper.from(auditLogService.list(from, to, page, size)));
    }
}
