//function build_selection(variant_tree) {



frappe.ready(() => {
	
	const $container = $('.variant-container');
	const item_name = $container.data( "name" );
	var variant_tree_string
	var variant_tree
	
	$(`.${item_name.split(' ')[0]}`).each(function() {$(this).hide()});
	frappe.call('aetesis.e_commerce.doctype.website_item.website_item.get_variant_tree', {name: item_name}).then(r => {
		variant_tree_string = r.message;
		variant_tree = JSON.parse(variant_tree_string);
		
      		build_selector(variant_tree, $container);
      		update_view(null);
      		
	});
	
})

function update_view(e) {
	checked = []
	$('.radio_item:checked').each(function() {
		checked.push($(this).attr('id').split('/')[1]);
		});
	update_variant_selector(checked);
	
	selected = $('.attribute:visible').find('.radio_item:checked').slice(-1).attr('value');
	console.log('selected',selected)
	
	update_image(selected);
//	update_info();
}

function update_image(selected){
	console.log($(`.${selected.split(' ')[0]}`));
	$('.item-slideshow-image').removeClass('active');
	const $img = $(`.${selected.split(' ').slice(-1)[0]}`).find('img');
	console.log('img',$img);
	const link = $img.prop('src');
	console.log(link);
	const $product_image = $('.product-image');
	$product_image.find('img').prop('src', link);
	
	$product_image.find('a').prop('href', link);
	$(`.${selected.split(' ')[0]}`).each( function() {$(this).addClass('my-hidden');});
	$(`.${selected.split(' ').slice(-1)[0]}`).each( function() {$(this).removeClass('my-hidden');});
	

}
	

function update_variant_selector(checked) {
	
	$('.attribute:not(:first)').each( function() {
		if ( !checked.includes( $(this).data("parent") ) ) {
			$(this).hide();
		} else {
			$(this).show();
		}
	});
	return
}

function get_child_attributes(attributes) {
	var children = [];
	attributes.forEach(attribute => {
		if (attribute.values) {
			attribute.values.forEach(value => value.children.forEach(child => children.push(child)))
			}
		});
	
	return children	
}

function build_selector(children, $container) {
	var new_children = [];
		
	for (let inc = 0; inc < 5; inc++) {
		children.forEach(attribute => {
				build_attribute(attribute, $container);
		});
		children = get_child_attributes(children);
		if (children.length === 0) break;
	}
	$('.radio_item').each(function() {
		$(this).on('change', update_view)
	});
}

function build_attribute(attribute, $container) {
	parent = attribute.parent.replace(' ','_') || 'root';
	html= `<div class="row attribute" data-parent=${parent}><form class="col"><div class="row attribute-label">${attribute.label}</div><div class="row atrribute-values">`;
	html += attribute.values.map((value, index) => {
			var sub_html = `<div class="col attribute-value"><input type="radio" class="radio_item" name="${attribute.label}" value="${value.item_code ||value.val.replace(' ','_')}" id="${parent}/${value.val.replace(' ','_')}"`;
			if (index === 0) sub_html += 'checked="true"';
			sub_html += `><label class="label_item" for="${parent}/${value.val.replace(' ','_')}"><div class="variant-selector">${value.val}</div></label></div>`;
			return sub_html;
		}).join(' ');
	html += "</div></form></div>";
	$container.append(html);
}


