// Configuración
const POKEMON_PER_PAGE = 20;
let currentPage = 1;
let allPokemon = [];
let filteredPokemon = [];

// Rangos de generaciones
const GENERATION_RANGES = {
    'all': { start: 1, end: 1025 },
    '1': { start: 1, end: 151 },
    '2': { start: 152, end: 251 },
    '3': { start: 252, end: 386 },
    '4': { start: 387, end: 493 },
    '5': { start: 494, end: 649 },
    '6': { start: 650, end: 721 },
    '7': { start: 722, end: 809 },
    '8': { start: 810, end: 905 },
    '9': { start: 906, end: 1025 }
};

// Elementos del DOM
const pokemonContainer = document.getElementById('pokemonContainer');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const typeFilter = document.getElementById('typeFilter');
const generationFilter = document.getElementById('generationFilter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close');
const splashScreen = document.getElementById('splashScreen');
const musicToggle = document.getElementById('musicToggle');
const backgroundMusic = document.getElementById('backgroundMusic');

// Traducciones de estadísticas
const statTranslations = {
    'hp': 'PS',
    'attack': 'Ataque',
    'defense': 'Defensa',
    'special-attack': 'At. Especial',
    'special-defense': 'Def. Especial',
    'speed': 'Velocidad'
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Mostrar splash screen por 3 segundos
    setTimeout(() => {
        splashScreen.classList.remove('active');
    }, 3000);

    loadPokemon();
    setupEventListeners();
    setupMusicControl();
});

// Event Listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    typeFilter.addEventListener('change', handleTypeFilter);
    generationFilter.addEventListener('change', handleGenerationChange);
    prevBtn.addEventListener('click', () => changePage(-1));
    nextBtn.addEventListener('click', () => changePage(1));
    closeModal.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
}

// Control de Música con YouTube IFrame API
let player;
let isMusicPlaying = true;

// Esta función es llamada por la YouTube API cuando está lista
window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('backgroundMusic', {
        height: '0',
        width: '0',
        videoId: 'PROqm2uqKbM',
        playerVars: {
            'autoplay': 1,
            'loop': 1,
            'playlist': 'PROqm2uqKbM',
            'controls': 0,
            'showinfo': 0,
            'rel': 0,
            'modestbranding': 1,
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    // Establecer volumen bajo (30% en lugar de 100%)
    event.target.setVolume(30);
    // Reproducir automáticamente
    event.target.playVideo();
}

function setupMusicControl() {
    musicToggle.addEventListener('click', toggleMusic);
}

function toggleMusic() {
    if (!player) return;

    if (isMusicPlaying) {
        // Pausar música
        player.pauseVideo();
        musicToggle.classList.add('muted');
        musicToggle.textContent = '🔇';
        isMusicPlaying = false;
    } else {
        // Reanudar música
        player.playVideo();
        musicToggle.classList.remove('muted');
        musicToggle.textContent = '🎵';
        isMusicPlaying = true;
    }
}

// Cargar Pokémon
async function loadPokemon(generation = '1') {
    showLoading(true);
    try {
        const range = GENERATION_RANGES[generation];
        const limit = range.end - range.start + 1;
        const offset = range.start - 1;

        // Cargar Pokémon de la generación seleccionada
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        const data = await response.json();

        // Obtener detalles de cada Pokémon
        const pokemonPromises = data.results.map(pokemon =>
            fetch(pokemon.url).then(res => res.json())
        );

        allPokemon = await Promise.all(pokemonPromises);
        filteredPokemon = [...allPokemon];

        displayPokemon();
    } catch (error) {
        console.error('Error al cargar Pokémon:', error);
        pokemonContainer.innerHTML = '<p style="color: white; text-align: center;">Error al cargar los Pokémon. Por favor, recarga la página.</p>';
    } finally {
        showLoading(false);
    }
}

// Cambiar generación
function handleGenerationChange() {
    const selectedGeneration = generationFilter.value;
    currentPage = 1;
    typeFilter.value = ''; // Resetear filtro de tipo
    searchInput.value = ''; // Resetear búsqueda
    loadPokemon(selectedGeneration);
}

// Mostrar/ocultar loading
function showLoading(show) {
    if (show) {
        loading.classList.add('active');
        pokemonContainer.style.display = 'none';
    } else {
        loading.classList.remove('active');
        pokemonContainer.style.display = 'grid';
    }
}

// Mostrar Pokémon
function displayPokemon() {
    const start = (currentPage - 1) * POKEMON_PER_PAGE;
    const end = start + POKEMON_PER_PAGE;
    const pokemonToShow = filteredPokemon.slice(start, end);

    pokemonContainer.innerHTML = '';

    if (pokemonToShow.length === 0) {
        pokemonContainer.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">No se encontraron Pokémon.</p>';
        return;
    }

    pokemonToShow.forEach(pokemon => {
        const card = createPokemonCard(pokemon);
        pokemonContainer.appendChild(card);
    });

    updatePagination();
}

// Crear tarjeta de Pokémon
function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';

    const imageUrl = pokemon.sprites.other['official-artwork'].front_default ||
                     pokemon.sprites.front_default;

    const types = pokemon.types.map(type =>
        `<span class="type-badge type-${type.type.name}">${type.type.name}</span>`
    ).join('');

    card.innerHTML = `
        <img src="${imageUrl}" alt="${pokemon.name}">
        <p class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</p>
        <h3 class="pokemon-name">${pokemon.name}</h3>
        <div class="pokemon-types">${types}</div>
        <button class="speech-btn" title="Pronunciar nombre">💬</button>
        <button class="sound-btn" title="Escuchar grito">🔊</button>
    `;

    // Evento para abrir detalles (excepto en botones)
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('sound-btn') && !e.target.classList.contains('speech-btn')) {
            showPokemonDetail(pokemon);
        }
    });

    // Evento para pronunciar nombre
    const speechBtn = card.querySelector('.speech-btn');
    speechBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        speakPokemonName(pokemon);
    });

    // Evento para reproducir sonido
    const soundBtn = card.querySelector('.sound-btn');
    soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playPokemonSound(pokemon);
    });

    return card;
}

// Pronunciar nombre del Pokémon
function speakPokemonName(pokemon) {
    // Verificar si el navegador soporta Web Speech API
    if ('speechSynthesis' in window) {
        // Cancelar cualquier pronunciación anterior
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(pokemon.name);

        // Configurar el idioma y velocidad
        utterance.lang = 'en-US'; // Inglés
        utterance.rate = 0.9; // Velocidad normal
        utterance.pitch = 1; // Tono normal
        utterance.volume = 1; // Volumen al 100%

        window.speechSynthesis.speak(utterance);
    } else {
        console.log('Tu navegador no soporta síntesis de voz');
        alert('Tu navegador no soporta la función de pronunciación');
    }
}

// Reproducir sonido del Pokémon
function playPokemonSound(pokemon) {
    // La API de PokeAPI proporciona sonidos en pokemon.cries
    const soundUrl = pokemon.cries?.latest || pokemon.cries?.legacy;

    if (soundUrl) {
        const audio = new Audio(soundUrl);
        audio.volume = 0.5; // Volumen al 50%
        audio.play().catch(error => {
            console.error('Error al reproducir sonido:', error);
        });
    } else {
        console.log('No hay sonido disponible para este Pokémon');
    }
}

// Construir carrusel de formas alternativas y mega evoluciones
async function buildFormsCarousel(varieties, baseName) {
    const forms = [];

    // Filtrar y obtener datos de formas alternativas
    for (const variety of varieties) {
        const varietyName = variety.pokemon.name;

        // Incluir mega evoluciones, formas alternativas, pero excluir la forma base
        if (varietyName !== baseName && !varietyName.includes('totem')) {
            try {
                const pokemonResponse = await fetch(variety.pokemon.url);
                const pokemonData = await pokemonResponse.json();

                const imageUrl = pokemonData.sprites.other['official-artwork']?.front_default ||
                               pokemonData.sprites.front_default;

                if (imageUrl) {
                    // Determinar el tipo de forma
                    let formLabel = 'Forma Alternativa';
                    if (varietyName.includes('mega')) {
                        formLabel = varietyName.includes('mega-x') ? 'Mega Evolución X' :
                                   varietyName.includes('mega-y') ? 'Mega Evolución Y' :
                                   'Mega Evolución';
                    } else if (varietyName.includes('alola')) {
                        formLabel = 'Forma Alola';
                    } else if (varietyName.includes('galar')) {
                        formLabel = 'Forma Galar';
                    } else if (varietyName.includes('hisui')) {
                        formLabel = 'Forma Hisui';
                    } else if (varietyName.includes('paldea')) {
                        formLabel = 'Forma Paldea';
                    } else if (varietyName.includes('gmax') || varietyName.includes('gigantamax')) {
                        formLabel = 'Forma Gigamax';
                    }

                    forms.push({
                        name: varietyName,
                        image: imageUrl,
                        label: formLabel
                    });
                }
            } catch (error) {
                console.error('Error al cargar forma:', error);
            }
        }
    }

    // Si no hay formas alternativas, no mostrar el carrusel
    if (forms.length === 0) {
        return '';
    }

    // Construir HTML del carrusel
    const carouselItems = forms.map((form, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}" data-index="${index}">
            <img src="${form.image}" alt="${form.name}">
            <p class="form-label">${form.label}</p>
            <p class="form-name">${form.name.replace(/-/g, ' ')}</p>
        </div>
    `).join('');

    return `
        <div class="pokemon-forms">
            <h3>Formas Alternativas y Mega Evoluciones</h3>
            <div class="forms-carousel-container">
                <button class="carousel-btn prev-btn" onclick="changeCarouselSlide(-1)">‹</button>
                <div class="forms-carousel">
                    ${carouselItems}
                </div>
                <button class="carousel-btn next-btn" onclick="changeCarouselSlide(1)">›</button>
            </div>
            <div class="carousel-indicators">
                ${forms.map((_, index) => `<span class="indicator ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></span>`).join('')}
            </div>
        </div>
    `;
}

// Variables globales para el carrusel
let currentSlideIndex = 0;

// Cambiar slide del carrusel
function changeCarouselSlide(direction) {
    const carouselItems = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.indicator');

    if (carouselItems.length === 0) return;

    // Ocultar slide actual
    carouselItems[currentSlideIndex].classList.remove('active');
    indicators[currentSlideIndex].classList.remove('active');

    // Calcular nuevo índice
    currentSlideIndex += direction;

    // Loop al inicio/final
    if (currentSlideIndex < 0) {
        currentSlideIndex = carouselItems.length - 1;
    } else if (currentSlideIndex >= carouselItems.length) {
        currentSlideIndex = 0;
    }

    // Mostrar nuevo slide
    carouselItems[currentSlideIndex].classList.add('active');
    indicators[currentSlideIndex].classList.add('active');
}

// Ir a slide específico
function goToSlide(index) {
    const carouselItems = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.indicator');

    if (carouselItems.length === 0) return;

    // Ocultar slide actual
    carouselItems[currentSlideIndex].classList.remove('active');
    indicators[currentSlideIndex].classList.remove('active');

    // Ir al nuevo slide
    currentSlideIndex = index;

    // Mostrar nuevo slide
    carouselItems[currentSlideIndex].classList.add('active');
    indicators[currentSlideIndex].classList.add('active');
}

// Construir cadena de evolución
async function buildEvolutionChain(chain) {
    const evolutions = [];

    // Función recursiva para procesar la cadena
    async function processChain(chainLink) {
        if (!chainLink) return;

        const speciesName = chainLink.species.name;
        const speciesId = chainLink.species.url.split('/').filter(Boolean).pop();

        // Obtener datos del Pokémon para la imagen
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${speciesId}`);
        const pokemonData = await pokemonResponse.json();
        const imageUrl = pokemonData.sprites.other['official-artwork'].front_default ||
                        pokemonData.sprites.front_default;

        evolutions.push({
            name: speciesName,
            id: speciesId,
            image: imageUrl,
            minLevel: chainLink.evolution_details[0]?.min_level || null
        });

        // Procesar solo la primera evolución (para simplicidad)
        if (chainLink.evolves_to.length > 0) {
            await processChain(chainLink.evolves_to[0]);
        }
    }

    await processChain(chain);

    // Construir HTML
    if (evolutions.length === 1) {
        return '<p class="no-evolution">Este Pokémon no evoluciona</p>';
    }

    return evolutions.map((evo, index) => {
        const isLast = index === evolutions.length - 1;
        const nextEvo = evolutions[index + 1];

        return `
            <div class="evolution-item">
                <div class="evolution-pokemon" data-pokemon-id="${evo.id}">
                    <img src="${evo.image}" alt="${evo.name}">
                    <p class="evolution-name">${evo.name}</p>
                    <p class="evolution-id">#${String(evo.id).padStart(3, '0')}</p>
                </div>
                ${!isLast ? `
                    <div class="evolution-arrow">
                        <span>→</span>
                        ${nextEvo.minLevel ? `<p class="evolution-level">Nv. ${nextEvo.minLevel}</p>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Mostrar detalle del Pokémon
async function showPokemonDetail(pokemon) {
    const imageUrl = pokemon.sprites.other['official-artwork'].front_default ||
                     pokemon.sprites.front_default;

    // Obtener sprite animado (GIF)
    const animatedSprite = pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default ||
                          pokemon.sprites.front_default;

    const types = pokemon.types.map(type =>
        `<span class="type-badge type-${type.type.name}">${type.type.name}</span>`
    ).join('');

    const stats = pokemon.stats.map(stat => `
        <div class="stat-row">
            <span class="stat-name">${statTranslations[stat.stat.name] || stat.stat.name}</span>
            <div class="stat-bar-container">
                <div class="stat-bar" style="width: ${(stat.base_stat / 255) * 100}%"></div>
            </div>
            <span class="stat-value">${stat.base_stat}</span>
        </div>
    `).join('');

    // Obtener información de la especie
    try {
        const speciesResponse = await fetch(pokemon.species.url);
        const speciesData = await speciesResponse.json();

        // Buscar descripción en español
        const description = speciesData.flavor_text_entries.find(
            entry => entry.language.name === 'es'
        )?.flavor_text.replace(/\f/g, ' ') || 'Descripción no disponible.';

        const abilities = pokemon.abilities.map(ability => ability.ability.name).join(', ');

        // Obtener cadena de evolución
        const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionChainData = await evolutionChainResponse.json();
        const evolutionChainHTML = await buildEvolutionChain(evolutionChainData.chain);

        // Obtener formas alternativas y mega evoluciones
        const formsCarouselHTML = await buildFormsCarousel(speciesData.varieties, pokemon.name);

        modalBody.innerHTML = `
            <div class="modal-pokemon-header">
                <div class="pokemon-image-gallery">
                    <div class="gallery-item">
                        <img src="${imageUrl}" alt="${pokemon.name}">
                        <p class="gallery-label">Oficial</p>
                    </div>
                    <div class="gallery-item">
                        <img src="${animatedSprite}" alt="${pokemon.name} animado" class="animated-sprite">
                        <p class="gallery-label">Animado</p>
                    </div>
                </div>
                <h2 class="modal-pokemon-name">${pokemon.name}</h2>
                <p class="modal-pokemon-id">#${String(pokemon.id).padStart(3, '0')}</p>
                <div class="pokemon-types">${types}</div>
                <div class="modal-buttons">
                    <button class="speech-btn-large" title="Pronunciar nombre">💬 Pronunciar Nombre</button>
                    <button class="sound-btn-large" title="Escuchar grito">🔊 Escuchar Grito</button>
                </div>
            </div>

            <div class="pokemon-info">
                <h3>Información</h3>
                <div class="info-row">
                    <span class="info-label">Altura:</span>
                    <span class="info-value">${pokemon.height / 10} m</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Peso:</span>
                    <span class="info-value">${pokemon.weight / 10} kg</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Habilidades:</span>
                    <span class="info-value">${abilities}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Descripción:</span>
                    <span class="info-value" style="text-transform: none;">${description}</span>
                </div>
            </div>

            ${formsCarouselHTML}

            <div class="pokemon-stats">
                <h3>Estadísticas Base</h3>
                ${stats}
            </div>

            <div class="pokemon-evolution">
                <h3>Cadena de Evolución</h3>
                <div class="evolution-chain">
                    ${evolutionChainHTML}
                </div>
            </div>
        `;

        // Agregar eventos a los botones del modal
        const modalSpeechBtn = modalBody.querySelector('.speech-btn-large');
        const modalSoundBtn = modalBody.querySelector('.sound-btn-large');

        modalSpeechBtn.addEventListener('click', () => speakPokemonName(pokemon));
        modalSoundBtn.addEventListener('click', () => playPokemonSound(pokemon));

        // Hacer clickeable las evoluciones
        const evolutionPokemons = modalBody.querySelectorAll('.evolution-pokemon');
        evolutionPokemons.forEach(evoElement => {
            evoElement.addEventListener('click', async () => {
                const pokemonId = evoElement.getAttribute('data-pokemon-id');

                // Buscar primero en allPokemon (misma generación)
                let selectedPokemon = allPokemon.find(p => p.id == pokemonId);

                // Si no está en allPokemon, cargarlo desde la API (otra generación)
                if (!selectedPokemon) {
                    try {
                        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
                        selectedPokemon = await response.json();
                    } catch (error) {
                        console.error('Error al cargar Pokémon:', error);
                        return;
                    }
                }

                await showPokemonDetail(selectedPokemon);
            });
        });

        // Resetear índice del carrusel al abrir nuevo Pokémon
        currentSlideIndex = 0;

        modal.classList.add('active');
    } catch (error) {
        console.error('Error al cargar detalles:', error);
    }
}

// Buscar Pokémon
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === '') {
        filteredPokemon = [...allPokemon];
    } else {
        filteredPokemon = allPokemon.filter(pokemon =>
            pokemon.name.includes(searchTerm) ||
            pokemon.id.toString() === searchTerm
        );
    }

    currentPage = 1;
    displayPokemon();
}

// Filtrar por tipo
function handleTypeFilter() {
    const selectedType = typeFilter.value;

    if (selectedType === '') {
        filteredPokemon = [...allPokemon];
    } else {
        filteredPokemon = allPokemon.filter(pokemon =>
            pokemon.types.some(type => type.type.name === selectedType)
        );
    }

    currentPage = 1;
    displayPokemon();
}

// Cambiar página
function changePage(direction) {
    currentPage += direction;
    displayPokemon();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Actualizar paginación
function updatePagination() {
    const totalPages = Math.ceil(filteredPokemon.length / POKEMON_PER_PAGE);

    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;
}
