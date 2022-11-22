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
      'fieldname': 'region-picker',
    }],
    primary_action_label: __('Confirm'),
    primary_action: () => {
      const $ccard = d.$wrapper.find('.country-card.active');
      const country_name = $ccard.closest('[data-country-name]').attr('data-country-name');
      
      const $lcard = d.$wrapper.find('.language-card.active');
      const language_code = $lcard.closest('[data-language-code]').attr('data-language-code');
      const language_name = $lcard.closest('[data-language-name]').attr('data-language-name');
      
      if (language_code && country_name) {
        document.cookie = "country=" + country_name + "; samesite=Lax; path=/";
        document.cookie = "preferred_language_name=" + language_name + "; samesite=Lax; path=/";
        frappe.call("aetesis.utilities.regions.set_language", {
        preferred_language: language_code,
        })
        .then(() => {
          d.hide()
          window.location.reload();
       });
      } else if (!language_code && country_name) {
        document.cookie = "country=" + country_name + "; samesite=Lax; path=/";
        d.hide()
        window.location.reload();
      } else if (language_code && !country_name) {
        document.cookie = "preferred_language_name=" + language_name + "; samesite=Lax; path=/";
        frappe.call("aetesis.utilities.regions.set_language", {
        preferred_language: language_code,
        })
        .then(() => {
          d.hide()
          window.location.reload();
       });
      }
      
      else {
        frappe.show_alert({
          message: __('Please select a country or a language'),
          indicator:'red'
        })
      }
      
    }
  });

  return d;
}



function get_Card(thing, type) {
  return `<div class="card address-card ${type}-card h-100">
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
  let language = getCookie("preferred_language_name") || 'English';
  var html = `<div class="col mb-3" data-section="languages"><div class="row no-gutters" >`;
  languages.forEach( lang => {
    var subhtml = `<div class="mr-3 mb-3 w-100" data-language-name="${ lang.language }" data-language-code="${lang.code}" data-region-type="country"`;
    lang.language === language ? subhtml += 'data-active>' : subhtml += '>';
    subhtml += get_Card(lang, 'language');
    subhtml += '</div>';
    html += subhtml;
  });
  html += get_less_or_more_button();
  html += '</div></div>'
  return html
}

function get_less_or_more_button() {
  return `<div class="card more-or-less h-100 w-100" style="cursor:pointer">
	<div class="card-body">
  <symbol xmlns="http://www.w3.org/2000/svg" id="icon-add">
		<path d="M8 3v10M3 8h10" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
	</symbol><span id="less-or-more-text" class="card-title align-center"> Show More</span>
	</div>
</div>`
}

function hide_all() {
  $('.language-card').each(function() {
    $(this).parent().hide()
  })
}

function show_recommended(country){
  const all_langs = document.languages
  console.log(all_langs)
  $('.language-card').each(function() {
    var lang = $(this).parent().data('language-name');
    console.log('card:', lang)
    me = this;
    var show = false;
    all_langs.some( l => {
      console.log('card:', lang, 'lang:', l.language)
      if (lang === l.language) {
        l.countries.some(c => {
          console.log('card:', lang, 'lang:', l.language, 'country:', c.country, country)
          if (country === c.country) {
            show = true
            return true;
          }
        })
      }
      if (show) return true;
    })
    if (show) {
      $(me).parent().show()
    } else {
      $(me).parent().hide()
    }
  })
}

function show_all(){
  $('.language-card').each(function() {
    $(this).parent().show()
  })
}

function less_or_more() {
  if (document.show_recommended) {
    show_all();
    $('#less-or-more-text').html('Show Less');
    document.show_recommended = false;
  } else {
    var country = $('[data-section="countries"').find('[data-active]').data('country-name');
    console.log(country)
    show_recommended(country);
    $('#less-or-more-text').html('Show More');
    document.show_recommended = true;
  }
}

$(document).on('click', '.more-or-less', (e) => {
  less_or_more()
});

$(document).on('click', '.address-card', (e) => {
  const $target = $(e.currentTarget);
  const $section = $target.closest('[data-section]');
  $section.find('.address-card').removeClass('active');
  $target.addClass('active');
  if ($target.hasClass('country-card') && document.show_recommended) {
    country = $target.closest('[data-country-name]').data('country-name');
    show_recommended(country);
  } 
});

var $link = $('#region-picker');
const d = getPickerDialog();
$link.on('click', function() {
  frappe.call('aetesis.utilities.regions.get_countries_and_languages').then( r => {
    
    const countries = r.message['countries'];
    const languages = r.message['languages'];
    document.languages = languages;
    document.show_recommended = true;
    const html = '<div class="row">' + get_country_html(countries) + get_language_html(languages) + '</div>'
    $(d.get_field('region-picker').wrapper).html(
      html
    );
    d.show();
    
  }).then(function() {
    var country = $('[data-section="countries"').find('[data-active]');
    console.log(country)
    show_recommended(country);
  })
})