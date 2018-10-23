/* eslint-disable */
import mainBonGridFunction from './main-bons-grid';
import selectedBonsManagerFunction from './selected-bons-manager';
import orderReviewFunction from './order-review';
import swipeFunction from './swipe';

const MAX_BONS = 32;

export default function bonBuilder() {
    const STATES = [
        'get-started',
        'custom-box',
        'review-section',
    ];

    // CustomEvent polyfill for IE11
    /* eslint wrap-iife: off, func-names: off */
    (function () {
        if (typeof window.CustomEvent === 'function') return false;

        function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };

            const evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

            return evt;
        }

        CustomEvent.prototype = window.Event.prototype;

        window.CustomEvent = CustomEvent;
    })();

    /**
     * We get the endpoint based on the page information
     *
     * @returns {String}
     */
    function getEndpointUrl() {
        const $endpoint = document.querySelector('.bigcommerce-information--endpoint');
        if (!$endpoint) return null;

        const endpointDomain = $endpoint.textContent.trim();

        // return `${window.location.protocol}${endpointDomain}`;
        return `https:${endpointDomain}`;
    }

    const ENDPOINT_URL = getEndpointUrl();
    if (!ENDPOINT_URL) throw new Error('There is no endpoint to query!');

    const mainBonGrid = mainBonGridFunction(document.querySelector('.builder-custom-box .builder-category-grid'), document.querySelector('.builder-custom-box .builder-mobile-category-grid--wrapper'));
    const selectedBonsManager = selectedBonsManagerFunction();
    const orderReview = orderReviewFunction(ENDPOINT_URL);
    swipeFunction(document.querySelector('.builder-mobile-category-grid--wrapper'));

    let BON_DATA = [];
    let currentState = 0;

    history.pushState({ currentState: 'get-started' }, 'bon-builder', location.href);

    const $fixedHeader = document.querySelector('.builder-fixed-header');
    const $filterMenu = document.querySelector('.builder-filters-container');

    const $startedSection = document.querySelector('.builder-get-started-page');
    const $customBox = document.querySelector('.builder-custom-box');
    const $reviewSection = document.querySelector('.builder-review-section');

    const $logoContainer = document.querySelector('.bon-bon-bon--logo-container > img');
    const $footer = document.querySelector('footer');

    const sections = {
        'get-started': {
            elem: [$startedSection],
        },
        'custom-box': {
            elem: [$customBox],
        },
        'review-section': {
            elem: [
                $reviewSection,
                document.querySelector('.builder-shipping-container'),
                document.querySelector('.builder-footer'),
            ],
        },
    };

    const builderForceScroll = {
        set: false,
        active: false,
        offset: 0,
        forceBottom: false,
        init($elem) {
            if (window.screen.width > 771) {
                window.scrollTo(0, 0);

                builderForceScroll.offset = $elem.getBoundingClientRect().top;

                window.addEventListener('scroll', builderForceScroll.scrollHandler);
            }

            builderForceScroll.set = true;
        },
        scrollHandler() {
            if (builderForceScroll.active === false) return;

            if (builderForceScroll.forceBottom) {
                window.scrollTo(0, builderForceScroll.offset);
            } else if (window.scrollY < builderForceScroll.offset) {
                window.scrollTo(0, builderForceScroll.offset);
            }
        }
    }

    /**
     * Here we check on what state of the builder customer is on, and shows the correct section
     *
     */
    function checkScroll() {
        const currentSection = sections[STATES[currentState]];

        Object.keys(sections).forEach(section => sections[section].elem.forEach($elem => $elem.classList.add('builder-invisible')));
        currentSection.elem.forEach($elem => $elem.classList.remove('builder-invisible'));

        if (builderForceScroll.set === false) {
            builderForceScroll.init($startedSection);

            builderForceScroll.active = false;
        }

        // Intro page
        if (currentState === 0) {
            $fixedHeader.classList.remove('visible');

            builderForceScroll.forceBottom = false;
            builderForceScroll.active = false;
        } else {
            builderForceScroll.active = true;

            $fixedHeader.classList.add('visible');
        }

        // Bon builder
        if (currentState === 1) {
            $filterMenu.style.opacity = 1;

            builderForceScroll.forceBottom = true;
        } else {
            $filterMenu.style.opacity = 0;
        }

        // Review Section
        if (currentState === 2) {
            builderForceScroll.forceBottom = false;

            if ($footer !== null) $footer.classList.remove('builder-invisible');
        } else {
            if ($footer !== null) $footer.classList.add('builder-invisible');
        }

        if (builderForceScroll.active) $logoContainer.classList.add('builder-invisible');

        builderForceScroll.scrollHandler();
    }

    checkScroll();

    /**
     * We look on the data array the selected bon and look for the before and after ones so there is information to show to the customer
     * once she click on the left/right arrow icons on the view detail modal
     *
     * @param {String} bonId
     * @returns {undefined}
     */
    function getViewDetailFor(bonId) {
        if (!bonId) return;

        const bon = BON_DATA.find(dataBon => dataBon.id === bonId);
        if (!bon) return;

        const bonIndex = BON_DATA.indexOf(bon);
        let detailOptions = {};

        if (bonIndex === 0) detailOptions = { right: BON_DATA[bonIndex + 1].id };
        else if (bonIndex === (BON_DATA.length - 1)) detailOptions = { left: BON_DATA[bonIndex - 1].id };
        else detailOptions = { left: BON_DATA[bonIndex - 1].id, right: BON_DATA[bonIndex + 1].id };

        mainBonGrid.showDetailsFor(bon, detailOptions);
    }

    /**
     * Logic to filter what we show to customer
     * @param {Object} bonData
     */
    function bonFilter(bonData) {
        return (bonData.availability === 'available') &&             // check for just available bons
            (bonData.inventory_level > 0) &&                         // then chek we have in stock
            !!bonData.custom_fields &&                               // then if it has custom fields (some tests don't have it)
            bonData.custom_fields.find(cf => cf.name === 'index');   // then check for the index custom field which is mandatory
    }

    /**
     * We get the object from the endpoint and rearrange somethings that are not organized or map to our functions data
     * @param {Object} bonData
     */
    function bonDataMap(bonData) {
        const customFields = bonData.custom_fields;

        bonData.index = customFields.find(customField => customField.name === 'index').text;

        const filter = customFields.find(customField => customField.name === 'filter');
        if (filter) bonData.filter = filter.text;

        bonData.url = bonData.custom_url;
        bonData.title = bonData.name;
        bonData.id = `${bonData.id}`;

        if (bonData.images) {
            // Some products don't come organized and the thumbnail is the second or third image :(
            const sortedByThumbnail = bonData.images.sort((a, b) => {
                // is_thumbnail = true, values first
                return (a.is_thumbnail === b.is_thumbnail)? 0 : (a.is_thumbnail ? -1 : 1);
            });

            sortedByThumbnail.forEach((image, index) => {
                bonData[`image${index + 1}`] = image.standard_url;
                bonData[`altImage${index + 1}`] = image.description;
            });
        }

        const marker = customFields.find(customField => customField.name === 'marker');
        if (marker) {
            if (marker.text === 'detroit classics') bonData.detroit = true;
            else if (marker.text === 'babes faves') bonData.faves = true;
        }

        // We get Allergies information
        if (bonData.warranty) {
            let allergiesInfo = bonData.warranty.split('products-allergies-container');

            if (allergiesInfo.length > 1) {
                allergiesInfo = allergiesInfo[1];
                allergiesInfo = allergiesInfo.split('description_section">');

                if (allergiesInfo.length > 1) {
                    allergiesInfo = allergiesInfo[1];
                    allergiesInfo = allergiesInfo.split('</div>');

                    if (allergiesInfo.length > 1) {
                        allergiesInfo = allergiesInfo[0];

                        bonData.allergies = allergiesInfo.trim();
                    }
                }
            }
        }

        return bonData;
    }

    /**
     * We make a call to the endpoint to get all bons. Once we get them, we change some bits so it's the expected object our front end needs
     *
     * @param {function} callback
     */
    function getBons(callback) {
        const request = new XMLHttpRequest;
        request.open('GET', `${ENDPOINT_URL}/api/product/bons`);
        request.addEventListener('load', event => {

            try {
                // We get the data from the request
                const data = JSON.parse(event.target.response).data
                    // filter it and create a new array with the things that are important to us
                    .filter(bonFilter)
                    .map(bonDataMap);

                BON_DATA = data;

                if (callback) callback();

            } catch (error) { console.error('There was an error trying to load all the bons!', error) }
        });
        request.addEventListener('error', error => console.error(error));

        request.send();
    }

    // intro start button
    $startedSection
        .querySelector('.builder-get-started')
        .addEventListener('click', () => {
            currentState += 1;

            if (currentState >= STATES.length) currentState = STATES.length - 1;
            if (currentState < 0) currentState = 0;

            // When changes into the builder
            if (currentState === 1) {
                history.pushState({ currentState: 'custom-box' }, 'bon-builder', location.href);

                const $builderContainer = document.querySelector('.builder-custom-box');

                getBons(() => {
                    mainBonGrid.createBonsGrid(BON_DATA);

                    $builderContainer
                        .querySelector('.builder-loader')
                        .style.display = 'none';

                    $builderContainer
                        .querySelector('.builder-left')
                        .style.display = 'block';

                    $builderContainer
                        .querySelector('.builder-right')
                        .style.display = 'block';

                    $builderContainer
                        .querySelector('.builder-mobile-elements')
                        .style.opacity = '1';
                });
            }

            checkScroll();
        });

    document
        .querySelector('.builder-custom-box .builder-filters-list')
        .addEventListener('click', event => {
            if (event.target.tagName.toLowerCase() !== 'li' || event.target.classList.contains('no-selectable')) return;

            Array
                .from(event.target.parentNode.children)
                .forEach($li => $li.classList.remove('builder-selected-filter'));

            event.target.classList.add('builder-selected-filter');

            event.target.dispatchEvent(new CustomEvent('builder-selected-filter', { detail: event.target.textContent.toLowerCase() }));
        });

    function orderReviewClickHandler() {
        currentState = 2;

        history.pushState({ currentState: 'review-section' }, 'bon-builder', location.href);

        document.querySelector('.builder-mobile-selected-bons-list-container').style.display = 'none';

        orderReview.calculateOrder(selectedBonsManager.getSelectedBons());
        checkScroll();
    }

    // we listen for back button
    window.addEventListener('popstate', event => {
        event.preventDefault();

        console.log(event.state)

        if (('state' in event) && (('currentState' in event.state))) {

            if (event.state.currentState === 'custom-box') currentState -= 1;
            else if (event.state.currentState === 'review-section') currentState += 1;
            else location.reload();

            checkScroll();
        } else {
            location.reload();
        }
    });

    // When clicking on the Add to Box button, we do it
    /* eslint complexity: off */
    document
        .querySelector('.builder-custom-box')
        .addEventListener('click', event => {
            if (event.target.classList.contains('bon-add-to-box-button')) {
                selectedBonsManager.addBon(BON_DATA.find(bon => bon.id === event.target.getAttribute('data-bon-index')));

                mainBonGrid.showGrid();
            }

            if (event.target.classList.contains('bon-first-top-container') ||
                    (event.target.parentNode && event.target.parentNode.classList.contains('bon-first-top-container')) ||
                    (event.target.parentNode.parentNode && event.target.parentNode.parentNode.classList.contains('bon-first-top-container'))) {
                event.preventDefault();

                getViewDetailFor(event.target.getAttribute('data-bon-index'));
            }

            if (event.target.classList.contains('boxes-counter-left-button')) {
                mainBonGrid.moveCarrousel({ left: true });
            }

            if (event.target.classList.contains('boxes-counter-right-button')) {
                mainBonGrid.moveCarrousel({ right: true });
            }

            if (event.target.classList.contains('builder-mobile-footer-review-button')) {
                orderReviewClickHandler();
            }

            if (event.target.classList.contains('view-details-left-button')) {
                getViewDetailFor(event.target.getAttribute('data-bon-left-index'));
            }

            if (event.target.classList.contains('view-details-right-button')) {
                getViewDetailFor(event.target.getAttribute('data-bon-right-index'));
            }

            if (event.target.classList.contains('mobile-view-details-back-button')) {
                document.querySelector('.builder-mobile-view-details-container').style.display = 'none';
            }

            if (event.target.classList.contains('builder-mobile-footer-view-box')) {
                document.querySelector('.builder-mobile-selected-bons-list-container').style.display = 'flex';

                document.querySelector('footer').style.display = 'none';
            }

            if (event.target.classList.contains('builder-mobile-selected-back-button')) {
                document.querySelector('.builder-mobile-selected-bons-list-container').style.display = 'none';

                document.querySelector('footer').style.display = 'block';
            }

            if (event.target.classList.contains('builder-mobile-price-point-button')) {
                document.querySelector('.builder-mobile-by-price-container').style.display = 'block';
            }

            if (event.target.classList.contains('by-price-close-modal-button')) {
                document.querySelector('.builder-mobile-by-price-container').style.display = 'none';
            }
        });

    document
        .querySelector('.builder-custom-box')
        .addEventListener('change', event => {
            if (event.target.id === 'mobile-filter-bons') {
                event.target.dispatchEvent(new CustomEvent('builder-selected-filter', { detail: event.target.options[event.target.selectedIndex].value }));
            }
        });

    // When clicking on one 'x' button on the bon selected list should remove the selected bon
    document
        .querySelector('.builder-custom-box-list-container')
        .addEventListener('click', event => {
            if (event.target.tagName.toLowerCase() === 'button') {
                const bonIndex = event.target.getAttribute('data-bon-index');

                if (bonIndex !== undefined && bonIndex !== null) {
                    selectedBonsManager.removeBon(bonIndex);
                    mainBonGrid.showGrid();
                }
            }
        });

    // When clicking on the 'x' button for mobile view
    document
        .querySelector('.builder-mobile-selected-bons-list')
        .addEventListener('click', event => {
            if (event.target.tagName.toLowerCase() === 'button') {
                const bonIndex = event.target.getAttribute('data-bon-index');

                if (bonIndex !== undefined && bonIndex !== null) {
                    selectedBonsManager.removeBon(bonIndex);
                    mainBonGrid.showGrid();
                }
            }
        });

    // when clicking a random bon button, add a new random one
    Array.from(document.querySelectorAll('.builder-add-one-random-button'))
        .forEach($button => {
            $button.addEventListener('click', () => {
                const randomIndex = (Math.random() * BON_DATA.length) | 0;

                selectedBonsManager.addBon(BON_DATA[randomIndex]);
                mainBonGrid.showGrid();
            });
        });

    // custom box Open pop up by price button
    document
        .querySelector('.builder-custom-footer > .builder-pricepoint')
        .addEventListener('click', () => {
            document.querySelector('.builder-custom-box-by-price-modal').style.display = 'flex';
        });

    // Click View Details close modal button
    document
        .querySelector('.builder-view-details-modal')
        .addEventListener('click', event => {
            if (event.target.classList.contains('view-details-close')) {
                document.querySelector('.builder-view-details-modal').style.display = 'none';
            }
        });

    // Click By price close modal button
    document
        .querySelector('.by-price-close-modal-button')
        .addEventListener('click', () => {
            document.querySelector('.builder-custom-box-by-price-modal').style.display = 'none';
        });

    // custom box Review order button
    document
        .querySelector('.builder-custom-footer > .button')
        .addEventListener('click', orderReviewClickHandler);

    // Click on the Randomize button, desktop and mobile
    Array.from(document.querySelectorAll('.by-price-randomize')).forEach($randomizeButton => {
        $randomizeButton.addEventListener('click', event => {
            const $select = event.currentTarget.parentNode.querySelector('#by-price-select');
            const optionSelected = $select.options[$select.selectedIndex].value;

            document.querySelector('.builder-custom-box-by-price-modal').style.display = 'none';
            document.querySelector('.builder-mobile-by-price-container').style.display = 'none';

            for (let i = 0; i < parseInt(optionSelected, 10); i += 1) {
                const randomIndex = (Math.random() * BON_DATA.length) | 0;

                if (selectedBonsManager.addBon(BON_DATA[randomIndex]) === MAX_BONS) break;

                mainBonGrid.showGrid();
            }
        });
    });

    // Back to edit link
    document
        .querySelector('.builder-back-to-edit')
        .addEventListener('click', event => {
            event.preventDefault();
            currentState -= 1;

            checkScroll();
        });

    // For the review photos section on mobile we make the slider work by touching the image
    document
        .querySelector('.review-photos-container')
        .addEventListener('click', event => {
            if (event.target.classList.contains('review-photo-dot')) {
                if (event.target.classList.contains('selected')) return;

                /* eslint no-param-reassign: off */
                event
                    .currentTarget.querySelector('div')
                    .style.transform = `translate(-${parseInt(event.target.getAttribute('data-dot-number'), 10) * 33.33333333333}%)`;

                Array
                    .from(event.currentTarget.querySelectorAll('.review-photo-dot'))
                    .forEach(currentButton => currentButton.classList.remove('selected'));

                event.target.classList.add('selected');
            }

            if (event.target.tagName.toLowerCase() === 'img') {
                const currentButtonSelectedNumber = event.currentTarget.querySelector('.selected').getAttribute('data-dot-number');
                const newSelectedButtonNumber = (parseInt(currentButtonSelectedNumber, 10) + 1) % 3;

                event
                    .currentTarget.querySelector('div')
                    .style.transform = `translate(-${newSelectedButtonNumber * 33.33333333333}%)`;

                Array
                    .from(event.currentTarget.querySelectorAll('.review-photo-dot'))
                    .forEach(currentButton => currentButton.classList.remove('selected'));

                event.currentTarget.querySelector(`[data-dot-number="${newSelectedButtonNumber}"]`).classList.add('selected');
            }
        });

    // We try to add swapping for when user touches the review photos
    let reviewPhotosStartX = 0;
    document
        .querySelector('.review-photos-container')
        .addEventListener('touchstart', event => {
            reviewPhotosStartX = event.changedTouches[0].pageX;
        });

    document
        .querySelector('.review-photos-container')
        .addEventListener('touchend', event => {
            const reviewPhotosEndX = event.changedTouches[0].pageX;
            const direction = (reviewPhotosEndX - reviewPhotosStartX > 0) ? 1 : -1;
            const currentButtonSelectedNumber = event.currentTarget.querySelector('.selected').getAttribute('data-dot-number');
            let newSelectedButtonNumber = (parseInt(currentButtonSelectedNumber, 10) + (direction * -1)) % 3;

            if (newSelectedButtonNumber < 0) newSelectedButtonNumber = 2;

            document
                .querySelector('.review-photos-container')
                .querySelector('div')
                .style.transform = `translate(-${newSelectedButtonNumber * 33.33333333333}%)`;

            Array
                .from(document.querySelector('.review-photos-container').querySelectorAll('.review-photo-dot'))
                .forEach(currentButton => currentButton.classList.remove('selected'));

            document
                .querySelector('.review-photos-container')
                .querySelector(`[data-dot-number="${newSelectedButtonNumber}"]`).classList.add('selected');
        });

    // Build another box button
    document
        .querySelector('.builder-footer .button-secondary')
        .addEventListener('click', () => orderReview.buildAnotherBox(() => {
            selectedBonsManager.removeAll();

            currentState -= 1;

            checkScroll();
        }));

    /* eslint no-return-assign: off */
    document
        .querySelector('.builder-footer .checkout-button')
        .addEventListener('click', () => orderReview.checkout(() => location.href = '/cart.php'));
}
