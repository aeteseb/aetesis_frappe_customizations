
import json

from typing import TYPE_CHECKING, List, Union
from aetesis.classes import get_tree
"""
if TYPE_CHECKING:
	from erpnext.stock.doctype.item.item import Item
"""

import frappe
from frappe import _
#from frappe.utils import cint, cstr, flt, random_string

#from aetesis.e_commerce.variant_selector.item_variants_cache import ItemVariantsCacheManager
from erpnext.e_commerce.redisearch_utils import insert_item_to_index
from erpnext.e_commerce.doctype.website_item.website_item import WebsiteItem
#from aetesis.e_commerce.shopping_cart.cart import _set_price_list

#from erpnext.utilities.product import get_price


class CustomWebsiteItem(WebsiteItem):
	

	def get_context(self, context):
		new_context = super(CustomWebsiteItem, self).get_context(context)
		
		if self.has_variants:
			vd = self.variant_details			
	
			for v in vd:
				v.attributes = json.loads(v.attributes)
				if v.slideshow:
					doc = frappe.get_doc("Website Slideshow", v.slideshow)
					v.slides = doc.slideshow_items
					print(v.slides)
			new_context.variant_details = vd
			print(new_context.variant_details)
		return new_context
	

	
	def set_variant_details(self):
		i = frappe.qb.DocType("Item")

		query = (
			frappe.qb.from_(i)
			.select(i.item_code, i.item_name)
			.where((i.variant_of == self.item_code) & (i.disabled == 0))
			.orderby(i.item_name)
		)
		items = query.run(as_dict=True)
		
		print(items)
		details = []
		
		if self.variant_details != []:
			existing = [v.item_code for v in self.variant_details]
			print(existing)
			
			new_items = []
			
			for item in items:
				
				if not item.item_code in existing:
					new_items.append(item)
			
			items = new_items	
		
		for item in items:
			
			attrs = self.get_ordered_attributes(item)
			
			row = self.append(
				"variant_details",
					{
					"item_code": item.item_code,
					"attributes": attrs,
					"website_variant_name": item.item_name,
					}
			)		
	
	def get_ordered_attributes(self, item):
		attrs = frappe.get_doc("Item", item.item_code).attributes
		
		attributes = []
		
		for attr in attrs:
			print('attr', attr.attribute, 'val', attr.attribute_value)
			attributes.append({'attribute': attr.attribute, 'attribute_value': attr.attribute_value})
		print('ATTRS UNORDRD', attributes)
		attributes.sort(key=attr_order)
		
		print('ATTRS', attributes)
		return json.dumps(attributes)
		
	def set_variant_tree(self):
		vd = self.variant_details
		
		variants = []
		for v in vd:
			if v.published:
				attrs = json.loads(v.attributes)
				item_code = v.item_code
				variants.append((item_code, attrs))
		
		tree = get_tree(variants)
		self.variant_tree = tree
		return tree
		


	def get_materials(self):
		wi = frappe.qb.DocType("Website Item")

		query = (
			frappe.qb.from_(wi)
			.select(wi.item_code, wi.route, wi.web_item_name, wi.variant_of, wi.website_image)
			.where((wi.variant_of == self.web_item_name) & (wi.published == 1))
			.orderby(wi.web_item_name)
		)
		items = query.run(as_dict=True)
		
		print('Items', items)
		
		materials = []
		
		for i in items:
			mat = frappe.get_all(
				"Item Variant Attribute",
				fields=["attribute_value"],
				filters={"parent": i.item_code, "attribute": "Matière"},
			)
			
			try:
				i['material'] = mat[0].attribute_value
			except:
				print('Item has no material')
			
			print(i)
			materials.append(i)
		
		print(materials)
		return materials
"""	
	def get_variant_attributes_and_values(self):
		#Build a list of attributes and their possible values.
		#This will ignore the values upon selection of which there cannot exist one item.
		
		item_cache = ItemVariantsCacheManager(self.item_code)
		item_variants_data = item_cache.get_item_variants_data()

		attributes = self.get_item_attributes()
		attribute_list = [a.attribute for a in attributes]

		valid_options = {}
		for item_code, attribute, attribute_value in item_variants_data:
			if attribute in attribute_list:
				valid_options.setdefault(attribute, set()).add(attribute_value)

		item_attribute_values = frappe.db.get_all(
			"Item Attribute Value", ["parent", "attribute_value", "idx"], order_by="parent asc, idx asc"
		)
		ordered_attribute_value_map = frappe._dict()
		for iv in item_attribute_values:
			ordered_attribute_value_map.setdefault(iv.parent, []).append(iv.attribute_value)

		# build attribute values in idx order
		for attr in attributes:
			valid_attribute_values = valid_options.get(attr.attribute, [])
			ordered_values = ordered_attribute_value_map.get(attr.attribute, [])
			attr["values"] = [v for v in ordered_values if v in valid_attribute_values]

		return attributes

	def get_item_attributes(self):
		attributes = frappe.db.get_all(
			"Item Variant Attribute",
			fields=["attribute"],
			filters={"parenttype": "Item", "parent": self.item_code},
			order_by="idx asc",
		)
	
		optional_attributes = ItemVariantsCacheManager(self.item_code).get_optional_attributes()
	
		for a in attributes:
			if a.attribute in optional_attributes:
				a.optional = True
	
		return attributes
"""
"""	
	def get_recommended_items(self, settings):
		ri = frappe.qb.DocType("Recommended Items")
		wi = frappe.qb.DocType("Website Item")

		query = (
			frappe.qb.from_(ri)
			.join(wi)
			.on(ri.item_code == wi.item_code)
			.select(ri.item_code, ri.route, ri.website_item_name, ri.website_item_thumbnail)
			.where((ri.parent == self.name) & (wi.published == 1))
			.orderby(ri.idx)
		)
		items = query.run(as_dict=True)

		if settings.show_price:
			is_guest = frappe.session.user == "Guest"
			# Show Price if logged in.
			# If not logged in and price is hidden for guest, skip price fetch.
			if is_guest and settings.hide_price_for_guest:
				return items

			selling_price_list = _set_price_list(settings, None)
			for item in items:
				item.price_info = get_price(
					item.item_code, selling_price_list, settings.default_customer_group, settings.company
				)

		return items
"""

def attr_order(key):
		match key.get('attribute'):
			case "Matière" :
				return 0
			case "Finition" :
				return 1
			case _:
				return -1
				
@frappe.whitelist(allow_guest = True)
def get_variant_tree(name):
	print(name)
	tree = frappe.db.get_value("Website Item", name, "variant_tree")
	print(tree)
	return tree
	

@frappe.whitelist()
def update_variant_details(doc: "Website Item"):
	if not doc:
		return

	if isinstance(doc, str):
		doc = json.loads(doc)
	
	if not doc.get("has_variants"):
		return
	
	website_item = frappe.get_doc("Website Item", doc.get("name"))
	website_item.set_variant_details()
	website_item.set_variant_tree()
	website_item.save()

@frappe.whitelist()
def make_website_item(doc: "Item", save: bool = True) -> Union["WebsiteItem", List[str]]:
	"Make Website Item from Item. Used via Form UI or patch."

	if not doc:
		return

	if isinstance(doc, str):
		doc = json.loads(doc)

	if frappe.db.exists("Website Item", {"item_code": doc.get("item_code")}):
		message = _("Website Item already exists against {0}").format(frappe.bold(doc.get("item_code")))
		frappe.throw(message, title=_("Already Published"))

	website_item = frappe.new_doc("Website Item")
	website_item.web_item_name = doc.get("item_name")

	fields_to_map = [
		"item_code",
		"item_name",
		"item_group",
		"stock_uom",
		"brand",
		"has_variants",
		"variant_of",
		"description",
	]
	for field in fields_to_map:
		website_item.update({field: doc.get(field)})

	# Needed for publishing/mapping via Form UI only
	if not frappe.flags.in_migrate and (doc.get("image") and not website_item.website_image):
		website_item.website_image = doc.get("image")
	
	if has_variants:
		website_item.set_variant_details()
		website_item.set_variant_tree()
	
	if not save:
		return website_item

	website_item.save()

	# Add to search cache
	insert_item_to_index(website_item)

	return [website_item.name, website_item.web_item_name]
