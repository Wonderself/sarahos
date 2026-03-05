export const CINEASTE_SYSTEM_PROMPT = `Tu es l'Agent Cineaste de Freenzy.io — guide expert en creation cinematographique assistee par IA.

ROLE :
Tu es un realisateur et directeur de post-production expert qui maitrise l'ensemble du pipeline
de creation de films et videos en utilisant les meilleurs outils d'intelligence artificielle disponibles.
Tu guides les utilisateurs etape par etape, du script a la distribution.

PIPELINE COMPLET DE CREATION :

1. PRE-PRODUCTION (Script & Storyboard)
   - Ecriture de scenario : structure en 3 actes, dialogues, logline
   - Storyboard IA : generation de planches visuelles avec Midjourney, DALL-E 3, Stable Diffusion
   - Prompts optimises pour chaque outil (style cinematographique, cadrage, eclairage)
   - Character design coherent via reference images et seeds

2. PRODUCTION (Generation Video IA)
   - Runway ML Gen-3 Alpha : video a partir d'images/texte, motion brush, camera controls
   - OpenAI Sora : generation video longue duree, physique realiste
   - Pika Labs : video stylisee, effets speciaux, lip sync
   - Kling AI : mouvements complexes, generation de scenes
   - Luma Dream Machine : video 3D realiste
   - Stable Video Diffusion : generation open-source
   - Techniques : img2vid, txt2vid, vid2vid, inpainting video, extension de plan

3. POST-PRODUCTION
   a) Montage :
      - DaVinci Resolve (gratuit/Studio) : montage pro, etalonnage, Fusion VFX
      - CapCut : montage rapide, sous-titres auto, effets tendance
      - Premiere Pro + After Effects : pipeline Adobe
   b) Son :
      - ElevenLabs : voix off IA haute qualite, clonage vocal
      - Suno AI : musique originale par prompt (styles, BPM, cles)
      - Udio : musique IA alternative, bon pour electro/ambient
      - Bark : text-to-speech open-source multilangue
   c) Sound Design :
      - Generation de bruitages et effets sonores IA
      - Mixage audio, spatialisation, mastering
   d) VFX & Compositing :
      - Suppression de fond, incrustation, color grading IA
      - Upscaling video (Topaz Video AI, Real-ESRGAN)
      - Debruitage et stabilisation

4. DISTRIBUTION
   - YouTube : SEO video, miniatures, chapitres, sous-titres multilingues
   - Festivals : formats requis, DCP, soumission en ligne
   - Reseaux sociaux : formats par plateforme, strategies de lancement
   - Streaming : preparation pour plateformes VOD

CAPACITES :
1. SCRIPT — Ecrire des scenarios structures (court-metrage, clip, pub, documentaire)
2. STORYBOARD — Creer des storyboards IA avec prompts optimises par outil
3. PRODUCTION — Guider la generation video IA outil par outil, plan par plan
4. POST — Superviser montage, son, VFX, etalonnage, export
5. DISTRIBUTE — Preparer et optimiser pour chaque plateforme de diffusion

REGLES :
- Reponds TOUJOURS en JSON structure
- Fournis des prompts CONCRETS et UTILISABLES directement dans les outils IA
- Inclus toujours les settings recommandes (resolution, FPS, ratio, duree)
- Mentionne les limites connues de chaque outil
- Propose des alternatives quand un outil ne convient pas
- Indique le cout estime quand pertinent
- Si tu manques d'informations, pose des questions via le champ "questions"`;

export const SCRIPT_TEMPLATE = `Ecris un scenario structure pour le projet suivant.

Type de projet : {projectType}
Genre : {genre}
Duree visee : {duration}
Theme / Sujet : {theme}
Public cible : {audience}
Ton : {tone}
Contexte supplementaire : {context}

Retourne un JSON avec :
{
  "title": "titre du projet",
  "logline": "logline en une phrase (max 30 mots)",
  "genre": "genre cinematographique",
  "duration": "duree estimee",
  "acts": [
    {
      "act": 1,
      "title": "titre de l'acte",
      "description": "resume de l'acte",
      "scenes": [
        {
          "number": 1,
          "location": "INT./EXT. LIEU - MOMENT",
          "timeOfDay": "jour/nuit/aube/crepuscule",
          "action": "description de l'action",
          "dialogue": ["PERSONNAGE: replique"]
        }
      ]
    }
  ],
  "characters": [
    {
      "name": "nom",
      "role": "protagoniste/antagoniste/secondaire",
      "description": "description physique et psychologique",
      "arc": "evolution du personnage"
    }
  ],
  "technicalNotes": "notes techniques pour la realisation",
  "moodReferences": ["references visuelles/cinematographiques"]
}`;

export const STORYBOARD_TEMPLATE = `Cree un storyboard detaille avec des prompts IA optimises pour chaque plan.

Scenario / Synopsis : {synopsis}
Style visuel : {visualStyle}
Outil principal : {primaryTool}
Nombre de plans : {panelCount}
Format : {format}
Contexte : {context}

Retourne un JSON avec :
{
  "projectTitle": "titre",
  "visualStyle": "description du style visuel global",
  "colorPalette": ["couleurs dominantes"],
  "panels": [
    {
      "panel": 1,
      "scene": 1,
      "description": "description du plan en francais",
      "cameraAngle": "type de plan (gros plan, plan large, plongee, etc.)",
      "aiPrompt": "prompt optimise pour l'outil IA (EN ANGLAIS pour meilleurs resultats)",
      "negativePrompt": "elements a eviter dans la generation",
      "suggestedTool": "Midjourney/DALL-E 3/Stable Diffusion",
      "toolSettings": "settings recommandes (--ar, --style, --v, etc.)",
      "duration": "duree du plan en secondes",
      "transition": "type de transition vers le plan suivant",
      "notes": "notes de realisation"
    }
  ],
  "consistencyTips": ["conseils pour maintenir la coherence visuelle"],
  "characterPrompts": {
    "personnage": "prompt de reference pour coherence du personnage"
  }
}`;

export const PRODUCTION_TEMPLATE = `Guide la production video IA pour le projet suivant.

Description du plan / scene : {sceneDescription}
Style visuel souhaite : {visualStyle}
Outil choisi : {tool}
Duree souhaitee : {duration}
Resolution : {resolution}
Contexte du projet : {context}

Retourne un JSON avec :
{
  "tool": "nom de l'outil",
  "version": "version recommandee",
  "steps": [
    {
      "step": 1,
      "action": "description de l'etape",
      "prompt": "prompt exact a utiliser dans l'outil",
      "settings": {
        "resolution": "1920x1080",
        "fps": "24",
        "duration": "4s",
        "motionAmount": "medium",
        "seed": "optionnel pour reproductibilite"
      },
      "tips": ["astuces pour cette etape"],
      "commonIssues": ["problemes courants et solutions"]
    }
  ],
  "alternatives": [
    {
      "tool": "outil alternatif",
      "reason": "pourquoi cette alternative",
      "adaptedPrompt": "prompt adapte pour cet outil"
    }
  ],
  "estimatedCost": "cout estime pour cette generation",
  "estimatedTime": "temps estime",
  "qualityTips": ["conseils pour maximiser la qualite"]
}`;

export const POST_PRODUCTION_TEMPLATE = `Guide la post-production du projet suivant.

Type de projet : {projectType}
Duree totale : {duration}
Style d'edition : {editStyle}
Besoins audio : {audioNeeds}
Besoins VFX : {vfxNeeds}
Plateforme cible : {targetPlatform}
Contexte : {context}

Retourne un JSON avec :
{
  "editingPipeline": [
    {
      "step": 1,
      "task": "nom de la tache",
      "tool": "outil recommande",
      "instructions": "instructions detaillees",
      "settings": {"cle": "valeur"},
      "tips": ["astuces"],
      "estimatedTime": "duree estimee"
    }
  ],
  "audioDesign": {
    "voiceover": {
      "tool": "ElevenLabs/Bark",
      "settings": {"voice": "...", "stability": 0.7, "clarity": 0.8},
      "script": "texte de la voix off"
    },
    "music": {
      "tool": "Suno/Udio",
      "prompt": "prompt pour la musique",
      "style": "genre musical",
      "bpm": 120,
      "duration": "duree"
    },
    "soundEffects": ["liste des effets sonores necessaires"],
    "mixingTips": ["conseils de mixage"]
  },
  "colorGrading": {
    "lut": "LUT recommande",
    "mood": "ambiance visee",
    "settings": {"contrast": "+10", "saturation": "-5", "temperature": "warm"}
  },
  "export": {
    "codec": "H.264/H.265/ProRes",
    "resolution": "4K/1080p",
    "fps": "24/30/60",
    "bitrate": "debit recommande",
    "format": "MP4/MOV"
  }
}`;

export const DISTRIBUTE_TEMPLATE = `Prepare un plan de distribution pour le projet suivant.

Titre du projet : {title}
Type de contenu : {contentType}
Duree : {duration}
Public cible : {audience}
Budget marketing : {budget}
Plateformes visees : {platforms}
Contexte : {context}

Retourne un JSON avec :
{
  "platforms": [
    {
      "name": "YouTube/TikTok/Instagram/Festival",
      "format": {"resolution": "...", "aspectRatio": "...", "maxDuration": "...", "codec": "..."},
      "optimization": {
        "title": "titre optimise SEO",
        "description": "description avec mots-cles",
        "tags": ["tags pertinents"],
        "thumbnail": "description de la miniature ideale",
        "chapters": ["chapitrage si applicable"]
      },
      "bestTimeToPost": "creneau optimal",
      "strategy": "strategie de lancement specifique",
      "estimatedReach": "portee estimee"
    }
  ],
  "launchPlan": {
    "preLaunch": ["actions avant la sortie"],
    "launchDay": ["actions le jour J"],
    "postLaunch": ["actions post-lancement"]
  },
  "festivals": [
    {
      "name": "nom du festival",
      "deadline": "date limite",
      "requirements": "specifications techniques",
      "submissionUrl": "lien de soumission"
    }
  ],
  "budget": {
    "total": "budget total",
    "breakdown": {"poste": "montant"}
  }
}`;
