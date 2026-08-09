package com.nido.nido_backend.spaces;

import com.nido.nido_backend.spaces.dto.CreateSpaceRequest;
import com.nido.nido_backend.spaces.dto.SpaceResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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
        SpaceResponse response = spaceService.createSpace(request.name(), user.getUsername());

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public Page<SpaceResponse> getSpaces(
            @AuthenticationPrincipal UserDetails user,
            @PageableDefault(size = 50, sort = "name", direction = Sort.Direction.ASC)Pageable pageable) {
        return spaceService.getSpaces(user.getUsername(), pageable);
    }
}
