class ItemConfigure {
	constructor(item_code, item_name, $container, selected) {
		this.item_code = item_code;
		this.item_name = item_name;
		this.$container = $container;
		this.selected = selected;
		this.first = true;

		this.get_attributes_and_values()
			.then(attribute_data => {
				this.attribute_data = attribute_data;
				this.show_configure_elements();
				this.on_attribute_selection();
			});
	}
	
	show_configure_elements() {
		this.attribute_data.map(a => {
			this.$container.append(
			$('<div>').prop({
				class: 'row attribute d-flex align-items-baseline',
				id: `Attr-${a.attribute}`
				}))
			var $div = $(`#Attr-${a.attribute}`)
			if ( a.attribute === "Size" ) {				
				$div.append(
            				$('<label>').prop({
                			for: 'Size'
            				}).html('<h3>Size</h3>')
				).append( $('<select>').prop({
                			id: 'Size',
                			name: 'Size'
            			}).on('change', (e) => this.on_attribute_selection(e)))
            			$('#Size').html( a.values.map(v => {
						return $('<option>').prop({
							label: v,
							value: v
						});
					}),
        			);
			} else {
				$div.append(
					$('<form>').prop({class: 'col',
						id: a.attribute
						})
						.append($('<div>').prop({ class: 'row variant-label' }).append(`<h3>${a.attribute}</h3>`))
						.append($('<div>').prop({ class: 'row attribute-values align-items-end'})
							.append( a.values.map(v => {
								return $('<div>').prop({class:'col attribute-value'})
									.append($('<input>').prop({
									type: 'radio',
									class: 'radio_item',
									name: a.attribute,
									value: v,
									id: v.replace(' ', '_')
									}).on('change', (e) => this.on_attribute_selection(e)))
									.append($('<label>').prop({
										class: 'label_item',
										id: `label-${v.replace(' ', '_')}`,
										for: v.replace(' ', '_')
										})
									.append($('<div>').prop({
										class:'variant-selector d-flex align-items-center justify-content-center'
										}).append($('<div>').prop({
											class: 'variant-selector-text'
										})).append(v)))
							}))
						)
				)
			}
		});
	}		
	
	on_attribute_selection(e) {
		const me = this
		if (e) {
			const changed_fieldname = $(e.target).attr('id');
			this.show_range_input_if_applicable(changed_fieldname);
		} else {
			//this.show_range_input_for_all_fields();
		}

		const values = this.get_values();
		this.get_next_attribute_and_values(values)
			.then(data => {
				const {
					valid_options_for_attributes,
				} = data;
				const {
					filtered_items,
				} = data;
				//this.set_item_found_status(data);
				var index = 0
				for (let attribute in valid_options_for_attributes) {
					const valid_options = valid_options_for_attributes[attribute];
					const options = this.get_options(attribute);
					const new_options = options.map(o => {
						if (index < 2)  o.disabled = false;
						else {o.disabled = !valid_options.includes(o.value)
							
						}
						return o;
					});
					
					if (index > 1) {
						var $attr = $(`#${attribute}`)
						$attr.find('.radio_item').each(function() {
							for (let i = 0; i < new_options.length; i++) {
								var o = new_options[i]
								if (o.value === $(this).val()) {
									if (o.disabled) {
										$(this).next().hide()
									}
									else {
										$(this).next().show()
									}
								}
							}
						})
					}
					index++;
				}
				
				if (this.first && this.selected) {
					var selected = this.selected;
					this.update_checked(selected);
					update_visibility(selected);
					this.update_heart(selected);
					this.first = false;
				} else {
					var selected_values = this.get_values(true);
					this.get_next_attribute_and_values(selected_values)
					.then(data => {
						const {
							filtered_items,
						} = data;
						var selected = filtered_items[0];
						this.update_checked(selected);
						update_visibility(selected);
						me.update_heart(selected);
					})
				}
			}) 
	}
	
	update_heart(selected) {
		$('.like-action-item-fp').data('item-code', selected);
	
		frappe.call('aetesis.whitelisted.wishlist.is_wished', {item_code: selected}).then(r => {
      			var $wish_icon = $('.wish-icon');
      			if (r.message === true && $wish_icon.hasClass('not-wished')) $wish_icon.toggleClass('not-wished wished')
      			else if (r.message === false && $wish_icon.hasClass('wished')) $wish_icon.toggleClass('not-wished wished')
			});
	}

	update_checked(selected) {
		this.get_item_attrs_and_values(selected).then( r => {
			for (let attr in r) {
				var $attr = $(`#${attr}`)
				if ($attr.is('select')) {
					$attr.val(r[attr])
				} else if ($attr.is('form')) {
					$attr.find('.radio_item').each(function() {
						if ($(this).val() === r[attr]) {
							$(this).prop('checked', true);
						} else {
							$(this).prop('checked', false);
						}
					})
				}
			}
		})

	}

	hide_disabled(attribute, options) {
		var $attr = $(`#${attribute}`)
		$attr.find('.radio_item').each(function() {
			for (let o in options) {
				if (o.value === $(this).val()) {
					if (o.disabled) $(this).hide()
					else $(this).show()
				}
			}
		})
	}
	
	get_options(attribute) {
		var $attr = $(`#${attribute}`)
		var options = []
		if ($attr.is('select')) {
			$attr.children().each(function() {
				options.push({'value':$(this).val()})
			})
		} else if ($attr.is('form')) {
			$attr.find('.radio_item').each(function() {
				options.push({'value':$(this).val()})
				})
		}
		return options
	}
	
	get_values(for_item=false) {
		var res = {}
		$('.attribute').each(function() {

			var attr_name = $(this).attr('id').split('-')[1]
			if ($(this).find('select').length != 0 ) {
				var val = $(this).find('select').val()
			} else if ($(this).find('.radio_item:checked').length != 0 ) {
				var val = $(this).find('.radio_item:checked').val();
			}
			if (for_item) res[attr_name] = val;
			else if (attr_name != 'Finish') res[attr_name] = val;
		})
		return res
	}
	
	get_next_attribute_and_values(selected_attributes) {
		return this.call('erpnext.e_commerce.variant_selector.utils.get_next_attribute_and_values', {
			item_code: this.item_code,
			selected_attributes
		});
	}
	
	get_attributes_and_values() {
		return this.call('erpnext.e_commerce.variant_selector.utils.get_attributes_and_values', {
			item_code: this.item_code
		});
	}
	get_item_attrs_and_values(item_code) {
		return this.call('aetesis.whitelisted.product_info.get_item_attrs_and_values', {
			item_code: item_code
		});
	}
	
	show_range_input_if_applicable(fieldname) {
		const $changed_field = $(`#${fieldname}`);
		const changed_value = $changed_field.val();
		if (changed_value && changed_value.includes(' to ')) {
			// possible range input
			let numbers = changed_value.split(' to ');
			numbers = numbers.map(number => parseFloat(number));

			if (!numbers.some(n => isNaN(n))) {
				numbers.sort((a, b) => a - b);
				if (changed_field.$input_wrapper.find('.range-selector').length) {
					return;
				}
				const parent = $('<div class="range-selector">')
					.insertBefore(changed_field.$input_wrapper.find('.help-box'));
				const control = frappe.ui.form.make_control({
					df: {
						fieldtype: 'Int',
						label: __('Enter value betweeen {0} and {1}', [numbers[0], numbers[1]]),
						change: () => {
							const value = control.get_value();
							if (value < numbers[0] || value > numbers[1]) {
								control.$wrapper.addClass('was-validated');
								control.set_description(
									__('Value must be between {0} and {1}', [numbers[0], numbers[1]]));
								control.$input[0].setCustomValidity('error');
							} else {
								control.$wrapper.removeClass('was-validated');
								control.set_description('');
								control.$input[0].setCustomValidity('');
								this.update_range_values(fieldname, value);
							}
						}
					},
					render_input: true,
					parent
				});
				control.$wrapper.addClass('mt-3');
			}
		}
	}
	
	call(method, args) {
		// promisified frappe.call
		return new Promise((resolve, reject) => {
			frappe.call(method, args)
				.then(r => resolve(r.message))
				.fail(reject);
		});
	}
}
function update_visibility(selected){
	$('.item-slideshow-image').removeClass('active');
	console.log(selected)
	const $img = $(`.${selected}`).find('img');
	console.log($img)
	const link = $img.prop('src');

	const $product_image = $('.product-image');
	$product_image.find('img').prop('src', link);
	
	$product_image.find('a').prop('href', link);
	$(`.slideshow-container:not(.${selected})`).each( function() {$(this).addClass('my-hidden');});
	$(`.buying`).each( function() {$(this).addClass('my-hidden');});
	$(`.${selected.replace(' ', '_')}`).each( function() {$(this).removeClass('my-hidden');});
}

frappe.ready(() => {
	const $container = $('.variant-container');
	const { itemName, itemCode } = $container.data();
	const queryString = window.location.search;
	var selected = null;
	var no_default = null;
	if ( queryString != "" ) {
	selected = queryString.replace('?', '').replace('_', ' ');
	no_default = true
	}
	new ItemConfigure(itemCode, itemName, $container, selected);
	const region = getCookie('country');
	var items = [];
	var prices;
	$('.price').each(function(){ items.push( $(this).data('item-code'))});
	frappe.call('aetesis.whitelisted.product_info.get_prices', {item_codes: items, region : region}).then( r => {
			prices = r.message;
			$('.price').each(function() {set_price($(this), prices)});
		});
});

function set_price($span, prices) {
	prices.forEach( item => {
		if (item.item_code == $span.data('item-code') && item.price) {
			$span.html( item.price.formatted_price)
		}
	});
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
  