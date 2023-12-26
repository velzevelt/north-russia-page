function scrollF(button) 
{
    const isScrolling = document.body.scrollTop > 20 || document.documentElement.scrollTop > 20;
    button.style.display = isScrolling ? 'block' : 'none';
}


function toTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}


const scrollButton = document.getElementById('scroll-top-button');
scrollButton.onclick = () => toTop();
window.onscroll = () => scrollF(scrollButton);
