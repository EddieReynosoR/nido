package com.nido.nido_backend.topics;

import com.nido.nido_backend.topics.dto.TopicRequest;
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
    public ResponseEntity<TopicEntity> create(
            @RequestBody TopicRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        var responseEntity = topicService.createTopic(request, userDetails.getUsername());
        return ResponseEntity.ok(responseEntity);
    }
}
