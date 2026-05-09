package com.rmdiagram.networth;

public enum AccountType {
    CASH,
    BANK,
    CREDIT,
    INVESTMENT,
    ASSET,
    LIABILITY;

    public boolean isLiability() {
        return this == CREDIT || this == LIABILITY;
    }
}
