import frappe
import frappe.utils
from frappe.utils import nowdate
from aetesis.overrides.purchase_order import make_print_purchase_order

def get_reference_str(item) :
	mrs = []
	res = []

	for i in item :
		if not i[1] in mrs :
			mrs.append(i[1])
			res.append([i[1], [(i[2], i[0])]])
		else:
			for j in res :
				if j[0] == i[1]:
					j[1].append((i[2], i[0]))
	string = ''
	for i in res :
		string += f'mr:{i[0]},'
		for j in i[1] :
			string += f'i:{j[0]},so:{j[1]},'
	
	return string

def reformat(items):
	res = []
	for i in items:
		res.append(
		{
		"item_code": i[0],
		"qty": i[1],
		"schedule_date": i[2],
		"warehouse": i[3],
		"sales_order": i[4],
		"material_request": i[5],
		"material_request_item": i[6]
#		"reference": get_reference_str(i[4])
		}
		)
	return res

def first_appearance(item, items):
	if items == [] : 
		return [True, 0]
	else: 
		for i in range(len(items)) :
			if items[i][0] == item[0]:
				return [False, i]
		return [True, 0]

def get_items_for_po(pending_requests):
	items = []
 
	for request in pending_requests :
		doc = frappe.get_doc('Material Request', request)
#		print("items:", items)

		for i in doc.items :
			item = [i.item_code, 
				i.qty,
				i.schedule_date,
				i.warehouse,
				i.sales_order,
				request,
				i.name,
				"""[(i.sales_order,
					request,
					i.name)]"""
				]
#			print("This item:", item)
			"""result =  first_appearance(item, items)
			first = result[0]
			n = result[1]

			if not first:
				items[n][1] = items[n][1] + item[1]
				items[n][4].append(item[4][0])
			else:"""
			items.append(item)

	items = reformat(items)
 
	return items

@frappe.whitelist()
def create_po():

	pending_requests = frappe.db.get_all('Material Request', filters={'status': 'Pending'}, fields=['name'], pluck='name')
	if not pending_requests: return
	items = get_items_for_po(pending_requests)


	
	po = frappe.new_doc('Purchase Order')
	po.update(
		dict(
			doctype='Purchase Order', 
			transaction_date=nowdate(), 
			company='ÆTESIS', 
			supplier = 'Altmann Casting AG',
			)
		)


	for item in items :
		row = po.append(
			"items",
			{
				"item_code": item.get("item_code"),
				"qty": item.get("qty"),
				"schedule_date": item.get("schedule_date"),
				"warehouse": item.get("warehouse"),
				"sales_order": item.get("sales_order"),
				"material_request": item.get("material_request"),
				"material_request_item": item.get("material_request_item"),
			},
		)

	po.insert()
	po.flags.ignore_permissions = 1
	po.run_method("set_missing_values")
	po.submit()
	
	make_print_purchase_order(po.name)
	
	for request in pending_requests :
		doc = frappe.get_doc('Material Request', request)
		doc.purchase_order = po.name
		doc.save()


