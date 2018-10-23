import PageManager from './page-manager';
import Instafeed from './custom/instafeed';

const IMAGES_REXEP = /\.(jpg|png|gif)/i;

/**
 * We look for all images inside the features section and try to find the shorter one
 * BigCommerce replace all images with an SVG, so we test we have an image loaded before trying to calculate the minimum height
 */
function setImagesHeight() {
    const $images = Array.from(document.querySelector('.productGrid').querySelectorAll('.card-image'));

    if ($images.every($img => IMAGES_REXEP.test($img.src) && $img.complete)) {
        const minimumHeight = $images
            .reduce((prevHeight, $currentImg) => {
                const currentHeight = $currentImg.getBoundingClientRect().height;
                return currentHeight > prevHeight ? prevHeight : currentHeight;
            }, 2000);

        /* eslint no-return-assign: off, no-param-reassign: off */
        $images.forEach($img => $img.style.height = `${minimumHeight}px`);
    } else {
        setTimeout(setImagesHeight, 10);
    }
}

export default class Home extends PageManager {
    loaded(next) {
        const feed = new Instafeed({
            get: 'user',
            userId: '1081179426',    // Bon Bon Bon user ID
            accessToken: '1081179426.edf0822.cba1aff277cf4e28ab56da76876ad6de', // From instagram sandbox
            limit: 4,
            resolution: 'standard_resolution',
            after: () => Array.from(document.querySelectorAll('#instafeed > a')).forEach($link => $link.setAttribute('target', '_blank')),
        });

        feed.run();

        setImagesHeight();
        next();
    }
}
