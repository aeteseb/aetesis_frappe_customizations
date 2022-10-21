import frappe

@frappe.whitelist()
def get_addresses(user, address_type):
    i = frappe.qb.DocType("Address")

    query = (
        frappe.qb.from_(i)
        .select(i.title, i.display)
        .where(i.user == user & i.type == address_type)
    )
    items = query.run(as_dict=True)

    return items