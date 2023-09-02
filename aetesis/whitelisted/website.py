import frappe

@frappe.whitelist(allow_guest=True)
def get_product_list(page_size=8, page_number=0):
    page_size = int(page_size or 8)
    page_number = int(page_number or 0)
    result = frappe.get_all("AE Product", fields=['name', 'product_name', 'family', 'categories', 'default_price', 'main_image', 'components'])
    return result[page_number * page_size:page_size * (page_number + 1)]

@frappe.whitelist(allow_guest=True)
def get_product_details(product_id):
    result = frappe.get_doc("AE Product", product_id)
    return result