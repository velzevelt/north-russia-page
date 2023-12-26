function isValidUrl(url) {
    const urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
    return !!urlPattern.test(url);
}

function redirect(url) {
    window.location = url;
}

function addRedirectOn(element, event) {
    const url = element.getAttribute('href');
    element.addEventListener(event, () => redirect(url));
}

function getHrefElementsExclude(exclude) {
    const concatExclude = exclude.join(', ');
    return Array.from(document.body.querySelectorAll(`[href]:not(${concatExclude})`));
}

function isValidHrefElement(element) {
    const url = element.getAttribute('href');
    const res = isValidUrl(url);

    if (!res) {
        console.warn(`Invalid url on element`, element, `href: "${url}"`);
    }

    return res;
}

function main() {
    const hrefNodes = getHrefElementsExclude(['a', 'use']);
    const validHrefNodes = hrefNodes.filter(el => isValidHrefElement(el));
    validHrefNodes.forEach(n => addRedirectOn(n, 'click'));
}

main();
