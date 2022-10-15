class ItemConfigure {
	constructor(item_code, item_name, $container) {
		this.item_code = item_code;
		this.item_name = item_name;
		this.$container = $container;

		this.get_attributes_and_values()
			.then(attribute_data => {
				this.attribute_data = attribute_data;
				this.show_configure_elements();
			});
	}
	
	show_configure_elements() {
		this.attribute_data.map(a => {
			this.$container.append(
			$('<div>').prop({
				class: 'row attribute',
				id: `Attr-${a.attribute}`
				}))
			var $div = $(`#Attr-${a.attribute}`)
			if ( a.attribute === "Size" ) {				
				$div.append(
            				$('<label>').prop({
                			for: 'Size'
            				}).html('Size')
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
						.append($('<div>').prop({ class: 'row attribute-values'})
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
										for: v.replace(' ', '_')
										})
									.append($('<div>').prop({
										class:'variant-selector'
										}).append(v)))
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
			this.show_range_input_for_all_fields();
		}

		const values = this.get_values();
		console.log(values)
		this.get_next_attribute_and_values(values)
			.then(data => {
				console.log(data)
				const {
					valid_options_for_attributes,
				} = data;
				const {
					filtered_items,
				} = data;
				console.log(filtered_items)
				//this.set_item_found_status(data);
				var index = 0
				for (let attribute in valid_options_for_attributes) {
					const valid_options = valid_options_for_attributes[attribute];
					console.log(valid_options)
					const options = this.get_options(attribute);
					console.log(options)
					const new_options = options.map(o => {
						if (index < 2)  o.disabled = false;
						else {o.disabled = !valid_options.includes(o.value)
							
						}
						return o;
					});
					
					if (index > 1) {
						var $attr = $(`#${attribute}`)
						$attr.find('.radio_item').each(function() {
							console.log(new_options)
							for (let i = 0; i < new_options.length; i++) {
								console.log(new_options[i])
								var o = new_options[i]
								console.log(o.value, o.value === $(this).val())
								if (o.value === $(this).val()) {
									if (o.disabled) {
										console.log('disabled')
										$(this).next().hide()
									}
									else {
										console.log('enabled')
										$(this).next().show()
									}
								}
							}
						})
					}
					
					
					index++;
				}
				
				var selected = this.get_values(true);
				this.get_next_attribute_and_values(selected)
				.then(data => {
				console.log(data)
				const {
					filtered_items,
				} = data;
				console.log(filtered_items)
				update_visibility(filtered_items[0])
				})
			}) 
		

					
					//this.dialog.set_df_property(attribute, 'options', new_options);
					//this.dialog.get_field(attribute).set_options();
	}
	
	hide_disabled(attribute, options) {
		var $attr = $(`#${attribute}`)
		$attr.find('.radio_item').each(function() {
			for (let o in options) {
			console.log(o.value, o.value === $(this).val())
				if (o.value === $(this).val()) {
					if (o.disabled) $(this).hide()
					else $(this).show()
				}
			}
		})
	}
	
	get_options(attribute) {
		console.log(`#${attribute}`)
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
			} else console.log($(this).find())
			var test = {}
			if (for_item) res[attr_name] = val;
			else if (attr_name != 'Finition') res[attr_name] = val;
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
	const $img = $(`.${selected.split(' ').slice(-1)[0]}`).find('img');

	const link = $img.prop('src');

	const $product_image = $('.product-image');
	$product_image.find('img').prop('src', link);
	
	$product_image.find('a').prop('href', link);
	$(`.${selected.split(' ')[0]}`).each( function() {$(this).addClass('my-hidden');});
	$(`.${selected.split(' ').slice(-1)[0]}`).each( function() {$(this).removeClass('my-hidden');});
}

frappe.ready(() => {
	const $container = $('.variant-container');
	const { itemName, itemCode } = $container.data();
	new ItemConfigure(itemCode, itemName, $container);
});
