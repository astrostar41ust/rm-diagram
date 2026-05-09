package com.rmdiagram.search;

import java.util.List;

public final class SearchDto {

    private SearchDto() {}

    public enum Kind { HABIT, NOTE, TRANSACTION, GOAL, CATEGORY }

    public record Result(
            String id,
            Kind kind,
            String title,
            String subtitle,
            String href) {}

    public record Response(int total, List<Result> results) {}
}
