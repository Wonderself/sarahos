# Session 13 — SEO blog : metadata uniques par article

**Modèle conseillé** : Haiku (économe — travail répétitif) · **Coût** : 🟢 léger · **Durée** : ~20 min

## Contexte (source : AUDIT-RESULTS.md §3 — SEO 75/100)

Points déjà bons (ne pas y toucher) : metadata racine riche, JSON-LD complet (Organization, SoftwareApplication, FAQPage, BreadcrumbList), 21 canonical sur les pages publiques, sitemap.ts, robots.ts.

Point faible : **les articles de blog n'ont pas de metadata unique** — ils héritent du title/description génériques du site. Résultat : mauvais CTR Google, pas de rich previews propres au partage.

Fichiers concernés :
- Contenu des articles : `src/dashboard/lib/blog-data.ts` (les articles y ont déjà title/description/slug — vérifier la structure exacte).
- Page article : `src/dashboard/app/blog/[slug]/page.tsx` (ou équivalent — vérifier avec `ls src/dashboard/app/blog`).

## Étapes

1. Regarder la structure de `blog-data.ts` (champs disponibles par article : title, excerpt/description, date, image ?).
2. Dans la page article dynamique, implémenter `generateMetadata({params})` (App Router) :
   - `title` : titre de l'article + « — Freenzy.io »
   - `description` : excerpt de l'article (≤ 160 caractères, tronquer proprement)
   - `alternates.canonical` : `https://app.freenzy.io/blog/<slug>` (vérifier le domaine canonique utilisé par les autres pages publiques et rester cohérent)
   - `openGraph` : title, description, type 'article', publishedTime, image si dispo
   - `twitter` : card summary_large_image
3. Ajouter le JSON-LD `Article`/`BlogPosting` par article (script type application/ld+json) : headline, datePublished, author Organization Freenzy.
4. Vérifier que la page index `/blog` a sa propre metadata (title « Blog — Freenzy.io » + description).
5. Vérifier que le sitemap inclut bien tous les slugs d'articles.
6. Build.

## Critère de réussite

- Chaque article a title/description/canonical/OG uniques (vérifier le HTML généré par le build sur 2-3 articles).
- JSON-LD BlogPosting présent par article.
- `next build` vert.

## 🚀 Megaprompt de lancement (copier-coller)

```
Lis AUDIT.md (tableau des sessions uniquement) puis audit/sessions/session-13.md et exécute la Session 13.

Mission : donner à chaque article de blog des metadata SEO uniques (generateMetadata + JSON-LD BlogPosting).

Règles strictes :
- Source de données : src/dashboard/lib/blog-data.ts — regarde sa structure d'abord, réutilise les champs existants.
- Implémente generateMetadata dans la page article dynamique (App Router) : title, description ≤160c, canonical cohérent avec les autres pages publiques, OpenGraph type article, Twitter card.
- Ajoute le JSON-LD BlogPosting par article. Ne touche PAS au JSON-LD racine existant (il est bon).
- Vérifie que le sitemap couvre tous les slugs.
- OBLIGATOIRE : cd src/dashboard && NODE_OPTIONS="--max-old-space-size=4096" npx next build → 0 erreur, puis inspecte le HTML généré de 2 articles pour confirmer les metadata.
- Commit : feat(seo): unique metadata + JSON-LD per blog article
- Fin de session : mets à jour AUDIT.md (statut + HISTORIQUE).
- Réponds en français, concis, diffs uniquement.
```
