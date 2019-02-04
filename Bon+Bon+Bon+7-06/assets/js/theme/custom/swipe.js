
export default function swipe($element) {
    if (getComputedStyle($element).display === 'none') return;

    let startX = 0;
    let endX = 0;

    const CARD_WIDTH = 228;
    let $boxesCounter = null;
    let $currentBon = null;
    let $totalBon = null;
    let $leftButton = null;
    let $rightButton = null;

    /**
     * We just look for the direction the swipe took place and move one card in that direction
     *
     * @returns {undefined}
     */
    function moveCarrousel() {
        let currentNumber = 0;

        if (!$boxesCounter) {
            $boxesCounter = document.querySelector('.boxes-counter');
            $currentBon = $boxesCounter.querySelector('.boxes-counter-current-bon');
            $totalBon = $boxesCounter.querySelector('.boxes-counter-total-bon');
            $leftButton = $boxesCounter.querySelector('.boxes-counter-left-button');
            $rightButton = $boxesCounter.querySelector('.boxes-counter-right-button');
        }

        let direction = 'none';
        const distance = startX - endX;

        if (distance > 0) direction = 'right';
        else if (distance < 0) direction = 'left';

        if (direction === 'left') {
            currentNumber = parseInt($currentBon.textContent.trim(), 10);

            if (currentNumber === 1) return;

            currentNumber -= 1;
            $currentBon.textContent = currentNumber;

            $rightButton.classList.remove('invisible');

            if (currentNumber === 1) $leftButton.classList.add('invisible');
        } else if (direction === 'right') {
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

        /* eslint no-param-reassign: off */
        $element.style.transform = `translate(-${(currentNumber - 1) * CARD_WIDTH}px)`;
    }

    $element.addEventListener('touchstart', event => {
        startX = event.changedTouches[0].clientX;
    });

    $element.addEventListener('touchend', event => {
        endX = event.changedTouches[0].clientX;

        moveCarrousel();
    });
}
