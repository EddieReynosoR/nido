package com.orderly.orderly_backend;

import com.orderly.orderly_backend.domain.user.UserEntity;
import com.orderly.orderly_backend.repository.UserRepository;
import jakarta.persistence.Entity;
import org.junit.jupiter.api.Test;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class OrderlyBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
