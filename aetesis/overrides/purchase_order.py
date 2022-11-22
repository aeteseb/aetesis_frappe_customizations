import frappe
import re
from erpnext.buying.doctype.purchase_order.purchase_order import PurchaseOrder
from erpnext.stock.stock_balance import get_ordered_qty, update_bin_qty

class CustomPurchaseOrder(PurchaseOrder) :
	def update_requested_qty(self):
		material_request_map = {}
		for d in self.get("items"):
			if d.material_request_item:
				material_request_map.setdefault(d.material_request, []).append(d.material_request_item)
			"""elif d.references:
				
				mrs = re.finditer('mr:[^,]+,(i:[^,]+,so:[^,]+,)+', d.references)
				for mr in mrs :
					mr_name = mr.group()[3:20]
					items = re.finditer('i:[^,]+,so:[^,]+,', mr.group())
					for item in items :
						item_name = item.group()[2:12]									
						material_request_map.setdefault(mr_name, []).append(item_name)"""

		for mr, mr_item_rows in material_request_map.items():

			if mr and mr_item_rows:
				mr_obj = frappe.get_doc("Material Request", mr)

				if mr_obj.status in ["Stopped", "Cancelled"]:
					frappe.throw(
						_("Material Request {0} is cancelled or stopped").format(mr), frappe.InvalidStatusError
					)

				mr_obj.update_requested_qty(mr_item_rows)

	def update_ordered_qty(self, po_item_rows=None):
		"""update requested qty (before ordered_qty is updated)"""
		item_wh_list = []
		for d in self.get("items"):
			if (
				(not po_item_rows or d.name in po_item_rows)
				and [d.item_code, d.warehouse] not in item_wh_list
				and frappe.get_cached_value("Item", d.item_code, "is_stock_item")
				and d.warehouse
				and not d.delivered_by_supplier
			):
				item_wh_list.append([d.item_code, d.warehouse])
		for item_code, warehouse in item_wh_list:
			update_bin_qty(item_code, warehouse, {"ordered_qty": get_ordered_qty(item_code, warehouse)})
			
@frappe.whitelist()
def make_print_purchase_order(po_name="", *args, **kwargs) :
	if po_name != "":
		source_name = po_name
	else :
		source_name = re.search('"name":[^,]+,', kwargs.get('doc')).group()[8:-2]
	po = frappe.get_doc("Purchase Order", source_name)
	
	ppo = frappe.new_doc('Print Purchase Order')
	ppo.title = po.name
	ppo.po_name = po.name
	ppo.company = po.company
	ppo.purchase_order = po.name
	ppo.supplier = po.supplier
	ppo.total_qty = po.total_qty
	ppo.transaction_date = po.transaction_date
	ppo.schedule_date = po.schedule_date
	items = get_items_for_ppo(po.items, po.supplier)
	
	
	for item in items :
		row = ppo.append(
			"items",
				{
				"item_code": item[0],
				"qty": item[1],
				"supplier_part_no": item[2],
				}
		)

	ppo.insert()
		
def get_supplier_part_number(item, supplier) :
	doc = frappe.get_doc('Item', item)
	suppliers = doc.supplier_items
	
	
	for sup in suppliers :
		if sup.supplier == supplier:
			return sup.supplier_part_no


def first_appearance(item, items):
	if items == [] : 
		return [True, 0]
	else: 
		for i in range(len(items)) :
			if items[i][0] == item[0]:
				return [False, i]
		return [True, 0]

def get_items_for_ppo(po_items, supplier):
	items = []
 
	for i in po_items :
		
		item = [i.item_code, 
			i.qty,
			get_supplier_part_number(i.item_code, supplier)]

		result =  first_appearance(item, items)
		first = result[0]
		n = result[1]

		if not first:
			items[n][1] = items[n][1] + item[1]
		else:
			items.append(item)
	return items




