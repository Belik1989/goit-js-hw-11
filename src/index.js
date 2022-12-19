import Notiflix from 'notiflix';
import 'regenerator-runtime/runtime';
import axios from 'axios';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const searchField = document.querySelector("#search-form");
const input = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-button");
const gallery = document.querySelector(".gallery");
const loadMoreBtn = document.querySelector(".load-more");


// const API_KEY ='32122100-8cc25e477ccf1dfc443f6b4e8';
// const BASE_URL = 'https://pixabay.com/api/';

const DEFAULT_PAGE = 1;
let page = DEFAULT_PAGE;
const perPage = 40;
let searchValue = '';
let simpleLightbox;

const optionsSL = {
    overlayOpacity: 0.5,
    captionsData: "alt",
    captionDelay: 250,
};

searchField.addEventListener('submit', onSubmit);
loadMoreBtn.addEventListener('click',onNextPage)
searchBtn.addEventListener('click', onSubmit);

// дістаємо потрібні нам дані зображень(images) з бази даних API
async function fetchImages(searchValue) {
    const searchParams = new URLSearchParams ({
        key: '32122100-8cc25e477ccf1dfc443f6b4e8',
        q: searchValue,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        per_page: perPage,
        page:page
    });
    const images = await axios.get(`https://pixabay.com/api/?${searchParams}`);
    page += 1;
    return images.data;
};

async function onSubmit(event) {
    event.preventDefault();
    searchValue = input.value.trim();
    if(searchValue === ''){
        clearAll();
        buttonUnHidden();
        Notiflix.Notify.info('You can not search by empty field, try again.');
        return;
    }else{
        try {
            resetPage()
            const result = await fetchImages(searchValue);
            if (result.hits < 1) {
                form.reset();
                clearAll();
                buttonUnHidden();
                Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            } else {
                // form.reset();
                gallery.innerHTML = createImage(result.hits);
                simpleLightbox = new SimpleLightbox(".gallery a", optionsSL).refresh();
                buttonUnHidden();
                Notiflix.Notify.success(`Hooray! We found ${result.totalHits} images.`);
            };
        } catch (error) {
            ifError();
        };
    };
};

function createImage(images) {
    return images.map((image) => `<div class="photo-card">
    <a href="${image.largeImageURL}">
<img src="${image.webformatURL}" alt="${image.tags}" class="gallery-image" loading="lazy" />
</a>
<div class="info">
    <p class="info-item">${image.likes}
    <b>Likes</b>
    </p>
    <p class="info-item">${image.views}
    <b>Views</b>
    </p>
    <p class="info-item">${image.comments}
    <b>Comments</b>
    </p>
    <p class="info-item">${image.downloads}
    <b>Downloads</b>
    </p>
</div>
</div>`).join('');
};

async function onNextPage() {
    simpleLightbox.destroy();
    try {
        const result = await fetchImages(searchValue);
        const totalPages = page * perPage;
            if (result.totalHits <= totalPages) {
                buttonHidden();
                Notiflix.Report.info('Wow', "We're sorry, but you've reached the end of search results.", 'Okay');
            }
        gallery.insertAdjacentHTML('beforeend', createImage(result.hits));
        smoothScroll();
        simpleLightbox = new SimpleLightbox(".gallery a", optionsSL).refresh();
    } catch (error) {
        ifError();
    };
};

function smoothScroll() {
    const { height: cardHeight } =
        document.querySelector(".photo-card").firstElementChild.getBoundingClientRect();
    window.scrollBy({
    top: cardHeight * 3.9,
    behavior: "smooth",
});
};

function ifError() {
    clearAll();
    // buttonHidden();
    Notiflix.Report.info('Oh', 'Something get wrong, please try again', 'Okay');
};

// під час нового пошуку всі дані та номерс торінки будуть очищатись
// до початкового default стану
function resetPage() {
    page = DEFAULT_PAGE;
};

// очистка блоку галереї
function clearAll() {
    gallery.innerHTML = '';
};

function buttonHidden() {
    loadMoreBtn.classList.add("visually-hidden");
};

function buttonUnHidden() {
    loadMoreBtn.classList.remove("visually-hidden");
};