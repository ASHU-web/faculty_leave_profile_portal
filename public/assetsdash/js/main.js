/* -----------------------------------------------
					Js Main
--------------------------------------------------
    Template Name: Dongo - vCard / Resume / Portfolio
--------------------------------------------------

Table of Content

	. Preloader
    . Navigation
    . Progress Bar
    . magnificPopup
    . testimonials

 
----------------------------------- */


(function ($) {
    "use strict";

    /* -----------------------------------
            Preloader
    ----------------------------------- */
        $('.loading').delay(500).fadeOut(500);
    

    /* -----------------------------------
            Navigation
    ----------------------------------- */
      
        $('#btnToggle').on('click', function () {
            $(".info-tab .nav").toggleClass('show');
        })
        $('.nav-link').on('click', function () {
            $(".info-tab .nav").removeClass('show');
        })
        
    

    /* -----------------------------------
            Progress Bar
    ----------------------------------- */
        $(".skill-progress .skill-progress-bar").each(function () {
            var bottom_object = $(this).offset().top + $(this).outerHeight();
            var bottom_window = $(window).scrollTop() + $(window).height();
            var progressWidth = $(this).attr('aria-valuenow') + '%';
            if (bottom_window > bottom_object) {
                $(this).css({
                    width: progressWidth
                });
            }
        });
  

   
    /* -----------------------------------
	       magnificPopup
    -----------------------------------*/
        $(".view-work").magnificPopup({
            type: "image",
            gallery: {
                enabled: true
            }
        });

    /* -----------------------------------
	       btn-custom
    -----------------------------------*/

    $('.home .btn-custom').on('click', function (e) {
        e.preventDefault()
        $('#myTab a[href="#about"]').tab('show');
    })
    $('.about .btn-custom').on('click', function (e) {
        e.preventDefault()
        $('#myTab a[href="#contact"]').tab('show');
    })
    
    /* -----------------------------------
           testimonials
    -----------------------------------*/
   
    $(".testimonials .owl-carousel").owlCarousel({
            loop: true,
            stagePadding:10,
            margin: 20,
            nav: false,
            autoplay: true,
            center: false,
            dots: true,
            mouseDrag: true,
            touchDrag: true,
            smartSpeed: 1000,
            autoplayHoverPause: false,
            responsiveClass: true,
            responsive: {
                0: {
                    items: 1,
                },
                600: {
                    items: 1,
                },
                1200: {
                    margin: 30,
                    items: 2,
                },
            }
        });
    

   
})(jQuery);