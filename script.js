const API_KEY = '0bd6154f35a592af111b96c9d39aa85c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const moviesGrid = document.getElementById('moviesGrid');
const loading = document.getElementById('loading');

// Genre mapping
let genreMap = {};

// Fetch genre list
async function fetchGenres() {
    try {
        const response = await fetch(
            `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=ko-KR`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch genres');
        }
        
        const data = await response.json();
        // Create a map of genre id to name
        data.genres.forEach(genre => {
            genreMap[genre.id] = genre.name;
        });
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}

// Get genre names from genre IDs
function getGenreNames(genreIds) {
    if (!genreIds || genreIds.length === 0) return '장르 미정';
    return genreIds
        .slice(0, 2) // Show max 2 genres
        .map(id => genreMap[id] || '')
        .filter(name => name)
        .join(' · ') || '장르 미정';
}

// Fetch now playing movies
async function fetchNowPlayingMovies() {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=ko-KR&page=1&region=KR`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch movies');
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
}

// Create movie card element
function createMovieCard(movie, index) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const posterPath = movie.poster_path 
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : null;
    
    const releaseYear = movie.release_date 
        ? new Date(movie.release_date).getFullYear()
        : '미정';
    
    const rating = movie.vote_average 
        ? movie.vote_average.toFixed(1)
        : 'N/A';
    
    const genres = getGenreNames(movie.genre_ids);
    
    card.innerHTML = `
        ${posterPath 
            ? `<img class="movie-poster" src="${posterPath}" alt="${movie.title}" loading="lazy">`
            : `<div class="no-poster">🎬</div>`
        }
        <div class="movie-title-static">${movie.title}</div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-genre">${genres}</div>
            <div class="movie-meta">
                <div class="movie-rating">
                    ⭐ <span>${rating}</span>
                </div>
                <div class="movie-date">${releaseYear}</div>
            </div>
        </div>
    `;
    
    // Add click event for potential future functionality
    card.addEventListener('click', () => {
        console.log('Movie clicked:', movie.title);
        // Could open a modal or navigate to detail page
    });
    
    return card;
}

// Display movies
function displayMovies(movies) {
    loading.classList.add('hidden');
    moviesGrid.innerHTML = '';
    
    if (movies.length === 0) {
        moviesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <p>현재 상영중인 영화를 불러올 수 없습니다.</p>
                <p style="font-size: 0.85rem; margin-top: 0.5rem;">잠시 후 다시 시도해주세요.</p>
            </div>
        `;
        return;
    }
    
    movies.forEach((movie, index) => {
        const card = createMovieCard(movie, index);
        moviesGrid.appendChild(card);
    });
}

// Header scroll effect
function handleScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// Initialize
async function init() {
    window.addEventListener('scroll', handleScroll);
    
    // Fetch genres first, then movies
    await fetchGenres();
    const movies = await fetchNowPlayingMovies();
    displayMovies(movies);
}

// Run on DOM loaded
document.addEventListener('DOMContentLoaded', init);

