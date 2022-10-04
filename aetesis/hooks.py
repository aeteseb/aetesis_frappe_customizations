from . import __version__ as app_version

app_name = "aetesis"
app_title = "Aetesis"
app_publisher = "Sebastian Beck"
app_description = "Aetesis Customisations"
app_email = "sebastian@aetesis.ch"
app_license = "MIT"
app_logo_url= "/assests/aetesis/images/app_logo.png"

template_apps = ['aetesis', 'erpnext']

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/aetesis/css/aetesis.css"
# app_include_js = "/assets/aetesis/js/aetesis.js"

# include js, css files in header of web template
web_include_css = "/assets/aetesis/css/aetesis.css"
web_include_js = "aetesis-web.bundle.js"

# include custom scss in every website theme (without file extension ".scss")
#website_theme_scss = "aetesis/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
#doctype_js = {"Purchase Order" : "public/js/purchase_order.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
#	"methods": "aetesis.utils.jinja_methods",
#	"filters": "aetesis.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "aetesis.install.before_install"
# after_install = "aetesis.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "aetesis.uninstall.before_uninstall"
# after_uninstall = "aetesis.uninstall.after_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "aetesis.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
#	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
#	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
#	"ToDo": "custom_app.overrides.CustomToDo"
# }

override_doctype_class = {
	"Task": "aetesis.overrides.task.CustomTask",
	"Sales Order": "aetesis.overrides.sales_order.CustomSalesOrder",
	"Purchase Order": "aetesis.overrides.purchase_order.CustomPurchaseOrder",
	"Website Item": "aetesis.e_commerce.doctype.website_item.website_item.CustomWebsiteItem",
#	"Material Request": "aetesis.overrides.material_request.CustomMaterialRequest",
}

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
#	"*": {
#		"on_update": "method",
#		"on_cancel": "method",
#		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

scheduler_events = {
#	"all": [
#		"aetesis.tasks.all"
#	],
#	"daily": [
#		"aetesis.tasks.daily"
#	],
#	"hourly": [
#		"aetesis.tasks.hourly"
#	],
#	"weekly": [
#		"aetesis.tasks.weekly"
#	],
#	"monthly": [
#		"aetesis.tasks.monthly"
#	],
	"cron": {
		'30 20 * * *': [
			'aetesis.scripts.create_purchase_order.create_po'
		],
	}
}

# Testing
# -------

# before_tests = "aetesis.install.before_tests"

# Overriding Methods
# ------------------------------
#
override_whitelisted_methods = {
#	"frappe.desk.doctype.event.event.get_events": "aetesis.event.get_events"
#	"erpnext.selling.doctype.sales_order.make_raw_material_request" : "aetesis.whitelisted.custom_make_raw_material_request"
	"erpnext.e_commerce.doctype.wishlist.wishlist.add_to_wishlist" : "aetesis.whitelisted.wishlist.add_to_wishlist"
 }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
#	"Task": "aetesis.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]


# User Data Protection
# --------------------

# user_data_fields = [
#	{
#		"doctype": "{doctype_1}",
#		"filter_by": "{filter_by}",
#		"redact_fields": ["{field_1}", "{field_2}"],
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_2}",
#		"filter_by": "{filter_by}",
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_3}",
#		"strict": False,
#	},
#	{
#		"doctype": "{doctype_4}"
#	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
#	"aetesis.auth.validate"
# ]
