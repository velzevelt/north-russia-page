async function main() {
    const selfEl = document.currentScript;
    selfEl.done = new Promise((resolve, reject) => {
    });

    const inject = selfEl.getAttribute('inject');
    const injectPos = selfEl.getAttribute('inject-pos');

    if (!Boolean(inject)) {
        console.error('Cannot inject on empty "inject" attribute in script: ' + selfEl);
        return;
    }

    const fetcher = await import('/js/fetch-html.js');
    const html = await fetcher.fetchHtml(inject);
    const el = fetcher.htmlToElement(html);

    switch (injectPos) {
        case 'top':
            fetcher.appendAtTop(document.body, el);
            break;
        case 'bottom':
            fetcher.appendAtBottom(document.body, el);
            break;
        default:
            selfEl.parentNode.insertBefore(el, selfEl);
    }

    selfEl.done = new Promise((resolve, reject) => {resolve()});
}

main();
