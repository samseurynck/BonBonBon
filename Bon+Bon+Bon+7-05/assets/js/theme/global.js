import $ from 'jquery';
import './common/select-option-plugin';
import 'html5-history-api';
import PageManager from './page-manager';
import quickSearch from './global/quick-search';
import currencySelector from './global/currency-selector';
import mobileMenuToggle from './global/mobile-menu-toggle';
import menu from './global/menu';
import foundation from './global/foundation';
import quickView from './global/quick-view';
// import cartPreview from './global/cart-preview';
import compareProducts from './global/compare-products';
import privacyCookieNotification from './global/cookieNotification';
import maintenanceMode from './global/maintenanceMode';
import carousel from './common/carousel';
import 'lazysizes';
import loadingProgressBar from './global/loading-progress-bar';
import FastClick from 'fastclick';
import sweetAlert from './global/sweet-alert';

import bonBuilder from './custom/bon-builder';
import contactUs from './contact-us';
import aboutBonBonBonChocolates from './custom/about-bonbonbon-chocolates';

import stinkyHeader from './custom/global-sticky-header';

function fastClick(element) {
    return new FastClick(element);
}

const BUILDER_PAGE = /^\/bon\-builder\/?/.test(window.location.pathname);

function scrollToTop() {
    window.scrollTo(0, 0);
}

export default class Global extends PageManager {

    before(next) {
        // we try to prevent the customer to scroll if we are on the bon bonx builder page
        if (BUILDER_PAGE) window.addEventListener('scroll', scrollToTop);

        stinkyHeader();

        next();
    }

    /**
     * You can wrap the execution in this method with an asynchronous function map using the async library
     * if your global modules need async callback handling.
     * @param next
     */
    loaded(next) {
        fastClick(document.body);
        quickSearch();
        currencySelector();
        foundation($(document));
        quickView(this.context);
        // cartPreview();
        compareProducts(this.context.urls);
        carousel();
        menu();
        mobileMenuToggle();
        privacyCookieNotification();
        maintenanceMode(this.context.maintenanceMode);
        loadingProgressBar();
        sweetAlert();

        if (BUILDER_PAGE) {
            bonBuilder();

            // we remove our safety listener when the bon bonx builder has fully loaded
            window.removeEventListener('scroll', scrollToTop);
        }

        if (/^\/contact\-us\/?/.test(window.location.pathname)) contactUs();
        if (/^\/about\/?/.test(window.location.pathname)) aboutBonBonBonChocolates();

        // We add the target attribute for all anchors that point to a pdf file
        Array
            .from(document.querySelectorAll('footer a[href$=".pdf"]'))
            .forEach($link => $link.setAttribute('target', '_blank'));

        next();
    }
}
