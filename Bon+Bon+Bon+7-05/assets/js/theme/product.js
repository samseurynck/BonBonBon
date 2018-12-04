/*
 Import all product specific js
 */
import $ from 'jquery';
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/form-utils';

/**
 * We look for the price and check if the stock number is present, if it is, then we check if it's zero, if it is, we add "SOLD OUT"
 * next to this price
 */
function checkStock() {
    const $price = document.querySelector('.price.price--withoutTax');
    const productattributes = window.BCData.product_attributes;
    const stockNumber = (productattributes && 'stock' in productattributes) ? productattributes.stock : null;
    const inStock = (productattributes && 'instock' in productattributes) ? productattributes.instock : null;
    const purchasable = (productattributes && 'purchasable' in productattributes) ? productattributes.purchasable : null;

    if (!$price || stockNumber) return;

    if (stockNumber === 0 || (inStock === false && purchasable)) {
        $price.style.textDecoration = 'line-through';

        $price.insertAdjacentHTML('afterend', '<span class="price"> SOLD OUT</span>');
    }
}

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
    }

    before(next) {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        next();
    }

    loaded(next) {
        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);

        videoGallery();

        const $reviewForm = classifyForm('.writeReview-form');
        const review = new Review($reviewForm);

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation(this.context);
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        checkStock();

        next();
    }

    after(next) {
        this.productReviewHandler();

        next();
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.click();
        }
    }
}
