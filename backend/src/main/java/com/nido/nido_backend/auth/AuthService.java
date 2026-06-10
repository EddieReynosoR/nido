package com.nido.nido_backend.auth;

import com.nido.nido_backend.auth.dto.LoginRequest;
import com.nido.nido_backend.refresh_token.dto.RefreshTokenDto;
import com.nido.nido_backend.user.dto.RegisterUserDto;
import com.nido.nido_backend.user.UserEntity;
import com.nido.nido_backend.refresh_token.RefreshTokenService;
import com.nido.nido_backend.user.UserService;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserService userService;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService, RefreshTokenService refreshTokenService, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.userService = userService;
    }

    public UserEntity signup(RegisterUserDto input) {
        return userService.saveUser(input);
    }

    public UserEntity authenticate(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        return userService.findByEmail(request.getEmail());
    }

    @Transactional
    public RefreshTokenDto signin(LoginRequest request) {

        UserEntity user = authenticate(request);
        refreshTokenService.deleleTokenByUserId(user.getUserId());

        String accessToken = jwtService.generateToken(user.getEmail());
        String refreshToken = refreshTokenService.createRefreshToken(user.getUserId());

        RefreshTokenDto refreshTokenDto = new RefreshTokenDto();
        refreshTokenDto.setAccessToken(accessToken);
        refreshTokenDto.setExpiration(jwtService.extractExpiration(accessToken));
        refreshTokenDto.setRefreshToken(refreshToken);

        return refreshTokenDto;
    }
}
