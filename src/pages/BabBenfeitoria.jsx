import React, { useState, useEffect } from 'react';

// WordPress API endpoint for BAB Benfeitoria page
const WP_API_URL = 'https://archa.com.br/wp-json/wp/v2/pages/31489';

// State to biome mapping
const STATE_INFO = {
    'acre': { nome: 'Acre', sigla: 'AC', bioma: 'Amazônia' },
    'para': { nome: 'Pará', sigla: 'PA', bioma: 'Amazônia' },
    'rondonia': { nome: 'Rondônia', sigla: 'RO', bioma: 'Amazônia' },
    'amazonas': { nome: 'Amazonas', sigla: 'AM', bioma: 'Amazônia' },
    'amapa': { nome: 'Amapá', sigla: 'AP', bioma: 'Amazônia' },
    'roraima': { nome: 'Roraima', sigla: 'RR', bioma: 'Amazônia' },
    'tocantins': { nome: 'Tocantins', sigla: 'TO', bioma: 'Amazônia' },
    'maranhao': { nome: 'Maranhão', sigla: 'MA', bioma: 'Amazônia' },
    'goias': { nome: 'Goiás', sigla: 'GO', bioma: 'Cerrado' },
    'minas-gerais': { nome: 'Minas Gerais', sigla: 'MG', bioma: 'Cerrado' },
    'mato-grosso-do-sul': { nome: 'Mato Grosso do Sul', sigla: 'MS', bioma: 'Cerrado' },
    'distrito-federal': { nome: 'Distrito Federal', sigla: 'DF', bioma: 'Cerrado' },
    'espirito-santo': { nome: 'Espírito Santo', sigla: 'ES', bioma: 'Mata Atlântica' },
    'parana': { nome: 'Paraná', sigla: 'PR', bioma: 'Mata Atlântica' },
    'rio-de-janeiro': { nome: 'Rio de Janeiro', sigla: 'RJ', bioma: 'Mata Atlântica' },
    'sao-paulo': { nome: 'São Paulo', sigla: 'SP', bioma: 'Mata Atlântica' },
    'santa-catarina': { nome: 'Santa Catarina', sigla: 'SC', bioma: 'Mata Atlântica' },
    'bahia': { nome: 'Bahia', sigla: 'BA', bioma: 'Caatinga' },
    'ceara': { nome: 'Ceará', sigla: 'CE', bioma: 'Caatinga' },
    'pernambuco': { nome: 'Pernambuco', sigla: 'PE', bioma: 'Caatinga' },
    'paraiba': { nome: 'Paraíba', sigla: 'PB', bioma: 'Caatinga' },
    'rio-grande-do-norte': { nome: 'Rio Grande do Norte', sigla: 'RN', bioma: 'Caatinga' },
    'sergipe': { nome: 'Sergipe', sigla: 'SE', bioma: 'Caatinga' },
    'alagoas': { nome: 'Alagoas', sigla: 'AL', bioma: 'Caatinga' },
    'piaui': { nome: 'Piauí', sigla: 'PI', bioma: 'Caatinga' },
    'rio-grande-do-sul': { nome: 'Rio Grande do Sul', sigla: 'RS', bioma: 'Pampa' },
    'mato-grosso': { nome: 'Mato Grosso', sigla: 'MT', bioma: 'Pantanal' }
};

// Helper to decode HTML entities
function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// Parse project data from WordPress page content
function parseProjectsFromContent(content) {
    // Find all benfeitoria links
    const linkPattern = /https:\/\/benfeitoria\.com\/projeto\/[^"'\s<>]+/g;
    const links = content.match(linkPattern) || [];
    const uniqueLinks = [...new Set(links)];

    // Find all images
    const imagePattern = /https:\/\/archa\.com\.br\/wp-content\/uploads\/[^"'\s<>]+\.(?:jpg|jpeg|png)/gi;
    const allImages = content.match(imagePattern) || [];

    // Extract project names and descriptions from structured content
    // Look for patterns near benfeitoria links
    const projects = [];

    for (const link of uniqueLinks) {
        // Extract state from URL pattern: -bab-STATE-CODE
        const stateMatch = link.match(/-bab-([a-z-]+)-\d/i);
        if (!stateMatch) continue;

        const stateKey = stateMatch[1].toLowerCase();
        const stateInfo = STATE_INFO[stateKey];
        if (!stateInfo) continue;

        // Extract office name from URL
        const officeMatch = link.match(/projeto\/([^-]+(?:-[^-]+)*?)-(?:projeta|arquitetura)/i);
        let escritorio = 'Escritório';
        if (officeMatch) {
            escritorio = officeMatch[1]
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        }

        // Try to find associated image near this link in content
        let imagemUrl = null;
        const linkIndex = content.indexOf(link);
        if (linkIndex !== -1) {
            // Search for image URLs within 5000 chars before the link
            const searchArea = content.substring(Math.max(0, linkIndex - 5000), linkIndex);
            const nearbyImages = searchArea.match(imagePattern);
            if (nearbyImages && nearbyImages.length > 0) {
                // Get the last (closest) image
                imagemUrl = nearbyImages[nearbyImages.length - 1];
            }
        }

        projects.push({
            bioma: stateInfo.bioma,
            estado: `${stateInfo.nome} (${stateInfo.sigla})`,
            estado_sigla: stateInfo.sigla,
            escritorio: escritorio,
            nome_projeto: `Projeto BAB ${stateInfo.sigla}`,
            descricao: null,
            imagem_url: imagemUrl,
            link_benfeitoria: link.split('?')[0]
        });
    }

    return projects;
}

// Group projects by biome
function groupByBiome(projects) {
    const biomeOrder = ['Amazônia', 'Cerrado', 'Mata Atlântica', 'Caatinga', 'Pampa', 'Pantanal'];

    const grouped = projects.reduce((acc, project) => {
        const { bioma } = project;
        if (!acc[bioma]) acc[bioma] = [];
        acc[bioma].push(project);
        return acc;
    }, {});

    // Sort by biome order
    const orderedGrouped = {};
    for (const biome of biomeOrder) {
        if (grouped[biome]) {
            orderedGrouped[biome] = grouped[biome];
        }
    }

    return orderedGrouped;
}

export default function BabBenfeitoria() {
    const [projects, setProjects] = useState([]);
    const [projectsByBiome, setProjectsByBiome] = useState({});
    const [activeBiome, setActiveBiome] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchProjects() {
            try {
                setLoading(true);
                setError(null);

                // Check cache first (valid for 1 hour)
                const cached = localStorage.getItem('bab_projects_cache');
                const cacheTime = localStorage.getItem('bab_projects_cache_time');
                const oneHour = 60 * 60 * 1000;

                if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < oneHour) {
                    const parsedProjects = JSON.parse(cached);
                    setProjects(parsedProjects);
                    const grouped = groupByBiome(parsedProjects);
                    setProjectsByBiome(grouped);
                    setActiveBiome(Object.keys(grouped)[0] || '');
                    setLoading(false);
                    return;
                }

                // Fetch from WordPress API
                const response = await fetch(WP_API_URL);
                if (!response.ok) {
                    throw new Error('Erro ao carregar projetos');
                }

                const data = await response.json();
                const content = data.content?.rendered || '';
                const decodedContent = decodeHtml(content);

                // Parse projects from content
                const parsedProjects = parseProjectsFromContent(decodedContent);

                // Cache the results
                localStorage.setItem('bab_projects_cache', JSON.stringify(parsedProjects));
                localStorage.setItem('bab_projects_cache_time', Date.now().toString());

                setProjects(parsedProjects);
                const grouped = groupByBiome(parsedProjects);
                setProjectsByBiome(grouped);
                setActiveBiome(Object.keys(grouped)[0] || '');

            } catch (err) {
                console.error('Error fetching BAB projects:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, []);

    const biomes = Object.keys(projectsByBiome);

    const scrollToBiome = (biome) => {
        setActiveBiome(biome);
        const element = document.getElementById(`biome-${biome}`);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="benfeitoria-container">
                <div className="bab-hero">
                    <div className="bab-hero-content">
                        <h1>Todos Juntos Pela Arquitetura Brasileira</h1>
                        <p className="bab-hero-subtitle">Carregando projetos...</p>
                    </div>
                </div>
                <div className="bab-loading">
                    <div className="bab-loading-spinner"></div>
                    <p>Buscando projetos do WordPress...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="benfeitoria-container">
                <div className="bab-hero">
                    <div className="bab-hero-content">
                        <h1>Todos Juntos Pela Arquitetura Brasileira</h1>
                    </div>
                </div>
                <div className="bab-error">
                    <p>Erro ao carregar projetos: {error}</p>
                    <button onClick={() => window.location.reload()}>Tentar novamente</button>
                </div>
            </div>
        );
    }

    return (
        <div className="benfeitoria-container">

            {/* Hero Section */}
            <div className="bab-hero">
                <div className="bab-hero-content">
                    <h1>
                        Todos Juntos Pela Arquitetura Brasileira
                    </h1>
                    <p className="bab-hero-subtitle">
                        Ajude a viabilizar os projetos vencedores da Bienal de Arquitetura Brasileira
                    </p>
                    <p className="bab-hero-date">
                        Parque Ibirapuera em São Paulo 25/03 – 26/04
                    </p>
                </div>
            </div>

            {/* Intro Section */}
            <div className="bab-intro">
                <p className="bab-intro-title">
                    AJUDE A VIABILIZAR OS PROJETOS VENCEDORES DA BIENAL DE ARQUITETURA BRASILEIRA
                </p>
                <p className="bab-intro-text">
                    Os projetos vencedores da Bienal de Arquitetura Brasileira representam o melhor da produção arquitetônica de todos os estados do país. Para que esses trabalhos possam ser apresentados, divulgados e ganhar visibilidade nacional, eles precisam do seu apoio.
                </p>
                <p className="bab-project-count">
                    <strong>{projects.length} projetos</strong> de {biomes.length} biomas brasileiros
                </p>
            </div>

            {/* Biome Navigation */}
            {biomes.length > 0 && (
                <nav className="bab-biome-nav">
                    <div className="bab-biome-nav-inner">
                        {biomes.map((biome) => (
                            <button
                                key={biome}
                                onClick={() => scrollToBiome(biome)}
                                className={`bab-biome-btn ${activeBiome === biome ? 'active' : ''}`}
                            >
                                {biome} ({projectsByBiome[biome].length})
                            </button>
                        ))}
                    </div>
                </nav>
            )}

            {/* Projects Content */}
            <div className="bab-projects-content">
                {biomes.map((biome) => (
                    <div key={biome} id={`biome-${biome}`} className="bab-biome-section">

                        {/* Biome Title */}
                        <h2 className="bab-biome-title">
                            Bioma {biome}
                        </h2>

                        {/* Projects List */}
                        <div className="bab-biome-projects">
                            {projectsByBiome[biome].map((project, index) => (
                                <article key={index} className="bab-project-card">

                                    {/* Image */}
                                    {project.imagem_url && (
                                        <div className="bab-project-image-wrapper">
                                            <img
                                                src={project.imagem_url}
                                                alt={project.nome_projeto}
                                                className="bab-project-image"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="bab-project-details">
                                        <div className="bab-project-meta">
                                            <p><span>Estado:</span> {project.estado}</p>
                                            <p><span>Escritório:</span> {project.escritorio}</p>
                                        </div>

                                        {project.descricao && (
                                            <p className="bab-project-description">
                                                {project.descricao}
                                            </p>
                                        )}

                                        <a
                                            href={project.link_benfeitoria}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bab-support-btn"
                                        >
                                            Quero apoiar o projeto
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="bab-biome-divider"></div>
                    </div>
                ))}
            </div>

        </div>
    );
}
