//function build_selection(variant_tree) {



frappe.ready(() => {
	
	const $container = $('.variant-container');
	const item_name = $container.data( "name" );
	const queryString = window.location.search;
	var variant_tree_string;
	var variant_tree;
	var selected = null;
	var no_default = null;
	if ( queryString != "" ) {
	selected = queryString.replace('?', '').replace('_', ' ');
	no_default = true
	}
	
	console.log(queryString, selected)
	
	$(`.${item_name.split(' ')[0]}`).each(function() {$(this).hide()});
	frappe.call('aetesis.e_commerce.doctype.website_item.website_item.get_variant_tree', {name: item_name}).then(r => {
		variant_tree_string = r.message;
		variant_tree = JSON.parse(variant_tree_string);
		
      		build_selector(variant_tree, $container, no_default);
      		update_view(null, selected);
	});
	
})

function update_view(e=null, sel=null) {
	checked = []
	$('.radio_item:checked').each(function() {
		checked.push($(this).attr('id').split('/')[1]);
		});
	update_variant_selector(checked);
	console.log('SEL', sel);
	selected = sel || $('.attribute:visible').find('.radio_item:checked').slice(-1).attr('value');
	console.log('selected',selected)
	
	update_visibility(selected);
	$('.like-action-item-fp').data('item-code', selected);
	
	frappe.call('aetesis.whitelisted.wishlist.is_wished', {item_code: selected}).then(r => {
      			$wish_icon = $('.wish-icon')
      			if (r.message === true && $wish_icon.hasClass('not-wished')) $wish_icon.toggleClass('not-wished wished')
      			else if (r.message === false && $wish_icon.hasClass('wished')) $wish_icon.toggleClass('not-wished wished')
      		});
}


function update_visibility(selected){
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

function build_selector(children, $container, no_default=false) {
	var new_children = [];
		
	for (let inc = 0; inc < 5; inc++) {
		children.forEach(attribute => {
				build_attribute(attribute, $container, no_default);
		});
		children = get_child_attributes(children);
		if (children.length === 0) break;
	}
	$('.radio_item').each(function() {
		$(this).on('change', update_view)
	});
}

function build_attribute(attribute, $container, no_default=false) {
	parent = attribute.parent.replace(' ','_') || 'root';
	html= `<div class="row attribute" data-parent=${parent}><form class="col"><div class="row attribute-label">${attribute.label}</div><div class="row atrribute-values">`;
	html += attribute.values.map((value, index) => {
			var sub_html = `<div class="col attribute-value"><input type="radio" class="radio_item" name="${attribute.label}" value="${value.item_code ||value.val.replace(' ','_')}" id="${parent}/${value.val.replace(' ','_')}"`;
			if (!no_default && index === 0) sub_html += 'checked="true"';
			sub_html += `><label class="label_item" for="${parent}/${value.val.replace(' ','_')}"><div class="variant-selector">${value.val}</div></label></div>`;
			return sub_html;
		}).join(' ');
	html += "</div></form></div>";
	$container.append(html);
}


