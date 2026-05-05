
package com.trekr.backend.dto.discipline;

public class CustomTrackingCategoryDto {

	private Long customTrackingId;
	private String name;

	public CustomTrackingCategoryDto() {
	}

	public CustomTrackingCategoryDto(Long customTrackingId, String name) {
		this.customTrackingId = customTrackingId;
		this.name = name;
	}

	public Long getCustomTrackingId() {
		return customTrackingId;
	}

	public void setCustomTrackingId(Long customTrackingId) {
		this.customTrackingId = customTrackingId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
}


