/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
export function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

export async function fetchHtml(url) {
    const f = await fetch(url, {headers: { 'Content-Type': 'text/html'}});
    const html = await f.text();
    return html;
}

export function appendAtTop(body, element) {
    body.insertBefore(element, body.firstChild);
}

export function appendAtBottom(body, element) {
    body.appendChild(element);
}
