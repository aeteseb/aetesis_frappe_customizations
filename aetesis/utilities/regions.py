import frappe

@frappe.whitelist(allow_guest=True)
def get_countries_and_languages():
    chart = frappe.get_all('Website Region', fields=['country', 'flag'])
    res = {}
    countries = map(lambda x: {'country': x.country, 'flag': x.flag}, chart)
    res['countries'] = countries
    
    langs = frappe.get_all('Language', filters=['enabled=true'], fields=['language_name'])
    languages = map(get_dict, langs)
    res['languages'] = languages
    return res

def get_dict(lang):
    doc = frappe.get_doc('Language', lang)
    return {'language': doc.language_name, 'flag': doc.flag, 'countries': doc.countries}