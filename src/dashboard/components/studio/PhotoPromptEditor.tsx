'use client';

import { useState } from 'react';

const STYLE_PRESETS = [
  // ─── Classiques ───
  { id: 'realistic', label: 'Realiste', icon: 'photo_camera', desc: 'Photo haute definition' },
  { id: 'cinematic', label: 'Cinematique', icon: 'movie', desc: 'Eclairage dramatique' },
  { id: 'portrait', label: 'Portrait', icon: 'person', desc: 'Photo portrait studio' },
  { id: 'bw', label: 'Noir et Blanc', icon: 'contrast', desc: 'Monochrome contrastes' },
  { id: 'film-grain', label: 'Argentique', icon: 'film_reel', desc: 'Grain et teintes film' },
  { id: 'polaroid', label: 'Polaroid', icon: 'photo_camera_back', desc: 'Photo instantanee retro' },
  { id: 'vintage', label: 'Vintage', icon: 'history', desc: 'Photo ancienne, tons sepia' },
  // ─── Artistiques ───
  { id: 'illustration', label: 'Illustration', icon: 'palette', desc: 'Illustration digitale' },
  { id: 'watercolor', label: 'Aquarelle', icon: 'brush', desc: 'Peinture douce' },
  { id: 'oil-painting', label: 'Peinture huile', icon: 'image', desc: 'Style classique peinture' },
  { id: 'pencil-sketch', label: 'Crayon', icon: 'edit', desc: 'Dessin au crayon' },
  { id: 'impressionist', label: 'Impressionniste', icon: 'filter_vintage', desc: 'Style Monet, touches' },
  { id: 'surrealist', label: 'Surrealiste', icon: 'auto_awesome', desc: 'Style Dali, onirique' },
  { id: 'pop-art', label: 'Pop Art', icon: 'color_lens', desc: 'Style Warhol, vif' },
  // ─── Digital & Design ───
  { id: 'flat-design', label: 'Flat Design', icon: 'dashboard', desc: 'Design plat vectoriel' },
  { id: '3d-render', label: '3D Render', icon: 'view_in_ar', desc: 'Rendu 3D cinema' },
  { id: 'minimalist', label: 'Minimaliste', icon: 'crop_square', desc: 'Simple et epure' },
  { id: 'pixel-art', label: 'Pixel Art', icon: 'grid_on', desc: 'Retro gaming pixels' },
  { id: 'comics', label: 'Comics / BD', icon: 'bolt', desc: 'Bande dessinee' },
  // ─── Ambiances ───
  { id: 'neon-cyberpunk', label: 'Cyberpunk', icon: 'electric_bolt', desc: 'Neons futuristes' },
  { id: 'anime', label: 'Anime', icon: 'spa', desc: 'Style japonais anime' },
  { id: 'movie-poster', label: 'Affiche Film', icon: 'film_reel', desc: 'Style poster cinema' },
  { id: 'gothic', label: 'Gothique', icon: 'dark_mode', desc: 'Dark et atmospherique' },
  { id: 'art-deco', label: 'Art Deco', icon: 'account_balance', desc: 'Style annees 1920' },
  { id: 'vaporwave', label: 'Vaporwave', icon: 'beach_access', desc: 'Esthetique 80s/90s' },
  // ─── Specialises ───
  { id: 'food-photo', label: 'Food Photo', icon: 'restaurant', desc: 'Photo culinaire pro' },
  { id: 'architecture', label: 'Architecture', icon: 'home', desc: 'Photo immobiliere' },
  { id: 'cartoon-avatar', label: 'Cartoon', icon: 'face', desc: 'Avatar cartoon moderne' },
];

const PROMPT_TEMPLATES: Record<string, string> = {
  'realistic': 'Portrait professionnel d\'une femme d\'affaires dans un bureau moderne, eclairage naturel doux, arriere-plan flou bokeh, photo haute definition 8K',
  'cinematic': 'Scene dramatique dans une ruelle sombre eclairee par des lampadaires, pluie fine, reflets au sol, eclairage orange et bleu, anamorphique, style Blade Runner',
  'portrait': 'Portrait studio d\'un homme d\'affaires confiant, fond gris neutre, eclairage Rembrandt, regard camera, costume sombre, photo professionnelle',
  'bw': 'Rue de Paris sous la pluie en noir et blanc, contrastes forts, silhouette avec parapluie, reflets sur les paves, style Henri Cartier-Bresson',
  'film-grain': 'Scene de cafe parisien annees 1970, grain de film Kodak Portra 400, couleurs chaudes delavees, lumiere naturelle, ambiance nostalgique',
  'polaroid': 'Pique-nique d\'ete au bord de la mer, cadre blanc Polaroid, couleurs legerement saturees, lumiere doree du coucher de soleil, ambiance vacances',
  'vintage': 'Photo de famille annees 1960, tons sepia chauds, grain de film, couleurs delavees, ambiance nostalgique, vetements d\'epoque',
  'illustration': 'Ville futuriste flottante dans les nuages, style illustration digitale detaillee, couleurs vibrantes, lumieres volumetriques, concept art',
  'watercolor': 'Jardin de fleurs au printemps en aquarelle, couleurs douces et transparentes, effet de pigments qui fusionnent, papier texture visible',
  'oil-painting': 'Nature morte de fruits et fleurs sur une table en bois, style peinture a l\'huile classique, eclairage clair-obscur, coups de pinceau visibles, style flamand',
  'pencil-sketch': 'Chat endormi sur un coussin, dessin au crayon graphite detaille, ombres hachurees, texture papier, style croquis naturaliste',
  'impressionist': 'Champ de coquelicots au coucher du soleil, touches de couleur visibles, lumiere diffuse, style Claude Monet, paysage pastoral',
  'surrealist': 'Escalier impossible montant vers un ciel rempli de poissons volants, horloges fondantes sur les marches, style Salvador Dali, onirique',
  'pop-art': 'Portrait colore style Andy Warhol, 4 panneaux de couleurs differentes, demi-tons apparents, couleurs neon vives, fond graphique bold',
  'flat-design': 'Espace de travail moderne vu d\'en haut, icones et objets en flat design, couleurs pastel, sans ombre ni perspective, style infographie',
  '3d-render': 'Salon d\'interieur minimaliste scandinave en 3D, eclairage realiste, materiaux textures (bois, tissu, verre), rendu Octane, ultra-detaille',
  'minimalist': 'Un seul arbre solitaire au milieu d\'un desert de sable blanc, ciel bleu pur, composition centree, espace negatif, zen',
  'pixel-art': 'Chateau medieval en pixel art 16 bits, palette limitee, ciel etoile, torches animees, style retro gaming SNES',
  'comics': 'Super-heros atterrissant sur un toit, style bande dessinee americaine, lignes d\'action, bulles de dialogue, couleurs primaires vives, encrage noir',
  'neon-cyberpunk': 'Rue de Tokyo la nuit, enseignes neon roses et bleues, pluie, personnage avec veste cyber, hologrammes, style cyberpunk 2077',
  'anime': 'Personnage anime aux cheveux bleus face a l\'ocean, cerisiers en fleur, coucher de soleil pastel, style Studio Ghibli, lumiere magique',
  'movie-poster': 'Affiche de film d\'action : homme en costume marchant vers une explosion, titre en haut en typographie bold, eclairage dramatique orange et bleu teal',
  'gothic': 'Cathedrale gothique abandonnee au clair de lune, brume, vitraux brises, lierre, corbeaux, ambiance sombre et mysterieuse',
  'art-deco': 'Gratte-ciel art deco dore avec motifs geometriques, style affiche annees 1920, couleurs or noir et ivoire, typographie elegante',
  'vaporwave': 'Statue grecque au milieu de palmiers et grille retrowave, coucher de soleil violet et rose, glitch effects, esthetique vaporwave 80s',
  'food-photo': 'Plat gastronomique presente sur table en bois sombre, eclairage naturel lateral doux, herbes fraiches et epices autour, vapeur legere, style food photography magazine, bokeh doux arriere-plan',
  'architecture': 'Salon moderne scandinave lumineux, grandes baies vitrees, parquet chene clair, canape blanc, plantes vertes, eclairage naturel abondant, photo immobiliere professionnelle grand angle',
  'cartoon-avatar': 'Portrait cartoon 3D moderne style Pixar, visage souriant et expressif, fond gradient colore violet vers bleu, rendu 3D doux et lumineux, eclairage studio trois points',
};

const DIMENSION_PRESETS = [
  { id: 'square', label: 'Carre 1:1', size: '1024x1024' },
  { id: 'landscape', label: 'Paysage 16:9', size: '1344x768' },
  { id: 'portrait', label: 'Portrait 9:16', size: '768x1344' },
  { id: 'social-story', label: 'Story', size: '768x1344' },
  { id: 'social-post', label: 'Post social', size: '1024x1024' },
  { id: 'banner', label: 'Banniere', size: '1536x512' },
  { id: 'youtube-thumb', label: 'Miniature YT', size: '1280x720' },
  { id: 'pinterest', label: 'Pinterest', size: '1000x1500' },
  { id: 'linkedin', label: 'LinkedIn', size: '1200x627' },
  { id: 'ig-portrait', label: 'Insta 4:5', size: '1080x1350' },
];

interface PhotoPromptEditorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (neg: string) => void;
  style: string;
  onStyleChange: (style: string) => void;
  dimensions: string;
  onDimensionsChange: (dim: string) => void;
}

export default function PhotoPromptEditor({
  prompt, onPromptChange, negativePrompt, onNegativePromptChange,
  style, onStyleChange, dimensions, onDimensionsChange,
}: PhotoPromptEditorProps) {
  const [showNegative, setShowNegative] = useState(false);
  const [showAllStyles, setShowAllStyles] = useState(false);

  const visibleStyles = showAllStyles ? STYLE_PRESETS : STYLE_PRESETS.slice(0, 12);
  const hasTemplate = style && PROMPT_TEMPLATES[style];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Prompt */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#1d1d1f', display: 'block', marginBottom: 6 }}>
          Prompt de generation
        </label>
        <textarea
          value={prompt}
          onChange={e => onPromptChange(e.target.value)}
          placeholder="Decrivez l'image que vous souhaitez generer..."
          rows={4}
          style={{
            width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e5e7eb',
            fontSize: 13, fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical', outline: 'none',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>
            Soyez precis : sujet, style, eclairage, composition, couleurs
          </span>
          {hasTemplate && (
            <button
              onClick={() => onPromptChange(PROMPT_TEMPLATES[style])}
              style={{
                fontSize: 10, color: '#8b5cf6', background: '#f5f3ff', border: '1px solid #e9e5ff',
                borderRadius: 12, padding: '3px 10px', cursor: 'pointer', fontWeight: 600,
                transition: 'all 0.15s',
              }}
              title="Inserer un exemple de prompt pour ce style"
            >
              Exemple de prompt
            </button>
          )}
        </div>
      </div>

      {/* Negative prompt toggle */}
      <div>
        <button
          onClick={() => setShowNegative(!showNegative)}
          style={{
            fontSize: 11, color: '#6b7280', background: 'none', border: 'none',
            cursor: 'pointer', padding: 0, textDecoration: 'underline',
          }}
        >
          {showNegative ? 'Masquer' : 'Afficher'} le prompt negatif
        </button>
        {showNegative && (
          <textarea
            value={negativePrompt}
            onChange={e => onNegativePromptChange(e.target.value)}
            placeholder="Elements a eviter (flou, basse qualite, texte...)"
            rows={2}
            style={{
              width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb',
              fontSize: 12, fontFamily: 'inherit', marginTop: 6, resize: 'vertical', outline: 'none',
            }}
          />
        )}
      </div>

      {/* Style presets */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#1d1d1f' }}>
            Style ({STYLE_PRESETS.length} disponibles)
          </label>
          <button
            onClick={() => setShowAllStyles(!showAllStyles)}
            style={{
              fontSize: 10, color: '#8b5cf6', background: 'none', border: 'none',
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            {showAllStyles ? 'Voir moins' : `Voir les ${STYLE_PRESETS.length} styles`}
          </button>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: 6,
          maxHeight: showAllStyles ? 'none' : 200,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}>
          {visibleStyles.map(s => (
            <button
              key={s.id}
              onClick={() => onStyleChange(s.id)}
              title={s.desc}
              style={{
                padding: '8px 4px', borderRadius: 8,
                border: `2px solid ${style === s.id ? '#8b5cf6' : '#e5e7eb'}`,
                background: style === s.id ? '#f5f3ff' : 'white', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                transition: 'all 0.15s',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: '#1d1d1f', textAlign: 'center', lineHeight: 1.2 }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dimensions */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#1d1d1f', display: 'block', marginBottom: 8 }}>
          Format
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {DIMENSION_PRESETS.map(d => (
            <button
              key={d.id}
              onClick={() => onDimensionsChange(d.id)}
              style={{
                padding: '6px 12px', borderRadius: 20,
                border: `1px solid ${dimensions === d.id ? '#8b5cf6' : '#e5e7eb'}`,
                background: dimensions === d.id ? '#f5f3ff' : 'white',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                color: dimensions === d.id ? '#7c3aed' : '#6b7280',
              }}
            >
              {d.label} <span style={{ fontWeight: 400, fontSize: 10 }}>({d.size})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
