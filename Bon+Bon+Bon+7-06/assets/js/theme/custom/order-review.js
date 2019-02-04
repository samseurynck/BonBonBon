export default function () {
    const $summaryList = document.querySelector('.builder-review-section .order-review-summary-list');
    const $totalBons = document.querySelector('.builder-review-section .order-review-summary-total-quantity');
    const $totalPrice = document.querySelector('.builder-review-section .order-review-total-price');
    const $personalMessage = document.getElementById('review-personal-message-textarea');
    const $specialNote = document.getElementById('review-special-note-textarea');
    const BON_PRICE = 3;    // $3.00

    let bonsTotal = null;
    let bonSelectedBons = null;

    /**
     * we get the asstes CDN url using an image we know it's there, so we can add our dynamic images
     *
     * @returns {String}
     */
    function getCDNpath() {
        const referenceImageUrl = 'img/bon_builder/review/img-fpo-box-size-1-BBB-122.jpg';

        const $img = document.querySelector(`img[src$="${referenceImageUrl}"]`);
        if (!$img) return '';

        return $img.src.replace(referenceImageUrl, '');
    }

    const CDN = getCDNpath();

    /**
     * we loop over the girl images and replace it's default 'src' attribute for the one based on the selected bons
     *
     */
    /* eslint no-return-assign: off */
    function showImagesByBox(totalBons) {
        Array
            .from(document.querySelectorAll('.review-photos-container img'))
            .forEach(($img, index) => $img.src = `${CDN}img/bon-boxes/${index + 1}-bons-${totalBons}.jpg`);
    }

    /**
     * We add to the bon object the integerAmount value needed on the enpoint call and show the customer the order review data
     *
     * @param {Array<Object>} bonsList
     */
    function showOrderReview(bonsList) {
        let totalBons = 0;
        let totalPrice = 0;

        // First, we show the total order
        const summaryHtml = bonsList.map(bon => {
            bon.integerAmount = bon.quantity * BON_PRICE * 100;
            totalBons += bon.quantity;
            totalPrice += bon.quantity * BON_PRICE;

            return `
                <li>
                    <span class="order-review-summary-list-description">${bon.title}</span>
                    <span class="order-review-summary-list-quantity">x${bon.quantity}</span>
                </li>
            `;
        }).join('');

        $summaryList.innerHTML = summaryHtml;

        // Then we update the number of bons
        $totalBons.innerHTML = `${totalBons} BON${totalBons > 1 ? 'S' : ''}`;

        // Finally, we update the total price
        $totalPrice.innerHTML = `$${totalPrice}.00`;

        showImagesByBox(totalBons);
    }

    /**
     * We calculate the quantity number for each type of selected bon
     *
     * @param {Array<Object>} selectedBons
     */
    function calculateOrder(selectedBons) {
        bonsTotal = [];
        bonSelectedBons = selectedBons;

        selectedBons.forEach(selectedBon => {
            const foundBonInTotal = bonsTotal.find(bonInTotal => bonInTotal.id === selectedBon.id);

            if (foundBonInTotal) {
                foundBonInTotal.quantity += 1;
            } else {
                /* eslint no-param-reassign: off */
                selectedBon.quantity = 1;

                bonsTotal.push(selectedBon);
            }
        });

        showOrderReview(bonsTotal);
    }


    /**
     * If customer writes some special note, we attach it to the cart item using the gift wrapping function
     * @param {String} itemId
     * @param {number} wrappingId
     * @param {String} note
     * @param {Function} callback
     */
    function sendNote(itemId, wrappingId, note, callback) {
        const request = new XMLHttpRequest;

        /* eslint no-console: off */
        request.open('POST', '/cart.php');
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.addEventListener('error', error => console.error(error));

        request.addEventListener('load', () => {
            $personalMessage.value = '';
            $specialNote.value = '';

            callback();
        });

        let formData = '';
        const urlEncodedDataPairs = [];

        const data = {
            action: 'save_giftwrapping',
            'giftmessage[all]': note,
            'giftwrapping[all]': wrappingId,
            giftwraptype: 'same',
            item_id: itemId,
        };

        /* eslint guard-for-in: off */
        for (const name in data) {
            urlEncodedDataPairs.push(`${encodeURIComponent(name)}=${encodeURIComponent(data[name])}`);
        }

        // we save the message on the local storage in case BigCommerce truncates our message later
        localStorage.setItem(`note-builder-${itemId}`, note);

        formData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

        request.send(formData);
    }

    /**
     * We request for the gift wrapping options for the selected cart item.
     * Once we get the results, we look for the "Personal Note" which is the one for this project and then send the Note into BigCommerce
     *
     * @param {string}   itemId
     * @param {function} callback
     */
    function getWrappingOptions(itemId, callback) {
        const PERSONAL_NOTE = 'Personal Note';
        const giftwrapUrl = `/remote/v1/gift_wrapping/${itemId}`;

        const request = new XMLHttpRequest;
        request.open('GET', giftwrapUrl);
        request.setRequestHeader('accept', 'application/json');
        request.addEventListener('load', event => {
            if (!event || 'responseText' in event.target === false) {
                return;
            }

            let data = null;

            try {
                data = JSON.parse(event.target.responseText);
            } catch (error) {
                console.error('Malformed JSON when getting wrapping options');
                console.error(error);
            }

            if (!data) {
                return;
            }

            const giftWrappingFiltered = data.data.gift_wrappings.filter(gw => gw.name === PERSONAL_NOTE);
            if (giftWrappingFiltered.length === 0) {
                return;
            }

            if (callback) {
                callback(giftWrappingFiltered[0].id);
            }
        });
        request.send();
    }

    /**
     * We send the form to the add to cart endpoint and if there is a special message, we assemble it and send it for the gift wrapping function
     * @param {FormData} formData
     * @param {Function} callback
     */
    function addItemsToCart(formData, callback) {
        const request = new XMLHttpRequest;
        request.open('POST', '/remote/v1/cart/add');

        request.addEventListener('load', event => {
            let data = event.target.response;
            if (!data) return;

            try {
                data = JSON.parse(data);
            } catch (error) {
                console.error('There is no a malformed response when adding to cart');
                console.error(error);
            }

            if (!data) return;

            const personalNote = $personalMessage.value.trim();
            const specialNote = $specialNote.value.trim();

            if (personalNote || specialNote) {
                const itemId = data.data.cart_item.id;
                const note = `PERSONAL:${personalNote}-----SPECIAL:${specialNote}`;

                getWrappingOptions(itemId, wrappingId => sendNote(itemId, wrappingId, note, callback));
            } else {
                callback();
            }
        });

        request.addEventListener('error', error => console.log('error: ', error));
        request.send(formData);
    }

    /**
     * We look into the custom bon box product iframe the information of all options selected by customer and we start forming the formdata to send to the add to cart
     * @param {Function} callback
     */
    function gatherBonOptionsOnCustomBoxProduct(callback) {
        const $customBoxPage = document.querySelector('.builder-custom-bon-iframe');
        if (!$customBoxPage) return;

        const $iframeBody = $customBoxPage.contentWindow.document.body;
        if (!$iframeBody) {
            console.error('There is no iframeBody');

            return;
        }

        const $iframeBonOptionSets = Array.from($iframeBody.querySelectorAll('[data-product-attribute="product-list"]'));
        const productId = $iframeBody.querySelector('input[name="product_id"]').value;

        const formdata = new FormData;
        formdata.append('name', 'action');
        formdata.append('product_id', productId);

        bonSelectedBons.forEach((bon, index) => {
            // we filter from all filters to find the one selected
            const $label = Array
                .from($iframeBonOptionSets[index].querySelectorAll('label'))
                .find(label => label.textContent === bon.title);

            // and then get it's input name and value attributes
            const $input = $iframeBonOptionSets[index].querySelector(`input#${$label.htmlFor}`);
            formdata.append($input.name, $input.value);
        });

        formdata.append('qty[]', 1);

        addItemsToCart(formdata, callback);
    }

    /**
     * We send Jideobi's endpoint information along with the callback
     *
     * @param {function} callback
     */
    function buildAnotherBox(callback) {
        gatherBonOptionsOnCustomBoxProduct(callback);
    }

    /**
     * We send Jideobi's endpoint information along with the callback
     *
     * @param {function} callback
     */
    function checkout(callback) {
        gatherBonOptionsOnCustomBoxProduct(callback);
    }

    return {
        calculateOrder,
        buildAnotherBox,
        checkout,
    };
}
