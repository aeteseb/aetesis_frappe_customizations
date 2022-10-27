import frappe

def get_price_list(region):
	countries = frappe.get_all('Website Region', fields=['country', 'price_list'])
	for country in countries:
		if region == country.country:
			return country.price_list
	return False
