$(() => {
	class ProductListing {
		constructor() {
			let me = this;
			let is_item_group_page = $(".item-group-content").data("item-group");
			this.item_group = is_item_group_page || null;


			// Render Product Views, Filters & Search
			new aetesis.ProductView({
				view_type: "Grid View",
				products_section: $('#product-listing'),
				item_group: me.item_group
			});

			this.bind_card_actions();
		}

		bind_card_actions() {
			aetesis.e_commerce.shopping_cart.bind_add_to_cart_action();
			aetesis.e_commerce.wishlist.bind_wishlist_action();
		}
	}

	new ProductListing();
});
