from erpnext.projects.doctype.task.task import Task
import frappe
from frappe.utils import flt

class CustomTask(Task):
	def on_update(self):
		self.update_nsm_model()
		self.check_recursion()
		self.reschedule_dependent_tasks()
		self.update_project()
		self.update_parent_task()
		self.unassign_todo()
		self.populate_depends_on()
		
	def update_parent_task(self):
		if self.parent_task and self.update_parent:
			frappe.get_cached_doc("Task", self.parent_task).update_task()
		
	def update_task(self):
		self.update_percent_complete()
		self.db_update()
	
	def update_percent_complete(self):
		if self.percent_complete_method == "Manual":
			if self.status == "Completed":
				self.progress = 100
			return

		total = frappe.db.count("Task", dict(parent_task=self.name))

		if not total:
			self.percent_complete = 0
		else:
			if (self.percent_complete_method == "Task Completion" and total > 0) or (
				not self.percent_complete_method and total > 0
			):
				completed = frappe.db.sql(
					"""select count(name) from tabTask where
					parent_task=%s and status in ('Cancelled', 'Completed')""",
					self.name,
				)[0][0]
				self.progress = flt(flt(completed) / total * 100, 2)

			if self.percent_complete_method == "Task Progress" and total > 0:
				advancement = frappe.db.sql(
					"""select sum(progress) from tabTask where
					parent_task=%s""",
					self.name,
				)[0][0]
				self.progress = flt(flt(advancement) / total, 2)

			if self.percent_complete_method == "Task Weight" and total > 0:
				weight_sum = frappe.db.sql(
					"""select sum(task_weight) from tabTask where
					parent_task=%s""",
					self.name,
				)[0][0]
				weighted_progress = frappe.db.sql(
					"""select progress, task_weight from tabTask where
					parent_task=%s""",
					self.name,
					as_dict=1,
				)
				pct_complete = 0
				for row in weighted_progress:
					pct_complete += row["progress"] * frappe.utils.safe_div(row["task_weight"], weight_sum)
				self.progress = flt(flt(pct_complete), 2)
		

		# don't update status if it is cancelled
		if self.status == "Cancelled":
			return

		if self.progress == 100:
			self.status = "Completed"
