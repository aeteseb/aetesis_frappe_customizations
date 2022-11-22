import frappe

@frappe.whitelist()
def set_taxes(
	party,
	party_type,
	posting_date,
	company,
	customer_group=None,
	supplier_group=None,
	tax_category=None,
	billing_address=None,
	shipping_address=None,
	use_for_shopping_cart=None,
    region=None
):
	from erpnext.accounts.doctype.tax_rule.tax_rule import get_party_details, get_tax_template

	args = {party_type.lower(): party, "company": company}

	if tax_category:
		args["tax_category"] = tax_category

	if customer_group:
		args["customer_group"] = customer_group

	if supplier_group:
		args["supplier_group"] = supplier_group

	if billing_address or shipping_address:
		args.update(
			get_party_details(
				party, party_type, {"billing_address": billing_address, "shipping_address": shipping_address}
			)
		)
		
	else:
		args.update(get_party_details(party, party_type))

	if party_type in ("Customer", "Lead"):
		args.update({"tax_type": "Sales"})

		if party_type == "Lead":
			args["customer"] = None
			del args["lead"]
	else:
		args.update({"tax_type": "Purchase"})

	if use_for_shopping_cart:
		args.update({"use_for_shopping_cart": use_for_shopping_cart})

	return get_tax_template(posting_date, args)