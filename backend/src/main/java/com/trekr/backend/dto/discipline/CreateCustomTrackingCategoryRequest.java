
package com.trekr.backend.dto.discipline;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateCustomTrackingCategoryRequest {

	@NotBlank(message = "Name is required")
	@Size(max = 100, message = "Name must be at most 100 characters")
	private String name;

	public CreateCustomTrackingCategoryRequest() {
	}

	public CreateCustomTrackingCategoryRequest(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
}


