import frappe
from frappe.translate import set_preferred_language_cookie


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
    return {'language': doc.language_name, 'flag': doc.flag, 'countries': doc.countries, 'code': doc.language_code}

@frappe.whitelist(allow_guest=True)
def set_language(preferred_language):
    user = frappe.session.user
    print(preferred_language)
    if user == "Guest":
        return set_preferred_language_cookie(preferred_language)
    else:
        doc = frappe.get_doc('User', user)
        doc.language = preferred_language
        doc.save()
        print(frappe.db.get_value('User', user, 'language'))
        return 