const HarleyFlix = {
  config: {
    API_KEY: 'bea92ea47a50fb9e1cd25ca8443c5718',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/original/',
    API_BASE_URL: 'https://api.themoviedb.org/3',
    ADSTERRA_URL: 'https://www.revenuecpmgate.com/nrmw6hswh7?key=cab87f7f10cb11cbed7a223557a84eee',
    ADSTERRA_URL_2: 'https://www.revenuecpmgate.com/i5i2bt4dhr?key=a8460bd41796b470bcf623817f395254',
  },
  servers: [],
  requests: {},
  els: {},
  currentMedia: {},

  init() {
    this.setupServers();
    this.setupRequests();
    this.cacheDOMElements();
    this.addEventListeners();
    this.loadInitialContent();
  },

  setupRequests() {
    const { API_KEY } = this.config;
    this.requests = {
      fetchNetflixOriginals: `/discover/tv?api_key=${API_KEY}&with_networks=213`,
      fetchTrending: `/trending/all/week?api_key=${API_KEY}&language=en-US`,
      fetchTopRated: `/movie/top_rated?api_key=${API_KEY}&language=en-US`,
      fetchActionMovies: `/discover/movie?api_key=${API_KEY}&with_genres=28`,
      fetchComedyMovies: `/discover/movie?api_key=${API_KEY}&with_genres=35`,
      fetchHorrorMovies: `/discover/movie?api_key=${API_KEY}&with_genres=27`,
      fetchRomanceMovies: `/discover/movie?api_key=${API_KEY}&with_genres=10749`,
      fetchSciFiMovies: `/discover/movie?api_key=${API_KEY}&with_genres=878`,
      fetchThrillerMovies: `/discover/movie?api_key=${API_KEY}&with_genres=53`,
      fetchAnimationMovies: `/discover/movie?api_key=${API_KEY}&with_genres=16`,
      fetchAnime: `/discover/tv?api_key=${API_KEY}&with_genres=16&with_keywords=210024`,
      fetchTvShows: `/discover/tv?api_key=${API_KEY}&language=en-US`,
      fetchDocumentaries: `/discover/movie?api_key=${API_KEY}&with_genres=99`,
    };
  },

  setupServers() {
    this.servers = [
      { 
        name: "VidSrc", 
        icon: "🎬",
        getUrl: (details, isTV, s, e) => isTV 
          ? `https://vidsrc.cc/v2/embed/tv/${details.id}/${s}/${e}` 
          : `https://vidsrc.cc/v2/embed/movie/${details.id}`
      },
      { 
        name: "Player4u", 
        icon: "🟢",
        getUrl: (details, isTV, s, e) => {
          const title = encodeURIComponent(details.title || details.name);
          if (isTV) {
            return `https://player4u.xyz/embed?key=${title}&s=${s}&e=${e}`;
          }
          return `https://player4u.xyz/embed?key=${title}`;
        }
      },
      { 
        name: "SuperEmbed", 
        icon: "⚡",
        getUrl: (details, isTV, s, e) => isTV 
          ? `https://multiembed.mov/directstream.php?video_id=${details.id}&s=${s}&e=${e}`
          : `https://multiembed.mov/directstream.php?video_id=${details.id}`
      },
      { 
        name: "2Embed", 
        icon: "⭐",
        getUrl: (details, isTV, s, e) => isTV 
            ? `https://www.2embed.cc/embedtv/${details.id}&s=${s}&e=${e}`
            : `https://www.2embed.cc/embed/${details.id}`
      },
       { 
        name: "MultiEmbed", 
        icon: "📺",
        getUrl: (details, isTV, s, e) => isTV
          ? `https://multiembed.mov/?video_id=${details.id}&s=${s}&e=${e}`
          : `https://multiembed.mov/?video_id=${details.id}&tmdb=1`
      },
    ];
  },
  
  cacheDOMElements() {
    this.els = {
      navbar: document.getElementById('navbar'),
      banner: document.getElementById('banner'),
      bannerTitle: document.getElementById('banner-title'),
      bannerDescription: document.getElementById('banner-description'),
      bannerPlayBtn: document.getElementById('banner-play-btn'),
      bannerInfoBtn: document.getElementById('banner-info-btn'),
      movieRowsContainer: document.getElementById('movie-rows'),
      modalOverlay: document.getElementById('modal-overlay'),
      modalCloseBtn: document.getElementById('modal-close-btn'),
      movieIframe: document.getElementById('movieIframe'),
      watchOptionsContainer: document.getElementById('watch-options-container'),
      movieTitle: document.getElementById("movieTitle"),
      movieOverview: document.getElementById("movieOverview"),
      modalPoster: document.getElementById("modalPoster"),
      modalRating: document.getElementById("modalRating"),
      noVideoMessage: document.getElementById("no-video-message"),
      loadingOverlay: document.getElementById("loadingOverlay"),
      videoErrorMsg: document.getElementById("videoErrorMsg"),
      searchInput: document.getElementById('search-input'),
      searchFilter: document.getElementById('search-filter'),
    };
  },

  addEventListeners() {
    this.els.modalCloseBtn.addEventListener("click", () => this.closeModal());
    window.addEventListener('scroll', () => {
      this.els.navbar.style.backgroundColor = window.scrollY > 100 ? '#141414' : 'transparent';
    });
    const debouncedSearch = this.debounce(() => this.handleSearch(), 500);
    this.els.searchInput.addEventListener('keyup', debouncedSearch);
    this.els.searchFilter.addEventListener('change', () => this.handleSearch());
  },

  async loadInitialContent() {
    await this.setupBanner();
    this.loadAllRows();
  },

  async fetchData(endpoint) {
    try {
      const response = await fetch(`${this.config.API_BASE_URL}${endpoint}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return (await response.json()).results;
    } catch (error) { console.error("Error fetching data:", error); return []; }
  },

  async fetchMediaDetails(id, type) {
    try {
      const append = type === 'tv' ? '&append_to_response=content_ratings,season/1,season/2,season/3,season/4,season/5,season/6,season/7,season/8,season/9,season/10' : '';
      const url = `${this.config.API_BASE_URL}/${type}/${id}?api_key=${this.config.API_KEY}${append}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch details');
      return await response.json();
    } catch (error) { console.error("Error fetching media details:", error); return null; }
  },

  async handleSearch() {
    const query = this.els.searchInput.value;
    if (query && query.trim() !== '') {
        const filter = this.els.searchFilter.value;
        const results = await this.fetchData(`/search/${filter}?api_key=${this.config.API_KEY}&query=${encodeURIComponent(query)}`);
        this.els.banner.style.display = 'none';
        this.els.movieRowsContainer.innerHTML = '';
        if (results && results.length > 0) {
            this.createMovieRow('Search Results', results, false);
        } else {
            this.els.movieRowsContainer.innerHTML = '<h2 class="text-xl font-bold p-10">No results found.</h2>';
        }
    } else {
        this.els.banner.style.display = 'block';
        this.loadAllRows();
    }
  },

  async setupBanner() {
    const bannerMovies = await this.fetchData(this.requests.fetchNetflixOriginals);
    if (!bannerMovies || bannerMovies.length === 0) return;
    const bannerMovie = bannerMovies[Math.floor(Math.random() * bannerMovies.length)];
    if (bannerMovie) {
      this.els.banner.style.backgroundImage = `url('${this.config.IMAGE_BASE_URL}${bannerMovie.backdrop_path}')`;
      this.els.bannerTitle.textContent = bannerMovie.name || bannerMovie.title;
      this.els.bannerDescription.textContent = bannerMovie.overview;
      const showBannerModal = async () => {
        window.open(this.config.ADSTERRA_URL, '_blank');
        window.open(this.config.ADSTERRA_URL_2, '_blank');
        const details = await this.fetchMediaDetails(bannerMovie.id, 'tv');
        if (details) this.openModal(details);
      };
      this.els.bannerPlayBtn.addEventListener('click', showBannerModal);
      this.els.bannerInfoBtn.addEventListener('click', showBannerModal);
    }
  },

  loadAllRows() {
    this.els.movieRowsContainer.innerHTML = '';
    const allRows = [
      { title: "HarleyFlix Originals", endpoint: this.requests.fetchNetflixOriginals, isLarge: true },
      { title: "Trending Now", endpoint: this.requests.fetchTrending },
      { title: "Top Rated", endpoint: this.requests.fetchTopRated },
      { title: "Anime Series", endpoint: this.requests.fetchAnime },
      { title: "TV Shows", endpoint: this.requests.fetchTvShows },
      { title: "Action Movies", endpoint: this.requests.fetchActionMovies },
      { title: "Comedy Movies", endpoint: this.requests.fetchComedyMovies },
      { title: "Horror Movies", endpoint: this.requests.fetchHorrorMovies },
      { title: "Documentaries", endpoint: this.requests.fetchDocumentaries },
    ];
    allRows.forEach(async (rowConfig, index) => {
        const movies = await this.fetchData(rowConfig.endpoint);
        if (movies && movies.length > 0) this.createMovieRow(rowConfig.title, movies, rowConfig.isLarge, index * 100);
    });
  },

  createMovieRow(title, movies, isLargeRow = false, animationDelay = 0) {
    const row = document.createElement('div');
    row.className = 'my-8 row-item';
    row.style.animationDelay = `${animationDelay}ms`;

    const rowTitle = document.createElement('h2');
    rowTitle.className = 'text-xl md:text-2xl font-bold mb-2 px-2 md:px-10';
    rowTitle.textContent = title;
    row.appendChild(rowTitle);
    const rowContainer = document.createElement('div');
    rowContainer.className = 'relative row-container';
    row.appendChild(rowContainer);
    const postersContainer = document.createElement('div');
    postersContainer.className = 'flex overflow-y-hidden overflow-x-scroll p-2 -ml-2 scrollbar-hide px-2 md:px-10';
    rowContainer.appendChild(postersContainer);
    movies.forEach(movie => {
      if (!movie.poster_path || !movie.backdrop_path || !movie.id) return;
      const poster = document.createElement('img');
      poster.src = `${this.config.IMAGE_BASE_URL}${isLargeRow ? movie.poster_path : movie.backdrop_path}`;
      poster.alt = movie.name || movie.title;
      poster.loading = 'lazy';
      poster.dataset.mediaId = movie.id;
      poster.dataset.mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
      poster.className = `object-contain transition-transform duration-300 hover:scale-105 cursor-pointer ${isLargeRow ? 'max-h-60' : 'max-h-28'} mr-3 rounded`;
      poster.addEventListener('click', (e) => this.handlePosterClick(e));
      postersContainer.appendChild(poster);
    });
    this.addScrollArrows(rowContainer, postersContainer);
    this.els.movieRowsContainer.appendChild(row);
  },

  addScrollArrows(container, scrollableElement) {
    const leftArrow = document.createElement('button');
    leftArrow.className = 'scroll-arrow left';
    leftArrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>';
    leftArrow.addEventListener('click', () => scrollableElement.scrollBy({ left: -window.innerWidth * 0.8, behavior: 'smooth' }));
    container.appendChild(leftArrow);

    const rightArrow = document.createElement('button');
    rightArrow.className = 'scroll-arrow right';
    rightArrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>';
    rightArrow.addEventListener('click', () => scrollableElement.scrollBy({ left: window.innerWidth * 0.8, behavior: 'smooth' }));
    container.appendChild(rightArrow);
  },

  async handlePosterClick(event) {
    window.open(this.config.ADSTERRA_URL, '_blank');
    window.open(this.config.ADSTERRA_URL_2, '_blank');
    const { mediaId, mediaType } = event.target.dataset;
    if (!mediaId || !mediaType) return;
    const details = await this.fetchMediaDetails(mediaId, mediaType);
    if (details) this.openModal(details);
  },
  
  openModal(details) {
    this.currentMedia.details = details;
    this.resetModalState();
    this.els.movieTitle.textContent = details.name || details.title;
    this.els.movieOverview.textContent = details.overview || "";
    this.els.modalPoster.src = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : "";
    const rating = details.vote_average ? `⭐ ${details.vote_average.toFixed(1)}` : "N/A";
    this.els.modalRating.textContent = rating;
    if (details.seasons) this.renderTVOptions(details);
    else this.renderMovieOptions(details);
    this.els.modalOverlay.style.display = "flex";
  },

  closeModal() {
    this.els.modalOverlay.style.display = "none";
    this.resetModalState();
  },

  resetModalState() {
    this.els.movieIframe.src = 'about:blank';
    this.els.movieIframe.classList.add("hidden");
    this.els.noVideoMessage.classList.remove("hidden");
    this.els.loadingOverlay.classList.add("hidden");
    this.els.videoErrorMsg.classList.add("hidden");
    this.els.watchOptionsContainer.innerHTML = "";
  },

  renderMovieOptions(details) {
    const serverContainer = document.createElement('div');
    serverContainer.className = 'button-container';
    this.els.watchOptionsContainer.appendChild(serverContainer);
    this.renderEpisodeServers(details, false, null, null, serverContainer);
  },

  renderTVOptions(details) {
    const container = this.els.watchOptionsContainer;
    const seasonsContainer = document.createElement('div');
    seasonsContainer.className = 'button-container';
    container.appendChild(seasonsContainer);
    const episodesContainer = document.createElement('div');
    episodesContainer.id = 'episodes-container';
    episodesContainer.className = 'button-container';
    container.appendChild(episodesContainer);
    const serverContainer = document.createElement('div');
    serverContainer.id = 'server-container';
    serverContainer.className = 'button-container';
    container.appendChild(serverContainer);

    const loadEpisodes = (seasonNumber) => {
      Array.from(seasonsContainer.children).forEach(btn => btn.classList.remove('active'));
      seasonsContainer.querySelector(`[data-season='${seasonNumber}']`).classList.add('active');
      const seasonKey = `season/${seasonNumber}`;
      const seasonDetails = details[seasonKey];
      episodesContainer.innerHTML = '';
      serverContainer.innerHTML = '';
      if (!seasonDetails || !seasonDetails.episodes) {
        episodesContainer.innerHTML = '<p class="text-sm text-zinc-400">Could not load episodes.</p>';
        return;
      }
      seasonDetails.episodes.forEach(episode => {
          const episodeBtn = document.createElement('button');
          episodeBtn.className = 'btn btn-episode';
          episodeBtn.textContent = `E${episode.episode_number}`;
          episodeBtn.dataset.episode = episode.episode_number;
          episodeBtn.onclick = () => {
              this.currentMedia.season = seasonNumber;
              this.currentMedia.episode = episode.episode_number;
              this.renderEpisodeServers(details, true, seasonNumber, episode.episode_number, serverContainer);
              Array.from(episodesContainer.children).forEach(child => child.classList.remove('active'));
              episodeBtn.classList.add('active');
          };
          episodesContainer.appendChild(episodeBtn);
      });
    };

    details.seasons.filter(s => s.season_number > 0 && s.episode_count > 0).forEach(season => {
        const seasonBtn = document.createElement('button');
        seasonBtn.className = 'btn btn-season';
        seasonBtn.textContent = `Season ${season.season_number}`;
        seasonBtn.dataset.season = season.season_number;
        seasonBtn.onclick = () => loadEpisodes(season.season_number);
        seasonsContainer.appendChild(seasonBtn);
    });
    
    const initialSeason = details.seasons.find(s => s.season_number > 0);
    if (initialSeason) loadEpisodes(initialSeason.season_number);
  },

  renderEpisodeServers(details, isTV, season, episode, container) {
    const serverContainer = container || document.getElementById('server-container');
    serverContainer.innerHTML = '';
    this.servers.forEach((server, index) => {
        const serverBtn = document.createElement("button");
        serverBtn.textContent = `Server ${index + 1}`;
        serverBtn.className = "btn btn-server";
        serverBtn.onclick = () => {
            const url = server.getUrl(details, isTV, season, episode);
            this.showIframeWithLoading(url);
        };
        serverContainer.appendChild(serverBtn);
    });
  },

  showIframeWithLoading(url) {
    this.els.loadingOverlay.classList.remove("hidden");
    this.els.movieIframe.classList.remove("hidden");
    this.els.videoErrorMsg.classList.add("hidden");
    this.els.noVideoMessage.classList.add("hidden");
    this.els.movieIframe.src = url;
    this.els.movieIframe.onload = () => this.els.loadingOverlay.classList.add("hidden");
    this.els.movieIframe.onerror = () => {
      this.els.loadingOverlay.classList.add("hidden");
      this.els.movieIframe.classList.add("hidden");
      this.els.videoErrorMsg.textContent = "Video failed to load. Try another server.";
      this.els.videoErrorMsg.classList.remove("hidden");
    };
  },

  getRatingClass(vote) {
    if (vote >= 8) return "bg-green-600";
    if (vote >= 5) return "bg-yellow-600";
    return "bg-red-600";
  },
  debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
  },
};

// Initialize the application
HarleyFlix.init();