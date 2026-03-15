package com.bankingsim.banking.util;

import org.springframework.data.domain.Page;
import com.bankingsim.banking.dto.common.PageResponse;

public final class PageMapper {

    private PageMapper() {
    }

    public static <T> PageResponse<T> from(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}
