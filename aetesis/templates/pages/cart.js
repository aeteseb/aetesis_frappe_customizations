// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

// JS exclusive to /cart page
frappe.provide("aetesis.e_commerce.shopping_cart");
var shopping_cart = aetesis.e_commerce.shopping_cart;

$.extend(shopping_cart, {
	show_error: function(title, text) {
		$("#cart-container").html('<div class="msg-box"><h4>' +
			title + '</h4><p class="text-muted">' + text + '</p></div>');
	},

	bind_events: function() {
		shopping_cart.bind_address_picker_dialog();
		shopping_cart.bind_place_order();
		shopping_cart.bind_request_quotation();
		shopping_cart.bind_change_qty();
		shopping_cart.bind_remove_cart_item();
		shopping_cart.bind_change_notes();
		shopping_cart.bind_coupon_code();
	},

	bind_address_picker_dialog: function() {
		const d = this.get_update_address_dialog();
		this.parent.find('.btn-change-address').on('click', (e) => {
			const type = $(e.currentTarget).parents('.address-container').attr('data-address-type');
			$(d.get_field('address_picker').wrapper).html(
				this.get_address_template(type)
			);
			d.show();
		});
	},

	shopping_cart_update: function({item_code, qty, cart_dropdown, additional_notes, region}) {
		var guest_id = frappe.get_cookie('guest_id') || undefined;
		console.log(guest_id)
		shopping_cart.update_cart({
			item_code,
			qty,
			additional_notes,
			with_items: 1,
			region: region,
			guest_id: guest_id,
			btn: this,
			callback: function(r) {
				if(!r.exc) {
					$(".cart-items").html(r.message.items);
					$(".cart-tax-items").html(r.message.total);
					$(".payment-summary").html(r.message.taxes_and_totals);
					shopping_cart.set_cart_count();


				}
			},
		});
	},

	get_update_address_dialog() {
		let d = new frappe.ui.Dialog({
			title: "Select Address",
			fields: [{
				'fieldtype': 'HTML',
				'fieldname': 'address_picker',
			}],
			primary_action_label: __('Set Address'),
			primary_action: () => {
				const $card = d.$wrapper.find('.address-card.active');
				const address_type = $card.closest('[data-address-type]').attr('data-address-type');
				const address_name = $card.closest('[data-address-name]').attr('data-address-name');
				frappe.call({
					type: "POST",
					method: "erpnext.e_commerce.shopping_cart.cart.update_cart_address",
					freeze: true,
					args: {
						address_type,
						address_name
					},
					callback: function(r) {
						d.hide();
						if (!r.exc) {
							$(".cart-tax-items").html(r.message.total);
							shopping_cart.parent.find(
								`.address-container[data-address-type="${address_type}"]`
							).html(r.message.address);
						}
					}
				});
			}
		});

		return d;
	},

	get_address_template(type) {
		
		return {
			shipping: `<div class="mb-3" data-section="shipping-address">
				<div class="row no-gutters" data-fieldname="shipping_address_name">
					{% for address in shipping_addresses %}
						<div class="mr-3 mb-3 w-100" data-address-name="{{address.name}}" data-address-type="shipping"
							{% if doc.shipping_address_name == address.name %} data-active {% endif %}>
							{% include "templates/includes/cart/address_picker_card.html" %}
						</div>
					{% endfor %}
				</div>
			</div>`,
			billing: `<div class="mb-3" data-section="billing-address">
				<div class="row no-gutters" data-fieldname="customer_address">
					{% for address in billing_addresses %}
						<div class="mr-3 mb-3 w-100" data-address-name="{{address.name}}" data-address-type="billing"
							{% if doc.shipping_address_name == address.name %} data-active {% endif %}>
							{% include "templates/includes/cart/address_picker_card.html" %}
						</div>
					{% endfor %}
				</div>
			</div>`,
		}[type];
	},

	bind_place_order: function() {
		$(".btn-place-order").on("click", function() {
			shopping_cart.place_order(this);
		});
	},

	bind_request_quotation: function() {
		$('.btn-request-for-quotation').on('click', function() {
			shopping_cart.request_quotation(this);
		});
	},

	bind_change_qty: function() {
		const region = getCookie('country');
		// bind update button
		$(".cart-items").on("change", ".cart-qty", function() {
			var item_code = $(this).attr("data-item-code");
			var newVal = $(this).val();
			shopping_cart.shopping_cart_update({item_code, qty: newVal, region: region});
		});

		$(".cart-items").on('click', '.number-spinner button', function () {
			var btn = $(this),
				input = btn.closest('.number-spinner').find('input'),
				oldValue = input.val().trim(),
				newVal = 0;

			if (btn.attr('data-dir') == 'up') {
				newVal = parseInt(oldValue) + 1;
			} else {
				if (oldValue > 1) {
					newVal = parseInt(oldValue) - 1;
				}
			}
			input.val(newVal);

			let notes = input.closest("td").siblings().find(".notes").text().trim();
			var item_code = input.attr("data-item-code");
			shopping_cart.shopping_cart_update({
				item_code,
				qty: newVal,
				additional_notes: notes,
				region: region
			});
		});
	},

	bind_change_notes: function() {
		$('.cart-items').on('change', 'textarea', function() {
			const $textarea = $(this);
			const item_code = $textarea.attr('data-item-code');
			const qty = $textarea.closest('tr').find('.cart-qty').val();
			const notes = $textarea.val();
			const region = getCookie('country');
			shopping_cart.shopping_cart_update({
				item_code,
				qty,
				additional_notes: notes,
				region: region
			});
		});
	},

	bind_remove_cart_item: function() {
		$(".cart-items").on("click", ".remove-cart-item", (e) => {
			const $remove_cart_item_btn = $(e.currentTarget);
			var item_code = $remove_cart_item_btn.data("item-code");
			const region = getCookie('country');
			shopping_cart.shopping_cart_update({
				item_code: item_code,
				qty: 0, 
				region: region
			});
		});
	},

	render_tax_row: function($cart_taxes, doc, shipping_rules) {
		var shipping_selector;
		if(shipping_rules) {
			shipping_selector = '<select class="form-control">' + $.map(shipping_rules, function(rule) {
				return '<option value="' + rule[0] + '">' + rule[1] + '</option>' }).join("\n") +
			'</select>';
		}

		var $tax_row = $(repl('<div class="row">\
			<div class="col-md-9 col-sm-9">\
				<div class="row">\
					<div class="col-md-9 col-md-offset-3">' +
					(shipping_selector || '<p>%(description)s</p>') +
					'</div>\
				</div>\
			</div>\
			<div class="col-md-3 col-sm-3 text-right">\
				<p' + (shipping_selector ? ' style="margin-top: 5px;"' : "") + '>%(formatted_tax_amount)s</p>\
			</div>\
		</div>', doc)).appendTo($cart_taxes);

		if(shipping_selector) {
			$tax_row.find('select option').each(function(i, opt) {
				if($(opt).html() == doc.description) {
					$(opt).attr("selected", "selected");
				}
			});
			$tax_row.find('select').on("change", function() {
				shopping_cart.apply_shipping_rule($(this).val(), this);
			});
		}
	},

	apply_shipping_rule: function(rule, btn) {
		return frappe.call({
			btn: btn,
			type: "POST",
			method: "erpnext.e_commerce.shopping_cart.cart.apply_shipping_rule",
			args: { shipping_rule: rule },
			callback: function(r) {
				if(!r.exc) {
					shopping_cart.render(r.message);
				}
			}
		});
	},

	place_order: function(btn) {
		if (frappe.session.user==="Guest") {
			if (localStorage) {
				localStorage.setItem("last_visited", window.location.pathname);
			}
			frappe.call('erpnext.e_commerce.api.get_guest_redirect_on_action').then((res) => {
				window.location.href = res.message || "/login";
			});
			return;
		}

		shopping_cart.freeze();

		return frappe.call({
			type: "POST",
			method: "aetesis.e_commerce.shopping_cart.cart.place_order",
			btn: btn,
			callback: function(r) {
				if(r.exc) {
					shopping_cart.unfreeze();
					var msg = "";
					if(r._server_messages) {
						msg = JSON.parse(r._server_messages || []).join("<br>");
					}

					$("#cart-error")
						.empty()
						.html(msg || frappe._("Something went wrong!"))
						.toggle(true);
				} else {
					$(btn).hide();
					window.location.href = '/orders/' + encodeURIComponent(r.message);
				}
			}
		});
	},

	request_quotation: function(btn) {
		shopping_cart.freeze();

		return frappe.call({
			type: "POST",
			method: "erpnext.e_commerce.shopping_cart.cart.request_for_quotation",
			btn: btn,
			callback: function(r) {
				if(r.exc) {
					shopping_cart.unfreeze();
					var msg = "";
					if(r._server_messages) {
						msg = JSON.parse(r._server_messages || []).join("<br>");
					}

					$("#cart-error")
						.empty()
						.html(msg || frappe._("Something went wrong!"))
						.toggle(true);
				} else {
					$(btn).hide();
					window.location.href = '/quotations/' + encodeURIComponent(r.message);
				}
			}
		});
	},

	bind_coupon_code: function() {
		$(".bt-coupon").on("click", function() {
			shopping_cart.apply_coupon_code(this);
		});
	},

	apply_coupon_code: function(btn) {
		return frappe.call({
			type: "POST",
			method: "erpnext.e_commerce.shopping_cart.cart.apply_coupon_code",
			btn: btn,
			args : {
				applied_code : $('.txtcoupon').val(),
				applied_referral_sales_partner: $('.txtreferral_sales_partner').val()
			},
			callback: function(r) {
				if (r && r.message){
					location.reload();
				}
			}
		});
	}
});

frappe.ready(function() {
	shopping_cart.parent = $(".cart-container");
	shopping_cart.bind_events();
	//If Guest try fetching guest cart
	if(frappe.session.user === 'Guest') {
		$('.cart-empty').hide();
		const guest_id = frappe.get_cookie('guest_id');
		frappe.call('aetesis.whitelisted.cart.get_quote', {guest_id:guest_id}).then( r => {
			
			const doc = r.message.doc;

			console.log(doc)
			if (doc.items.length > 0) {
				buildTable(doc)
				shopping_cart.shopping_cart_update({guest_id:guest_id})				
			} else {
				$('.cart-empty').show();
			}
			
		});
	}
});

function buildTable(doc) {
	
	var all_html = '';
	for (const d of doc.items) {
		console.log(d)
		var html = `<tr data-name="${ d.name }">
		<td style="width: 60%;">
			<div class="d-flex">
				<div class="cart-item-image mr-4">`
		if (d.thumbnail) {
			html += product_image(d.thumbnail, alt="d.web_item_name", no_border=True)
		} else {
			html += `<div class = "no-image-cart-item">"NA"</div>`
		}
		html += '</div>'
		html += `<div class="d-flex w-100" style="flex-direction: column;">
		<div class="item-title mb-1 mr-3">
			${ d.item_name }
		</div>
		<div class="item-subtitle mr-2">
			${ d.item_code }
		</div>`
		let disabled
		d.is_free_item? disabled = 'disabled' : disabled = '' ;
		html += `</div>
		</div>
	</td>
	<td class="text-right" style="width: 25%;">
			<div class="d-flex">
				<div class="input-group number-spinner mt-1 mb-4">
					<span class="input-group-prepend d-sm-inline-block">
						<button class="btn cart-btn" data-dir="dwn" ${ disabled }>
							${ d.is_free_item ? '' : '–' }
						</button>
					</span>

					<input class="form-control text-center cart-qty" value="${ d.qty }" data-item-code="${ d.item_code }"
						style="max-width: 70px;" ${ disabled }>

					<span class="input-group-append d-sm-inline-block">
						<button class="btn cart-btn" data-dir="up" ${ disabled }>
							${ d.is_free_item ? '' : '+' }
						</button>
					</span>
					</div>

				<div>`
		if (!d.is_free_item) {
			html += `<div class="remove-cart-item column-sm-view d-flex" data-item-code="${ d.item_code }">
			<span>
				<svg class="icon sm remove-cart-item-logo"
					width="18" height="18" viewBox="0 0 18 18"
					xmlns="http://www.w3.org/2000/svg" id="icon-close">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M4.146 11.217a.5.5 0 1 0 .708.708l3.182-3.182 3.181 3.182a.5.5 0 1 0 .708-.708l-3.182-3.18 3.182-3.182a.5.5 0 1 0-.708-.708l-3.18 3.181-3.183-3.182a.5.5 0 0 0-.708.708l3.182 3.182-3.182 3.181z" stroke-width="0"></path>
				</svg>
			</span>
		</div>`
		}
		html += `</div>
		</div>
				<div class="text-right sm-item-subtotal">
					${ item_subtotal(d) }
				</div>
		</td>

		<!-- Subtotal column -->

			<td class="text-right item-subtotal column-sm-view w-100">
				${ item_subtotal(d) }
			</td>
	</tr>`
	all_html+=html;
	}
	$('.cart-items').append(all_html);
}

function item_subtotal(item) {
	var html = `<div>
	${ item.amount }
</div>`
	if ( item.is_free_item) {
html += `<div class="text-success mt-4">
<span class="free-tag">
	${ __('FREE') }
</span>
</div>`
	} else {
		html += `<span class="item-rate">
		${ __('Rate:') } ${ item.rate }
	</span>`
	}
	return html
}

function product_image(website_image, css_class="product-image", alt="", no_border=False, item_code="") {
	var html = `<div class="${ no_border ? '' : 'border' } text-center rounded ${ css_class } ${ item_code }" style="overflow: hidden;">`
	if (website_image) {
		html += `<img itemprop="image" class="website-image h-100 w-100" alt="${ alt }" src="${ frappe.utils.quoted(website_image) | abs_url }">`
	} else {
		html += `<div class="card-img-top no-image-item">
			"NA"
			</div>`
	}
	html += '</div>'
	return html
}

function show_terms() {
	var html = $(".cart-terms").html();
	frappe.msgprint(html);
}

function getCookie(cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for(let i = 0; i <ca.length; i++) {
	  let c = ca[i];
	  while (c.charAt(0) == ' ') {
		c = c.substring(1);
	  }
	  if (c.indexOf(name) == 0) {
		return c.substring(name.length, c.length);
	  }
	}
	return "";
  }