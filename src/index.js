import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

Notiflix.Notify.init({
    width: '500px',
    position: 'right-top',
    fontSize: '20px',
})

let gallery = new SimpleLightbox('.gallery a');

const searchForm = document.querySelector(".search-form");
const input = document.querySelector("input[name='searchQuery']");
const galleryDiv = document.querySelector(".gallery");
const btnLoadMore = document.querySelector(".load-more");

let pageNumber = 1;
let pictureName;
let pageMax;

searchForm.addEventListener("submit", searchPicture);
btnLoadMore.addEventListener("click", loadMore);

function searchPicture(evt) {
    evt.preventDefault();

    pictureName = input.value.trim();
    if (!pictureName) {
    return
    }

    btnLoadMore.classList.add("is-hidden");
    
    clearMarkup();
    pageNumber = 1;
    
    fetchpicture(pictureName)
        .then(pictures => {
            pageMax = Math.ceil(pictures.totalHits / 40);
            Notiflix.Notify.success(`Hooray! We found ${pictures.totalHits} images.`);
            galleryDiv.innerHTML = createMarkup(pictures);
            gallery.refresh();
        })
        .catch(() => createErrorMessage());
}


function clearMarkup() {
    galleryDiv.innerHTML = "";
}

function fetchpicture(name) {
    const BASE_URL = "https://pixabay.com/api"


        return fetch(`${BASE_URL}/?key=32768630-4c1c0e7ab0d8fff90c0efa0bc&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${pageNumber}`)
    .then(response => {
        if (!response.ok) {
        throw new Error(response.statusText);
        }
        return response.json();
    })
}

function createMarkup(data) {
    if (data.totalHits < 1) {
        createErrorMessage()
    } else {
        btnLoadMore.classList.remove("is-hidden");
        return data.hits.map((card) => {
            return `<div class="photo-card">
                    <a href="${card.largeImageURL}"><img src="${card.webformatURL}" alt="${card.tags}" loading="lazy" class="photo-img"/></a>
                    <div class="info">
                    <p class="info-item">
                    <b>Likes</b>${card.likes}
                    </p>
                    <p class="info-item">
                    <b>Views</b>${card.views}
                    </p>
                    <p class="info-item">
                    <b>Comments</b>${card.comments}
                    </p>
                    <p class="info-item">
                    <b>Downloads</b>${card.downloads}
                    </p>
                    </div>
                    </div>`}).join(``)
    }
}

function createErrorMessage() {
    Notiflix.Notify.failure(`Sorry, there are no images matching your search query. Please try again.`);
}

function loadMore() {
    pageNumber += 1;

    fetchpicture(pictureName)
        .then(pictures => {
            galleryDiv.insertAdjacentHTML('beforeend', createMarkup(pictures));
            gallery.refresh();
            smoothScroll();
        })
        .then(() => {
            if (pageNumber === pageMax) {
                btnLoadMore.classList.add("is-hidden");
                Notiflix.Notify.warning(`We're sorry, but you've reached the end of search results.`);
            }
        })
        .catch(() => createErrorMessage());
}

function smoothScroll() {
    const { height: cardHeight } = document
    .querySelector(".gallery")
    .firstElementChild.getBoundingClientRect();

    window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
    });
}
