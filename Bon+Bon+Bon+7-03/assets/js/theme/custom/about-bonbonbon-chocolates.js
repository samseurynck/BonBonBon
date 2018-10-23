/* eslint no-unused-vars: off */
import $ from 'jquery';
import owlCarousel from './owl-carousel';
import SmoothScroll from './smooth-scroll';

export default function () {
    $(document).ready(() => {
        const scroll = new SmoothScroll('a[href*="#"]', {
            offset: 70,
        });

        $('.story_2nd .owl-carousel').owlCarousel({
            loop: true,
            margin: 0,
            autoplay: true,
            responsiveClass: true,
            responsive: {
                0: {
                    items: 1,
                    nav: true,
                },
                413: {
                    items: 1,
                    nav: false,
                },
                600: {
                    items: 1,
                    nav: false,
                },
                767: {
                    items: 1,
                    nav: false,
                },
                1000: {
                    items: 1,
                    nav: true,
                    loop: true,
                },
            },
        });
    });
}
