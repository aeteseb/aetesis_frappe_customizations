import frappe
from aetesis.e_commerce.shopping_cart.cart import get_cart_quotation, get_party

@frappe.whitelist(allow_guest=True)
def get_quote(guest_id):
    quote = get_cart_quotation(guest_id=guest_id)
    return quote

@frappe.whitelist()
def transfer_cart_from_guest(guest_id, user):
    print('transferring cart from', guest_id, 'to', user)
    try:
        quotation = frappe.get_all(
		"Quotation",
		fields=["name"],
		filters={
			"party_name": guest_id,
			"order_type": "Shopping Cart",
			"docstatus": 0,
		},
		order_by="modified desc",
		limit_page_length=1,
	    )
        print('got quotation:', quotation)
        if  quotation:
            doc = frappe.get_doc("Quotation", quotation[0].get("name"))
            print('party on quotation:', get_party().name)
            customer = get_party().name
            doc.party_name = customer
            doc.title = customer
            doc.save()
    except:
        print('no quotation found')
