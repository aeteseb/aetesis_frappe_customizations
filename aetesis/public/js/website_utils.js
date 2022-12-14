if(!window.aetesis) window.aetesis = {};

if (/windows/i.test(navigator.userAgent)) {
    document.body.classList.add('win')
  }

frappe.ready(function() {
    var guest_id = frappe.get_cookie('guest_id');
    if ((!guest_id) && frappe.session.user==="Guest") {
        guest_id = Math.floor(100000 + Math.random() * 900000);
        var d = new Date();
	    // expires within 7 days
	    d.setTime(d.getTime() + (604800000));
	    var expires = "; expires="+d.toUTCString();
        document.cookie = "guest_id=" + guest_id + expires + "; samesite=Lax; path=/";
        frappe.boot['guest_id'] = guest_id;
    } else if (guest_id) {
        frappe.boot['guest_id'] = guest_id;
    }   
})
