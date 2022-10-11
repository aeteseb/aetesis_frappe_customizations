import frappe
import json
from erpnext.e_commerce.doctype.e_commerce_settings.e_commerce_settings import get_shopping_cart_settings
from erpnext.utilities.product import get_price as frappe_price
from aetesis.utilities.price_list import get_price_list
@frappe.whitelist(allow_guest=True)
def get_product_info_for_website(item_code, skip_quotation_creation=False):
	"""get product price / stock info for website"""

	cart_settings = get_shopping_cart_settings()
	if not cart_settings.enabled:
		# return settings even if cart is disabled
		return frappe._dict({"product_info": {}, "cart_settings": cart_settings})

	cart_quotation = frappe._dict()
	if not skip_quotation_creation:
		cart_quotation = _get_cart_quotation()

	selling_price_list = (
		cart_quotation.get("selling_price_list")
		if cart_quotation
		else _set_price_list(cart_settings, None)
	)

	price = {}
	if cart_settings.show_price:
		is_guest = frappe.session.user == "Guest"
		# Show Price if logged in.
		# If not logged in, check if price is hidden for guest.
		if not is_guest or not cart_settings.hide_price_for_guest:
			price = get_price(
				item_code, selling_price_list, cart_settings.default_customer_group, cart_settings.company
			)

	stock_status = None

	if cart_settings.show_stock_availability:
		on_backorder = frappe.get_cached_value("Website Item", {"item_code": item_code}, "on_backorder")
		if on_backorder:
			stock_status = frappe._dict({"on_backorder": True})
		else:
			stock_status = get_web_item_qty_in_stock(item_code, "website_warehouse")

	product_info = {
		"price": price,
		"qty": 0,
		"uom": frappe.db.get_value("Item", item_code, "stock_uom"),
		"sales_uom": frappe.db.get_value("Item", item_code, "sales_uom"),
	}

	if stock_status:
		if stock_status.on_backorder:
			product_info["on_backorder"] = True
		else:
			product_info["stock_qty"] = stock_status.stock_qty
			product_info["in_stock"] = (
				stock_status.in_stock
				if stock_status.is_stock_item
				else get_non_stock_item_status(item_code, "website_warehouse")
			)
			product_info["show_stock_qty"] = show_quantity_in_website()

	if product_info["price"]:
		if frappe.session.user != "Guest":
			item = cart_quotation.get({"item_code": item_code}) if cart_quotation else None
			if item:
				product_info["qty"] = item[0].qty

	return frappe._dict({"product_info": product_info, "cart_settings": cart_settings})

@frappe.whitelist(allow_guest=True)
def get_prices(item_codes, region):
	cart_settings = get_shopping_cart_settings()
	price_list = get_price_list(region)
	prices = []
	items = json.loads(item_codes)
	for item in items:
		price = frappe_price(item, price_list, cart_settings.default_customer_group, cart_settings.company)
		print(item, price_list, price)
		prices.append({"item_code": item, "price": price})
	return prices





