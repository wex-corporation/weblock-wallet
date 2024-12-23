package com.wefunding.wallet.api.user.dto;

public record SignInRequest(String provider, String firebaseId, String email, String idToken) {}
