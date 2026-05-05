
package com.trekr.backend.dto.discipline;

import java.util.List;

public class CustomTrackingCategoriesResponse {

	private List<CustomTrackingCategoryDto> items;

	public CustomTrackingCategoriesResponse() {
	}

	public CustomTrackingCategoriesResponse(List<CustomTrackingCategoryDto> items) {
		this.items = items;
	}

	public List<CustomTrackingCategoryDto> getItems() {
		return items;
	}

	public void setItems(List<CustomTrackingCategoryDto> items) {
		this.items = items;
	}
}


