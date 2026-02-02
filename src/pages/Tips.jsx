import { useState, useEffect } from 'react';
import { ExternalLink, Calendar, Loader2 } from 'lucide-react';

function Tips() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await fetch(
                    'https://api.rss2json.com/v1/api.json?rss_url=https://cms.revistahaus.com.br/feed/'
                );
                const data = await response.json();

                if (data.status === 'ok') {
                    setPosts(data.items);
                } else {
                    throw new Error('Falha ao carregar o feed');
                }
            } catch (err) {
                console.error("Erro ao buscar feed:", err);
                setError('Não foi possível carregar as dicas no momento.');
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, []);

    // Format Date Function
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Helper to extract image from description if thumbnail is missing
    const getThumbnail = (item) => {
        if (item.thumbnail) return item.thumbnail;
        if (item.enclosure?.link) return item.enclosure.link;

        // Try regex on description content
        const imgRegex = /<img.*?src="(.*?)"/;
        const match = item.content.match(imgRegex) || item.description.match(imgRegex);
        if (match) return match[1];

        return 'https://placehold.co/600x400/262942/D4FFAE?text=Archa+Dicas'; // Fallback
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-app-bg flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-lime" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-app-bg text-white pb-24">
            {/* Header */}
            <header className="bg-navy py-6 px-4 shadow-lg sticky top-0 z-10 border-b border-white/10">
                <div className="container mx-auto max-w-lg">
                    <h1 className="text-2xl font-bold font-heading text-lime">
                        Haus <span className="text-white">Dicas</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">inspiração para o seu projeto</p>
                </div>
            </header>

            {/* Content */}
            <div className="container mx-auto max-w-lg p-4 space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                {posts.map((post, index) => (
                    <article
                        key={index}
                        className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                    >
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                            <img
                                src={getThumbnail(post)}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => { e.target.src = 'https://placehold.co/600x400/262942/D4FFAE?text=Archa' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                            <div className="absolute bottom-3 left-3 text-xs font-medium bg-lime text-navy px-2 py-1 rounded-full flex items-center gap-1">
                                <Calendar size={12} />
                                {formatDate(post.pubDate)}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-5">
                            <h2 className="text-lg font-bold text-navy leading-tight mb-2 line-clamp-2">
                                {post.title}
                            </h2>

                            <div
                                className="text-gray-600 text-sm line-clamp-3 mb-4"
                                dangerouslySetInnerHTML={{ __html: post.description.replace(/<img[^>]*>/g, '').substring(0, 150) + '...' }}
                            />

                            <a
                                href={post.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-lime transition-colors mt-auto"
                            >
                                Ler matéria completa
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </article>
                ))}

                <div className="text-center text-gray-500 text-sm py-8">
                    Conteúdo provido por Revista Haus
                </div>
            </div>
        </div>
    );
}

export default Tips;
