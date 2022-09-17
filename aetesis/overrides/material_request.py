import json

import frappe
from frappe import _, msgprint
from frappe.model.mapper import get_mapped_doc
from frappe.utils import cstr, flt, get_link_to_form, getdate, new_line_sep, nowdate

from erpnext.buying.utils import check_on_hold_or_closed_status, validate_for_items
from erpnext.controllers.buying_controller import BuyingController
from erpnext.manufacturing.doctype.work_order.work_order import get_item_details
from erpnext.stock.doctype.item.item import get_item_defaults
from erpnext.stock.stock_balance import get_indented_qty, update_bin_qty
from erpnext.stock.doctype.material_request.material_request import MaterialRequest

class CustomMaterialRequest(MaterialRequest) :
	
	def update_requested_qty(self, mr_item_rows=None):
		"""update requested qty (before ordered_qty is updated)"""
		item_wh_list = []

		for d in self.get("items"):
			if (
				(not mr_item_rows or d.name in mr_item_rows)
				and [d.item_code, d.warehouse] not in item_wh_list
				and d.warehouse
				and frappe.db.get_value("Item", d.item_code, "is_stock_item") == 1
			):
				item_wh_list.append([d.item_code, d.warehouse])

		for item_code, warehouse in item_wh_list:
			update_bin_qty(item_code, warehouse, {"indented_qty": get_indented_qty(item_code, warehouse)})
