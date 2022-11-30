from erpnext.selling.doctype.sales_order.sales_order import SalesOrder, make_raw_material_request, make_material_request, update_linked_doc, make_sales_invoice
import frappe
from datetime import timedelta



class CustomSalesOrder(SalesOrder):



	def sort_items_and_create_requests(self):
		purchasing_items = []
		manufacturing_items = []
		
	
		for item in self.items:
			item_doc = frappe.get_cached_doc("Item", item.get("item_code"))
			request_type = item_doc.default_material_request_type
			if not request_type in ["Purchase","Manufacture"]:
				frappe.throw("Wrong Material Request Type")
			if self.item_needs_purchasing(item):
				if request_type == "Purchase" :
					purchasing_items.append(item)
				else:
					manufacturing_items.append(item)	
		
		if not manufacturing_items == []:
			manufacturing_str = self.create_manufacturing_str(manufacturing_items)
			make_raw_material_request(manufacturing_str, self.company, self.name)
		
		
		#purchasing_str = self.create_purchasing_str()
		#make_material_request(purchasing_items)
		
	def item_needs_purchasing(self, item):
	
		return True
	
	def create_manufacturing_str(self, items):
	
		res = '{"include_exploded_items":0,"ignore_existing_ordered_qty":1,"items":['
		count = 0
		for i in items :
			count += 1
			res += '{"name":"' + i.name
			res += '","item_code":"' + i.item_code
			res += '","description":"' + frappe.get_cached_doc("Item", i.get("item_code")).name
			res += '","bom":"' + i.bom_no
			res += '","warehouse":"' + i.warehouse
			res += '","pending_qty":' + str(i.qty)
			res += ',"required_qty":' + str(i.qty)
			res += ',"sales_order_item":"' + i.name
			res += '","idx":' + str(count) +'}'
			if count < len(items) : res += ','
			
		res += ']}'

		return res
#{"include_exploded_items":0,"ignore_existing_ordered_qty":0,"items":[{"name":"bf67788718","item_code":"Test Fini-AG","description":"Test-AG","bom":"BOM-Test Fini-AG-001","warehouse":"Stores - Æ","pending_qty":1,"required_qty":1,"sales_order_item":"bf67788718","idx":1},{"name":"05e935d68e","item_code":"Test Fini-AU J","description":"Test-AU J","bom":"","warehouse":"Stores - Æ","pending_qty":2,"required_qty":2,"sales_order_item":"05e935d68e","idx":2}]}











