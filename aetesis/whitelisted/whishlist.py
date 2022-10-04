@frappe.whitelist()
def add_to_wishlist(item_code, parent=None):
	"""Insert Item into wishlist."""

	if frappe.db.exists("Wishlist Item", {"item_code": item_code, "parent": frappe.session.user}):
		return

	if parent:
		variant_details = frappe.db.get_value(
			"Website Item",
			{"item_code": parent},
			[
				"variant_details",
			],
			as_dict=1,
		)
		print(variant_details[0])
		print('VAR', variant)
	else:
		web_item_data = frappe.db.get_value(
			"Website Item",
			{"item_code": item_code},
			[
				"website_image",
				"website_warehouse",
				"name",
				"web_item_name",
				"item_name",
				"item_group",
				"route",
			],
			as_dict=1,
		)

	wished_item_dict = {
		"item_code": item_code,
		"item_name": web_item_data.get("item_name"),
		"item_group": web_item_data.get("item_group"),
		"website_item": web_item_data.get("name"),
		"web_item_name": web_item_data.get("web_item_name"),
		"image": web_item_data.get("website_image"),
		"warehouse": web_item_data.get("website_warehouse"),
		"route": web_item_data.get("route"),
	}

	if not frappe.db.exists("Wishlist", frappe.session.user):
		# initialise wishlist
		wishlist = frappe.get_doc({"doctype": "Wishlist"})
		wishlist.user = frappe.session.user
		wishlist.append("items", wished_item_dict)
		wishlist.save(ignore_permissions=True)
	else:
		wishlist = frappe.get_doc("Wishlist", frappe.session.user)
		item = wishlist.append("items", wished_item_dict)
		item.db_insert()

	if hasattr(frappe.local, "cookie_manager"):
		frappe.local.cookie_manager.set_cookie("wish_count", str(len(wishlist.items)))
