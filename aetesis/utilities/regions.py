import frappe

@frappe.whitelist(allow_guest=True)
def get_countries_and_languages():
    chart = frappe.get_all('Website Region', fields=['country', 'flag'])
    res = {}
    countries = map(lambda x: {'country': x.country, 'flag': x.flag}, chart)
    res['countries'] = countries
    return res
