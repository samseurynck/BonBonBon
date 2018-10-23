export default function stickyHeader() {
    const MIN_WIDTH = 552;  // Mobile width
    const MIN_WIDTH_NAVUSER = 1350;  // on tablet view NavUser is of no use as per the comp

    if (window.screen.width < MIN_WIDTH) return;

    const NAVUSER_IN_THE_MIX = window.screen.width > MIN_WIDTH_NAVUSER;

    const $header = document.querySelector('#menu');
    const $headerDummy = document.querySelector('.navPages--dummy');
    const $navUser = document.querySelector('ul.navUser-section');
    const $fixedLogo = document.querySelector('.navPages-scroll-fixed--logo');
    const $builderBadge = document.querySelector('.box-box-box-builder-button');

    window.scrollTo(0, 0);  // we need this in order to get the exact value in pixels. When using just the top header height, when going into fixed, you can tell something happened
    const headerTop = $header.getBoundingClientRect().top;

    $headerDummy.style.height = `${$header.getBoundingClientRect().height}px`;

    let fixed = false;  // we don't want to wast more calculations if the header is already fixed or not

    window.addEventListener('scroll', () => {
        if (window.scrollY > headerTop) {
            if (fixed) return;

            $headerDummy.style.display = 'block';
            $header.classList.add('menu-scroll-fixed');
            $fixedLogo.classList.add('fixed');

            if (NAVUSER_IN_THE_MIX) $navUser.classList.add('navUser-scroll-fixed');
            if ($builderBadge) $builderBadge.classList.add('badge-scroll-fixed');

            fixed = true;
        } else {
            if (!fixed) return;

            $headerDummy.style.display = 'none';
            $header.classList.remove('menu-scroll-fixed');
            $fixedLogo.classList.remove('fixed');

            if (NAVUSER_IN_THE_MIX) $navUser.classList.remove('navUser-scroll-fixed');
            if ($builderBadge) $builderBadge.classList.remove('badge-scroll-fixed');

            fixed = false;
        }
    });
}
