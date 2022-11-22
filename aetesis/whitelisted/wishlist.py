import frappe
from frappe.model.document import Document

@frappe.whitelist(allow_guest=True)
def is_wished(item_code):
	res = bool(frappe.db.exists("Wishlist Item", {"item_code": item_code, "parent": frappe.session.user}))
	return res

@frappe.whitelist()
def add_to_wishlist(item_code, parent=None):
	"""Insert Item into wishlist."""
	if frappe.db.exists("Wishlist Item", {"item_code": item_code, "parent": frappe.session.user}):
		return

	if parent:
		parent_doc = frappe.get_doc(
			"Website Item",
			{"item_code": parent},
			as_dict=1,
		)
		variant_details = parent_doc.variant_details
		for v in variant_details:
			if v.item_code == item_code:
				variant = v
				break
		web_item_data = {
			"item_code": variant.item_code,
			"item_name": variant.website_variant_name,
			"item_group": parent_doc.get("item_group"),
			"website_item": parent_doc.get("name"),
			"web_item_name": variant.website_variant_name,
			"website_image": variant.website_image,
			"warehouse": parent_doc.get("website_warehouse"),
			"route": parent_doc.get("route") + '?' + variant.item_code.replace(' ', '_'),
		}
		
		
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
