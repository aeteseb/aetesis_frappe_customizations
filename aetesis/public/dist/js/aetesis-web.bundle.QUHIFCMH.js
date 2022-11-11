(() => {
  // ../aetesis/aetesis/public/js/website_utils.js
  if (!window.aetesis)
    window.aetesis = {};

  // ../aetesis/aetesis/public/js/regions.js
  if (!getCookie("country")) {
    $.getJSON("http://www.geoplugin.net/json.gp?jsoncallback=?", function(data) {
      document.cookie = "country=" + data.geoplugin_countryName + "; samesite=Lax; path=/";
    });
  }
  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  function getPickerDialog() {
    let d2 = new frappe.ui.Dialog({
      title: "Select Country and Language",
      fields: [{
        "fieldtype": "HTML",
        "fieldname": "region-picker"
      }],
      primary_action_label: __("Confirm"),
      primary_action: () => {
        const $ccard = d2.$wrapper.find(".country-card.active");
        const country_name = $ccard.closest("[data-country-name]").attr("data-country-name");
        const $lcard = d2.$wrapper.find(".language-card.active");
        const language_code = $lcard.closest("[data-language-code]").attr("data-language-code");
        const language_name = $lcard.closest("[data-language-name]").attr("data-language-name");
        if (language_code && country_name) {
          document.cookie = "country=" + country_name + "; samesite=Lax; path=/";
          document.cookie = "preferred_language_name=" + language_name + "; samesite=Lax; path=/";
          frappe.call("aetesis.utilities.regions.set_language", {
            preferred_language: language_code
          }).then(() => {
            d2.hide();
            window.location.reload();
          });
        } else if (!language_code && country_name) {
          document.cookie = "country=" + country_name + "; samesite=Lax; path=/";
          d2.hide();
          window.location.reload();
        } else if (language_code && !country_name) {
          document.cookie = "preferred_language_name=" + language_name + "; samesite=Lax; path=/";
          frappe.call("aetesis.utilities.regions.set_language", {
            preferred_language: language_code
          }).then(() => {
            d2.hide();
            window.location.reload();
          });
        } else {
          frappe.show_alert({
            message: __("Please select a country or a language"),
            indicator: "red"
          });
        }
      }
    });
    return d2;
  }
  function get_Card(thing, type) {
    return `<div class="card address-card ${type}-card h-100">
	<div class="check" style="position: absolute; right: 15px; top: 15px;">
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>
	</div>
	<div class="card-body">
		<h5 class="card-title align-center">${thing.flag} ${thing.country || thing.language}</h5>
	</div>
</div>`;
  }
  function get_country_html(countries) {
    let country2 = getCookie("country");
    var html = `<div class="col mb-3" data-section="countries"><div class="row no-gutters" >`;
    countries.forEach((c) => {
      var subhtml = `<div class="mr-3 mb-3 w-100" data-country-name="${c.country}" data-region-type="country"`;
      console.log(c, country2);
      c.country === country2 ? subhtml += "data-active>" : subhtml += ">";
      console.log(subhtml, get_Card(c, "counrty"));
      subhtml += get_Card(c, "country");
      subhtml += "</div>";
      html += subhtml;
    });
    html += "</div></div>";
    return html;
  }
  function get_language_html(languages) {
    let language = getCookie("preferred_language_name") || "English";
    var html = `<div class="col mb-3" data-section="languages"><div class="row no-gutters" >`;
    languages.forEach((lang) => {
      var subhtml = `<div class="mr-3 mb-3 w-100" data-language-name="${lang.language}" data-language-code="${lang.code}" data-region-type="country"`;
      lang.language === language ? subhtml += "data-active>" : subhtml += ">";
      subhtml += get_Card(lang, "language");
      subhtml += "</div>";
      html += subhtml;
    });
    html += get_less_or_more_button();
    html += "</div></div>";
    return html;
  }
  function get_less_or_more_button() {
    return `<div class="card more-or-less h-100 w-100" style="cursor:pointer">
	<div class="card-body">
  <symbol xmlns="http://www.w3.org/2000/svg" id="icon-add">
		<path d="M8 3v10M3 8h10" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
	</symbol><span id="less-or-more-text" class="card-title align-center"> Show More</span>
	</div>
</div>`;
  }
  function show_recommended(country2) {
    const all_langs = document.languages;
    console.log(all_langs);
    $(".language-card").each(function() {
      var lang = $(this).parent().data("language-name");
      console.log("card:", lang);
      me = this;
      var show = false;
      all_langs.some((l) => {
        console.log("card:", lang, "lang:", l.language);
        if (lang === l.language) {
          l.countries.some((c) => {
            console.log("card:", lang, "lang:", l.language, "country:", c.country, country2);
            if (country2 === c.country) {
              show = true;
              return true;
            }
          });
        }
        if (show)
          return true;
      });
      if (show) {
        $(me).parent().show();
      } else {
        $(me).parent().hide();
      }
    });
  }
  function show_all() {
    $(".language-card").each(function() {
      $(this).parent().show();
    });
  }
  function less_or_more() {
    if (document.show_recommended) {
      show_all();
      $("#less-or-more-text").html("Show Less");
      document.show_recommended = false;
    } else {
      var country2 = $('[data-section="countries"').find("[data-active]").data("country-name");
      console.log(country2);
      show_recommended(country2);
      $("#less-or-more-text").html("Show More");
      document.show_recommended = true;
    }
  }
  $(document).on("click", ".more-or-less", (e) => {
    less_or_more();
  });
  $(document).on("click", ".address-card", (e) => {
    const $target = $(e.currentTarget);
    const $section = $target.closest("[data-section]");
    $section.find(".address-card").removeClass("active");
    $target.addClass("active");
    if ($target.hasClass("country-card") && document.show_recommended) {
      country = $target.closest("[data-country-name]").data("country-name");
      show_recommended(country);
    }
  });
  var $link = $("#region-picker");
  var d = getPickerDialog();
  $link.on("click", function() {
    frappe.call("aetesis.utilities.regions.get_countries_and_languages").then((r) => {
      console.log(r.message);
      const countries = r.message["countries"];
      const languages = r.message["languages"];
      document.languages = languages;
      document.show_recommended = true;
      const html = '<div class="row">' + get_country_html(countries) + get_language_html(languages) + "</div>";
      $(d.get_field("region-picker").wrapper).html(html);
      d.show();
    }).then(function() {
      var country2 = $('[data-section="countries"').find("[data-active]");
      console.log(country2);
      show_recommended(country2);
    });
  });

  // ../aetesis/aetesis/public/js/shopping_cart.js
  frappe.provide("aetesis.e_commerce.shopping_cart");
  var shopping_cart = aetesis.e_commerce.shopping_cart;
  var getParams = function(url) {
    var params = [];
    var parser = document.createElement("a");
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
  };
  frappe.ready(function() {
    var full_name = frappe.session && frappe.session.user_fullname;
    if (full_name) {
      $('.navbar li[data-label="User"] a').html('<i class="fa fa-fixed-width fa fa-user"></i> ' + full_name);
    }
    var url_args = getParams(window.location.href);
    var referral_coupon_code = url_args["cc"];
    var referral_sales_partner = url_args["sp"];
    var d2 = new Date();
    d2.setTime(d2.getTime() + 0.02 * 24 * 60 * 60 * 1e3);
    var expires = "expires=" + d2.toUTCString();
    if (referral_coupon_code) {
      document.cookie = "referral_coupon_code=" + referral_coupon_code + ";" + expires + ";path=/";
    }
    if (referral_sales_partner) {
      document.cookie = "referral_sales_partner=" + referral_sales_partner + ";" + expires + ";path=/";
    }
    referral_coupon_code = frappe.get_cookie("referral_coupon_code");
    referral_sales_partner = frappe.get_cookie("referral_sales_partner");
    if (referral_coupon_code && $(".tot_quotation_discount").val() == void 0) {
      $(".txtcoupon").val(referral_coupon_code);
    }
    if (referral_sales_partner) {
      $(".txtreferral_sales_partner").val(referral_sales_partner);
    }
    shopping_cart.show_shoppingcart_dropdown();
    shopping_cart.set_cart_count();
    shopping_cart.show_cart_navbar();
  });
  $.extend(shopping_cart, {
    show_shoppingcart_dropdown: function() {
      $(".shopping-cart").on("shown.bs.dropdown", function() {
        if (!$(".shopping-cart-menu .cart-container").length) {
          return frappe.call({
            method: "erpnext.e_commerce.shopping_cart.cart.get_shopping_cart_menu",
            callback: function(r) {
              if (r.message) {
                $(".shopping-cart-menu").html(r.message);
              }
            }
          });
        }
      });
    },
    update_cart: function(opts) {
      if (frappe.session.user === "Guest") {
        shopping_cart.freeze();
        return frappe.call({
          type: "POST",
          method: "aetesis.e_commerce.shopping_cart.cart.update_cart",
          args: {
            item_code: opts.item_code,
            region: opts.region,
            qty: opts.qty,
            sid: opts.sid,
            additional_notes: opts.additional_notes !== void 0 ? opts.additional_notes : void 0,
            with_items: opts.with_items || 0
          },
          btn: opts.btn,
          callback: function(r) {
            shopping_cart.unfreeze();
            shopping_cart.set_cart_count(true);
            if (opts.callback)
              opts.callback(r);
          }
        });
      } else {
        shopping_cart.freeze();
        return frappe.call({
          type: "POST",
          method: "aetesis.e_commerce.shopping_cart.cart.update_cart",
          args: {
            item_code: opts.item_code,
            region: opts.region,
            qty: opts.qty,
            additional_notes: opts.additional_notes !== void 0 ? opts.additional_notes : void 0,
            with_items: opts.with_items || 0
          },
          btn: opts.btn,
          callback: function(r) {
            shopping_cart.unfreeze();
            shopping_cart.set_cart_count(true);
            if (opts.callback)
              opts.callback(r);
          }
        });
      }
    },
    set_cart_count: function(animate = false) {
      $(".intermediate-empty-cart").remove();
      var cart_count = frappe.get_cookie("cart_count");
      const guest = frappe.session.user === "Guest";
      if (!guest && cart_count) {
        $(".shopping-cart").toggleClass("hidden", false);
      }
      var $cart = $(".cart-icon");
      var $badge = $cart.find("#cart-count");
      if (parseInt(cart_count) === 0 || cart_count === void 0 || guest != void 0) {
        $(".cart-tax-items").hide();
        $(".btn-place-order").hide();
        $(".cart-payment-addresses").hide();
        if (guest) {
          var intermediate_empty_cart_msg = `
				<div class="text-center w-100 intermediate-empty-cart mt-4 mb-4 text-muted">
					Log in to Place Order
				</div>`;
        } else {
          var intermediate_empty_cart_msg = `
					<div class="text-center w-100 intermediate-empty-cart mt-4 mb-4 text-muted">
						${__("Cart is Empty")}
					</div>
				`;
        }
        $(".cart-table").after(intermediate_empty_cart_msg);
      } else {
        $cart.css("display", "inline");
        $("#cart-count").text(cart_count);
      }
      if (cart_count) {
        $badge.html(cart_count);
        if (animate) {
          $cart.addClass("cart-animate");
          setTimeout(() => {
            $cart.removeClass("cart-animate");
          }, 500);
        }
      } else {
        $badge.remove();
      }
    },
    shopping_cart_update: function({ item_code, qty, cart_dropdown, additional_notes }) {
      shopping_cart.update_cart({
        item_code,
        qty,
        additional_notes,
        with_items: 1,
        btn: this,
        callback: function(r) {
          if (!r.exc) {
            $(".cart-items").html(r.message.items);
            $(".cart-tax-items").html(r.message.total);
            $(".payment-summary").html(r.message.taxes_and_totals);
            shopping_cart.set_cart_count();
            if (cart_dropdown != true) {
              $(".cart-icon").hide();
            }
          }
        }
      });
    },
    show_cart_navbar: function() {
      frappe.call({
        method: "erpnext.e_commerce.doctype.e_commerce_settings.e_commerce_settings.is_cart_enabled",
        callback: function(r) {
          $(".shopping-cart").toggleClass("hidden", r.message ? false : true);
        }
      });
    },
    toggle_button_class(button, remove, add) {
      button.removeClass(remove);
      button.addClass(add);
    },
    bind_add_to_cart_action() {
      $(".page_content").on("click", ".btn-add-to-cart-list", (e) => {
        const $btn = $(e.currentTarget);
        $btn.prop("disabled", true);
        $btn.addClass("hidden");
        $btn.closest(".cart-action-container").addClass("d-flex");
        $btn.parent().find(".go-to-cart").removeClass("hidden");
        $btn.parent().find(".go-to-cart-grid").removeClass("hidden");
        $btn.parent().find(".cart-indicator").removeClass("hidden");
        const item_code = $btn.data("item-code");
        const region = getCookie2("country");
        if (frappe.session.user === "Guest") {
          const sid = getCookie2("sid");
          aetesis.e_commerce.shopping_cart.update_cart({
            item_code,
            region,
            qty: 1,
            sid
          });
        } else {
          aetesis.e_commerce.shopping_cart.update_cart({
            item_code,
            region,
            qty: 1
          });
        }
      });
    },
    freeze() {
      if (window.location.pathname !== "/cart")
        return;
      if (!$("#freeze").length) {
        let freeze = $('<div id="freeze" class="modal-backdrop fade"></div>').appendTo("body");
        setTimeout(function() {
          freeze.addClass("show");
        }, 1);
      } else {
        $("#freeze").addClass("show");
      }
    },
    unfreeze() {
      if ($("#freeze").length) {
        let freeze = $("#freeze").removeClass("show");
        setTimeout(function() {
          freeze.remove();
        }, 1);
      }
    }
  });
  function getCookie2(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  // ../aetesis/aetesis/public/js/wishlist.js
  frappe.provide("aetesis.e_commerce.wishlist");
  var wishlist = aetesis.e_commerce.wishlist;
  frappe.provide("aetesis.e_commerce.shopping_cart");
  var shopping_cart2 = aetesis.e_commerce.shopping_cart;
  $.extend(wishlist, {
    set_wishlist_count: function(animate = false) {
      var wish_count = frappe.get_cookie("wish_count");
      if (frappe.session.user === "Guest") {
        wish_count = 0;
      }
      if (wish_count) {
        $(".wishlist").toggleClass("hidden", false);
      }
      var $wishlist = $(".wishlist-icon");
      var $badge = $wishlist.find("#wish-count");
      if (parseInt(wish_count) === 0 || wish_count === void 0) {
        $wishlist.css("display", "none");
      } else {
        $wishlist.css("display", "inline");
      }
      if (wish_count) {
        $badge.html(wish_count);
        if (animate) {
          $wishlist.addClass("cart-animate");
          setTimeout(() => {
            $wishlist.removeClass("cart-animate");
          }, 500);
        }
      } else {
        $badge.remove();
      }
    },
    bind_move_to_cart_action: function() {
      $(".page_content").on("click", ".btn-add-to-cart", (e) => {
        const $move_to_cart_btn = $(e.currentTarget);
        let item_code = $move_to_cart_btn.data("item-code");
        shopping_cart2.shopping_cart_update({
          item_code,
          qty: 1,
          cart_dropdown: true
        });
        let success_action = function() {
          const $card_wrapper = $move_to_cart_btn.closest(".wishlist-card");
          $card_wrapper.addClass("wish-removed");
        };
        let args = { item_code };
        this.add_remove_from_wishlist("remove", args, success_action, null, true);
      });
    },
    bind_remove_action: function() {
      let me2 = this;
      $(".page_content").on("click", ".remove-wish", (e) => {
        const $remove_wish_btn = $(e.currentTarget);
        let item_code = $remove_wish_btn.data("item-code");
        let success_action = function() {
          const $card_wrapper = $remove_wish_btn.closest(".wishlist-card");
          $card_wrapper.addClass("wish-removed");
          if (frappe.get_cookie("wish_count") == 0) {
            $(".page_content").empty();
            me2.render_empty_state();
          }
        };
        let args = { item_code };
        this.add_remove_from_wishlist("remove", args, success_action);
      });
    },
    bind_wishlist_action() {
      $(".page_content").on("click", ".like-action, .like-action-list", (e) => {
        const $btn = $(e.currentTarget);
        this.wishlist_action($btn);
      });
    },
    wishlist_action(btn) {
      const $wish_icon = btn.find(".wish-icon");
      let me2 = this;
      if (frappe.session.user === "Guest") {
        if (localStorage) {
          localStorage.setItem("last_visited", window.location.pathname);
        }
        this.redirect_guest();
        return;
      }
      let success_action = function() {
        console.log("Success?");
        erpnext.e_commerce.wishlist.set_wishlist_count(true);
      };
      let args = { item_code: btn.data("item-code") };
      if (btn.data("parent")) {
        args["parent"] = btn.data("parent");
      }
      if ($wish_icon.hasClass("wished")) {
        btn.removeClass("like-animate");
        btn.addClass("like-action-wished");
        this.toggle_button_class($wish_icon, "wished", "not-wished");
        let failure_action = function() {
          me2.toggle_button_class($wish_icon, "not-wished", "wished");
        };
        this.add_remove_from_wishlist("remove", args, success_action, failure_action);
      } else {
        btn.addClass("like-animate");
        btn.addClass("like-action-wished");
        this.toggle_button_class($wish_icon, "not-wished", "wished");
        let failure_action = function() {
          me2.toggle_button_class($wish_icon, "wished", "not-wished");
        };
        this.add_remove_from_wishlist("add", args, success_action, failure_action);
      }
    },
    toggle_button_class(button, remove, add) {
      button.removeClass(remove);
      button.addClass(add);
    },
    add_remove_from_wishlist(action, args, success_action, failure_action, async = false) {
      if (frappe.session.user === "Guest") {
        if (localStorage) {
          localStorage.setItem("last_visited", window.location.pathname);
        }
        this.redirect_guest();
      } else {
        let method = "erpnext.e_commerce.doctype.wishlist.wishlist.add_to_wishlist";
        if (action === "remove") {
          method = "erpnext.e_commerce.doctype.wishlist.wishlist.remove_from_wishlist";
        }
        frappe.call({
          async,
          type: "POST",
          method,
          args,
          callback: function(r) {
            if (r.exc) {
              if (failure_action && typeof failure_action === "function") {
                failure_action();
              }
              frappe.msgprint({
                message: __("Sorry, something went wrong. Please refresh."),
                indicator: "red",
                title: __("Note")
              });
            } else if (success_action && typeof success_action === "function") {
              success_action();
            }
          }
        });
      }
    },
    redirect_guest() {
      frappe.call("erpnext.e_commerce.api.get_guest_redirect_on_action").then((res) => {
        window.location.href = res.message || "/login";
      });
    },
    render_empty_state() {
      $(".page_content").append(`
			<div class="cart-empty frappe-card">
				<div class="cart-empty-state">
					<img src="/assets/erpnext/images/ui-states/cart-empty-state.png" alt="Empty Cart">
				</div>
				<div class="cart-empty-message mt-4">${__("Wishlist is empty !")}</p>
			</div>
		`);
    }
  });
  frappe.ready(function() {
    if (window.location.pathname !== "/wishlist") {
      $(".wishlist").toggleClass("hidden", true);
      wishlist.set_wishlist_count();
    } else {
      wishlist.bind_move_to_cart_action();
      wishlist.bind_remove_action();
    }
  });

  // ../aetesis/aetesis/public/js/search.js
  function prepare_search() {
    $(".toolbar").append(`
        <div class="input-group p-0">
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
    `);
  }
  frappe.ready(() => {
    $("#nav-search-container").append(`
        <div id="nav-search" class="toolbar">
        </div>
    `);
    prepare_search();
    new aetesis.ProductSearch();
  });

  // ../aetesis/aetesis/e_commerce/product_ui/list.js
  aetesis.ProductList = class {
    constructor(options) {
      Object.assign(this, options);
      if (this.preference !== "List View") {
        this.products_section.addClass("hidden");
      }
      this.products_section.empty();
      this.make();
    }
    make() {
      let me2 = this;
      let html = `<br><br>`;
      this.items.forEach((item) => {
        let title = item.web_item_name || item.item_name || item.item_code || "";
        title = title.length > 200 ? title.substr(0, 200) + "..." : title;
        html += `<div class='row list-row w-100 mb-4' style="cursor: pointer;" onclick="window.location='/${item.route || "#"}'">`;
        html += me2.get_image_html(item, title, me2.settings);
        html += me2.get_row_body_html(item, title, me2.settings);
        html += `</div>`;
      });
      let $product_wrapper = this.products_section;
      $product_wrapper.append(html);
    }
    get_image_html(item, title, settings) {
      let image = item.website_image;
      let wishlist_enabled = !item.has_variants && settings.enable_wishlist;
      let image_html = ``;
      if (image) {
        image_html += `
				<div class="col-2 border text-center rounded list-image">
					<a class="product-link product-list-link" href="/${item.route || "#"}">
						<img itemprop="image" class="website-image h-100 w-100" alt="${title}"
							src="${image}">
					</a>
					${wishlist_enabled ? this.get_wishlist_icon(item) : ""}
				</div>
			`;
      } else {
        image_html += `
				<div class="col-2 border text-center rounded list-image">
					<a class="product-link product-list-link" href="/${item.route || "#"}"
						style="text-decoration: none">
						<div class="card-img-top no-image-list">
							${frappe.get_abbr(title)}
						</div>
					</a>
					${wishlist_enabled ? this.get_wishlist_icon(item) : ""}
				</div>
			`;
      }
      return image_html;
    }
    get_row_body_html(item, title, settings) {
      let body_html = `<div class='col-10 text-left'>`;
      body_html += this.get_title_html(item, title, settings);
      body_html += this.get_item_details(item, settings);
      body_html += `</div>`;
      return body_html;
    }
    get_title_html(item, title, settings) {
      let title_html = `<div style="display: flex; margin-left: -15px;">`;
      title_html += `
			<div class="col-8" style="margin-right: -15px;">
				<a class="" href="/${item.route || "#"}"
					style="color: var(--gray-800); font-weight: 500;">
					${title}
				</a>
			</div>
		`;
      if (settings.enabled) {
        title_html += `<div class="col-4 cart-action-container ${item.in_cart ? "d-flex" : ""}">`;
        title_html += this.get_primary_button(item, settings);
        title_html += `</div>`;
      }
      title_html += `</div>`;
      return title_html;
    }
    get_item_details(item, settings) {
      let details = `
			<p class="product-code">
				${item.item_group} | Item Code : ${item.item_code}
			</p>
			<div class="mt-2" style="color: var(--gray-600) !important; font-size: 13px;">
				${item.short_description || ""}
			</div>
			<div class="product-price">
				${item.formatted_price || ""}
		`;
      if (item.formatted_mrp) {
        details += `
				<small class="striked-price">
					<s>${item.formatted_mrp ? item.formatted_mrp.replace(/ +/g, "") : ""}</s>
				</small>
				<small class="ml-1 product-info-green">
					${item.discount} OFF
				</small>
			`;
      }
      details += this.get_stock_availability(item, settings);
      details += `</div>`;
      return details;
    }
    get_stock_availability(item, settings) {
      if (settings.show_stock_availability && !item.has_variants) {
        if (item.on_backorder) {
          return `
					<br>
					<span class="out-of-stock mt-2" style="color: var(--primary-color)">
						${__("Available on backorder")}
					</span>
				`;
        } else if (!item.in_stock) {
          return `
					<br>
					<span class="out-of-stock mt-2">${__("Out of stock")}</span>
				`;
        }
      }
      return ``;
    }
    get_wishlist_icon(item) {
      let icon_class = item.wished ? "wished" : "not-wished";
      return `
			<div class="like-action-list ${item.wished ? "like-action-wished" : ""}"
				data-item-code="${item.item_code}">
				<svg class="icon sm">
					<use class="${icon_class} wish-icon" href="#icon-heart"></use>
				</svg>
			</div>
		`;
    }
    get_primary_button(item, settings) {
      if (item.has_variants) {
        return `
				<a href="/${item.route || "#"}">
					<div class="btn btn-sm btn-explore-variants btn mb-0 mt-0">
						${__("Explore")}
					</div>
				</a>
			`;
      } else if (settings.enabled && (settings.allow_items_not_in_stock || item.in_stock)) {
        return `
				<div id="${item.name}" class="btn
					btn-sm btn-primary btn-add-to-cart-list mb-0
					${item.in_cart ? "hidden" : ""}"
					data-item-code="${item.item_code}"
					style="margin-top: 0px !important; max-height: 30px; float: right;
						padding: 0.25rem 1rem; min-width: 135px;">
					<span class="mr-2">
						<svg class="icon icon-md">
							<use href="#icon-assets"></use>
						</svg>
					</span>
					${settings.enable_checkout ? __("Add to Cart") : __("Add to Quote")}
				</div>

				<div class="cart-indicator list-indicator ${item.in_cart ? "" : "hidden"}">
					1
				</div>

				<a href="/cart">
					<div id="${item.name}" class="btn
						btn-sm btn-primary btn-add-to-cart-list
						ml-4 go-to-cart mb-0 mt-0
						${item.in_cart ? "" : "hidden"}"
						data-item-code="${item.item_code}"
						style="padding: 0.25rem 1rem; min-width: 135px;">
						${settings.enable_checkout ? __("Go to Cart") : __("Go to Quote")}
					</div>
				</a>
			`;
      } else {
        return ``;
      }
    }
  };

  // ../aetesis/aetesis/e_commerce/product_ui/views.js
  aetesis.ProductView = class {
    constructor(options) {
      Object.assign(this, options);
      this.preference = this.view_type;
      this.make();
    }
    make(from_filters = false) {
      this.products_section.empty();
      this.get_item_filter_data(from_filters);
    }
    get_item_filter_data(from_filters = false) {
      let me2 = this;
      this.from_filters = from_filters;
      let args = this.get_query_filters();
      frappe.call({
        method: "erpnext.e_commerce.api.get_product_filter_data",
        args: {
          query_args: args
        },
        callback: function(result) {
          if (!result || result.exc || !result.message || result.message.exc) {
            me2.render_no_products_section(true);
          } else {
            if (me2.item_group && result.message["sub_categories"].length) {
              me2.render_item_sub_categories(result.message["sub_categories"]);
            }
            if (!result.message["items"].length) {
              me2.render_no_products_section();
            } else {
              me2.re_render_discount_filters(result.message["filters"].discount_filters);
              me2.render_grid_view(result.message["items"], result.message["settings"]);
              me2.products = result.message["items"];
              me2.product_count = result.message["items_count"];
            }
            if (!from_filters) {
              me2.bind_filters();
              me2.restore_filters_state();
            }
            me2.add_paging_section(result.message["settings"]);
          }
        }
      });
    }
    render_grid_view(items, settings) {
      let me2 = this;
      this.prepare_product_area_wrapper("grid");
      new aetesis.ProductGrid({
        items,
        products_section: $("#products-grid-area"),
        settings,
        preference: me2.preference
      });
    }
    prepare_product_area_wrapper(view) {
      let left_margin = view == "list" ? "ml-2" : "";
      let top_margin = view == "list" ? "mt-6" : "mt-minus-1";
      return this.products_section.append(`
			<br>
			<div id="products-${view}-area" class="row products-list ${top_margin} ${left_margin}"></div>
		`);
    }
    get_query_filters() {
      const filters = frappe.utils.get_query_params();
      let { field_filters, attribute_filters } = filters;
      field_filters = field_filters ? JSON.parse(field_filters) : {};
      attribute_filters = attribute_filters ? JSON.parse(attribute_filters) : {};
      return {
        field_filters,
        attribute_filters,
        item_group: this.item_group,
        start: filters.start || null,
        from_filters: this.from_filters || false
      };
    }
    add_paging_section(settings) {
      $(".product-paging-area").remove();
      if (this.products) {
        let paging_html = `
				<div class="row product-paging-area mt-5">
					<div class="col-2">
					</div>
					<div class="col-10 d-flex justify-content-between paging-buttons-area">
			`;
        let query_params = frappe.utils.get_query_params();
        let start = query_params.start ? cint(JSON.parse(query_params.start)) : 0;
        let page_length = settings.products_per_page || 0;
        let prev_disable = start > 0 ? "" : "disabled";
        let next_disable = this.product_count > page_length ? "" : "disabled";
        paging_html += `
				<button class="btn btn-default btn-prev" data-start="${start - page_length}"
					style="float: left" ${prev_disable}>
					${__("Prev")}
				</button>`;
        paging_html += `
				<button class="btn btn-default btn-next" data-start="${start + page_length}"
					${next_disable}>
					${__("Next")}
				</button>
			`;
        paging_html += `</div></div>`;
        $(".page_content").append(paging_html);
        this.bind_paging_action();
      }
    }
    set_view_state() {
      $("#image-view").addClass("btn-primary");
      $("#list").removeClass("btn-primary");
    }
    bind_paging_action() {
      let me2 = this;
      $(".btn-prev, .btn-next").click((e) => {
        const $btn = $(e.target);
        me2.from_filters = false;
        $btn.prop("disabled", true);
        const start = $btn.data("start");
        let query_params = frappe.utils.get_query_params();
        query_params.start = start;
        let path = window.location.pathname + "?" + frappe.utils.get_url_from_dict(query_params);
        window.location.href = path;
      });
    }
    re_render_discount_filters(filter_data) {
      this.get_discount_filter_html(filter_data);
      if (this.from_filters) {
        this.bind_discount_filter_action();
      }
      this.restore_discount_filter();
    }
    get_discount_filter_html(filter_data) {
      $("#discount-filters").remove();
      if (filter_data) {
        $("#product-filters").append(`
				<div id="discount-filters" class="mb-4 filter-block pb-5">
					<div class="filter-label mb-3">${__("Discounts")}</div>
				</div>
			`);
        let html = `<div class="filter-options">`;
        filter_data.forEach((filter) => {
          html += `
					<div class="checkbox">
						<label data-value="${filter[0]}">
							<input type="radio"
								class="product-filter discount-filter"
								name="discount" id="${filter[0]}"
								data-filter-name="discount"
								data-filter-value="${filter[0]}"
								style="width: 14px !important"
							>
								<span class="label-area" for="${filter[0]}">
									${filter[1]}
								</span>
						</label>
					</div>
				`;
        });
        html += `</div>`;
        $("#discount-filters").append(html);
      }
    }
    restore_discount_filter() {
      const filters = frappe.utils.get_query_params();
      let field_filters = filters.field_filters;
      if (!field_filters)
        return;
      field_filters = JSON.parse(field_filters);
      if (field_filters && field_filters["discount"]) {
        const values = field_filters["discount"];
        const selector = values.map((value) => {
          return `input[data-filter-name="discount"][data-filter-value="${value}"]`;
        }).join(",");
        $(selector).prop("checked", true);
        this.field_filters = field_filters;
      }
    }
    bind_discount_filter_action() {
      let me2 = this;
      $(".discount-filter").on("change", (e) => {
        const $checkbox = $(e.target);
        const is_checked = $checkbox.is(":checked");
        const {
          filterValue: filter_value
        } = $checkbox.data();
        delete this.field_filters["discount"];
        if (is_checked) {
          this.field_filters["discount"] = [];
          this.field_filters["discount"].push(filter_value);
        }
        if (this.field_filters["discount"].length === 0) {
          delete this.field_filters["discount"];
        }
        me2.change_route_with_filters();
      });
    }
    bind_filters() {
      let me2 = this;
      this.field_filters = {};
      this.attribute_filters = {};
      $(".product-filter").on("change", (e) => {
        me2.from_filters = true;
        const $checkbox = $(e.target);
        const is_checked = $checkbox.is(":checked");
        if ($checkbox.is(".attribute-filter")) {
          const {
            attributeName: attribute_name,
            attributeValue: attribute_value
          } = $checkbox.data();
          if (is_checked) {
            this.attribute_filters[attribute_name] = this.attribute_filters[attribute_name] || [];
            this.attribute_filters[attribute_name].push(attribute_value);
          } else {
            this.attribute_filters[attribute_name] = this.attribute_filters[attribute_name] || [];
            this.attribute_filters[attribute_name] = this.attribute_filters[attribute_name].filter((v) => v !== attribute_value);
          }
          if (this.attribute_filters[attribute_name].length === 0) {
            delete this.attribute_filters[attribute_name];
          }
        } else if ($checkbox.is(".field-filter") || $checkbox.is(".discount-filter")) {
          const {
            filterName: filter_name,
            filterValue: filter_value
          } = $checkbox.data();
          if ($checkbox.is(".discount-filter")) {
            delete this.field_filters["discount"];
          }
          if (is_checked) {
            this.field_filters[filter_name] = this.field_filters[filter_name] || [];
            if (!in_list(this.field_filters[filter_name], filter_value)) {
              this.field_filters[filter_name].push(filter_value);
            }
          } else {
            this.field_filters[filter_name] = this.field_filters[filter_name] || [];
            this.field_filters[filter_name] = this.field_filters[filter_name].filter((v) => v !== filter_value);
          }
          if (this.field_filters[filter_name].length === 0) {
            delete this.field_filters[filter_name];
          }
        }
        me2.change_route_with_filters();
      });
      $(".filter-lookup-input").on("keydown", frappe.utils.debounce((e) => {
        const $input = $(e.target);
        const keyword = ($input.val() || "").toLowerCase();
        const $filter_options = $input.next(".filter-options");
        $filter_options.find(".filter-lookup-wrapper").show();
        $filter_options.find(".filter-lookup-wrapper").each((i, el) => {
          const $el = $(el);
          const value = $el.data("value").toLowerCase();
          if (!value.includes(keyword)) {
            $el.hide();
          }
        });
      }, 300));
    }
    change_route_with_filters() {
      let route_params = frappe.utils.get_query_params();
      let start = this.if_key_exists(route_params.start) || 0;
      if (this.from_filters) {
        start = 0;
      }
      const query_string = this.get_query_string({
        start,
        field_filters: JSON.stringify(this.if_key_exists(this.field_filters)),
        attribute_filters: JSON.stringify(this.if_key_exists(this.attribute_filters))
      });
      window.history.pushState("filters", "", `${location.pathname}?` + query_string);
      $(".page_content input").prop("disabled", true);
      this.make(true);
      $(".page_content input").prop("disabled", false);
    }
    restore_filters_state() {
      const filters = frappe.utils.get_query_params();
      let { field_filters, attribute_filters } = filters;
      if (field_filters) {
        field_filters = JSON.parse(field_filters);
        for (let fieldname in field_filters) {
          const values = field_filters[fieldname];
          const selector = values.map((value) => {
            return `input[data-filter-name="${fieldname}"][data-filter-value="${value}"]`;
          }).join(",");
          $(selector).prop("checked", true);
        }
        this.field_filters = field_filters;
      }
      if (attribute_filters) {
        attribute_filters = JSON.parse(attribute_filters);
        for (let attribute in attribute_filters) {
          const values = attribute_filters[attribute];
          const selector = values.map((value) => {
            return `input[data-attribute-name="${attribute}"][data-attribute-value="${value}"]`;
          }).join(",");
          $(selector).prop("checked", true);
        }
        this.attribute_filters = attribute_filters;
      }
    }
    render_no_products_section(error = false) {
      let error_section = `
			<div class="mt-4 w-100 alert alert-error font-md">
				Something went wrong. Please refresh or contact us.
			</div>
		`;
      let no_results_section = `
			<div class="cart-empty frappe-card mt-4">
				<div class="cart-empty-state">
					<img src="/assets/erpnext/images/ui-states/cart-empty-state.png" alt="Empty Cart">
				</div>
				<div class="cart-empty-message mt-4">${__("No products found")}</p>
			</div>
		`;
      this.products_section.append(error ? error_section : no_results_section);
    }
    render_item_sub_categories(categories) {
      if (categories && categories.length) {
        let sub_group_html = `
				<div class="sub-category-container scroll-categories">
			`;
        categories.forEach((category) => {
          sub_group_html += `
					<a href="/${category.route || "#"}" style="text-decoration: none;">
						<div class="category-pill">
							${category.name}
						</div>
					</a>
				`;
        });
        sub_group_html += `</div>`;
        $("#product-listing").prepend(sub_group_html);
      }
    }
    get_query_string(object) {
      const url = new URLSearchParams();
      for (let key in object) {
        const value = object[key];
        if (value) {
          url.append(key, value);
        }
      }
      return url.toString();
    }
    if_key_exists(obj) {
      let exists = false;
      for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key]) {
          exists = true;
          break;
        }
      }
      return exists ? obj : void 0;
    }
  };

  // ../aetesis/aetesis/e_commerce/product_ui/grid.js
  aetesis.ProductGrid = class {
    constructor(options) {
      Object.assign(this, options);
      if (this.preference !== "Grid View") {
        this.products_section.addClass("hidden");
      }
      this.products_section.empty();
      this.make();
    }
    make() {
      let me2 = this;
      let html = ``;
      this.items.forEach((item) => {
        let title = item.web_item_name || item.item_name || item.item_code || "";
        title = title.length > 90 ? title.substr(0, 90) + "..." : title;
        html += `<div class="col-sm-2 item-card"><div class="card text-left" style="cursor: pointer;" onclick="window.location='/${item.route || "#"}'">`;
        html += me2.get_image_html(item, title);
        html += me2.get_card_body_html(item, title, me2.settings);
        html += `</div></div>`;
      });
      let $product_wrapper = this.products_section;
      $product_wrapper.append(html);
    }
    get_image_html(item, title) {
      let image = item.website_image;
      if (image) {
        return `
				<div class="card-img-container">
						<img class="card-img" src="${image}" alt="${title}">
				</div>
			`;
      } else {
        return `
				<div class="card-img-container">
						<div class="card-img-top no-image">
							${frappe.get_abbr(title)}
						</div>
				</div>
			`;
      }
    }
    get_card_body_html(item, title, settings) {
      let body_html = `
			<div class="card-body text-center card-body-flex" style="width:100%">
				<div >
		`;
      body_html += this.get_title(item, title);
      if (!item.has_variants) {
        if (settings.enable_wishlist) {
          body_html += this.get_wishlist_icon(item);
        }
        if (settings.enabled) {
          body_html += this.get_cart_indicator(item);
        }
      }
      body_html += `</div>`;
      body_html += `<div class="product-category">${item.item_group || ""}</div>`;
      if (item.formatted_price) {
        body_html += this.get_price_html(item);
      }
      body_html += this.get_stock_availability(item, settings);
      body_html += `</div>`;
      return body_html;
    }
    get_title(item, title) {
      let title_html = `
				<h3 class="card-title">
					${title || ""}
				</h3>
		`;
      return title_html;
    }
    get_wishlist_icon(item) {
      let icon_class = item.wished ? "wished" : "not-wished";
      return `
			<div class="like-action ${item.wished ? "like-action-wished" : ""}"
				data-item-code="${item.item_code}">
				<svg class="icon sm">
					<use class="${icon_class} wish-icon" href="#icon-heart"></use>
				</svg>
			</div>
		`;
    }
    get_cart_indicator(item) {
      return `
			<div class="cart-indicator ${item.in_cart ? "" : "hidden"}" data-item-code="${item.item_code}">
				1
			</div>
		`;
    }
    get_price_html(item) {
      let price_html = `
			<div class="product-price">
				${item.formatted_price || ""}
		`;
      if (item.formatted_mrp) {
        price_html += `
				<small class="striked-price">
					<s>${item.formatted_mrp ? item.formatted_mrp.replace(/ +/g, "") : ""}</s>
				</small>
				<small class="ml-1 product-info-green">
					${item.discount} OFF
				</small>
			`;
      }
      price_html += `</div>`;
      return price_html;
    }
    get_stock_availability(item, settings) {
      if (settings.show_stock_availability && !item.has_variants) {
        if (item.on_backorder) {
          return `
					<span class="out-of-stock mb-2 mt-1" style="color: var(--primary-color)">
						${__("Available on backorder")}
					</span>
				`;
        } else if (!item.in_stock) {
          return `
					<span class="out-of-stock mb-2 mt-1">
						${__("Out of stock")}
					</span>
				`;
        }
      }
      return ``;
    }
    get_primary_button(item, settings) {
      if (item.has_variants) {
        return `
				<a href="/${item.route || "#"}">
					<div class="btn btn-sm btn-explore-variants w-100 mt-4">
						${__("Explore")}
					</div>
				</a>
			`;
      } else if (settings.enabled && (settings.allow_items_not_in_stock || item.in_stock)) {
        return `
				<div id="${item.name}" class="btn
					btn-sm btn-primary btn-add-to-cart-list
					w-100 mt-2 ${item.in_cart ? "hidden" : ""}"
					data-item-code="${item.item_code}">
					<span class="mr-2">
						<svg class="icon icon-md">
							<use href="#icon-assets"></use>
						</svg>
					</span>
					${settings.enable_checkout ? __("Add to Cart") : __("Add to Quote")}
				</div>

				<a href="/cart">
					<div id="${item.name}" class="btn
						btn-sm btn-primary btn-add-to-cart-list
						w-100 mt-4 go-to-cart-grid
						${item.in_cart ? "" : "hidden"}"
						data-item-code="${item.item_code}">
						${settings.enable_checkout ? __("Go to Cart") : __("Go to Quote")}
					</div>
				</a>
			`;
      } else {
        return ``;
      }
    }
  };

  // ../aetesis/aetesis/e_commerce/product_ui/search.js
  aetesis.ProductSearch = class {
    constructor(opts) {
      $.extend(this, opts);
      this.MAX_RECENT_SEARCHES = 4;
      this.search_box_id = this.search_box_id || "#search-box";
      this.searchBox = $(this.search_box_id);
      this.setupSearchDropDown();
      this.bindSearchAction();
    }
    setupSearchDropDown() {
      this.search_area = $("#dropdownMenuSearch");
      this.setupSearchResultContainer();
      this.populateRecentSearches();
    }
    bindSearchAction() {
      let me2 = this;
      this.searchBox.on("focus", () => {
        this.search_dropdown.removeClass("hidden");
      });
      $("body").on("click", (e) => {
        let searchEvent = $(e.target).closest(this.search_box_id).length;
        let resultsEvent = $(e.target).closest("#search-results-container").length;
        let isResultHidden = this.search_dropdown.hasClass("hidden");
        if (!searchEvent && !resultsEvent && !isResultHidden) {
          this.search_dropdown.addClass("hidden");
        }
      });
      this.searchBox.on("input", (e) => {
        let query = e.target.value;
        if (query.length == 0) {
          me2.populateResults(null);
          me2.populateCategoriesList(null);
        }
        if (query.length < 3 || !query.length)
          return;
        frappe.call({
          method: "erpnext.templates.pages.product_search.search",
          args: {
            query
          },
          callback: (data) => {
            let product_results = null, category_results = null;
            product_results = data.message ? data.message.product_results : null;
            me2.populateResults(product_results);
            if (me2.category_container) {
              category_results = data.message ? data.message.category_results : null;
              me2.populateCategoriesList(category_results);
            }
            if (!$.isEmptyObject(product_results) || !$.isEmptyObject(category_results)) {
              me2.setRecentSearches(query);
            }
          }
        });
        this.search_dropdown.removeClass("hidden");
      });
    }
    setupSearchResultContainer() {
      this.search_dropdown = this.search_area.append(`
			<div class="overflow-hidden shadow dropdown-menu w-100 hidden"
				id="search-results-container"
				aria-labelledby="dropdownMenuSearch"
				style="display: flex; flex-direction: column;">
			</div>
		`).find("#search-results-container");
      this.setupCategoryContainer();
      this.setupProductsContainer();
      this.setupRecentsContainer();
    }
    setupProductsContainer() {
      this.products_container = this.search_dropdown.append(`
			<div id="product-results mt-2">
				<div id="product-scroll" style="overflow: scroll; max-height: 300px">
				</div>
			</div>
		`).find("#product-scroll");
    }
    setupCategoryContainer() {
      this.category_container = this.search_dropdown.append(`
			<div class="category-container mt-2 mb-1">
				<div class="category-chips">
				</div>
			</div>
		`).find(".category-chips");
    }
    setupRecentsContainer() {
      let $recents_section = this.search_dropdown.append(`
			<div class="mb-2 mt-2 recent-searches">
				<div>
					<b>${__("Recent")}</b>
				</div>
			</div>
		`).find(".recent-searches");
      this.recents_container = $recents_section.append(`
			<div id="recents" style="padding: .25rem 0 1rem 0;">
			</div>
		`).find("#recents");
    }
    getRecentSearches() {
      return JSON.parse(localStorage.getItem("recent_searches") || "[]");
    }
    attachEventListenersToChips() {
      let me2 = this;
      const chips = $(".recent-search");
      window.chips = chips;
      for (let chip of chips) {
        chip.addEventListener("click", () => {
          me2.searchBox[0].value = chip.innerText.trim();
          me2.searchBox.trigger("input");
          me2.searchBox.focus();
        });
      }
    }
    setRecentSearches(query) {
      let recents = this.getRecentSearches();
      if (recents.length >= this.MAX_RECENT_SEARCHES) {
        recents.splice(0, 1);
      }
      if (recents.indexOf(query) >= 0) {
        return;
      }
      recents.push(query);
      localStorage.setItem("recent_searches", JSON.stringify(recents));
      this.populateRecentSearches();
    }
    populateRecentSearches() {
      let recents = this.getRecentSearches();
      if (!recents.length) {
        this.recents_container.html(`<span class=""text-muted">No searches yet.</span>`);
        return;
      }
      let html = "";
      recents.forEach((key) => {
        html += `
				<div class="recent-search mr-1" style="font-size: 13px">
					<span class="mr-2">
						<svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="var(--gray-500)"" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M8.00027 5.20947V8.00017L10 10" stroke="var(--gray-500)" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</span>
					${key}
				</div>
			`;
      });
      this.recents_container.html(html);
      this.attachEventListenersToChips();
    }
    populateResults(product_results) {
      if (!product_results || product_results.length === 0) {
        let empty_html = ``;
        this.products_container.html(empty_html);
        return;
      }
      let html = "";
      product_results.forEach((res) => {
        let thumbnail = res.thumbnail || "/assets/erpnext/images/ui-states/cart-empty-state.png";
        html += `
				<div class="dropdown-item" style="display: flex;">
					<img class="item-thumb col-2" src=${encodeURI(thumbnail)} />
					<div class="col-9" style="white-space: normal;">
						<a href="/${res.route}">${res.web_item_name}</a><br>
						<span class="brand-line">${res.brand ? "by " + res.brand : ""}</span>
					</div>
				</div>
			`;
      });
      this.products_container.html(html);
    }
    populateCategoriesList(category_results) {
      if (!category_results || category_results.length === 0) {
        let empty_html = `
				<div class="category-container mt-2">
					<div class="category-chips">
					</div>
				</div>
			`;
        this.category_container.html(empty_html);
        return;
      }
      let html = `
			<div class="mb-2">
				<b>${__("Categories")}</b>
			</div>
		`;
      category_results.forEach((category) => {
        html += `
				<a href="/${category.route}" class="btn btn-sm category-chip mr-2 mb-2"
					style="font-size: 13px" role="button">
				${category.name}
				</button>
			`;
      });
      this.category_container.html(html);
    }
  };
})();
//# sourceMappingURL=aetesis-web.bundle.QUHIFCMH.js.map
