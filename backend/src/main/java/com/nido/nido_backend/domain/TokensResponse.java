package com.nido.nido_backend.domain;

import java.util.Date;

public class TokensResponse {
    private String accessToken;
    private Date expiration;

    public TokensResponse(String accessToken, Date expiration) {
        this.accessToken = accessToken;
        this.expiration = expiration;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public Date getExpiration() {
        return expiration;
    }

    public void setExpiration(Date expiration) {
        this.expiration = expiration;
    }
}
