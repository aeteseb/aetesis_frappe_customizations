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

	
	$(`.${item_name.split(' ')[0]}`).each(function() {$(this).hide()});
	frappe.call('aetesis.e_commerce.doctype.website_item.website_item.get_variant_tree', {name: item_name}).then(r => {
		variant_tree_string = r.message;
		variant_tree = JSON.parse(variant_tree_string);
		
      		build_selector(variant_tree, $container, no_default);
      		update_view(null, selected);
	});
	
	const region = getCookie('country');
	var items = [];
	var prices;
	$('.price').each(function(){ items.push( $(this).data('item-code'))});
	frappe.call('aetesis.whitelisted.product_info.get_prices', {item_codes: items, region : region}).then( r => {
			prices = r.message;
		$('.price').each(function() {set_price($(this), prices)});
		});
	
})

function set_price($span, prices) {
	prices.forEach( item => {
		if (item.item_code == $span.data('item-code') && item.price) {
			$span.html( item.price.formatted_price)
		}
	});
}

function update_view(e=null, sel=null) {
	checked = []
	$('.radio_item:checked').each(function() { 
		checked.push($(this).attr('id').split('/')[1]);
		});
	update_variant_selector(checked);
	selected = sel || $('.attribute:visible').find('.radio_item:checked').slice(-1).attr('value');
	
	update_visibility(selected);
	$('.like-action-item-fp').data('item-code', selected);
	
	frappe.call('aetesis.whitelisted.wishlist.is_wished', {item_code: selected}).then(r => {
      			$wish_icon = $('.wish-icon')
      			if (r.message === true && $wish_icon.hasClass('not-wished')) $wish_icon.toggleClass('not-wished wished')
      			else if (r.message === false && $wish_icon.hasClass('wished')) $wish_icon.toggleClass('not-wished wished')
      		});
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
	

function update_variant_selector(checked) {
	
	$('.attribute:not(:first)').each( function() {
		if ( checked.includes( $(this).data("parent") ) ) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});
	
	$('.attribute:not(:first):visible').each(function() {
		var parent_name = $(this).data("parent");
		console.log('will it work?', checked[0], parent_name);
		const id = `#${checked[0]}/${parent_name}`;
		console.log(id);
		/*$test = $(id).slice(0);
		console.log($test);
		if ($test && $test.is(':visible')) {
			console.log('it works!', checked[0], parent_name);
		}*/
	})
	
	return
}

function get_parent($div_attr, first_checked) {
	var parent_name = $div_attr.data("parent")
	console.log('will it work?', first_checked, $div_attr)
	if ($(`${first_checked}/${parent_name}`).is(':visible')) {
		console.log('it works!', first_checked, parent_name)
	}
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
		
	for (let inc = 0; inc < children.length; inc++) {
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
	html= `<div id="${parent}/${attribute.label}" class="row attribute" data-parent=${parent}><form class="col"><div class="row attribute-label">${attribute.label}</div><div class="row atrribute-values">`;
	html += attribute.values.map((value, index) => {
			var sub_html = `<div class="col attribute-value"><input type="radio" class="radio_item" name="${attribute.label}" value="${value.item_code ||value.val.replace(' ','_')}" id="${parent}/${value.val.replace(' ','_')}"`;
			if (!no_default && index === 0) sub_html += 'checked="true"';
			sub_html += `><label class="label_item" for="${parent}/${value.val.replace(' ','_')}"><div class="variant-selector">${value.val}</div></label></div>`;
			return sub_html;
		}).join(' ');
	html += "</div></form></div>";
	$container.append(html);
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
