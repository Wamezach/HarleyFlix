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
    this.handleDevOverlay();
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
      body: document.body,
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
      modalYear: document.getElementById("modalYear"),
      modalDuration: document.getElementById("modalDuration"),
      modalDetailsList: document.getElementById("modal-details-list"),
      noVideoMessage: document.getElementById("no-video-message"),
      loadingOverlay: document.getElementById("loadingOverlay"),
      videoErrorMsg: document.getElementById("videoErrorMsg"),
      searchInput: document.getElementById('search-input'),
      searchFilter: document.getElementById('search-filter'),
      shareContainer: document.getElementById('share-container'),
      searchResultsDropdown: document.getElementById('search-results-dropdown'),
      searchOverlay: document.getElementById('search-overlay'),
      modalTrendingSection: document.getElementById('modal-trending-section'),
      devOverlay: document.getElementById('dev-overlay'),
      devCloseBtn: document.getElementById('dev-close-btn'),
      dontShowAgainCheckbox: document.getElementById('dont-show-again-checkbox'),
    };
  },

  addEventListeners() {
    this.els.modalCloseBtn.addEventListener("click", () => this.closeModal());
    this.els.devCloseBtn.addEventListener('click', () => {
        if (this.els.dontShowAgainCheckbox.checked) {
            localStorage.setItem('hideDevOverlay', 'true');
        }
        this.els.devOverlay.style.display = 'none';
    });
    window.addEventListener('scroll', () => {
      this.els.navbar.style.backgroundColor = window.scrollY > 100 ? '#141414' : 'transparent';
    });
    
    const debouncedSearch = this.debounce(() => this.handleSearch(), 300);
    this.els.searchInput.addEventListener('input', debouncedSearch);

    this.els.searchInput.addEventListener('search', () => {
        if (!this.els.searchInput.value) {
            this.clearSearch();
        }
    });

    this.els.searchFilter.addEventListener('change', () => this.handleSearch());

    document.addEventListener('click', (e) => {
        if (!this.els.searchInput.contains(e.target)) {
            this.els.searchResultsDropdown.style.display = 'none';
        }
    });
  },

  handleDevOverlay() {
    if (localStorage.getItem('hideDevOverlay') !== 'true') {
        this.els.devOverlay.style.display = 'flex';
    }
  },

  clearSearch() {
    this.els.searchInput.value = '';
    this.els.searchResultsDropdown.style.display = 'none';
    this.els.searchOverlay.classList.remove('active');
    this.els.body.classList.remove('search-active');
  },

  isMobile() {
    return window.innerWidth <= 768;
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
      const append = 'append_to_response=credits,content_ratings' + (type === 'tv' ? ',season/1,season/2,season/3,season/4,season/5,season/6,season/7,season/8,season/9,season/10' : '');
      const url = `${this.config.API_BASE_URL}/${type}/${id}?api_key=${this.config.API_KEY}&${append}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch details');
      const details = await response.json();
      details.media_type = type; // Ensure media_type is set
      return details;
    } catch (error) { console.error("Error fetching media details:", error); return null; }
  },

  async handleSearch() {
    const query = this.els.searchInput.value;
    
    if (!query || query.trim() === '') {
      this.clearSearch();
      return;
    }

    const filter = this.els.searchFilter.value;
    const results = await this.fetchData(`/search/${filter}?api_key=${this.config.API_KEY}&query=${encodeURIComponent(query)}`);
    
    const isMobile = this.isMobile();
    const resultsContainer = isMobile ? this.els.searchOverlay : this.els.searchResultsDropdown;
    resultsContainer.innerHTML = '';

    if (results && results.length > 0) {
      this.els.body.classList.add('search-active');
      resultsContainer.style.display = 'block';

      const items = results.slice(0, 15).map(result => {
        if (!result.poster_path) return null;
        const item = document.createElement('div');
        item.className = 'search-result-item';

        const mediaType = result.media_type || (result.first_air_date ? 'tv' : 'movie');
        
        item.addEventListener('click', async () => {
          const details = await this.fetchMediaDetails(result.id, mediaType);
          if (details) this.openModal(details);
          this.clearSearch();
        });

        const poster = document.createElement('img');
        poster.src = `https://image.tmdb.org/t/p/w92${result.poster_path}`;
        
        const info = document.createElement('div');
        const title = document.createElement('span');
        title.textContent = result.title || result.name;
        title.className = 'font-semibold';
        
        const year = document.createElement('span');
        const releaseDate = result.release_date || result.first_air_date;
        year.textContent = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
        year.className = 'text-sm text-zinc-400 ml-2';

        info.appendChild(title);
        info.appendChild(year);
        item.appendChild(poster);
        item.appendChild(info);
        return item;
      }).filter(Boolean);

      if (isMobile) {
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-2 xs:grid-cols-3 gap-4';
        items.forEach(item => grid.appendChild(item));
        resultsContainer.appendChild(grid);
      } else {
        items.forEach(item => resultsContainer.appendChild(item));
      }

    } else {
      this.clearSearch();
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

  async loadAllRows() {
    this.els.movieRowsContainer.innerHTML = '';
    const allRows = [
      { title: "Trending Now", endpoint: this.requests.fetchTrending, isLarge: true },
      { title: "HarleyFlix Originals", endpoint: this.requests.fetchNetflixOriginals, isLarge: true },
      { title: "Top Rated", endpoint: this.requests.fetchTopRated },
      { title: "Anime Series", endpoint: this.requests.fetchAnime },
      { title: "TV Shows", endpoint: this.requests.fetchTvShows },
      { title: "Action Movies", endpoint: this.requests.fetchActionMovies },
      { title: "Comedy Movies", endpoint: this.requests.fetchComedyMovies },
      { title: "Horror Movies", endpoint: this.requests.fetchHorrorMovies },
      { title: "Documentaries", endpoint: this.requests.fetchDocumentaries },
    ];
  
    let animationDelay = 0;
    for (const rowConfig of allRows) {
      const movies = await this.fetchData(rowConfig.endpoint);
      if (movies && movies.length > 0) {
        await this.createMovieRow(rowConfig.title, movies, rowConfig.isLarge, animationDelay);
        animationDelay += 100;
      }
    }
  },

  async createMovieRow(title, movies, isLargeRow = false, animationDelay = 0, parent = null, isOverlay = false) {
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

    for (const [idx, movie] of movies.entries()) {
      if (!movie.poster_path || !movie.backdrop_path || !movie.id) continue;
      
      const posterContainer = document.createElement('div');
      posterContainer.className = `poster-container ${isLargeRow ? 'large' : ''}`;
      
      const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
      posterContainer.dataset.mediaId = movie.id;
      posterContainer.dataset.mediaType = mediaType;
      
      posterContainer.style.opacity = "0";
      posterContainer.style.transform = "scale(0.95)";
      setTimeout(() => {
        posterContainer.style.transition = "opacity 0.4s, transform 0.4s";
        posterContainer.style.opacity = "1";
        posterContainer.style.transform = "scale(1)";
      }, 80 * idx);

      posterContainer.addEventListener('click', (e) => this.handlePosterClick(e));

      const posterWrapper = document.createElement('div');
      posterWrapper.className = 'poster-wrapper';

      const poster = document.createElement('img');
      poster.src = `${this.config.IMAGE_BASE_URL}${isLargeRow ? movie.poster_path : movie.backdrop_path}`;
      poster.alt = movie.name || movie.title;
      poster.loading = 'lazy';
      poster.className = 'object-cover w-full h-full';
      
      const hdBadge = document.createElement('div');
      hdBadge.className = 'poster-badge hd-badge';
      hdBadge.textContent = 'HD';

      const yearBadge = document.createElement('div');
      yearBadge.className = 'poster-badge year-badge';

      let releaseDate;
      if (mediaType === 'tv') {
        const details = await this.fetchMediaDetails(movie.id, 'tv');
        releaseDate = details ? details.last_air_date || details.first_air_date : movie.first_air_date;
      } else {
        releaseDate = movie.release_date;
      }
      yearBadge.textContent = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';

      const posterTitle = document.createElement('h3');
      posterTitle.className = 'poster-title';
      posterTitle.textContent = movie.title || movie.name;

      posterWrapper.appendChild(poster);
      posterWrapper.appendChild(hdBadge);
      posterWrapper.appendChild(yearBadge);
      posterContainer.appendChild(posterWrapper);
      posterContainer.appendChild(posterTitle);
      postersContainer.appendChild(posterContainer);
    }

    this.addScrollArrows(rowContainer, postersContainer);
    if (parent) parent.appendChild(row);
    else this.els.movieRowsContainer.appendChild(row);
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
    const target = event.currentTarget;
    const { mediaId, mediaType } = target.dataset;
    if (!mediaId || !mediaType) return;
    const details = await this.fetchMediaDetails(mediaId, mediaType);
    if (details) this.openModal(details);
  },
  
  async openModal(details) {
    this.currentMedia.details = details;
    this.resetModalState();
  
    this.els.movieTitle.textContent = details.name || details.title;
    this.els.movieOverview.textContent = details.overview || "";
    this.els.modalPoster.src = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : "";
    this.els.modalRating.textContent = details.vote_average ? `⭐ ${details.vote_average.toFixed(1)}` : "N/A";
  
    const releaseDate = details.media_type === 'tv'
      ? details.last_air_date || details.first_air_date
      : details.release_date;
    this.els.modalYear.textContent = releaseDate ? new Date(releaseDate).getFullYear() : '';
  
    const runtime = details.runtime || (details.episode_run_time && details.episode_run_time.length > 0 ? details.episode_run_time[0] : null);
    this.els.modalDuration.textContent = runtime ? `${runtime} min` : '';
  
    this.renderDetailsList(details);
  
    if (details.seasons) this.renderTVOptions(details);
    else this.renderMovieOptions(details);
  
    this.renderShareButtons(details);
    await this.renderModalTrending();
    this.els.modalOverlay.style.display = "flex";
  },
  
  async renderModalTrending() {
    const section = this.els.modalTrendingSection;
    if (!section) return;
    section.innerHTML = '';
    
    const movies = await this.fetchData(this.requests.fetchTrending);
    if (!movies || movies.length === 0) return;

    const title = document.createElement('h3');
    title.className = 'text-lg font-bold mb-2';
    title.textContent = 'Trending Now';
    section.appendChild(title);

    const rowContainer = document.createElement('div');
    rowContainer.className = 'relative row-container';
    
    const postersContainer = document.createElement('div');
    postersContainer.className = 'flex overflow-y-hidden overflow-x-scroll p-2 -ml-2 scrollbar-hide';
    rowContainer.appendChild(postersContainer);

    movies.forEach(movie => {
        if (!movie.poster_path) return;
        const posterContainer = document.createElement('div');
        posterContainer.className = 'poster-container small';
        
        const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
        posterContainer.dataset.mediaId = movie.id;
        posterContainer.dataset.mediaType = mediaType;

        posterContainer.addEventListener('click', async (e) => {
            this.closeModal();
            setTimeout(() => this.handlePosterClick(e), 300);
        });

        const posterWrapper = document.createElement('div');
        posterWrapper.className = 'poster-wrapper';
        
        const poster = document.createElement('img');
        poster.src = `${this.config.IMAGE_BASE_URL}${movie.poster_path}`;
        poster.alt = movie.name || movie.title;
        poster.loading = 'lazy';
        poster.className = 'object-cover w-full h-full';

        posterWrapper.appendChild(poster);
        posterContainer.appendChild(posterWrapper);
        postersContainer.appendChild(posterContainer);
    });

    this.addScrollArrows(rowContainer, postersContainer);
    section.appendChild(rowContainer);
  },

  renderDetailsList(details) {
    const dl = this.els.modalDetailsList;
    dl.innerHTML = '';
    const items = {
        "Country": details.production_countries?.map(c => c.name).join(', '),
        "Genre": details.genres?.map(g => g.name).join(', '),
        "Casts": details.credits?.cast.slice(0, 5).map(c => c.name).join(', '),
    };
    for (const [term, description] of Object.entries(items)) {
        if (description) {
            const dt = document.createElement('dt');
            dt.textContent = term;
            const dd = document.createElement('dd');
            dd.textContent = description;
            const item = document.createElement('div');
            item.className = 'detail-item';
            item.append(dt, dd);
            dl.appendChild(item);
        }
    }
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
    this.els.modalDetailsList.innerHTML = "";
    this.els.shareContainer.innerHTML = "";
    this.els.modalTrendingSection.innerHTML = "";
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
      // Auto-select first episode
      if(episodesContainer.firstChild) episodesContainer.firstChild.click();
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
            Array.from(serverContainer.children).forEach(child => child.classList.remove('active'));
            serverBtn.classList.add('active');
            const url = server.getUrl(details, isTV, season, episode);
            this.showIframeWithLoading(url);
        };
        serverContainer.appendChild(serverBtn);
    });

    if (serverContainer.firstChild) {
      serverContainer.firstChild.click();
    }
  },

  renderShareButtons(details) {
    const container = this.els.shareContainer;
    container.innerHTML = '';
    const title = details.name || details.title;
    const shareUrl = window.location.href;
    const shareText = `Hey! I'm watching ${title} on HarleyFlix. You should check it out too! Hahaha!`;

    const shareTitle = document.createElement('h3');
    shareTitle.className = 'text-base font-semibold text-zinc-300 mb-3';
    shareTitle.textContent = 'Share with friends';
    container.appendChild(shareTitle);

    // Use Web Share API if available (on mobile)
    if (navigator.share) {
        const shareButton = document.createElement('button');
        shareButton.className = 'w-full bg-red-600 text-white font-bold rounded px-4 py-2 hover:bg-red-700 transition flex items-center justify-center gap-2';
        shareButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg> Share`;
        shareButton.addEventListener('click', async () => {
            try {
                await navigator.share({
                    title: title,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err) {
                console.error("Share failed:", err);
            }
        });
        container.appendChild(shareButton);
    } else {
        // Fallback for desktop browsers
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex items-center gap-3';
        container.appendChild(buttonContainer);
        
        const platforms = [
          { name: 'Facebook', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#1877F2" viewBox="0 0 16 16"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0 0 3.603 0 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/></svg>', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}` },
          { name: 'Twitter', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/></svg>', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}` },
          { name: 'WhatsApp', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#25D366" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}` },
          { name: 'Copy Link', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/></svg>', action: 'copy' }
        ];

        platforms.forEach(platform => {
            const btn = document.createElement('a');
            btn.className = 'share-btn';
            btn.innerHTML = platform.icon;
            btn.title = `Share on ${platform.name}`;
            
            if (platform.action === 'copy') {
                btn.href = '#';
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/></svg>';
                        setTimeout(() => { btn.innerHTML = platform.icon; }, 2000);
                    });
                });
            } else {
                btn.href = platform.url;
                btn.target = '_blank';
                btn.rel = 'noopener noreferrer';
            }
            buttonContainer.appendChild(btn);
        });
    }
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

  debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
  },
};

HarleyFlix.init();