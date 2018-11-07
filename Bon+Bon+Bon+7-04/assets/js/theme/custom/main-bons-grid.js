
export default function MainBonGrid($bonsContainer, $bonsMobileContainer) {
    const $detailModal = document.querySelector('.builder-view-details-modal');
    const $detailContainer = $detailModal.querySelector('.builder-view-details-container');
    const $mobileDetailContainer = document.querySelector('.builder-mobile-view-details-container');
    const $bonGridContainer = document.querySelector('.builder-category-grid');
    const BON_CARD_WIDTH = 242; // pixels: card is 220px, margin right is 18px and browser adds 4 pixels to flexbox to work
    const BON_CARD_MARGIN_OFFSET = 9; // pixels

    let appliedFilter = 'all';  // possible values: all, milk, dark, caramel, avoids gluten, nuts and vegan
    let bonsList = [];

    // We adjust bon grid padding so the bon grid seems to be centered since flex-box alone doesn't allow it
    function setBonGridContainerPadding() {
        const bonGridBbox = $bonGridContainer.getBoundingClientRect();
        const numberOfCardsOnTheBonGrid = (bonGridBbox.width / BON_CARD_WIDTH) | 0;
        const padding = (bonGridBbox.width - (BON_CARD_WIDTH * numberOfCardsOnTheBonGrid)) / 2;

        $bonGridContainer.style.paddingLeft = `${padding + BON_CARD_MARGIN_OFFSET}px`;
        $bonGridContainer.style.paddingRight = `${padding - BON_CARD_MARGIN_OFFSET}px`;
    }

    /**
     * We populate the bons grid with the information provided, filtering based on the filter property of each bon
     *
     * @returns {undefined}
     */
    function showGrid() {
        const html = bonsList
            .filter(bonData => {
                if (bonData.inventory_level === 0) return false;
                if (appliedFilter === 'all') return true;

                return bonData.filter && bonData.filter.indexOf(appliedFilter) > -1;
            })
            .map((bonData) => {
                const faves = bonData.faves ? '<div class="bon-box-faves-marker"></div>' : '';
                const detroit = bonData.detroit ? '<div class="bon-box-detroit-classics-marker"></div>' : '';

                return `
                    <div class="bon-box-container">
                        <div class="bon-first-top-container" data-bon-index="${bonData.id}">
                            <a href="${bonData.url}" class="bon-view-details" data-bon-index="${bonData.id}">View details</a>
                            <div class="bon-image-container" data-current="true" data-bon-index="${bonData.id}">
                                <img src="${bonData.image1 || ''}" alt="${bonData.altImage1 || ''}" data-bon-index="${bonData.id}">
                                ${faves}
                                ${detroit}
                            </div>
                        </div>
                        <p class="bon-index">#${bonData.index}</p>
                        <h4 class="bon-name">${bonData.title}</h4>
                        <div class="bon-dummy"></div>
                        <button data-bon-index="${bonData.id}" class="bon-add-to-box-button">Add to Box</button>
                    </div>
                `;
            });

        if (!$bonsContainer) return;

        /* eslint no-param-reassign: off */
        $bonsContainer.innerHTML = html.join('');

        if ($bonGridContainer) setTimeout(setBonGridContainerPadding, 20);

        if ($bonsMobileContainer) {
            $bonsMobileContainer.innerHTML = html.join('');

            if ($bonsMobileContainer.parentNode.parentNode.querySelector('.boxes-counter-current-bon')) {
                $bonsMobileContainer.parentNode.parentNode.querySelector('.boxes-counter-current-bon').textContent = 1;
                $bonsMobileContainer.parentNode.parentNode.querySelector('.boxes-counter-total-bon').textContent = html.length;

                $bonsMobileContainer.parentNode.parentNode.querySelector('.boxes-counter-left-button').classList.add('invisible');
                $bonsMobileContainer.parentNode.parentNode.querySelector('.boxes-counter-right-button').classList.remove('invisible');

                $bonsMobileContainer.style.transform = 'translate(-0px)';
            } else {
                const counterHtml = `
                    <div class="boxes-counter">
                        <button class="boxes-counter-left-button invisible">
                            <svg width="11px" height="16px" viewBox="0 0 11 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                <g id="Bon-Builder" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                    <g id="Mobile---Bon-Builder" transform="translate(-209.000000, -1382.000000)" fill="#E35737">
                                        <g id="Mobile/Bon-Builder-Grid" transform="translate(0.000000, 574.000000)">
                                            <g id="Paging" transform="translate(102.000000, 806.742169)">
                                                <polygon id="Path-2" transform="translate(112.500000, 9.380723) scale(-1, 1) rotate(-90.000000) translate(-112.500000, -9.380723) " points="120 14.346988 112.4848 4.41445783 105 14.346988"></polygon>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </svg>
                        </button>
                        <span class="boxes-counter-current-bon">1</span>/<span class="boxes-counter-total-bon">${html.length}</span>
                        <button class="boxes-counter-right-button">
                            <svg width="11px" height="16px" viewBox="0 0 11 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                <g id="Bon-Builder" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                    <g id="Mobile---Bon-Builder" transform="translate(-209.000000, -1382.000000)" fill="#E35737">
                                        <g id="Mobile/Bon-Builder-Grid" transform="translate(0.000000, 574.000000)">
                                            <g id="Paging" transform="translate(102.000000, 806.742169)">
                                                <polygon id="Path-2" transform="translate(112.500000, 9.380723) scale(-1, 1) rotate(-90.000000) translate(-112.500000, -9.380723) " points="120 14.346988 112.4848 4.41445783 105 14.346988"></polygon>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </svg>
                        </button>
                    </div>
                `;

                $bonsMobileContainer.parentNode.insertAdjacentHTML('afterend', counterHtml);
            }
        }
    }

    /**
     * We move the bon cards when clicking on the left/right arrows
     *
     * @param   {Object} { right = false, left = false }
     * @returns {undefined}
     */
    function moveCarrousel({ right = false, left = false }) {
        const $boxesCounter = document.querySelector('.boxes-counter');
        const $currentBon = $boxesCounter.querySelector('.boxes-counter-current-bon');
        const $totalBon = $boxesCounter.querySelector('.boxes-counter-total-bon');
        const $leftButton = $boxesCounter.querySelector('.boxes-counter-left-button');
        const $rightButton = $boxesCounter.querySelector('.boxes-counter-right-button');

        const CARD_WIDTH = 228;
        let currentNumber = 0;

        if (left) {
            currentNumber = parseInt($currentBon.textContent.trim(), 10);

            if (currentNumber === 1) return;

            currentNumber -= 1;
            $currentBon.textContent = currentNumber;

            $rightButton.classList.remove('invisible');

            if (currentNumber === 1) $leftButton.classList.add('invisible');
        } else if (right) {
            currentNumber = parseInt($currentBon.textContent.trim(), 10);
            const total = parseInt($totalBon.textContent.trim(), 10);

            if (currentNumber === total) return;

            currentNumber += 1;
            $currentBon.textContent = currentNumber;

            $leftButton.classList.remove('invisible');

            if (currentNumber === total) $rightButton.classList.add('invisible');
        } else {
            return;
        }

        $bonsMobileContainer.style.transform = `translate(-${(currentNumber - 1) * CARD_WIDTH}px)`;
    }

    /**
     * We take the data and create the bon template to add it into the grid
     *
     * @param {Array<Object>} data
     * @returns {undefined}
     */
    function createBonsGrid(data) {
        if (!data || !data.length) return;

        bonsList = data;

        showGrid();
    }

    /**
     * We populate the show details modal using the information of the bon
     *
     * @param {Object} bon
     * @param {Object} { left = false, right = false }
     */
    function showDetailsFor(bon, { left = false, right = false }) {
        $detailModal.style.display = 'flex';

        let imagesHTML = `<img src="${bon.image1 || ''}" alt="${bon.altImage1 || ''}">`;
        if ('image3' in bon) imagesHTML += `<img src="${bon.image3}" alt="${bon.altImage3}">`;
        if ('image2' in bon) imagesHTML += `<img src="${bon.image2}" alt="${bon.altImage2}">`;

        const leftButton = left ? `<button class="view-details-left-button" data-bon-left-index="${left}"></button>` : '';
        const rightButton = right ? `<button class="view-details-right-button" data-bon-right-index="${right}"></button>` : '';

        const html = `
            <button class="view-details-close"></button>
            <div class="view-details-content-wrapper">
                <div class="view-details-images-container">
                    ${imagesHTML}
                </div>
                <h2>
                    <span>${bon.title}</span>
                </h2>
                <p>${bon.description}</p>
                <div class="view-details-add-to-box-container">
                    <button data-bon-index="${bon.id}" class="bon-add-to-box-button">Add to Box</button>
                    <span>$3 each</span>
                </div>
                <div class="view-details-allergies">
                    <label for="view-details-allergies"><strong>Allergies</strong></label>
                    <input id="view-details-allergies" type="checkbox" style="display: none">
                    <span class="view-details-allergies--plus">+</span>
                    <p>${bon.allergies}</p>
                </div>
            </div>
            ${leftButton}
            ${rightButton}
        `;

        $detailContainer.innerHTML = html;

        if ($bonsMobileContainer) {
            $mobileDetailContainer.style.display = 'block';

            const mobileImagesHTML = `<img src="${bon.image1}" alt="${bon.altImage1}">`;

            const mobileLeftButton = `<button class="view-details-left-button ${left ? '' : 'invisible'}" data-bon-left-index="${left}">PREVIOUS</button>`;
            const mobileRightButton = `<button class="view-details-right-button ${right ? '' : 'invisible'}" data-bon-right-index="${right}">NEXT</button>`;

            const mobileHtml = `
                <button class="mobile-view-details-back-button">
                    <svg width="9px" height="15px" viewBox="0 0 9 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <g id="Mobile/Bon-Builder-Grid" transform="translate(-210.000000, -732.000000)" fill="#E35737">
                                <g id="Paging" transform="translate(102.000000, 731.000000)">
                                    <polygon id="Path-2" transform="translate(112.500000, 8.500000) scale(-1, 1) rotate(-90.000000) translate(-112.500000, -8.500000) " points="120 13 112.4848 4 105 13"></polygon>
                                </g>
                            </g>
                        </g>
                    </svg>
                    <span>Back</span>
                </button>
                <h2>
                    <span>${bon.title}</span>
                </h2>
                <div class="view-details-images-container">
                    ${mobileImagesHTML}
                </div>
                <p>${bon.description}</p>
                <div class="view-details-add-to-box-container">
                    <button data-bon-index="${bon.id}" class="bon-add-to-box-button">Add to Box</button>
                    <span>$3 each</span>
                </div>
                <div class="view-details-allergies">
                    <label for="mobile-view-details-allergies"><strong>Allergies</strong></label>
                    <input id="mobile-view-details-allergies" type="checkbox" style="display: none">
                    <span class="view-details-allergies--plus">+</span>
                    <p>${bon.allergies}</p>
                </div>
                <div class="mobile-view-details-buttons-container">
                    ${mobileLeftButton}
                    ${mobileRightButton}
                </div>
            `;

            $mobileDetailContainer.querySelector('div').innerHTML = mobileHtml;
        }
    }

    // BIND EVENTS

    // We listen for the filters change event
    document
        .querySelector('.main .builder')
        .addEventListener('builder-selected-filter', event => {
            if (event.detail) {
                appliedFilter = event.detail;

                showGrid();
            }
        }, true);

    return {
        showGrid,
        createBonsGrid,
        showDetailsFor,
        moveCarrousel,
    };
}
