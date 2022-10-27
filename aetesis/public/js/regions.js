if (!getCookie('country')) {
	$.getJSON("http://www.geoplugin.net/json.gp?jsoncallback=?",
	function (data) {
      document.cookie = "country=" + data.geoplugin_countryName + "; samesite=Lax; path=/";
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

function getPickerDialog() {
  let d = new frappe.ui.Dialog({
    title: "Select Country and Language",
    fields: [{
      'fieldtype': 'HTML',
      'fieldname': 'region_picker',
    }],
    primary_action_label: __('Confirm'),
    primary_action: () => {
      const $card = d.$wrapper.find('.region-card.active');
      const country_name = $card.closest('[data-country-name]').attr('data-country-name');
      document.cookie = "country=" + country_name + "; samesite=Lax; path=/";
      d.hide()
      window.location.reload();
    }
  });

  return d;
}



function get_Card(thing, type) {
  return `<div class="card ${type}-card h-100">
	<div class="check" style="position: absolute; right: 15px; top: 15px;">
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>
	</div>
	<div class="card-body">
		<h5 class="card-title align-center">${ thing.flag } ${ thing.country || thing.language }</h5>
	</div>
</div>`
}

function get_country_html(countries) {
  let country = getCookie('country');
  var html = `<div class="col mb-3" data-section="countries"><div class="row no-gutters" >`;
  countries.forEach( c => {
    var subhtml = `<div class="mr-3 mb-3 w-100" data-country-name="${ c.country }" data-region-type="country"`;
    console.log(c, country)
    c.country === country ? subhtml += 'data-active>' : subhtml += '>'
    console.log(subhtml, get_Card(c, 'counrty'))
    subhtml += get_Card(c, 'country');
    subhtml += '</div>';
    html += subhtml;
  })
  html += '</div></div>'
  return html
}

function get_language_html(languages){
  let language = frappe.get_cookie("preferred_language");
  var html = `<div class="col mb-3" data-section="languages"><div class="row no-gutters" >`;
  languages.forEach( lang => {
    var subhtml = `<div class="mr-3 mb-3 w-100" data-language-name="${ lang.language }" data-region-type="country"`;
    lang.language === language ? subhtml += 'data-active>' : subhtml += '>';
    subhtml += get_Card(lang, 'language');
    subhtml += '</div>';
    html += subhtml;
  });
  html += '</div></div>'
  return html
}

$(document).on('click', '.country-card', (e) => {
  const $target = $(e.currentTarget);
  const $section = $target.closest('[data-section]');
  $section.find('.region-card').removeClass('active');
  $target.addClass('active');
});

var $link = $('a.nav-link:not([href])');
const d = getPickerDialog();
$link.on('click', function() {
  frappe.call('aetesis.utilities.regions.get_countries_and_languages').then( r => {
    console.log(r.message);
    const countries = r.message['countries']
    const languages = r.message['languages']
    $(d.get_field('region_picker').wrapper).html(
      get_country_html(countries)
    );
    d.show();
  })
})