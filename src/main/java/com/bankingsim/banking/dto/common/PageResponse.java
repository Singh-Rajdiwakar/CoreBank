package com.bankingsim.banking.dto.common;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
}
