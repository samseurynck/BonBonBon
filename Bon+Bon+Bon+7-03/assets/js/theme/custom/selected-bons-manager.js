
export default function selectedBonsManager() {
    const bonsList = [];

    // ELEMENTS
    const $bonsEmptyContainer = document.querySelector('.builder-custom-box-empty-container');
    const $bonsListContainer = document.querySelector('.builder-custom-box-list-container');
    const $reviewOrderButton = document.querySelector('.builder-custom-footer .button');
    const $totalCost = document.querySelector('.build-by-ptice--price');
    const $mobileReviewOrderButtons = Array.from(document.querySelectorAll('.builder-mobile-footer-review-button'));
    const $mobileBonsListContainer = document.querySelector('.builder-mobile-selected-bons-list');
    const $mobilePrice = document.querySelector('.builder-mobile-selected-price');
    const $mobileFooterTotalCost = document.querySelector('.builder-mobile-footer-total-cost');

    const BON_PRICE = 3; // $3.00

    /**
     * We create the DOM list to show the selected list to the customer
     *
     */
    function showBonList() {
        const html = bonsList.map(bon => `
            <div class="bon-selected-item">
                <button data-bon-index="${bon.id}"></button>
                <img src="${bon.image2 || ''}" alt="${bon.altImage2 || ''}">
                <p>
                    <span>#${bon.index}</span>
                    <span>${bon.title}</span>
                </p>
            </div>
        `);

        $bonsListContainer.innerHTML = html.join('');
        $mobileBonsListContainer.innerHTML = html.join('');

        $mobilePrice.textContent = html.length * BON_PRICE;
        $totalCost.textContent = `$${html.length * BON_PRICE}`;
        $mobileFooterTotalCost.textContent = `$${html.length * BON_PRICE}`;
    }

    /**
     * We add the new bon into the selected list
     *
     * @param {Object} bonObject
     * @returns {Number}
     */
    function addBon(bonObject) {
        if (bonsList.length === 32) {
            alert('You can add up to 32 Bons to your Box!');

            return bonsList.length;
        }

        bonObject.inventory_level -= 1;

        // We remove the empty box message, show the bons list along with the add random link and enable the review order button
        $bonsEmptyContainer.style.display = 'none';
        $bonsListContainer.style.display = 'block';
        $reviewOrderButton.disabled = false;
        $mobileReviewOrderButtons.forEach($button => $button.disabled = false);

        bonsList.unshift(bonObject);
        showBonList();

        return bonsList.length;
    }

    /**
     * We remove the bon from the list
     *
     * @param   {String}  bonIndex
     * @returns {Number}
     */
    function removeBon(bonIndex) {
        const foundIndex = bonsList.findIndex(bon => bon.id === bonIndex);

        if (foundIndex > -1) {
            bonsList[foundIndex].inventory_level += 1;

            bonsList.splice(foundIndex, 1);

            if (bonsList.length === 0) {
                // We show again the empty box message, hide the bons list along with the add random link and disable the review order button
                $bonsEmptyContainer.style.display = 'block';
                $bonsListContainer.style.display = 'none';
                $reviewOrderButton.disabled = true;
                /* eslint no-param-reassign: off, no-return-assign: off */
                $mobileReviewOrderButtons.forEach($button => $button.disabled = true);
            }

            showBonList();
        }

        return bonsList.length;
    }

    /**
     * We return the selected bons list
     *
     * @returns {Array}
     */
    function getSelectedBons() {
        return bonsList;
    }

    /**
     * We remove all bons from the selected list to start again
     *
     */
    function removeAll() {
        while (bonsList.length) bonsList.pop();

        // We show again the empty box message, hide the bons list along with the add random link and disable the review order button
        $bonsEmptyContainer.style.display = 'block';
        $bonsListContainer.style.display = 'none';
        $reviewOrderButton.disabled = true;
        $totalCost.textContent = '$0';
        $mobileFooterTotalCost.textContent = '$0';

        $mobileReviewOrderButtons.forEach($button => $button.disabled = true);
    }

    return {
        addBon,
        removeBon,
        getSelectedBons,
        removeAll,
    };
}
