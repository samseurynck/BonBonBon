const PERSONAL_NOTE = 'Personal Note';
let PERSONAL_NOTE_WRAPPING_ID = null;   // Used to know what's the Personal Note Gift wrapping option id

/**
 * We just the element the invisible class if present
 * @param {DOMElement}  $element
 */
function hide($element) {
    if ($element) $element.classList.add('cart-notes--invisible');
}

/**
 * We remove the invisible class on the element if present
 *
 * @param {DOMElemetn} $element
 */
function unhide($element) {
    if ($element) $element.classList.remove('cart-notes--invisible');
}

/**
 * We send the note information to BigCommerce as a GitWrap note and update the view using the cart instance from the cart.js file
 *
 * @param {String} itemId
 * @param {String} note
 * @param {Object} cartInstance
 */
function sendNote(itemId, note, cartInstance) {
    if (PERSONAL_NOTE_WRAPPING_ID === null) {
        throw new Error('No "Personal Note" Gift Wrapping option available to use');
    }

    const request = new XMLHttpRequest;

    /* eslint no-console: off */
    request.open('POST', '/cart.php');
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.addEventListener('error', error => console.error(error));
    request.addEventListener('load', () => cartInstance.refreshContent.bind(cartInstance)());

    let formData = '';
    const urlEncodedDataPairs = [];

    const data = {
        action: 'save_giftwrapping',
        'giftmessage[all]': note,
        'giftwrapping[all]': PERSONAL_NOTE_WRAPPING_ID,
        giftwraptype: 'same',
        item_id: itemId,
    };

    /* eslint guard-for-in: off */
    for (const name in data) {
        urlEncodedDataPairs.push(`${encodeURIComponent(name)}=${encodeURIComponent(data[name])}`);
    }

    // we save the message on the local storage in case BigCommerce truncates our message later
    localStorage.setItem(`note-${itemId}`, note);

    formData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

    request.send(formData);
}

/**
 * We check that no personal notes widget is shown for Custom bon boxes
 */
function checkCustomProducts() {
    const customRegexp = /CUSTOM BON BOX/;

    Array
        .from(document.querySelectorAll('.cart-notes-container'))
        .forEach($personalNoteContainer => {
            if (customRegexp.test($personalNoteContainer.getAttribute('data-product-name')) === false) {
                const $addButton = $personalNoteContainer.querySelector('.cart-notes--add-button');

                if ($addButton) $addButton.classList.remove('cart-notes--invisible');
            } else {
                const $editButton = $personalNoteContainer.querySelector('.cart-notes--edit-button');

                if ($editButton) $personalNoteContainer.classList.add('cart-notes--invisible');
            }
        });
}

/**
 * We request for the gift wrapping options for the selected cart item.
 * Once we get the results, we look for the "Personal Note" which is the one for this project and then send the Note into BigCommerce
 *
 * @param {string}   itemId
 * @param {function} callback
 */
function getWrappingOptions(itemId) {
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

        PERSONAL_NOTE_WRAPPING_ID = giftWrappingFiltered[0].id;
    });
    request.send();
}

/**
 * We check all product personal notes and if they were inserted on the same machine, we show the complete message to customer
 */
function checkAllMessages() {
    const ellipsisRegexp = /\.\.\.$/;

    Array
        .from(document.querySelectorAll('p.cart-notes-message'))
        .forEach($note => {
            if (ellipsisRegexp.test($note.textContent) === false) return;

            const itemId = $note.getAttribute('data-item-note');
            const localNote = localStorage.getItem(`note-${itemId}`);

            if (localNote) $note.textContent = localNote;
        });
}

export default function init(cartInstance) {
    checkCustomProducts();
    checkAllMessages();

    const $personalNotes = Array.from(document.querySelectorAll('.cart-notes-container'));
    let isGetWrappingOptionsCalled = false;

    $personalNotes.forEach($personalNoteContainer => {
        // We try to get the wrapping options if present since Custom boxes don't have it
        if (isGetWrappingOptionsCalled === false) {
            const $dataItemNote = $personalNoteContainer.querySelector('[data-item-note]');

            if ($dataItemNote) {
                getWrappingOptions($dataItemNote.getAttribute('data-item-note'));

                isGetWrappingOptionsCalled = true;
            }
        }

        $personalNoteContainer.addEventListener('click', event => {
            const target = event.target;

            // When we click on Add button, we need to hide this button and show the text area
            if (target.classList.contains('cart-notes--add-button')) {
                hide(target);
                unhide($personalNoteContainer.querySelector('.cart-notes-input-container'));
            }

            // When clicking on Cancel on text area, we need to show the Add button if we're adding
            // or Edit Button if we're editing
            if (target.classList.contains('cart-notes-input-container--cancel-button')) {
                hide($personalNoteContainer.querySelector('.cart-notes-input-container'));
                unhide($personalNoteContainer.querySelector('.cart-notes--add-button'));
                unhide($personalNoteContainer.querySelector('.cart-notes-message-container'));
            }

            // When clicking the Edit button we need to copy what's on the message to the textarea, so even if the customer cancels the edition
            // and goes back to it, always has the message
            if (target.classList.contains('cart-notes--edit-button')) {
                /* eslint no-param-reassign: off  */
                $personalNoteContainer.querySelector('textarea').value = $personalNoteContainer.querySelector('.cart-notes-message').textContent;

                hide($personalNoteContainer.querySelector('.cart-notes-message-container'));
                unhide($personalNoteContainer.querySelector('.cart-notes-input-container'));
            }

            // When clicking Save button, we need to send the information and reload?
            if (target.classList.contains('cart-notes-input-container--save-button')) {
                const $textarea = $personalNoteContainer.querySelector('textarea');

                if (!$textarea) throw new Error('There is no text area when adding a personal note');

                hide(target);

                const textAreaInfo = $textarea.value.trim();
                sendNote(target.getAttribute('data-item-note'), textAreaInfo, cartInstance);
            }
        });
    });
}
