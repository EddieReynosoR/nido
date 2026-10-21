package com.nido.nido_backend.spaces;

import com.nido.nido_backend.spaces.dto.CreateSpaceRequest;
import com.nido.nido_backend.spaces.dto.SpaceContentResponse;
import com.nido.nido_backend.spaces.dto.SpaceResponse;
import com.nido.nido_backend.spaces.dto.UpdateSpaceRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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
        SpaceResponse response = spaceService.createSpace(request.name(), user.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public PagedModel<SpaceResponse> getSpaces(
            @AuthenticationPrincipal UserDetails user,
            @PageableDefault(size = 50, sort = "name", direction = Sort.Direction.ASC)Pageable pageable) {
        return new PagedModel<>(spaceService.getSpaces(user.getUsername(), pageable));
    }

    @DeleteMapping("/delete/{spaceId}")
    public ResponseEntity<Void> deleteSpace(
            @PathVariable("spaceId") UUID spaceId,
            @AuthenticationPrincipal UserDetails user) {
        spaceService.deleteSpace(spaceId, UUID.fromString(user.getUsername()));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/update")
    public ResponseEntity<SpaceResponse> updateSpace(
            @Valid @RequestBody UpdateSpaceRequest request,
            @AuthenticationPrincipal UserDetails user) {
        SpaceResponse response = spaceService.updateSpace(
                UUID.fromString(request.spaceId()),
                UUID.fromString(user.getUsername()),
                request.name());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/content")
    public ResponseEntity<SpaceContentResponse> get(
            @RequestParam("spaceId") UUID spaceId,
            @AuthenticationPrincipal UserDetails userDetails) {
        var response = spaceService.getContent(spaceId, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}
