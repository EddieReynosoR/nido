package com.nido.nido_backend.topics;

import com.nido.nido_backend.topics.dto.TopicRequest;
import com.nido.nido_backend.topics.dto.TopicResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/topic")
public class TopicController {

    private final TopicService topicService;

    public TopicController(TopicService topicService) { this.topicService = topicService; }

    @PostMapping("/create")
    public ResponseEntity<TopicResponse> create(
            @Valid @RequestBody TopicRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        var entity = topicService.createTopic(request, userDetails.getUsername());
        return ResponseEntity.ok(TopicResponse.from(entity));
    }
}
