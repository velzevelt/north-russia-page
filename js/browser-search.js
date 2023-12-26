const inputs = Array.from(document.querySelectorAll('.search__input'));
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const search = urlParams.get('s');


inputs.forEach(
    i => i.value = search
);


console.log(itemBrowsers);