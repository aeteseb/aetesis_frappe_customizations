import frappe

def get_price_list(region):
	chart = frappe.get_doc('Price List Chart')
	for country in chart.correspondance:
		print(region.lower(), country.country_code)
		if region.lower() == country.country_code:
			return country.price_list
	return False
