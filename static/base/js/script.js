(function ($) {
    "use strict";

    // Add active state to sidbar nav links
    var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
    $("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function () {
        if (this.href === path) {
            $(this).addClass("active");
        }
    });

    // Toggle the side navigation
    $("#sidebarToggle").on("click", function (e) {
        e.preventDefault();
        $("body").toggleClass("sb-sidenav-toggled");
    });
})(jQuery);

$('.util-card').hover(
       function(){ $(this).addClass('shadow') },
       function(){ $(this).removeClass('shadow') }
)

function getFormData($form) {
    const serializeArray = $form.serializeArray();
    const indexed_array = {};

    $.map(serializeArray, function (n, i) {
        if (n['value'] === "") {
            indexed_array[n['name']] = null;
        } else indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}