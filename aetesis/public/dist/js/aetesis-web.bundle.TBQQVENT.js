(()=>{aetesis.ProductView=class{constructor(t){Object.assign(this,t),this.preference=this.view_type,this.make()}make(t=!1){this.products_section.empty(),this.prepare_toolbar(),this.get_item_filter_data(t)}prepare_toolbar(){this.products_section.append(`
			<div class="toolbar d-flex">
			</div>
		`),this.prepare_search(),this.prepare_view_toggler(),new erpnext.ProductSearch}prepare_view_toggler(){(!$("#list").length||!$("#image-view").length)&&(this.render_view_toggler(),this.bind_view_toggler_actions(),this.set_view_state())}get_item_filter_data(t=!1){let e=this;this.from_filters=t;let i=this.get_query_filters();this.disable_view_toggler(!0),frappe.call({method:"erpnext.e_commerce.api.get_product_filter_data",args:{query_args:i},callback:function(s){!s||s.exc||!s.message||s.message.exc?e.render_no_products_section(!0):(e.item_group&&s.message.sub_categories.length&&e.render_item_sub_categories(s.message.sub_categories),s.message.items.length?(e.re_render_discount_filters(s.message.filters.discount_filters),e.render_list_view(s.message.items,s.message.settings),e.render_grid_view(s.message.items,s.message.settings),e.products=s.message.items,e.product_count=s.message.items_count):e.render_no_products_section(),t||(e.bind_filters(),e.restore_filters_state()),e.add_paging_section(s.message.settings)),e.disable_view_toggler(!1)}})}disable_view_toggler(t=!1){$("#list").prop("disabled",t),$("#image-view").prop("disabled",t)}render_grid_view(t,e){let i=this;this.prepare_product_area_wrapper("grid"),new erpnext.ProductGrid({items:t,products_section:$("#products-grid-area"),settings:e,preference:i.preference})}render_list_view(t,e){let i=this;this.prepare_product_area_wrapper("list"),new erpnext.ProductList({items:t,products_section:$("#products-list-area"),settings:e,preference:i.preference})}prepare_product_area_wrapper(t){let e=t=="list"?"ml-2":"",i=t=="list"?"mt-6":"mt-minus-1";return this.products_section.append(`
			<br>
			<div id="products-${t}-area" class="row products-list ${i} ${e}"></div>
		`)}get_query_filters(){let t=frappe.utils.get_query_params(),{field_filters:e,attribute_filters:i}=t;return e=e?JSON.parse(e):{},i=i?JSON.parse(i):{},{field_filters:e,attribute_filters:i,item_group:this.item_group,start:t.start||null,from_filters:this.from_filters||!1}}add_paging_section(t){if($(".product-paging-area").remove(),this.products){let e=`
				<div class="row product-paging-area mt-5">
					<div class="col-3">
					</div>
					<div class="col-9 text-right">
			`,i=frappe.utils.get_query_params(),s=i.start?cint(JSON.parse(i.start)):0,r=t.products_per_page||0,a=s>0?"":"disabled",l=this.product_count>r?"":"disabled";e+=`
				<button class="btn btn-default btn-prev" data-start="${s-r}"
					style="float: left" ${a}>
					${__("Prev")}
				</button>`,e+=`
				<button class="btn btn-default btn-next" data-start="${s+r}"
					${l}>
					${__("Next")}
				</button>
			`,e+="</div></div>",$(".page_content").append(e),this.bind_paging_action()}}prepare_search(){$(".toolbar").append(`
			<div class="input-group col-8 p-0">
				<div class="dropdown w-100" id="dropdownMenuSearch">
					<input type="search" name="query" id="search-box" class="form-control font-md"
						placeholder="Search for Products"
						aria-label="Product" aria-describedby="button-addon2">
					<div class="search-icon">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor" stroke-width="2" stroke-linecap="round"
							stroke-linejoin="round"
							class="feather feather-search">
							<circle cx="11" cy="11" r="8"></circle>
							<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
						</svg>
					</div>
					<!-- Results dropdown rendered in product_search.js -->
				</div>
			</div>
		`)}render_view_toggler(){$(".toolbar").append('<div class="toggle-container col-4 p-0"></div>'),["btn-list-view","btn-grid-view"].forEach(t=>{let e=t==="btn-list-view"?"list":"image-view";$(".toggle-container").append(`
				<div class="form-group mb-0" id="toggle-view">
					<button id="${e}" class="btn ${t} mr-2">
						<span>
							<svg class="icon icon-md">
								<use href="#icon-${e}"></use>
							</svg>
						</span>
					</button>
				</div>
			`)})}bind_view_toggler_actions(){$("#list").click(function(){let t=$(this);t.removeClass("btn-primary"),t.addClass("btn-primary"),$(".btn-grid-view").removeClass("btn-primary"),$("#products-grid-area").addClass("hidden"),$("#products-list-area").removeClass("hidden"),localStorage.setItem("product_view","List View")}),$("#image-view").click(function(){let t=$(this);t.removeClass("btn-primary"),t.addClass("btn-primary"),$(".btn-list-view").removeClass("btn-primary"),$("#products-list-area").addClass("hidden"),$("#products-grid-area").removeClass("hidden"),localStorage.setItem("product_view","Grid View")})}set_view_state(){this.preference==="List View"?($("#list").addClass("btn-primary"),$("#image-view").removeClass("btn-primary")):($("#image-view").addClass("btn-primary"),$("#list").removeClass("btn-primary"))}bind_paging_action(){let t=this;$(".btn-prev, .btn-next").click(e=>{let i=$(e.target);t.from_filters=!1,i.prop("disabled",!0);let s=i.data("start"),r=frappe.utils.get_query_params();r.start=s;let a=window.location.pathname+"?"+frappe.utils.get_url_from_dict(r);window.location.href=a})}re_render_discount_filters(t){this.get_discount_filter_html(t),this.from_filters&&this.bind_discount_filter_action(),this.restore_discount_filter()}get_discount_filter_html(t){if($("#discount-filters").remove(),t){$("#product-filters").append(`
				<div id="discount-filters" class="mb-4 filter-block pb-5">
					<div class="filter-label mb-3">${__("Discounts")}</div>
				</div>
			`);let e='<div class="filter-options">';t.forEach(i=>{e+=`
					<div class="checkbox">
						<label data-value="${i[0]}">
							<input type="radio"
								class="product-filter discount-filter"
								name="discount" id="${i[0]}"
								data-filter-name="discount"
								data-filter-value="${i[0]}"
								style="width: 14px !important"
							>
								<span class="label-area" for="${i[0]}">
									${i[1]}
								</span>
						</label>
					</div>
				`}),e+="</div>",$("#discount-filters").append(e)}}restore_discount_filter(){let e=frappe.utils.get_query_params().field_filters;if(!!e&&(e=JSON.parse(e),e&&e.discount)){let s=e.discount.map(r=>`input[data-filter-name="discount"][data-filter-value="${r}"]`).join(",");$(s).prop("checked",!0),this.field_filters=e}}bind_discount_filter_action(){let t=this;$(".discount-filter").on("change",e=>{let i=$(e.target),s=i.is(":checked"),{filterValue:r}=i.data();delete this.field_filters.discount,s&&(this.field_filters.discount=[],this.field_filters.discount.push(r)),this.field_filters.discount.length===0&&delete this.field_filters.discount,t.change_route_with_filters()})}bind_filters(){let t=this;this.field_filters={},this.attribute_filters={},$(".product-filter").on("change",e=>{t.from_filters=!0;let i=$(e.target),s=i.is(":checked");if(i.is(".attribute-filter")){let{attributeName:r,attributeValue:a}=i.data();s?(this.attribute_filters[r]=this.attribute_filters[r]||[],this.attribute_filters[r].push(a)):(this.attribute_filters[r]=this.attribute_filters[r]||[],this.attribute_filters[r]=this.attribute_filters[r].filter(l=>l!==a)),this.attribute_filters[r].length===0&&delete this.attribute_filters[r]}else if(i.is(".field-filter")||i.is(".discount-filter")){let{filterName:r,filterValue:a}=i.data();i.is(".discount-filter")&&delete this.field_filters.discount,s?(this.field_filters[r]=this.field_filters[r]||[],in_list(this.field_filters[r],a)||this.field_filters[r].push(a)):(this.field_filters[r]=this.field_filters[r]||[],this.field_filters[r]=this.field_filters[r].filter(l=>l!==a)),this.field_filters[r].length===0&&delete this.field_filters[r]}t.change_route_with_filters()}),$(".filter-lookup-input").on("keydown",frappe.utils.debounce(e=>{let i=$(e.target),s=(i.val()||"").toLowerCase(),r=i.next(".filter-options");r.find(".filter-lookup-wrapper").show(),r.find(".filter-lookup-wrapper").each((a,l)=>{let n=$(l);n.data("value").toLowerCase().includes(s)||n.hide()})},300))}change_route_with_filters(){let t=frappe.utils.get_query_params(),e=this.if_key_exists(t.start)||0;this.from_filters&&(e=0);let i=this.get_query_string({start:e,field_filters:JSON.stringify(this.if_key_exists(this.field_filters)),attribute_filters:JSON.stringify(this.if_key_exists(this.attribute_filters))});window.history.pushState("filters","",`${location.pathname}?`+i),$(".page_content input").prop("disabled",!0),this.make(!0),$(".page_content input").prop("disabled",!1)}restore_filters_state(){let t=frappe.utils.get_query_params(),{field_filters:e,attribute_filters:i}=t;if(e){e=JSON.parse(e);for(let s in e){let a=e[s].map(l=>`input[data-filter-name="${s}"][data-filter-value="${l}"]`).join(",");$(a).prop("checked",!0)}this.field_filters=e}if(i){i=JSON.parse(i);for(let s in i){let a=i[s].map(l=>`input[data-attribute-name="${s}"][data-attribute-value="${l}"]`).join(",");$(a).prop("checked",!0)}this.attribute_filters=i}}render_no_products_section(t=!1){let e=`
			<div class="mt-4 w-100 alert alert-error font-md">
				Something went wrong. Please refresh or contact us.
			</div>
		`,i=`
			<div class="cart-empty frappe-card mt-4">
				<div class="cart-empty-state">
					<img src="/assets/erpnext/images/ui-states/cart-empty-state.png" alt="Empty Cart">
				</div>
				<div class="cart-empty-message mt-4">${__("No products found")}</p>
			</div>
		`;this.products_section.append(t?e:i)}render_item_sub_categories(t){if(t&&t.length){let e=`
				<div class="sub-category-container scroll-categories">
			`;t.forEach(i=>{e+=`
					<a href="/${i.route||"#"}" style="text-decoration: none;">
						<div class="category-pill">
							${i.name}
						</div>
					</a>
				`}),e+="</div>",$("#product-listing").prepend(e)}}get_query_string(t){let e=new URLSearchParams;for(let i in t){let s=t[i];s&&e.append(i,s)}return e.toString()}if_key_exists(t){let e=!1;for(let i in t)if(Object.prototype.hasOwnProperty.call(t,i)&&t[i]){e=!0;break}return e?t:void 0}};})();
//# sourceMappingURL=aetesis-web.bundle.TBQQVENT.js.map
