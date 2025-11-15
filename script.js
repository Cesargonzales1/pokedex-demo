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

// Pokémon con formas Gigamax
const GIGAMAX_POKEMON = [
    3,   // Venusaur
    6,   // Charizard
    9,   // Blastoise
    12,  // Butterfree
    25,  // Pikachu
    52,  // Meowth
    68,  // Machamp
    94,  // Gengar
    99,  // Kingler
    131, // Lapras
    133, // Eevee
    143, // Snorlax
    569, // Garbodor
    823, // Corviknight
    826, // Orbeetle
    834, // Drednaw
    839, // Coalossal
    841, // Flapple
    842, // Appletun
    844, // Sandaconda
    849, // Toxtricity
    851, // Centiskorch
    858, // Hatterene
    861, // Grimmsnarl
    869, // Alcremie
    879, // Copperajah
    884, // Duraludon
    892  // Urshifu
];

let isGigamaxMode = false;

// Elementos del DOM
const pokemonContainer = document.getElementById('pokemonContainer');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const typeFilter = document.getElementById('typeFilter');
const generationFilter = document.getElementById('generationFilter');
const gigamaxBtn = document.getElementById('gigamaxBtn');
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
    gigamaxBtn.addEventListener('click', toggleGigamaxMode);
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
    isGigamaxMode = false;
    gigamaxBtn.classList.remove('active');
    gigamaxBtn.textContent = '⚡ Ver Pokémon Gigamax ⚡';
    loadPokemon(selectedGeneration);
}

// Toggle Gigamax mode
async function toggleGigamaxMode() {
    isGigamaxMode = !isGigamaxMode;

    if (isGigamaxMode) {
        gigamaxBtn.classList.add('active');
        gigamaxBtn.textContent = '🔙 Volver a Vista Normal';
        await loadGigamaxPokemon();
    } else {
        gigamaxBtn.classList.remove('active');
        gigamaxBtn.textContent = '⚡ Ver Pokémon Gigamax ⚡';
        const selectedGeneration = generationFilter.value;
        loadPokemon(selectedGeneration);
    }
}

// Cargar Pokémon Gigamax
async function loadGigamaxPokemon() {
    showLoading(true);
    try {
        // Resetear filtros
        typeFilter.value = '';
        searchInput.value = '';
        currentPage = 1;

        // Cargar todos los Pokémon Gigamax con sus formas
        const pokemonPromises = GIGAMAX_POKEMON.map(async (id) => {
            // Cargar datos base del Pokémon
            const pokemonData = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json());

            // Intentar cargar la forma Gigamax
            try {
                const gigamaxFormName = `${pokemonData.name}-gmax`;
                const formResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${gigamaxFormName}`);

                if (formResponse.ok) {
                    const gigamaxForm = await formResponse.json();
                    // Si existe la forma Gigamax, usar sus sprites
                    pokemonData.gigamaxSprite = gigamaxForm.sprites.other['official-artwork']?.front_default
                                              || gigamaxForm.sprites.front_default;
                }
            } catch (error) {
                // Si no hay forma Gigamax disponible, usar sprite normal
                console.log(`No Gigamax form found for ${pokemonData.name}`);
            }

            return pokemonData;
        });

        allPokemon = await Promise.all(pokemonPromises);

        // Modificar los Pokémon para mostrar información Gigamax
        allPokemon = allPokemon.map(pokemon => {
            // Crear una copia modificada del Pokémon
            const gigamaxPokemon = { ...pokemon };
            gigamaxPokemon.name = `${pokemon.name} (Gigamax)`;
            gigamaxPokemon.isGigamax = true;

            // Si hay sprite Gigamax, modificar la estructura de sprites
            if (pokemon.gigamaxSprite) {
                gigamaxPokemon.sprites = {
                    ...pokemon.sprites,
                    other: {
                        ...pokemon.sprites.other,
                        'official-artwork': {
                            front_default: pokemon.gigamaxSprite
                        }
                    }
                };
            }

            return gigamaxPokemon;
        });

        filteredPokemon = [...allPokemon];
        displayPokemon();
    } catch (error) {
        console.error('Error al cargar Pokémon Gigamax:', error);
        pokemonContainer.innerHTML = '<p style="color: white; text-align: center;">Error al cargar los Pokémon Gigamax. Por favor, intenta de nuevo.</p>';
    } finally {
        showLoading(false);
    }
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

    // Desactivar modo Gigamax si está activo
    if (isGigamaxMode && searchTerm !== '') {
        isGigamaxMode = false;
        gigamaxBtn.classList.remove('active');
        gigamaxBtn.textContent = '⚡ Ver Pokémon Gigamax ⚡';
    }

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

    // Desactivar modo Gigamax si se aplica filtro de tipo
    if (isGigamaxMode && selectedType !== '') {
        isGigamaxMode = false;
        gigamaxBtn.classList.remove('active');
        gigamaxBtn.textContent = '⚡ Ver Pokémon Gigamax ⚡';
    }

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

// ==========================================
// GAMES MENU SYSTEM
// ==========================================

const gamesMenuToggle = document.getElementById('gamesMenuToggle');
const gamesMenuModal = document.getElementById('gamesMenuModal');
const gamesMenuClose = document.querySelector('.games-menu-close');
const gameCards = document.querySelectorAll('.game-card');

// Open games menu
gamesMenuToggle.addEventListener('click', () => {
    gamesMenuModal.classList.add('active');
});

// Close games menu
gamesMenuClose.addEventListener('click', () => {
    gamesMenuModal.classList.remove('active');
});

// Close when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === gamesMenuModal) {
        gamesMenuModal.classList.remove('active');
    }
});

// Game card selection
gameCards.forEach(card => {
    card.addEventListener('click', () => {
        const gameName = card.getAttribute('data-game');
        gamesMenuModal.classList.remove('active');

        switch(gameName) {
            case 'memory':
                openGameModal();
                break;
            case 'dugtrio':
                openDugtrioModal();
                break;
            case 'guess':
                openGuessModal();
                break;
            case 'fishing':
                openFishingModal();
                break;
            case 'runner':
                openRunnerModal();
                break;
            case 'puzzle':
                openPuzzleModal();
                break;
            case 'battle':
                openBattleModal();
                break;
            case 'towerdefense':
                openTDModal();
                break;
            case 'mathevo':
                openMathEvoModal();
                break;
        }
    });
});

// ==================== JUEGO DE MEMORIA ====================

// Variables del juego
let memoryGameCards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let gameTimer = null;
let gameSeconds = 0;
let currentDifficulty = null;

// Elementos del DOM del juego
const gameModal = document.getElementById('gameModal');
const gameClose = document.querySelector('.game-close');
const gameMenu = document.getElementById('gameMenu');
const gameBoard = document.getElementById('gameBoard');
const cardsGrid = document.getElementById('cardsGrid');
const gameTimerDisplay = document.getElementById('gameTimer');
const gameMovesDisplay = document.getElementById('gameMoves');
const resetGameBtn = document.getElementById('resetGame');
const victoryScreen = document.getElementById('victoryScreen');
const playAgainBtn = document.getElementById('playAgain');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');

// Event listeners del juego
gameClose.addEventListener('click', closeGameModal);
window.addEventListener('click', (e) => {
    if (e.target === gameModal) closeGameModal();
});

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const level = btn.getAttribute('data-level');
        startGame(level);
    });
});

resetGameBtn.addEventListener('click', () => startGame(currentDifficulty));
playAgainBtn.addEventListener('click', () => {
    victoryScreen.style.display = 'none';
    gameMenu.style.display = 'block';
});

// Abrir modal del juego
function openGameModal() {
    gameModal.classList.add('active');
    gameMenu.style.display = 'block';
    gameBoard.style.display = 'none';
    victoryScreen.style.display = 'none';
}

// Cerrar modal del juego
function closeGameModal() {
    gameModal.classList.remove('active');
    stopGameTimer();
}

// Iniciar juego
function startGame(difficulty) {
    currentDifficulty = difficulty;
    const pairsCount = difficulty === 'easy' ? 6 : 8;

    // Resetear variables
    memoryGameCards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    gameSeconds = 0;

    // Mostrar tablero de juego
    gameMenu.style.display = 'none';
    gameBoard.style.display = 'block';
    victoryScreen.style.display = 'none';

    // Actualizar displays
    gameMovesDisplay.textContent = '0';
    gameTimerDisplay.textContent = '0:00';

    // Generar cartas
    generateGameCards(pairsCount);

    // Iniciar timer
    startGameTimer();
}

// Generar cartas del juego
function generateGameCards(pairsCount) {
    // Seleccionar Pokémon aleatorios de allPokemon
    const selectedPokemon = [];
    const availablePokemon = [...allPokemon];

    for (let i = 0; i < pairsCount; i++) {
        if (availablePokemon.length === 0) break;
        const randomIndex = Math.floor(Math.random() * availablePokemon.length);
        selectedPokemon.push(availablePokemon[randomIndex]);
        availablePokemon.splice(randomIndex, 1);
    }

    // Crear parejas
    const cardPairs = [];
    selectedPokemon.forEach((pokemon, index) => {
        const imageUrl = pokemon.sprites.other['official-artwork']?.front_default ||
                        pokemon.sprites.front_default;

        cardPairs.push({
            id: index,
            pokemon: pokemon.name,
            image: imageUrl,
            matched: false
        });

        cardPairs.push({
            id: index,
            pokemon: pokemon.name,
            image: imageUrl,
            matched: false
        });
    });

    // Barajar cartas
    memoryGameCards = shuffleArray(cardPairs);

    // Renderizar cartas
    renderGameCards();
}

// Barajar array (Fisher-Yates shuffle)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Renderizar cartas en el tablero
function renderGameCards() {
    cardsGrid.innerHTML = '';
    const gridClass = currentDifficulty === 'easy' ? 'grid-easy' : 'grid-medium';
    cardsGrid.className = `cards-grid ${gridClass}`;

    memoryGameCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card';
        cardElement.setAttribute('data-index', index);

        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <div class="pokeball-icon">
                        <div class="pokeball-top"></div>
                        <div class="pokeball-middle"></div>
                        <div class="pokeball-bottom"></div>
                    </div>
                </div>
                <div class="card-back">
                    <img src="${card.image}" alt="${card.pokemon}">
                </div>
            </div>
        `;

        cardElement.addEventListener('click', () => flipCard(index));
        cardsGrid.appendChild(cardElement);
    });
}

// Voltear carta
function flipCard(index) {
    // No permitir voltear si ya hay 2 cartas volteadas
    if (flippedCards.length >= 2) return;

    const card = memoryGameCards[index];
    const cardElement = cardsGrid.children[index];

    // No voltear si ya está volteada o ya fue emparejada
    if (card.flipped || card.matched) return;

    // Voltear carta
    card.flipped = true;
    cardElement.classList.add('flipped');
    flippedCards.push({ index, card });

    // Si hay 2 cartas volteadas, comprobar
    if (flippedCards.length === 2) {
        moves++;
        gameMovesDisplay.textContent = moves;
        checkMatch();
    }
}

// Comprobar si hay match
function checkMatch() {
    const [first, second] = flippedCards;

    if (first.card.id === second.card.id) {
        // Match! ✅
        setTimeout(() => {
            first.card.matched = true;
            second.card.matched = true;

            const firstElement = cardsGrid.children[first.index];
            const secondElement = cardsGrid.children[second.index];

            firstElement.classList.add('matched');
            secondElement.classList.add('matched');

            flippedCards = [];
            matchedPairs++;

            // Verificar victoria
            if (matchedPairs === memoryGameCards.length / 2) {
                setTimeout(() => showVictory(), 500);
            }
        }, 600);
    } else {
        // No match ❌
        setTimeout(() => {
            first.card.flipped = false;
            second.card.flipped = false;

            const firstElement = cardsGrid.children[first.index];
            const secondElement = cardsGrid.children[second.index];

            firstElement.classList.remove('flipped');
            secondElement.classList.remove('flipped');

            flippedCards = [];
        }, 1000);
    }
}

// Timer del juego
function startGameTimer() {
    stopGameTimer();
    gameTimer = setInterval(() => {
        gameSeconds++;
        const minutes = Math.floor(gameSeconds / 60);
        const seconds = gameSeconds % 60;
        gameTimerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopGameTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

// Mostrar pantalla de victoria
function showVictory() {
    stopGameTimer();

    const minutes = Math.floor(gameSeconds / 60);
    const seconds = gameSeconds % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    document.getElementById('victoryTime').textContent = timeString;
    document.getElementById('victoryMoves').textContent = moves;

    gameBoard.style.display = 'none';
    victoryScreen.style.display = 'block';

    // Crear confeti
    createConfetti();
}

// Crear efecto confetti
function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';

            victoryScreen.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

// ==========================================
// DUGTRIO WHAC-A-MOLE GAME
// ==========================================

const dugtrioToggle = document.getElementById('dugtrioToggle');
const dugtrioModal = document.getElementById('dugtrioModal');
const dugtrioClose = document.querySelector('.dugtrio-close');
const dugtrioMenu = document.getElementById('dugtrioMenu');
const startDugtrioBtn = document.getElementById('startDugtrio');
const dugtrioGameBoard = document.getElementById('dugtrioGameBoard');
const dugtrioVictoryScreen = document.getElementById('dugtrioVictory');
const dugtrioPlayAgainBtn = document.getElementById('dugtrioPlayAgain');

let dugtrioScore = 0;
let dugtrioTimeLeft = 30;
let dugtrioTimer = null;
let dugtrioGameActive = false;
let dugtrioSpawnInterval = null;
let dugtrioHitCount = 0;

// Open Dugtrio modal
function openDugtrioModal() {
    dugtrioModal.classList.add('active');
    dugtrioMenu.style.display = 'block';
    dugtrioGameBoard.style.display = 'none';
    dugtrioVictoryScreen.style.display = 'none';
}

// Close Dugtrio modal
function closeDugtrioModal() {
    dugtrioModal.classList.remove('active');
    resetDugtrioGame();
}

// Start Dugtrio game
function startDugtrioGame() {
    // Reset game state
    dugtrioScore = 0;
    dugtrioTimeLeft = 30;
    dugtrioHitCount = 0;
    dugtrioGameActive = true;

    // Update UI
    document.getElementById('dugtrioScore').textContent = dugtrioScore;
    document.getElementById('dugtrioTime').textContent = dugtrioTimeLeft;

    // Hide menu, show game board
    dugtrioMenu.style.display = 'none';
    dugtrioGameBoard.style.display = 'block';

    // Hide all Dugtrios initially
    const allDugtrios = document.querySelectorAll('.dugtrio');
    allDugtrios.forEach(d => d.classList.remove('up', 'whacked'));

    // Start game timer
    dugtrioTimer = setInterval(() => {
        dugtrioTimeLeft--;
        document.getElementById('dugtrioTime').textContent = dugtrioTimeLeft;

        if (dugtrioTimeLeft <= 0) {
            endDugtrioGame();
        }
    }, 1000);

    // Start spawning Dugtrios
    spawnDugtrio();
    dugtrioSpawnInterval = setInterval(spawnDugtrio, 800);
}

// Spawn a random Dugtrio
function spawnDugtrio() {
    if (!dugtrioGameActive) return;

    const allDugtrios = document.querySelectorAll('.dugtrio');
    const availableDugtrios = Array.from(allDugtrios).filter(d => !d.classList.contains('up'));

    if (availableDugtrios.length === 0) return;

    const randomDugtrio = availableDugtrios[Math.floor(Math.random() * availableDugtrios.length)];
    const displayTime = Math.random() * 1000 + 800; // 800-1800ms

    randomDugtrio.classList.add('up');
    randomDugtrio.classList.remove('whacked');

    // Auto hide after display time
    setTimeout(() => {
        if (randomDugtrio.classList.contains('up') && !randomDugtrio.classList.contains('whacked')) {
            randomDugtrio.classList.remove('up');
        }
    }, displayTime);
}

// Hit a Dugtrio
function hitDugtrio(dugtrio) {
    if (!dugtrioGameActive) return;
    if (!dugtrio.classList.contains('up')) return;
    if (dugtrio.classList.contains('whacked')) return;

    // Mark as whacked
    dugtrio.classList.add('whacked');

    // Update score
    dugtrioScore += 10;
    dugtrioHitCount++;
    document.getElementById('dugtrioScore').textContent = dugtrioScore;

    // Create hit effect
    const hitEffect = document.createElement('div');
    hitEffect.className = 'hit-effect';
    hitEffect.textContent = '+10';
    dugtrio.parentElement.appendChild(hitEffect);

    setTimeout(() => hitEffect.remove(), 500);

    // Hide Dugtrio after hit
    setTimeout(() => {
        dugtrio.classList.remove('up', 'whacked');
    }, 300);
}

// End game
function endDugtrioGame() {
    dugtrioGameActive = false;
    clearInterval(dugtrioTimer);
    clearInterval(dugtrioSpawnInterval);

    // Hide all Dugtrios
    const allDugtrios = document.querySelectorAll('.dugtrio');
    allDugtrios.forEach(d => d.classList.remove('up', 'whacked'));

    // Show victory screen
    dugtrioGameBoard.style.display = 'none';
    dugtrioVictoryScreen.style.display = 'block';

    document.getElementById('dugtrioFinalScore').textContent = dugtrioScore;
    document.getElementById('dugtrioHits').textContent = dugtrioHitCount;
}

// Reset game
function resetDugtrioGame() {
    dugtrioGameActive = false;
    clearInterval(dugtrioTimer);
    clearInterval(dugtrioSpawnInterval);

    const allDugtrios = document.querySelectorAll('.dugtrio');
    allDugtrios.forEach(d => d.classList.remove('up', 'whacked'));
}

// Event listeners
dugtrioClose.addEventListener('click', closeDugtrioModal);
startDugtrioBtn.addEventListener('click', startDugtrioGame);
dugtrioPlayAgainBtn.addEventListener('click', () => {
    dugtrioVictoryScreen.style.display = 'none';
    dugtrioMenu.style.display = 'block';
});

// Click on Dugtrios
document.querySelectorAll('.dugtrio').forEach(dugtrio => {
    dugtrio.addEventListener('click', () => hitDugtrio(dugtrio));
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === dugtrioModal) {
        closeDugtrioModal();
    }
});

// ==========================================
// GUESS POKEMON GAME
// ==========================================

const guessModal = document.getElementById('guessModal');
const guessClose = document.querySelector('.guess-close');
const guessMenu = document.getElementById('guessMenu');
const startGuessBtn = document.getElementById('startGuess');
const guessGameBoard = document.getElementById('guessGameBoard');
const guessVictoryScreen = document.getElementById('guessVictory');
const guessPlayAgainBtn = document.getElementById('guessPlayAgain');

let guessScore = 0;
let guessCurrentQuestion = 0;
let guessCorrectAnswers = 0;
let guessTimeLeft = 10;
let guessTimer = null;
let guessCurrentPokemon = null;
let guessOptions = [];

// Open Guess modal
function openGuessModal() {
    guessModal.classList.add('active');
    guessMenu.style.display = 'block';
    guessGameBoard.style.display = 'none';
    guessVictoryScreen.style.display = 'none';
}

// Close Guess modal
function closeGuessModal() {
    guessModal.classList.remove('active');
    resetGuessGame();
}

// Start Guess game
function startGuessGame() {
    // Reset game state
    guessScore = 0;
    guessCurrentQuestion = 0;
    guessCorrectAnswers = 0;

    // Update UI
    guessMenu.style.display = 'none';
    guessGameBoard.style.display = 'block';

    // Load first question
    loadNextQuestion();
}

// Load next question
function loadNextQuestion() {
    if (guessCurrentQuestion >= 10) {
        endGuessGame();
        return;
    }

    guessCurrentQuestion++;
    guessTimeLeft = 10;

    // Update question counter
    document.getElementById('guessQuestion').textContent = `${guessCurrentQuestion}/10`;
    document.getElementById('guessScore').textContent = guessScore;
    document.getElementById('guessTime').textContent = guessTimeLeft;

    // Select random Pokemon
    if (allPokemon.length < 4) return;

    const randomIndex = Math.floor(Math.random() * allPokemon.length);
    guessCurrentPokemon = allPokemon[randomIndex];

    // Show silhouette
    const pokemonImg = document.getElementById('guessPokemonImg');
    pokemonImg.src = guessCurrentPokemon.sprites.other['official-artwork']?.front_default ||
                     guessCurrentPokemon.sprites.front_default;
    pokemonImg.classList.remove('revealed');

    // Generate options (1 correct + 3 wrong)
    guessOptions = [guessCurrentPokemon];

    while (guessOptions.length < 4) {
        const randomPokemon = allPokemon[Math.floor(Math.random() * allPokemon.length)];
        if (!guessOptions.find(p => p.id === randomPokemon.id)) {
            guessOptions.push(randomPokemon);
        }
    }

    // Shuffle options
    for (let i = guessOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [guessOptions[i], guessOptions[j]] = [guessOptions[j], guessOptions[i]];
    }

    // Display options
    const optionBtns = document.querySelectorAll('.guess-option-btn');
    optionBtns.forEach((btn, index) => {
        btn.textContent = guessOptions[index].name;
        btn.disabled = false;
        btn.classList.remove('correct', 'incorrect');
        btn.onclick = () => selectGuessOption(index);
    });

    // Start timer
    clearInterval(guessTimer);
    guessTimer = setInterval(() => {
        guessTimeLeft--;
        document.getElementById('guessTime').textContent = guessTimeLeft;

        if (guessTimeLeft <= 0) {
            clearInterval(guessTimer);
            revealAnswer(null);
        }
    }, 1000);
}

// Select option
function selectGuessOption(optionIndex) {
    clearInterval(guessTimer);

    const selectedPokemon = guessOptions[optionIndex];
    const isCorrect = selectedPokemon.id === guessCurrentPokemon.id;

    revealAnswer(optionIndex);

    if (isCorrect) {
        guessCorrectAnswers++;
        // Score: base 100 + time bonus (10 per second remaining)
        const timeBonus = guessTimeLeft * 10;
        guessScore += 100 + timeBonus;
        document.getElementById('guessScore').textContent = guessScore;
    }

    // Load next question after 2 seconds
    setTimeout(() => {
        loadNextQuestion();
    }, 2000);
}

// Reveal answer
function revealAnswer(selectedIndex) {
    const optionBtns = document.querySelectorAll('.guess-option-btn');

    optionBtns.forEach((btn, index) => {
        btn.disabled = true;

        if (guessOptions[index].id === guessCurrentPokemon.id) {
            btn.classList.add('correct');
        } else if (index === selectedIndex) {
            btn.classList.add('incorrect');
        }
    });

    // Reveal Pokemon image
    const pokemonImg = document.getElementById('guessPokemonImg');
    pokemonImg.classList.add('revealed');
}

// End game
function endGuessGame() {
    guessGameBoard.style.display = 'none';
    guessVictoryScreen.style.display = 'block';

    const accuracy = Math.round((guessCorrectAnswers / 10) * 100);

    document.getElementById('guessFinalScore').textContent = guessScore;
    document.getElementById('guessCorrect').textContent = guessCorrectAnswers;
    document.getElementById('guessAccuracy').textContent = accuracy;
}

// Reset game
function resetGuessGame() {
    clearInterval(guessTimer);
    guessScore = 0;
    guessCurrentQuestion = 0;
    guessCorrectAnswers = 0;
}

// Event listeners
guessClose.addEventListener('click', closeGuessModal);
startGuessBtn.addEventListener('click', startGuessGame);
guessPlayAgainBtn.addEventListener('click', () => {
    guessVictoryScreen.style.display = 'none';
    guessMenu.style.display = 'block';
});

window.addEventListener('click', (e) => {
    if (e.target === guessModal) {
        closeGuessModal();
    }
});

// ==========================================
// FISHING POKEMON GAME
// ==========================================

const fishingModal = document.getElementById('fishingModal');
const fishingClose = document.querySelector('.fishing-close');
const fishingMenu = document.getElementById('fishingMenu');
const startFishingBtn = document.getElementById('startFishing');
const fishingGameBoard = document.getElementById('fishingGameBoard');
const fishingVictoryScreen = document.getElementById('fishingVictory');
const fishingPlayAgainBtn = document.getElementById('fishingPlayAgain');
const fishingPokemonContainer = document.getElementById('fishingPokemonContainer');
const fishingRod = document.getElementById('fishingRod');
const catchBtn = document.getElementById('catchBtn');

let fishingScore = 0;
let fishingTimeLeft = 60;
let fishingTimer = null;
let fishingCatches = 0;
let fishingAttempts = 0;
let swimmingPokemon = [];
let fishingAnimationFrame = null;

// Water-type Pokemon IDs (common water Pokemon)
const WATER_POKEMON_IDS = [7, 8, 9, 54, 55, 60, 61, 62, 72, 73, 79, 80, 86, 87, 90, 91, 98, 99, 116, 117, 118, 119, 120, 121, 129, 130, 131, 134, 138, 139, 140, 141];

// Open Fishing modal
function openFishingModal() {
    fishingModal.classList.add('active');
    fishingMenu.style.display = 'block';
    fishingGameBoard.style.display = 'none';
    fishingVictoryScreen.style.display = 'none';
}

// Close Fishing modal
function closeFishingModal() {
    fishingModal.classList.remove('active');
    resetFishingGame();
}

// Start Fishing game
function startFishingGame() {
    // Reset game state
    fishingScore = 0;
    fishingTimeLeft = 60;
    fishingCatches = 0;
    fishingAttempts = 0;

    // Update UI
    document.getElementById('fishingScore').textContent = fishingScore;
    document.getElementById('fishingTime').textContent = fishingTimeLeft;
    document.getElementById('fishingCatches').textContent = fishingCatches;

    fishingMenu.style.display = 'none';
    fishingGameBoard.style.display = 'block';

    // Start game timer
    fishingTimer = setInterval(() => {
        fishingTimeLeft--;
        document.getElementById('fishingTime').textContent = fishingTimeLeft;

        if (fishingTimeLeft <= 0) {
            endFishingGame();
        }
    }, 1000);

    // Start spawning Pokemon
    spawnWaterPokemon();
    updatePokemonPositions();
}

// Spawn water Pokemon
function spawnWaterPokemon() {
    const spawnInterval = setInterval(() => {
        if (fishingTimeLeft <= 0) {
            clearInterval(spawnInterval);
            return;
        }

        // Get random water-type Pokemon
        const waterPokemon = allPokemon.filter(p =>
            p.types.some(t => t.type.name === 'water') ||
            WATER_POKEMON_IDS.includes(p.id)
        );

        if (waterPokemon.length === 0) return;

        const randomPokemon = waterPokemon[Math.floor(Math.random() * waterPokemon.length)];

        // Random starting side (left or right)
        const fromLeft = Math.random() > 0.5;
        const startX = fromLeft ? -100 : window.innerWidth + 100;
        const endX = fromLeft ? window.innerWidth + 100 : -100;

        // Random Y position (between 40% and 80% of container height)
        const yPosition = 40 + Math.random() * 40;

        // Random speed (pixels per frame) - Reduced for better gameplay
        const speed = 0.8 + Math.random() * 1.5;

        // Calculate points based on speed (faster = more points)
        const points = Math.round(speed * 30);

        const pokemonDiv = document.createElement('div');
        pokemonDiv.className = 'swimming-pokemon';
        if (!fromLeft) pokemonDiv.classList.add('flipped');
        pokemonDiv.style.left = startX + 'px';
        pokemonDiv.style.top = yPosition + '%';
        pokemonDiv.innerHTML = `<img src="${randomPokemon.sprites.front_default}" alt="${randomPokemon.name}">`;

        fishingPokemonContainer.appendChild(pokemonDiv);

        const pokemonData = {
            element: pokemonDiv,
            currentX: startX,
            targetX: endX,
            speed: speed,
            fromLeft: fromLeft,
            points: points,
            name: randomPokemon.name
        };

        swimmingPokemon.push(pokemonData);

    }, 2800); // Spawn every 2.8 seconds
}

// Update Pokemon positions
function updatePokemonPositions() {
    fishingAnimationFrame = requestAnimationFrame(updatePokemonPositions);

    swimmingPokemon.forEach((pokemon, index) => {
        if (pokemon.fromLeft) {
            pokemon.currentX += pokemon.speed;
        } else {
            pokemon.currentX -= pokemon.speed;
        }

        pokemon.element.style.left = pokemon.currentX + 'px';

        // Remove if out of bounds
        if ((pokemon.fromLeft && pokemon.currentX > pokemon.targetX) ||
            (!pokemon.fromLeft && pokemon.currentX < pokemon.targetX)) {
            pokemon.element.remove();
            swimmingPokemon.splice(index, 1);
        }
    });
}

// Catch Pokemon
catchBtn.addEventListener('click', () => {
    fishingAttempts++;
    catchBtn.disabled = true;

    // Show fishing rod
    fishingRod.classList.add('active');

    // Check if any Pokemon is near the center
    const containerWidth = fishingPokemonContainer.offsetWidth;
    const centerX = containerWidth / 2;
    const catchRange = 100; // pixels

    let caught = false;
    let caughtPokemon = null;

    swimmingPokemon.forEach((pokemon, index) => {
        const pokemonCenterX = pokemon.currentX + 40; // 40 is half of Pokemon width

        if (Math.abs(pokemonCenterX - centerX) < catchRange && !caught) {
            caught = true;
            caughtPokemon = pokemon;

            // Update score and catches
            fishingScore += pokemon.points;
            fishingCatches++;
            document.getElementById('fishingScore').textContent = fishingScore;
            document.getElementById('fishingCatches').textContent = fishingCatches;

            // Show catch effect
            const catchEffect = document.createElement('div');
            catchEffect.className = 'catch-effect';
            catchEffect.textContent = `+${pokemon.points} 🎣`;
            catchEffect.style.left = centerX + 'px';
            catchEffect.style.top = '40%';
            fishingPokemonContainer.appendChild(catchEffect);

            setTimeout(() => catchEffect.remove(), 1000);

            // Remove caught Pokemon
            pokemon.element.remove();
            swimmingPokemon.splice(index, 1);
        }
    });

    // Hide fishing rod after animation
    setTimeout(() => {
        fishingRod.classList.remove('active');
        catchBtn.disabled = false;
    }, 1000);
});

// End game
function endFishingGame() {
    clearInterval(fishingTimer);
    cancelAnimationFrame(fishingAnimationFrame);

    // Clear all Pokemon
    swimmingPokemon.forEach(p => p.element.remove());
    swimmingPokemon = [];

    // Show victory screen
    fishingGameBoard.style.display = 'none';
    fishingVictoryScreen.style.display = 'block';

    const accuracy = fishingAttempts > 0 ? Math.round((fishingCatches / fishingAttempts) * 100) : 0;

    document.getElementById('fishingFinalScore').textContent = fishingScore;
    document.getElementById('fishingTotalCatches').textContent = fishingCatches;
    document.getElementById('fishingAccuracy').textContent = accuracy;
}

// Reset game
function resetFishingGame() {
    clearInterval(fishingTimer);
    cancelAnimationFrame(fishingAnimationFrame);
    swimmingPokemon.forEach(p => p.element.remove());
    swimmingPokemon = [];
    fishingRod.classList.remove('active');
    catchBtn.disabled = false;
}

// Event listeners
fishingClose.addEventListener('click', closeFishingModal);
startFishingBtn.addEventListener('click', startFishingGame);
fishingPlayAgainBtn.addEventListener('click', () => {
    fishingVictoryScreen.style.display = 'none';
    fishingMenu.style.display = 'block';
});

window.addEventListener('click', (e) => {
    if (e.target === fishingModal) {
        closeFishingModal();
    }
});

// ==========================================
// PIKACHU RUNNER GAME
// ==========================================

const runnerModal = document.getElementById('runnerModal');
const runnerClose = document.querySelector('.runner-close');
const runnerMenu = document.getElementById('runnerMenu');
const startRunnerBtn = document.getElementById('startRunner');
const runnerGameBoard = document.getElementById('runnerGameBoard');
const runnerVictoryScreen = document.getElementById('runnerVictory');
const runnerPlayAgainBtn = document.getElementById('runnerPlayAgain');
const pikachu = document.getElementById('pikachu');
const obstaclesContainer = document.getElementById('obstaclesContainer');
const jumpBtn = document.getElementById('jumpBtn');

let runnerScore = 0;
let runnerDistance = 0;
let runnerSpeed = 5;
let runnerMaxSpeed = 5;
let runnerIsJumping = false;
let runnerGameActive = false;
let runnerAnimationFrame = null;
let runnerObstacles = [];
let runnerObstacleInterval = null;

// Open Runner modal
function openRunnerModal() {
    runnerModal.classList.add('active');
    runnerMenu.style.display = 'block';
    runnerGameBoard.style.display = 'none';
    runnerVictoryScreen.style.display = 'none';
}

// Close Runner modal
function closeRunnerModal() {
    runnerModal.classList.remove('active');
    resetRunnerGame();
}

// Start Runner game
function startRunnerGame() {
    // Reset game state
    runnerScore = 0;
    runnerDistance = 0;
    runnerSpeed = 2.5;
    runnerMaxSpeed = 2.5;
    runnerIsJumping = false;
    runnerGameActive = true;

    // Update UI
    document.getElementById('runnerScore').textContent = runnerScore;
    document.getElementById('runnerDistance').textContent = '0m';

    runnerMenu.style.display = 'none';
    runnerGameBoard.style.display = 'block';

    // Clear obstacles
    obstaclesContainer.innerHTML = '';
    runnerObstacles = [];

    // Start spawning obstacles
    spawnRunnerObstacle();
    runnerObstacleInterval = setInterval(() => {
        if (runnerGameActive) {
            spawnRunnerObstacle();
        }
    }, 2500);

    // Start game loop
    updateRunnerGame();
}

// Spawn obstacle
function spawnRunnerObstacle() {
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    obstacle.style.animationDuration = (4000 / runnerSpeed) + 'ms';
    obstaclesContainer.appendChild(obstacle);

    const obstacleData = {
        element: obstacle,
        passed: false
    };

    runnerObstacles.push(obstacleData);

    // Remove obstacle after animation
    setTimeout(() => {
        if (obstacle.parentNode) {
            obstacle.remove();
            const index = runnerObstacles.findIndex(o => o.element === obstacle);
            if (index > -1) {
                runnerObstacles.splice(index, 1);
            }
        }
    }, 4000);
}

// Jump
function runnerJump() {
    if (runnerIsJumping || !runnerGameActive) return;

    runnerIsJumping = true;
    pikachu.classList.add('jumping');

    setTimeout(() => {
        runnerIsJumping = false;
        pikachu.classList.remove('jumping');
    }, 500);
}

// Check collision
function checkRunnerCollision() {
    const pikachuRect = pikachu.getBoundingClientRect();

    for (let obstacle of runnerObstacles) {
        const obstacleRect = obstacle.element.getBoundingClientRect();

        // Check if obstacle has passed Pikachu
        if (!obstacle.passed && obstacleRect.right < pikachuRect.left) {
            obstacle.passed = true;
            runnerScore += 10;
            runnerDistance++;
            document.getElementById('runnerScore').textContent = runnerScore;
            document.getElementById('runnerDistance').textContent = runnerDistance + 'm';

            // Increase speed every 10 obstacles
            if (runnerDistance % 10 === 0) {
                runnerSpeed = Math.min(runnerSpeed + 0.3, 8);
                if (runnerSpeed > runnerMaxSpeed) {
                    runnerMaxSpeed = runnerSpeed;
                }
            }
        }

        // Check collision - only if Pikachu is actually touching the obstacle
        // If Pikachu's bottom is above obstacle's top (with tolerance), no collision
        const horizontalCollision = obstacleRect.left < pikachuRect.right - 5 &&
                                   obstacleRect.right > pikachuRect.left + 5;
        const verticalCollision = pikachuRect.bottom > obstacleRect.top + 15; // More tolerance

        if (horizontalCollision && verticalCollision) {
            // Game over
            endRunnerGame();
            return true;
        }
    }

    return false;
}

// Update game
function updateRunnerGame() {
    if (!runnerGameActive) return;

    const collision = checkRunnerCollision();

    if (!collision) {
        runnerAnimationFrame = requestAnimationFrame(updateRunnerGame);
    }
}

// End game
function endRunnerGame() {
    runnerGameActive = false;
    clearInterval(runnerObstacleInterval);
    cancelAnimationFrame(runnerAnimationFrame);

    // Show victory screen
    runnerGameBoard.style.display = 'none';
    runnerVictoryScreen.style.display = 'block';

    document.getElementById('runnerFinalDistance').textContent = runnerDistance;
    document.getElementById('runnerFinalScore').textContent = runnerScore;
    document.getElementById('runnerMaxSpeed').textContent = runnerMaxSpeed.toFixed(1) + 'x';
}

// Reset game
function resetRunnerGame() {
    runnerGameActive = false;
    clearInterval(runnerObstacleInterval);
    cancelAnimationFrame(runnerAnimationFrame);
    obstaclesContainer.innerHTML = '';
    runnerObstacles = [];
    pikachu.classList.remove('jumping');
}

// Event listeners
runnerClose.addEventListener('click', closeRunnerModal);
startRunnerBtn.addEventListener('click', startRunnerGame);
runnerPlayAgainBtn.addEventListener('click', () => {
    runnerVictoryScreen.style.display = 'none';
    runnerMenu.style.display = 'block';
});

// Jump controls
jumpBtn.addEventListener('click', runnerJump);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && runnerGameActive) {
        e.preventDefault();
        runnerJump();
    }
});

window.addEventListener('click', (e) => {
    if (e.target === runnerModal) {
        closeRunnerModal();
    }
});

// ==========================================
// PUZZLE POKEMON GAME
// ==========================================

const puzzleModal = document.getElementById('puzzleModal');
const puzzleClose = document.querySelector('.puzzle-close');
const puzzleMenu = document.getElementById('puzzleMenu');
const puzzleGameBoard = document.getElementById('puzzleGameBoard');
const puzzleVictoryScreen = document.getElementById('puzzleVictory');
const puzzlePlayAgainBtn = document.getElementById('puzzlePlayAgain');
const puzzleGrid = document.getElementById('puzzleGrid');
const puzzleResetBtn = document.getElementById('puzzleResetBtn');
const puzzleNewGameBtn = document.getElementById('puzzleNewGameBtn');
const puzzleDifficultyBtns = document.querySelectorAll('.puzzle-difficulty-btn');

let puzzleSize = 3;
let puzzlePieces = [];
let puzzleEmptyIndex = 0;
let puzzleMoves = 0;
let puzzleSeconds = 0;
let puzzleTimer = null;
let puzzleCurrentPokemon = null;
let puzzleSolved = false;

// Open Puzzle modal
function openPuzzleModal() {
    puzzleModal.classList.add('active');
    puzzleMenu.style.display = 'block';
    puzzleGameBoard.style.display = 'none';
    puzzleVictoryScreen.style.display = 'none';
}

// Close Puzzle modal
function closePuzzleModal() {
    puzzleModal.classList.remove('active');
    resetPuzzleGame();
}

// Start Puzzle game
function startPuzzleGame(size) {
    puzzleSize = parseInt(size);
    puzzleMoves = 0;
    puzzleSeconds = 0;
    puzzleSolved = false;

    // Select random Pokemon
    if (allPokemon.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allPokemon.length);
    puzzleCurrentPokemon = allPokemon[randomIndex];

    // Update UI
    document.getElementById('puzzleMoves').textContent = puzzleMoves;
    document.getElementById('puzzleTime').textContent = '0:00';

    puzzleMenu.style.display = 'none';
    puzzleGameBoard.style.display = 'block';

    // Initialize puzzle
    initializePuzzle();

    // Start timer
    clearInterval(puzzleTimer);
    puzzleTimer = setInterval(() => {
        puzzleSeconds++;
        const mins = Math.floor(puzzleSeconds / 60);
        const secs = puzzleSeconds % 60;
        document.getElementById('puzzleTime').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

// Initialize puzzle
function initializePuzzle() {
    const totalPieces = puzzleSize * puzzleSize;
    puzzlePieces = [];

    // Create ordered pieces
    for (let i = 0; i < totalPieces; i++) {
        puzzlePieces.push(i);
    }

    // Last piece is empty
    puzzleEmptyIndex = totalPieces - 1;

    // Shuffle
    shufflePuzzle();

    // Render
    renderPuzzle();
}

// Shuffle puzzle
function shufflePuzzle() {
    // Make random valid moves
    const moves = puzzleSize * puzzleSize * 50;

    for (let i = 0; i < moves; i++) {
        const validMoves = getValidMoves();
        if (validMoves.length > 0) {
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            swapPieces(randomMove, puzzleEmptyIndex);
        }
    }
}

// Get valid moves
function getValidMoves() {
    const validMoves = [];
    const row = Math.floor(puzzleEmptyIndex / puzzleSize);
    const col = puzzleEmptyIndex % puzzleSize;

    // Up
    if (row > 0) validMoves.push(puzzleEmptyIndex - puzzleSize);
    // Down
    if (row < puzzleSize - 1) validMoves.push(puzzleEmptyIndex + puzzleSize);
    // Left
    if (col > 0) validMoves.push(puzzleEmptyIndex - 1);
    // Right
    if (col < puzzleSize - 1) validMoves.push(puzzleEmptyIndex + 1);

    return validMoves;
}

// Swap pieces
function swapPieces(index1, index2) {
    [puzzlePieces[index1], puzzlePieces[index2]] = [puzzlePieces[index2], puzzlePieces[index1]];
    puzzleEmptyIndex = index1;
}

// Render puzzle
function renderPuzzle() {
    puzzleGrid.innerHTML = '';
    puzzleGrid.className = `puzzle-grid size-${puzzleSize}`;

    const imageUrl = puzzleCurrentPokemon.sprites.other['official-artwork']?.front_default ||
                     puzzleCurrentPokemon.sprites.front_default;

    puzzlePieces.forEach((pieceNum, index) => {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';

        if (pieceNum === puzzleSize * puzzleSize - 1) {
            piece.classList.add('empty');
        } else {
            const row = Math.floor(pieceNum / puzzleSize);
            const col = pieceNum % puzzleSize;

            const bgSize = puzzleSize * 100;
            const bgX = -col * 100;
            const bgY = -row * 100;

            piece.style.backgroundImage = `url(${imageUrl})`;
            piece.style.backgroundSize = `${bgSize}% ${bgSize}%`;
            piece.style.backgroundPosition = `${bgX}% ${bgY}%`;

            piece.addEventListener('click', () => clickPiece(index));
        }

        puzzleGrid.appendChild(piece);
    });
}

// Click piece
function clickPiece(index) {
    if (puzzleSolved) return;

    const validMoves = getValidMoves();

    if (validMoves.includes(index)) {
        swapPieces(index, puzzleEmptyIndex);
        puzzleMoves++;
        document.getElementById('puzzleMoves').textContent = puzzleMoves;

        renderPuzzle();

        // Check if solved
        if (isPuzzleSolved()) {
            endPuzzleGame();
        }
    }
}

// Check if puzzle is solved
function isPuzzleSolved() {
    for (let i = 0; i < puzzlePieces.length; i++) {
        if (puzzlePieces[i] !== i) {
            return false;
        }
    }
    return true;
}

// End game
function endPuzzleGame() {
    puzzleSolved = true;
    clearInterval(puzzleTimer);

    puzzleGameBoard.style.display = 'none';
    puzzleVictoryScreen.style.display = 'block';

    const mins = Math.floor(puzzleSeconds / 60);
    const secs = puzzleSeconds % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

    const difficultyStr = puzzleSize === 3 ? 'Fácil (3x3)' :
                          puzzleSize === 4 ? 'Medio (4x4)' : 'Difícil (5x5)';

    document.getElementById('puzzleFinalTime').textContent = timeStr;
    document.getElementById('puzzleFinalMoves').textContent = puzzleMoves;
    document.getElementById('puzzleFinalDifficulty').textContent = difficultyStr;

    const imageUrl = puzzleCurrentPokemon.sprites.other['official-artwork']?.front_default ||
                     puzzleCurrentPokemon.sprites.front_default;
    document.getElementById('puzzleVictoryImage').style.backgroundImage = `url(${imageUrl})`;
}

// Reset game
function resetPuzzleGame() {
    clearInterval(puzzleTimer);
    puzzleMoves = 0;
    puzzleSeconds = 0;
    puzzleSolved = false;
}

// Event listeners
puzzleClose.addEventListener('click', closePuzzleModal);

puzzleDifficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const size = btn.getAttribute('data-size');
        startPuzzleGame(size);
    });
});

puzzleResetBtn.addEventListener('click', () => {
    initializePuzzle();
    puzzleMoves = 0;
    puzzleSeconds = 0;
    document.getElementById('puzzleMoves').textContent = puzzleMoves;
    document.getElementById('puzzleTime').textContent = '0:00';

    clearInterval(puzzleTimer);
    puzzleTimer = setInterval(() => {
        puzzleSeconds++;
        const mins = Math.floor(puzzleSeconds / 60);
        const secs = puzzleSeconds % 60;
        document.getElementById('puzzleTime').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
});

puzzleNewGameBtn.addEventListener('click', () => {
    startPuzzleGame(puzzleSize);
});

puzzlePlayAgainBtn.addEventListener('click', () => {
    puzzleVictoryScreen.style.display = 'none';
    puzzleMenu.style.display = 'block';
});

window.addEventListener('click', (e) => {
    if (e.target === puzzleModal) {
        closePuzzleModal();
    }
});

// ==========================================
// BATTLE GAME
// ==========================================

const battleModal = document.getElementById('battleModal');
const battleClose = document.querySelector('.battle-close');
const battleTeamSelection = document.getElementById('battleTeamSelection');
const battlePokemonGrid = document.getElementById('battlePokemonGrid');
const battleSelectedPokemon = document.getElementById('battleSelectedPokemon');
const battleTeamCount = document.getElementById('battleTeamCount');
const startBattleBtn = document.getElementById('startBattle');
const battleGameBoard = document.getElementById('battleGameBoard');
const battleVictory = document.getElementById('battleVictory');
const battleDefeat = document.getElementById('battleDefeat');
const battlePlayAgainBtn = document.getElementById('battlePlayAgain');
const battleTryAgainBtn = document.getElementById('battleTryAgain');

// Battle state
let playerTeam = [];
let enemyTeam = [];
let currentPlayerPokemon = null;
let currentEnemyPokemon = null;
let playerTeamIndex = 0;
let enemyTeamIndex = 0;
let battleLog = [];
let isPlayerTurn = true;
let battleInProgress = false;

// Type effectiveness chart
const TYPE_CHART = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

// Open Battle modal
function openBattleModal() {
    battleModal.classList.add('active');
    resetBattle();
    loadPokemonForSelection();
}

// Close Battle modal
function closeBattleModal() {
    battleModal.classList.remove('active');
    resetBattle();
}

// Reset battle
function resetBattle() {
    playerTeam = [];
    enemyTeam = [];
    currentPlayerPokemon = null;
    currentEnemyPokemon = null;
    playerTeamIndex = 0;
    enemyTeamIndex = 0;
    battleLog = [];
    isPlayerTurn = true;
    battleInProgress = false;

    battleTeamSelection.style.display = 'block';
    battleGameBoard.style.display = 'none';
    battleVictory.style.display = 'none';
    battleDefeat.style.display = 'none';

    battleSelectedPokemon.innerHTML = '';
    battleTeamCount.textContent = '0';
    startBattleBtn.disabled = true;
}

// Load Pokemon for selection
function loadPokemonForSelection() {
    battlePokemonGrid.innerHTML = '';

    // Show first 20 Pokemon from current generation for selection
    const pokemonToShow = allPokemon.slice(0, Math.min(20, allPokemon.length));

    pokemonToShow.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'battle-pokemon-card';
        card.innerHTML = `
            <img src="${pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p>${pokemon.name}</p>
        `;

        card.addEventListener('click', () => selectPokemon(pokemon, card));
        battlePokemonGrid.appendChild(card);
    });
}

// Select Pokemon for team
function selectPokemon(pokemon, card) {
    // Check if already selected
    const alreadySelected = playerTeam.find(p => p.id === pokemon.id);

    if (alreadySelected) {
        // Deselect
        playerTeam = playerTeam.filter(p => p.id !== pokemon.id);
        card.classList.remove('selected');
    } else {
        // Select (max 3)
        if (playerTeam.length < 3) {
            playerTeam.push(createBattlePokemon(pokemon));
            card.classList.add('selected');
        }
    }

    updateSelectedTeam();
}

// Create battle Pokemon with HP and moves
function createBattlePokemon(pokemon) {
    const maxHP = pokemon.stats.find(s => s.stat.name === 'hp').base_stat;
    const attack = pokemon.stats.find(s => s.stat.name === 'attack').base_stat;
    const defense = pokemon.stats.find(s => s.stat.name === 'defense').base_stat;
    const spAttack = pokemon.stats.find(s => s.stat.name === 'special-attack').base_stat;
    const speed = pokemon.stats.find(s => s.stat.name === 'speed').base_stat;

    // Get Pokemon primary type
    const primaryType = pokemon.types[0].type.name;

    // Generate 4 moves based on Pokemon's type and stats
    const moves = generateMoves(pokemon, primaryType, attack, spAttack);

    return {
        ...pokemon,
        currentHP: maxHP,
        maxHP: maxHP,
        attack: attack,
        defense: defense,
        spAttack: spAttack,
        speed: speed,
        moves: moves,
        isFainted: false
    };
}

// Generate moves for Pokemon
function generateMoves(pokemon, type, attack, spAttack) {
    const typeMoveSets = {
        normal: ['Tackle', 'Quick Attack', 'Body Slam', 'Hyper Beam'],
        fire: ['Ember', 'Flame Wheel', 'Flamethrower', 'Fire Blast'],
        water: ['Water Gun', 'Bubble Beam', 'Surf', 'Hydro Pump'],
        electric: ['Thunder Shock', 'Spark', 'Thunderbolt', 'Thunder'],
        grass: ['Vine Whip', 'Razor Leaf', 'Solar Beam', 'Leaf Storm'],
        ice: ['Powder Snow', 'Ice Beam', 'Blizzard', 'Ice Shard'],
        fighting: ['Low Kick', 'Karate Chop', 'Cross Chop', 'Close Combat'],
        poison: ['Poison Sting', 'Sludge', 'Poison Jab', 'Sludge Bomb'],
        ground: ['Mud Shot', 'Dig', 'Earthquake', 'Earth Power'],
        flying: ['Gust', 'Wing Attack', 'Drill Peck', 'Brave Bird'],
        psychic: ['Confusion', 'Psybeam', 'Psychic', 'Future Sight'],
        bug: ['Bug Bite', 'Pin Missile', 'X-Scissor', 'Bug Buzz'],
        rock: ['Rock Throw', 'Rock Slide', 'Stone Edge', 'Rock Blast'],
        ghost: ['Lick', 'Shadow Punch', 'Shadow Ball', 'Shadow Claw'],
        dragon: ['Dragon Rage', 'Dragon Claw', 'Dragon Pulse', 'Draco Meteor'],
        dark: ['Bite', 'Feint Attack', 'Crunch', 'Dark Pulse'],
        steel: ['Metal Claw', 'Iron Head', 'Flash Cannon', 'Steel Beam'],
        fairy: ['Fairy Wind', 'Charm', 'Dazzling Gleam', 'Moonblast']
    };

    const moveNames = typeMoveSets[type] || typeMoveSets.normal;
    const powers = [35, 50, 80, 110];

    return moveNames.map((name, index) => ({
        name: name,
        type: type,
        power: powers[index],
        isSpecial: spAttack > attack
    }));
}

// Update selected team display
function updateSelectedTeam() {
    battleSelectedPokemon.innerHTML = '';
    battleTeamCount.textContent = playerTeam.length;

    playerTeam.forEach(pokemon => {
        const mini = document.createElement('div');
        mini.className = 'battle-selected-mini';
        mini.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <span>${pokemon.name}</span>
        `;
        battleSelectedPokemon.appendChild(mini);
    });

    startBattleBtn.disabled = playerTeam.length !== 3;
}

// Start battle
startBattleBtn.addEventListener('click', () => {
    if (playerTeam.length !== 3) return;

    // Generate enemy team
    generateEnemyTeam();

    // Show battle screen
    battleTeamSelection.style.display = 'none';
    battleGameBoard.style.display = 'block';

    // Initialize battle
    initializeBattle();
});

// Generate enemy team
function generateEnemyTeam() {
    enemyTeam = [];
    const availablePokemon = [...allPokemon];

    for (let i = 0; i < 3; i++) {
        if (availablePokemon.length === 0) break;
        const randomIndex = Math.floor(Math.random() * availablePokemon.length);
        const pokemon = availablePokemon[randomIndex];
        enemyTeam.push(createBattlePokemon(pokemon));
        availablePokemon.splice(randomIndex, 1);
    }
}

// Initialize battle
function initializeBattle() {
    playerTeamIndex = 0;
    enemyTeamIndex = 0;
    isPlayerTurn = true;
    battleInProgress = true;

    currentPlayerPokemon = playerTeam[0];
    currentEnemyPokemon = enemyTeam[0];

    updateBattleUI();
    addBattleLog(`¡Comienza la batalla!`);
    addBattleLog(`¡Adelante, ${currentPlayerPokemon.name}!`);
    addBattleLog(`¡${currentEnemyPokemon.name} enemigo aparece!`);

    // Setup battle UI event listeners
    setupBattleListeners();
}

// Setup battle listeners
function setupBattleListeners() {
    const attackBtn = document.getElementById('attackBtn');
    const switchBtn = document.getElementById('switchBtn');
    const attackMenu = document.getElementById('attackMenu');
    const switchMenu = document.getElementById('switchMenu');
    const battleActions = document.getElementById('battleActions');
    const backToActions = document.getElementById('backToActions');
    const backToActionsSwitch = document.getElementById('backToActionsSwitch');

    // Remove old listeners by cloning
    const newAttackBtn = attackBtn.cloneNode(true);
    const newSwitchBtn = switchBtn.cloneNode(true);
    const newBackToActions = backToActions.cloneNode(true);
    const newBackToActionsSwitch = backToActionsSwitch.cloneNode(true);

    attackBtn.parentNode.replaceChild(newAttackBtn, attackBtn);
    switchBtn.parentNode.replaceChild(newSwitchBtn, switchBtn);
    backToActions.parentNode.replaceChild(newBackToActions, backToActions);
    backToActionsSwitch.parentNode.replaceChild(newBackToActionsSwitch, backToActionsSwitch);

    newAttackBtn.addEventListener('click', () => {
        if (!isPlayerTurn || !battleInProgress) return;
        battleActions.style.display = 'none';
        attackMenu.style.display = 'block';
        renderAttackMenu();
    });

    newSwitchBtn.addEventListener('click', () => {
        if (!isPlayerTurn || !battleInProgress) return;
        battleActions.style.display = 'none';
        switchMenu.style.display = 'block';
        renderSwitchMenu();
    });

    newBackToActions.addEventListener('click', () => {
        attackMenu.style.display = 'none';
        battleActions.style.display = 'grid';
    });

    newBackToActionsSwitch.addEventListener('click', () => {
        switchMenu.style.display = 'none';
        battleActions.style.display = 'grid';
    });
}

// Render attack menu
function renderAttackMenu() {
    const attackGrid = document.getElementById('attackGrid');
    attackGrid.innerHTML = '';

    currentPlayerPokemon.moves.forEach(move => {
        const btn = document.createElement('button');
        btn.className = 'attack-btn';
        btn.innerHTML = `
            <span class="attack-name">${move.name}</span>
            <span class="attack-type">${move.type} | ${move.power} POW</span>
        `;
        btn.addEventListener('click', () => useMove(move));
        attackGrid.appendChild(btn);
    });
}

// Render switch menu
function renderSwitchMenu() {
    const switchGrid = document.getElementById('switchGrid');
    switchGrid.innerHTML = '';

    playerTeam.forEach((pokemon, index) => {
        const btn = document.createElement('button');
        btn.className = 'switch-pokemon-btn';
        btn.disabled = pokemon.isFainted || index === playerTeamIndex;
        btn.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <div class="switch-pokemon-info">
                <strong>${pokemon.name}</strong>
                <small>HP: ${pokemon.currentHP}/${pokemon.maxHP}</small>
            </div>
        `;
        btn.addEventListener('click', () => switchPokemon(index));
        switchGrid.appendChild(btn);
    });
}

// Use move
function useMove(move) {
    if (!isPlayerTurn || !battleInProgress) return;

    document.getElementById('attackMenu').style.display = 'none';
    document.getElementById('battleActions').style.display = 'grid';

    isPlayerTurn = false;

    // Player attacks
    executeTurn(currentPlayerPokemon, currentEnemyPokemon, move, true);
}

// Switch Pokemon
function switchPokemon(newIndex) {
    if (!isPlayerTurn || !battleInProgress) return;
    if (playerTeam[newIndex].isFainted) return;

    document.getElementById('switchMenu').style.display = 'none';
    document.getElementById('battleActions').style.display = 'grid';

    playerTeamIndex = newIndex;
    currentPlayerPokemon = playerTeam[newIndex];

    addBattleLog(`¡Regresa, ${playerTeam[playerTeamIndex === 0 ? 1 : 0].name}!`);
    addBattleLog(`¡Adelante, ${currentPlayerPokemon.name}!`);

    updateBattleUI();

    // Enemy gets free turn
    isPlayerTurn = false;
    setTimeout(() => enemyTurn(), 1500);
}

// Execute turn
function executeTurn(attacker, defender, move, isPlayer) {
    const attackerName = isPlayer ? attacker.name : `${attacker.name} enemigo`;
    const defenderName = isPlayer ? `${defender.name} enemigo` : defender.name;

    addBattleLog(`¡${attackerName} usa ${move.name}!`);

    // Animate attack
    const sprite = isPlayer ?
        document.getElementById('playerPokemonSprite') :
        document.getElementById('enemyPokemonSprite');
    sprite.classList.add('attacking');
    setTimeout(() => sprite.classList.remove('attacking'), 500);

    // Calculate damage
    const damage = calculateDamage(attacker, defender, move);

    setTimeout(() => {
        defender.currentHP = Math.max(0, defender.currentHP - damage);

        // Animate hit
        const defenderSprite = isPlayer ?
            document.getElementById('enemyPokemonSprite') :
            document.getElementById('playerPokemonSprite');
        defenderSprite.classList.add('hit');
        setTimeout(() => defenderSprite.classList.remove('hit'), 500);

        addBattleLog(`¡${defenderName} recibe ${damage} de daño!`);

        updateBattleUI();

        // Check if defender fainted
        if (defender.currentHP <= 0) {
            defender.isFainted = true;
            handleFainted(defender, isPlayer);
        } else {
            // Continue battle
            if (isPlayer) {
                setTimeout(() => enemyTurn(), 1500);
            } else {
                isPlayerTurn = true;
            }
        }
    }, 600);
}

// Calculate damage
function calculateDamage(attacker, defender, move) {
    const attackStat = move.isSpecial ? attacker.spAttack : attacker.attack;
    const defenseStat = move.isSpecial ? defender.defense : defender.defense;

    // Base damage
    let damage = Math.floor(((2 * 5 / 5 + 2) * move.power * attackStat / defenseStat) / 50) + 2;

    // Type effectiveness
    const attackerType = move.type;
    const defenderType = defender.types[0].type.name;

    let effectiveness = 1;
    if (TYPE_CHART[attackerType] && TYPE_CHART[attackerType][defenderType] !== undefined) {
        effectiveness = TYPE_CHART[attackerType][defenderType];
    }

    damage = Math.floor(damage * effectiveness);

    // Random factor
    damage = Math.floor(damage * (0.85 + Math.random() * 0.15));

    // Show effectiveness
    if (effectiveness > 1) {
        setTimeout(() => addBattleLog('¡Es super efectivo!'), 700);
    } else if (effectiveness < 1 && effectiveness > 0) {
        setTimeout(() => addBattleLog('No es muy efectivo...'), 700);
    } else if (effectiveness === 0) {
        setTimeout(() => addBattleLog('¡No tiene efecto!'), 700);
    }

    return Math.max(1, damage);
}

// Handle fainted Pokemon
function handleFainted(pokemon, isPlayer) {
    const pokemonName = isPlayer ? `${pokemon.name} enemigo` : pokemon.name;
    addBattleLog(`¡${pokemonName} se debilitó!`);

    // Animate faint
    const sprite = isPlayer ?
        document.getElementById('enemyPokemonSprite') :
        document.getElementById('playerPokemonSprite');
    sprite.classList.add('fainted');

    setTimeout(() => {
        if (isPlayer) {
            // Enemy fainted - check if more enemy Pokemon
            enemyTeamIndex++;
            if (enemyTeamIndex < enemyTeam.length) {
                currentEnemyPokemon = enemyTeam[enemyTeamIndex];
                addBattleLog(`¡${currentEnemyPokemon.name} enemigo aparece!`);
                updateBattleUI();
                sprite.classList.remove('fainted');
                isPlayerTurn = true;
            } else {
                endBattle(true);
            }
        } else {
            // Player Pokemon fainted - check if more player Pokemon
            const alivePokemon = playerTeam.filter(p => !p.isFainted);
            if (alivePokemon.length > 0) {
                addBattleLog('¡Elige tu siguiente Pokémon!');
                // Auto-switch to next alive Pokemon
                for (let i = 0; i < playerTeam.length; i++) {
                    if (!playerTeam[i].isFainted) {
                        playerTeamIndex = i;
                        currentPlayerPokemon = playerTeam[i];
                        addBattleLog(`¡Adelante, ${currentPlayerPokemon.name}!`);
                        break;
                    }
                }
                updateBattleUI();
                sprite.classList.remove('fainted');
                setTimeout(() => enemyTurn(), 1500);
            } else {
                endBattle(false);
            }
        }
    }, 1000);
}

// Enemy turn
function enemyTurn() {
    if (!battleInProgress) return;

    // Simple AI: choose random move
    const randomMove = currentEnemyPokemon.moves[Math.floor(Math.random() * currentEnemyPokemon.moves.length)];

    setTimeout(() => {
        executeTurn(currentEnemyPokemon, currentPlayerPokemon, randomMove, false);
    }, 500);
}

// Update battle UI
function updateBattleUI() {
    // Player Pokemon
    document.getElementById('playerPokemonName').textContent = currentPlayerPokemon.name;
    document.getElementById('playerPokemonSprite').src = currentPlayerPokemon.sprites.other['official-artwork']?.front_default || currentPlayerPokemon.sprites.front_default;
    document.getElementById('playerHP').textContent = currentPlayerPokemon.currentHP;
    document.getElementById('playerMaxHP').textContent = currentPlayerPokemon.maxHP;

    const playerHPPercent = (currentPlayerPokemon.currentHP / currentPlayerPokemon.maxHP) * 100;
    const playerHPBar = document.getElementById('playerHPBar');
    playerHPBar.style.width = playerHPPercent + '%';

    playerHPBar.classList.remove('low', 'critical');
    if (playerHPPercent <= 20) {
        playerHPBar.classList.add('critical');
    } else if (playerHPPercent <= 50) {
        playerHPBar.classList.add('low');
    }

    // Enemy Pokemon
    document.getElementById('enemyPokemonName').textContent = currentEnemyPokemon.name;
    document.getElementById('enemyPokemonSprite').src = currentEnemyPokemon.sprites.other['official-artwork']?.front_default || currentEnemyPokemon.sprites.front_default;
    document.getElementById('enemyHP').textContent = currentEnemyPokemon.currentHP;
    document.getElementById('enemyMaxHP').textContent = currentEnemyPokemon.maxHP;

    const enemyHPPercent = (currentEnemyPokemon.currentHP / currentEnemyPokemon.maxHP) * 100;
    const enemyHPBar = document.getElementById('enemyHPBar');
    enemyHPBar.style.width = enemyHPPercent + '%';

    enemyHPBar.classList.remove('low', 'critical');
    if (enemyHPPercent <= 20) {
        enemyHPBar.classList.add('critical');
    } else if (enemyHPPercent <= 50) {
        enemyHPBar.classList.add('low');
    }
}

// Add battle log
function addBattleLog(message) {
    const logDiv = document.getElementById('battleLog');
    const p = document.createElement('p');
    p.textContent = message;
    logDiv.appendChild(p);
    logDiv.scrollTop = logDiv.scrollHeight;
}

// End battle
function endBattle(playerWon) {
    battleInProgress = false;

    setTimeout(() => {
        battleGameBoard.style.display = 'none';

        if (playerWon) {
            battleVictory.style.display = 'block';
            const alivePokemon = playerTeam.filter(p => !p.isFainted).length;
            document.getElementById('battlesWon').textContent = '3';
            document.getElementById('pokemonRemaining').textContent = alivePokemon;
        } else {
            battleDefeat.style.display = 'block';
            const enemyDefeated = enemyTeam.filter(p => p.isFainted).length;
            document.getElementById('enemyDefeated').textContent = enemyDefeated;
        }
    }, 1500);
}

// Event listeners
battleClose.addEventListener('click', closeBattleModal);

battlePlayAgainBtn.addEventListener('click', () => {
    battleVictory.style.display = 'none';
    resetBattle();
    loadPokemonForSelection();
});

battleTryAgainBtn.addEventListener('click', () => {
    battleDefeat.style.display = 'none';
    resetBattle();
    loadPokemonForSelection();
});

window.addEventListener('click', (e) => {
    if (e.target === battleModal) {
        closeBattleModal();
    }
});

// ==========================================
// TOWER DEFENSE GAME
// ==========================================

const tdModal = document.getElementById('towerDefenseModal');
const tdClose = document.querySelector('.td-close');
const tdMenu = document.getElementById('tdMenu');
const startTDBtn = document.getElementById('startTD');
const tdGameBoard = document.getElementById('tdGameBoard');
const tdGrid = document.getElementById('tdGrid');
const tdVictory = document.getElementById('tdVictory');
const tdDefeat = document.getElementById('tdDefeat');

// TD State
let tdLives = 20;
let tdMoney = 150;
let tdWave = 1;
let tdTowers = [];
let tdEnemies = [];
let tdProjectiles = [];
let tdSelectedTower = null;
let tdGameActive = false;
let tdPaused = false;
let tdGameSpeed = 1;
let tdEnemiesKilled = 0;
let tdWaveInProgress = false;
let tdAnimationFrame = null;

// Path (serpentine) - 10x6 grid
const TD_PATH = [
    {row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}, {row: 3, col: 3}, {row: 3, col: 4},
    {row: 2, col: 4}, {row: 1, col: 4}, {row: 1, col: 5}, {row: 1, col: 6}, {row: 1, col: 7},
    {row: 2, col: 7}, {row: 3, col: 7}, {row: 4, col: 7}, {row: 4, col: 8}, {row: 4, col: 9}
];

// Tower types
const TOWER_TYPES = {
    squirtle: {
        name: 'Squirtle',
        cost: 50,
        damage: 10,
        range: 120,
        fireRate: 800,
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
        projectileColor: 'water'
    },
    charmander: {
        name: 'Charmander',
        cost: 75,
        damage: 25,
        range: 100,
        fireRate: 1200,
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
        projectileColor: 'fire'
    },
    bulbasaur: {
        name: 'Bulbasaur',
        cost: 100,
        damage: 15,
        range: 150,
        fireRate: 1500,
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
        projectileColor: 'grass'
    }
};

// Open TD modal
function openTDModal() {
    tdModal.classList.add('active');
    resetTDGame();
}

// Close TD modal
function closeTDModal() {
    tdModal.classList.remove('active');
    if (tdAnimationFrame) {
        cancelAnimationFrame(tdAnimationFrame);
    }
    resetTDGame();
}

// Reset TD game
function resetTDGame() {
    tdLives = 20;
    tdMoney = 150;
    tdWave = 1;
    tdTowers = [];
    tdEnemies = [];
    tdProjectiles = [];
    tdSelectedTower = null;
    tdGameActive = false;
    tdPaused = false;
    tdGameSpeed = 1;
    tdEnemiesKilled = 0;
    tdWaveInProgress = false;

    tdMenu.style.display = 'block';
    tdGameBoard.style.display = 'none';
    tdVictory.style.display = 'none';
    tdDefeat.style.display = 'none';
}

// Start game
startTDBtn.addEventListener('click', () => {
    tdMenu.style.display = 'none';
    tdGameBoard.style.display = 'block';
    tdGameActive = true;

    initTDGrid();
    updateTDUI();
    setupTDControls();
});

// Initialize grid
function initTDGrid() {
    tdGrid.innerHTML = '';

    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('div');
            cell.className = 'td-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Check if it's on the path
            const isPath = TD_PATH.some(p => p.row === row && p.col === col);

            if (isPath) {
                cell.classList.add('path');
            } else {
                cell.classList.add('buildable');
                cell.addEventListener('click', () => placeTower(row, col, cell));
            }

            tdGrid.appendChild(cell);
        }
    }
}

// Setup controls
function setupTDControls() {
    // Tower selection
    document.querySelectorAll('.td-tower-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const towerType = btn.dataset.tower;
            const cost = parseInt(btn.dataset.cost);

            if (tdMoney >= cost) {
                // Deselect all
                document.querySelectorAll('.td-tower-btn').forEach(b => b.classList.remove('selected'));
                // Select this
                btn.classList.add('selected');
                tdSelectedTower = towerType;
            }
        });
    });

    // Start wave
    document.getElementById('tdStartWave').addEventListener('click', startWave);

    // Pause
    document.getElementById('tdPause').addEventListener('click', () => {
        tdPaused = !tdPaused;
        document.getElementById('tdPause').textContent = tdPaused ? '▶️ Reanudar' : '⏸️ Pausar';
    });

    // Speed
    document.getElementById('tdSpeed').addEventListener('click', () => {
        tdGameSpeed = tdGameSpeed === 1 ? 2 : 1;
        document.getElementById('tdSpeed').textContent = `⏩ Velocidad: ${tdGameSpeed}x`;
    });
}

// Place tower
function placeTower(row, col, cell) {
    if (!tdSelectedTower || cell.classList.contains('occupied')) return;

    const towerType = TOWER_TYPES[tdSelectedTower];

    if (tdMoney < towerType.cost) {
        return;
    }

    // Deduct money
    tdMoney -= towerType.cost;

    // Create tower
    const tower = {
        row: row,
        col: col,
        type: tdSelectedTower,
        ...towerType,
        lastFire: 0
    };

    tdTowers.push(tower);

    // Render tower on grid
    const towerDiv = document.createElement('div');
    towerDiv.className = 'td-tower';
    towerDiv.innerHTML = `<img src="${towerType.sprite}" alt="${towerType.name}">`;
    cell.appendChild(towerDiv);
    cell.classList.add('occupied');
    cell.classList.remove('buildable');

    // Deselect
    tdSelectedTower = null;
    document.querySelectorAll('.td-tower-btn').forEach(b => b.classList.remove('selected'));

    updateTDUI();
}

// Start wave
function startWave() {
    if (tdWaveInProgress) return;

    tdWaveInProgress = true;
    document.getElementById('tdStartWave').disabled = true;

    const enemiesCount = 5 + tdWave * 2;
    const enemyHP = 20 + tdWave * 10;
    const enemySpeed = 0.5 + tdWave * 0.05;
    const enemyReward = 10 + tdWave * 2;

    // Spawn enemies
    for (let i = 0; i < enemiesCount; i++) {
        setTimeout(() => {
            spawnEnemy(enemyHP, enemySpeed, enemyReward);
        }, i * 1500);
    }

    // Start game loop if not already running
    if (!tdAnimationFrame) {
        tdGameLoop();
    }
}

// Spawn enemy
function spawnEnemy(hp, speed, reward) {
    const enemyDiv = document.createElement('div');
    enemyDiv.className = 'td-enemy';

    // Random Pokemon sprite
    const pokemonId = Math.floor(Math.random() * 151) + 1;
    enemyDiv.innerHTML = `
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png" alt="Enemy">
        <div class="td-enemy-hp">
            <div class="td-enemy-hp-bar" style="width: 100%;"></div>
        </div>
    `;

    tdGrid.appendChild(enemyDiv);

    const enemy = {
        element: enemyDiv,
        pathIndex: 0,
        currentHP: hp,
        maxHP: hp,
        speed: speed * tdGameSpeed,
        reward: reward,
        alive: true
    };

    tdEnemies.push(enemy);
    updateEnemyPosition(enemy);
}

// Update enemy position
function updateEnemyPosition(enemy) {
    if (!enemy.alive || enemy.pathIndex >= TD_PATH.length) return;

    const pathPoint = TD_PATH[enemy.pathIndex];
    const cellSize = tdGrid.offsetWidth / 10;

    const x = pathPoint.col * cellSize + cellSize / 2 - 20;
    const y = pathPoint.row * cellSize + cellSize / 2 - 20;

    enemy.element.style.left = x + 'px';
    enemy.element.style.top = y + 'px';
}

// Game loop
function tdGameLoop() {
    if (!tdGameActive) {
        tdAnimationFrame = null;
        return;
    }

    if (!tdPaused) {
        // Move enemies
        tdEnemies.forEach(enemy => {
            if (!enemy.alive) return;

            enemy.pathIndex += enemy.speed * 0.02;

            const index = Math.floor(enemy.pathIndex);

            if (index >= TD_PATH.length) {
                // Enemy reached end
                enemy.alive = false;
                enemy.element.remove();
                tdLives--;
                updateTDUI();

                if (tdLives <= 0) {
                    endTDGame(false);
                }

                return;
            }

            updateEnemyPosition(enemy);
        });

        // Clean up dead enemies
        tdEnemies = tdEnemies.filter(e => e.alive || e.element.parentNode);

        // Towers shoot
        const now = Date.now();
        tdTowers.forEach(tower => {
            if (now - tower.lastFire < tower.fireRate) return;

            // Find target in range
            const towerX = (tower.col + 0.5) * (tdGrid.offsetWidth / 10);
            const towerY = (tower.row + 0.5) * (tdGrid.offsetHeight / 6);

            let closestEnemy = null;
            let closestDist = Infinity;

            tdEnemies.forEach(enemy => {
                if (!enemy.alive) return;

                const enemyX = parseFloat(enemy.element.style.left) + 20;
                const enemyY = parseFloat(enemy.element.style.top) + 20;

                const dist = Math.sqrt((enemyX - towerX) ** 2 + (enemyY - towerY) ** 2);

                if (dist < tower.range && dist < closestDist) {
                    closestEnemy = enemy;
                    closestDist = dist;
                }
            });

            if (closestEnemy) {
                tower.lastFire = now;
                shootProjectile(tower, closestEnemy);

                // Animation
                const towerCell = document.querySelector(`.td-cell[data-row="${tower.row}"][data-col="${tower.col}"]`);
                const towerDiv = towerCell?.querySelector('.td-tower');
                if (towerDiv) {
                    towerDiv.classList.add('shooting');
                    setTimeout(() => towerDiv.classList.remove('shooting'), 300);
                }
            }
        });

        // Move projectiles
        tdProjectiles.forEach((proj, index) => {
            if (!proj.target.alive) {
                proj.element.remove();
                tdProjectiles.splice(index, 1);
                return;
            }

            const targetX = parseFloat(proj.target.element.style.left) + 20;
            const targetY = parseFloat(proj.target.element.style.top) + 20;

            const dx = targetX - proj.x;
            const dy = targetY - proj.y;
            const dist = Math.sqrt(dx ** 2 + dy ** 2);

            if (dist < 10) {
                // Hit!
                proj.target.currentHP -= proj.damage;
                proj.target.element.classList.add('hit');
                setTimeout(() => proj.target.element.classList.remove('hit'), 300);

                // Update HP bar
                const hpPercent = (proj.target.currentHP / proj.target.maxHP) * 100;
                const hpBar = proj.target.element.querySelector('.td-enemy-hp-bar');
                if (hpBar) {
                    hpBar.style.width = hpPercent + '%';
                }

                if (proj.target.currentHP <= 0) {
                    proj.target.alive = false;
                    proj.target.element.remove();
                    tdMoney += proj.target.reward;
                    tdEnemiesKilled++;
                    updateTDUI();
                }

                proj.element.remove();
                tdProjectiles.splice(index, 1);
            } else {
                // Move towards target
                const speed = 5;
                proj.x += (dx / dist) * speed;
                proj.y += (dy / dist) * speed;
                proj.element.style.left = proj.x + 'px';
                proj.element.style.top = proj.y + 'px';
            }
        });

        // Check if wave complete
        if (tdWaveInProgress && tdEnemies.length === 0) {
            tdWaveInProgress = false;
            tdWave++;

            document.getElementById('tdStartWave').disabled = false;
            updateTDUI();

            // Check for victory (10 waves)
            if (tdWave > 10) {
                endTDGame(true);
                return;
            }
        }
    }

    tdAnimationFrame = requestAnimationFrame(tdGameLoop);
}

// Shoot projectile
function shootProjectile(tower, target) {
    const towerX = (tower.col + 0.5) * (tdGrid.offsetWidth / 10);
    const towerY = (tower.row + 0.5) * (tdGrid.offsetHeight / 6);

    const projDiv = document.createElement('div');
    projDiv.className = `td-projectile ${tower.projectileColor}`;
    projDiv.style.left = towerX + 'px';
    projDiv.style.top = towerY + 'px';

    tdGrid.appendChild(projDiv);

    tdProjectiles.push({
        element: projDiv,
        x: towerX,
        y: towerY,
        target: target,
        damage: tower.damage
    });
}

// Update UI
function updateTDUI() {
    document.getElementById('tdLives').textContent = tdLives;
    document.getElementById('tdMoney').textContent = tdMoney;
    document.getElementById('tdWave').textContent = tdWave;

    // Update tower buttons
    document.querySelectorAll('.td-tower-btn').forEach(btn => {
        const cost = parseInt(btn.dataset.cost);
        if (tdMoney < cost) {
            btn.classList.add('disabled');
        } else {
            btn.classList.remove('disabled');
        }
    });
}

// End game
function endTDGame(victory) {
    tdGameActive = false;

    setTimeout(() => {
        tdGameBoard.style.display = 'none';

        if (victory) {
            tdVictory.style.display = 'block';
            document.getElementById('tdFinalWave').textContent = tdWave - 1;
            document.getElementById('tdFinalMoney').textContent = tdMoney;
            document.getElementById('tdFinalLives').textContent = tdLives;
        } else {
            tdDefeat.style.display = 'block';
            document.getElementById('tdSurvivedWaves').textContent = tdWave - 1;
            document.getElementById('tdEnemiesKilled').textContent = tdEnemiesKilled;
        }
    }, 1000);
}

// Event listeners
tdClose.addEventListener('click', closeTDModal);

document.getElementById('tdPlayAgain').addEventListener('click', () => {
    tdVictory.style.display = 'none';
    resetTDGame();
    tdMenu.style.display = 'block';
});

document.getElementById('tdTryAgain').addEventListener('click', () => {
    tdDefeat.style.display = 'none';
    resetTDGame();
    tdMenu.style.display = 'block';
});

window.addEventListener('click', (e) => {
    if (e.target === tdModal) {
        closeTDModal();
    }
});

// ==================== MATH EVOLUTION GAME ====================

// Evolution chains data
const EVOLUTION_CHAINS = {
    bulbasaur: [
        { id: 1, name: 'Bulbasaur', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
        { id: 2, name: 'Ivysaur', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png' },
        { id: 3, name: 'Venusaur', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png' }
    ],
    charmander: [
        { id: 4, name: 'Charmander', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
        { id: 5, name: 'Charmeleon', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png' },
        { id: 6, name: 'Charizard', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png' }
    ],
    squirtle: [
        { id: 7, name: 'Squirtle', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
        { id: 8, name: 'Wartortle', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png' },
        { id: 9, name: 'Blastoise', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png' }
    ]
};

// Game state
let mathEvoModal;
let mathEvoMenu;
let mathEvoGameBoard;
let mathEvoEvolutionScreen;
let mathEvoVictory;
let mathEvoClose;

let selectedPokemon = null;
let selectedDifficulty = null;
let selectedOperation = null;
let currentEvolutionChain = [];
let currentStage = 0;
let progressToNextEvolution = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let currentProblem = null;
let currentAnswer = null;

// DOM elements
function initMathEvoDOMElements() {
    mathEvoModal = document.getElementById('mathEvoModal');
    mathEvoMenu = document.getElementById('mathEvoMenu');
    mathEvoGameBoard = document.getElementById('mathEvoGameBoard');
    mathEvoEvolutionScreen = document.getElementById('mathEvoEvolutionScreen');
    mathEvoVictory = document.getElementById('mathEvoVictory');
    mathEvoClose = document.querySelector('.mathevo-close');
}

// Open modal
function openMathEvoModal() {
    if (!mathEvoModal) initMathEvoDOMElements();

    gamesMenuModal.style.display = 'none';
    mathEvoModal.style.display = 'block';
    mathEvoMenu.style.display = 'block';
    mathEvoGameBoard.style.display = 'none';
    mathEvoEvolutionScreen.style.display = 'none';
    mathEvoVictory.style.display = 'none';
}

// Close modal
function closeMathEvoModal() {
    mathEvoModal.style.display = 'none';
    resetMathEvoGame();
}

// Reset game
function resetMathEvoGame() {
    selectedPokemon = null;
    selectedDifficulty = null;
    selectedOperation = null;
    currentEvolutionChain = [];
    currentStage = 0;
    progressToNextEvolution = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    currentProblem = null;
    currentAnswer = null;

    // Reset UI selections
    document.querySelectorAll('.mathevo-pokemon-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.mathevo-difficulty-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.mathevo-operation-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('startMathEvo').disabled = true;
    document.getElementById('mathEvoAnswer').value = '';
}

// Pokemon selection
document.querySelectorAll('.mathevo-pokemon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mathevo-pokemon-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedPokemon = btn.dataset.pokemon;
        checkStartButton();
    });
});

// Difficulty selection
document.querySelectorAll('.mathevo-difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mathevo-difficulty-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedDifficulty = parseInt(btn.dataset.difficulty);
        checkStartButton();
    });
});

// Operation selection
document.querySelectorAll('.mathevo-operation-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mathevo-operation-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedOperation = btn.dataset.operation;
        checkStartButton();
    });
});

// Check if all selections are made
function checkStartButton() {
    const startBtn = document.getElementById('startMathEvo');
    if (selectedPokemon && selectedDifficulty && selectedOperation) {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }
}

// Start game
document.getElementById('startMathEvo').addEventListener('click', startMathEvoGame);

function startMathEvoGame() {
    // Initialize game
    currentEvolutionChain = EVOLUTION_CHAINS[selectedPokemon];
    currentStage = 0;
    progressToNextEvolution = 0;
    correctAnswers = 0;
    wrongAnswers = 0;

    // Hide menu, show game board
    mathEvoMenu.style.display = 'none';
    mathEvoGameBoard.style.display = 'block';

    // Setup evolution display
    setupEvolutionDisplay();

    // Update current Pokemon
    updateCurrentPokemon();

    // Generate first problem
    generateProblem();

    // Update stats
    updateStats();
}

function setupEvolutionDisplay() {
    // Display all 3 stages
    for (let i = 0; i < 3; i++) {
        const stageEl = document.getElementById(`mathEvoStage${i + 1}`);
        const sprite = document.getElementById(`mathEvoSprite${i + 1}`);
        const name = document.getElementById(`mathEvoName${i + 1}`);

        sprite.src = currentEvolutionChain[i].sprite;
        name.textContent = currentEvolutionChain[i].name;

        if (i === 0) {
            stageEl.classList.add('active');
        } else {
            stageEl.classList.remove('active', 'completed');
        }
    }
}

function updateCurrentPokemon() {
    const currentPokemon = currentEvolutionChain[currentStage];
    document.getElementById('mathEvoCurrentSprite').src = currentPokemon.sprite;
    document.getElementById('mathEvoCurrentName').textContent = currentPokemon.name;

    // Update progress bar
    updateProgressBar();
}

function updateProgressBar() {
    const progressText = document.getElementById('mathEvoProgressText');
    const progressFill = document.getElementById('mathEvoProgressFill');

    progressText.textContent = `${progressToNextEvolution}/5`;
    progressFill.style.width = `${(progressToNextEvolution / 5) * 100}%`;
}

function updateStats() {
    document.getElementById('mathEvoCorrect').textContent = correctAnswers;
    document.getElementById('mathEvoWrong').textContent = wrongAnswers;
    document.getElementById('mathEvoEvolutions').textContent = currentStage;
}

function generateProblem() {
    let num1, num2, operation, operationSymbol;

    // Generate numbers based on difficulty
    if (selectedDifficulty === 1) {
        num1 = Math.floor(Math.random() * 9) + 1; // 1-9
        num2 = Math.floor(Math.random() * 9) + 1; // 1-9
    } else {
        num1 = Math.floor(Math.random() * 90) + 10; // 10-99
        num2 = Math.floor(Math.random() * 90) + 10; // 10-99
    }

    // Determine operation
    if (selectedOperation === 'addition') {
        operation = 'addition';
        operationSymbol = '+';
        currentAnswer = num1 + num2;
    } else if (selectedOperation === 'subtraction') {
        operation = 'subtraction';
        operationSymbol = '-';
        // Make sure result is positive
        if (num1 < num2) {
            [num1, num2] = [num2, num1];
        }
        currentAnswer = num1 - num2;
    } else { // mixed
        operation = Math.random() < 0.5 ? 'addition' : 'subtraction';
        if (operation === 'addition') {
            operationSymbol = '+';
            currentAnswer = num1 + num2;
        } else {
            operationSymbol = '-';
            if (num1 < num2) {
                [num1, num2] = [num2, num1];
            }
            currentAnswer = num1 - num2;
        }
    }

    // Display problem
    document.getElementById('mathEvoProblem').textContent = `${num1} ${operationSymbol} ${num2} = ?`;

    // Clear answer input and remove classes
    const answerInput = document.getElementById('mathEvoAnswer');
    answerInput.value = '';
    answerInput.classList.remove('correct', 'wrong');
    answerInput.disabled = false;
    answerInput.focus();
}

// Number pad functionality
document.querySelectorAll('.mathevo-num-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const answerInput = document.getElementById('mathEvoAnswer');

        if (btn.dataset.num) {
            // Add number to input
            answerInput.value += btn.dataset.num;
        } else if (btn.dataset.action === 'clear') {
            // Clear input
            if (answerInput.value.length > 0) {
                answerInput.value = answerInput.value.slice(0, -1);
            }
        } else if (btn.dataset.action === 'negative') {
            // Toggle negative
            if (answerInput.value.startsWith('-')) {
                answerInput.value = answerInput.value.substring(1);
            } else if (answerInput.value.length > 0) {
                answerInput.value = '-' + answerInput.value;
            }
        }
    });
});

// Submit answer
document.getElementById('mathEvoSubmit').addEventListener('click', checkAnswer);
document.getElementById('mathEvoAnswer').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

function checkAnswer() {
    const answerInput = document.getElementById('mathEvoAnswer');
    const userAnswer = parseInt(answerInput.value);

    if (isNaN(userAnswer)) {
        return;
    }

    answerInput.disabled = true;

    if (userAnswer === currentAnswer) {
        // Correct answer
        answerInput.classList.add('correct');
        correctAnswers++;
        progressToNextEvolution++;

        updateStats();
        updateProgressBar();

        // Check if evolution is ready
        if (progressToNextEvolution >= 5) {
            // Evolve!
            if (currentStage < 2) {
                setTimeout(() => {
                    showEvolutionAnimation();
                }, 800);
            } else {
                // Final stage reached - victory!
                setTimeout(() => {
                    showVictory();
                }, 800);
            }
        } else {
            // Next problem
            setTimeout(() => {
                generateProblem();
            }, 1000);
        }
    } else {
        // Wrong answer
        answerInput.classList.add('wrong');
        wrongAnswers++;

        updateStats();

        // Show correct answer briefly, then new problem
        setTimeout(() => {
            answerInput.value = currentAnswer;
        }, 500);

        setTimeout(() => {
            generateProblem();
        }, 2000);
    }
}

function showEvolutionAnimation() {
    mathEvoGameBoard.style.display = 'none';
    mathEvoEvolutionScreen.style.display = 'block';

    const oldPokemon = currentEvolutionChain[currentStage];
    const newPokemon = currentEvolutionChain[currentStage + 1];

    document.getElementById('mathEvoOldSprite').src = oldPokemon.sprite;
    document.getElementById('mathEvoNewSprite').src = newPokemon.sprite;
    document.getElementById('mathEvoEvolutionMessage').textContent =
        `¡Tu ${oldPokemon.name} evolucionó a ${newPokemon.name}!`;
}

document.getElementById('mathEvoContinue').addEventListener('click', () => {
    // Evolve to next stage
    currentStage++;
    progressToNextEvolution = 0;

    // Update evolution display
    const prevStage = document.getElementById(`mathEvoStage${currentStage}`);
    prevStage.classList.remove('active');
    prevStage.classList.add('completed');

    const currentStageEl = document.getElementById(`mathEvoStage${currentStage + 1}`);
    currentStageEl.classList.add('active');

    // Update current Pokemon
    updateCurrentPokemon();
    updateStats();

    // Hide evolution screen, show game board
    mathEvoEvolutionScreen.style.display = 'none';
    mathEvoGameBoard.style.display = 'block';

    // Generate new problem
    generateProblem();
});

function showVictory() {
    mathEvoGameBoard.style.display = 'none';
    mathEvoVictory.style.display = 'block';

    const finalPokemon = currentEvolutionChain[2];
    document.getElementById('mathEvoFinalSprite').src = finalPokemon.sprite;
    document.getElementById('mathEvoFinalName').textContent = finalPokemon.name;
    document.getElementById('mathEvoFinalCorrect').textContent = correctAnswers;
    document.getElementById('mathEvoFinalWrong').textContent = wrongAnswers;

    const accuracy = Math.round((correctAnswers / (correctAnswers + wrongAnswers)) * 100);
    document.getElementById('mathEvoAccuracy').textContent = accuracy;
}

// Event listeners
mathEvoClose.addEventListener('click', closeMathEvoModal);

document.getElementById('mathEvoPlayAgain').addEventListener('click', () => {
    mathEvoVictory.style.display = 'none';
    resetMathEvoGame();
    mathEvoMenu.style.display = 'block';
});

window.addEventListener('click', (e) => {
    if (e.target === mathEvoModal) {
        closeMathEvoModal();
    }
});

// Initialize DOM elements on page load
initMathEvoDOMElements();
