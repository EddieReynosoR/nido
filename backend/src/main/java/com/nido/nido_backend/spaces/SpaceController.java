package com.nido.nido_backend.spaces;

import com.nido.nido_backend.spaces.dto.CreateSpaceRequest;
import com.nido.nido_backend.spaces.dto.SpaceResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RequestMapping("api/space")
@RestController
public class SpaceController {
    private final SpaceService spaceService;

    public SpaceController(SpaceService spaceService) {
        this.spaceService = spaceService;
    }

    @PostMapping("/create")
    public ResponseEntity<SpaceResponse> create(
            @Valid @RequestBody CreateSpaceRequest request,
            @AuthenticationPrincipal UserDetails user) {
        SpaceResponse response = spaceService.createSpace(request.name(), UUID.fromString(user.getUsername()));

        return ResponseEntity.ok(response);
    }
}
