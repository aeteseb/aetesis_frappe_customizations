if (!getCookie('region')) {
	$.getJSON("http://www.geoplugin.net/json.gp?jsoncallback=?",
	function (data) {
			document.cookie = "region=" + data.geoplugin_countryCode; + "; samesite=Lax;"
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
