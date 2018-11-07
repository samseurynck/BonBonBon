/* eslint no-unused-vars: off */
import $ from 'jquery';
import dcalendarpicker from './custom/dcalendar.picker';
import jqueryvalidate from './custom/jquery-validate';
import accordion from './custom/jquery-ui';
import SmoothScroll from './custom/smooth-scroll';

export default function () {
    $(document).ready(() => {
        const scroll = new SmoothScroll('a[href*="#"]', {
            offset: 90,
        });

        $('#date-pick').dcalendarpicker();

        $('.icon_trigger').click(() => {
            $('#date-pick').focus();
        });

        $('.faq-acc').accordion({
            heightStyle: 'content',
            collapsible: 'true',
            active: 'false',
        });

        $('.tabs-navigation-item.tabs-qs').click(() => {
            $('.tabs-navigation-item').addClass('active');
            $('.tabs-ship, .tabs-faqs, .tabs-events').removeClass('active');
        });

        $('.tabs-navigation-item.tabs-ship').click(() => {
            $('.tabs-navigation-item').addClass('active');
            $('.tabs-qs, .tabs-faqs, .tabs-events').removeClass('active');
        });

        $('.tabs-navigation-item.tabs-faqs').click(() => {
            $('.tabs-navigation-item').addClass('active');
            $('.tabs-qs, .tabs-ship, .tabs-events').removeClass('active');
        });

        $('.tabs-navigation-item.tabs-events').click(() => {
            $('.tabs-navigation-item').addClass('active');
            $('.tabs-qs, .tabs-ship, .tabs-faqs').removeClass('active');
        });

        $('.tab_blk.question h3').click(() => {
            $('.question-content').slideToggle();
            $('.tab_blk.question h3').toggleClass('accordion-open');
        });

        $('.tab_blk.ship h3').click(() => {
            $('.shipping-content').slideToggle();
            $('.tab_blk.ship h3').toggleClass('accordion-open');
        });

        $('.tab_blk.faqs h3').click(() => {
            $('.faq-content').slideToggle();
            $('.tab_blk.faqs h3').toggleClass('accordion-open');
        });

        $('.tab_blk.event h3').click(() => {
            $('.events-content').slideToggle();
            $('.tab_blk.event h3').toggleClass('accordion-open');
        });

        const ht = $('.resetdiv').innerHeight();

        $('.form-thank-you').hide();
        $('.form-error').hide();

        $('#postcontent').validate({
            rules: {
                email: {
                    email: true,
                },
            },
        });

        $('#postcontent').submit(e => {
            const form = $('#postcontent');

            if (form.valid()) {
                e.preventDefault();
                $.ajax({
                    type: 'POST',
                    url: 'https://builder.bonbonbon.hosting.brandlabs.net/api/inquiry/contact',
                    data: $('#postcontent').serialize(),
                    error() {
                        $('.form-error').show();
                    },
                    success() {
                        $('.form-wrapper').hide();
                        $('.form-thank-you').show();
                    },
                });
            }
            e.preventDefault();
        });
    });

    // if we come from another page to a section of this one, we trigger the respective tab
    if (location.hash) {
        const $link = document.querySelector(`a[href="${location.hash}"]`);

        if ($link) $link.click();
    }
}
