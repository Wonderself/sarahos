'use client';

import { useState } from 'react';
import Link from 'next/link';

const FEATURES = [
  {
    icon: 'call',
    title: 'Repondeur IA 24/7',
    description: 'Ne manquez plus aucun appel. Sarah repond, qualifie et transfere intelligemment.',
    stat: '98%',
    statLabel: 'appels traites',
  },
  {
    icon: 'edit_document',
    title: 'Documents automatises',
    description: 'Contrats, devis, factures generes en quelques secondes avec vos donnees.',
    stat: '10x',
    statLabel: 'plus rapide',
  },
  {
    icon: 'schedule',
    title: 'Agenda intelligent',
    description: 'Planification automatique, rappels, et synchronisation multi-calendriers.',
    stat: '5h',
    statLabel: 'gagnees/semaine',
  },
  {
    icon: 'share',
    title: 'Reseaux sociaux',
    description: 'Contenu genere, planifie et publie sur toutes vos plateformes.',
    stat: '300%',
    statLabel: 'engagement',
  },
];

const AGENTS = [
  { name: 'Communication', count: 12, color: '#3B82F6' },
  { name: 'Documents', count: 8, color: '#10B981' },
  { name: 'Scheduling', count: 6, color: '#F59E0B' },
  { name: 'Analytics', count: 10, color: '#8B5CF6' },
  { name: 'Social Media', count: 15, color: '#EC4899' },
  { name: 'Finance', count: 9, color: '#06B6D4' },
];

const TESTIMONIALS = [
  {
    quote: "J'ai gagne 15 heures par semaine depuis que j'utilise SarahOS. Mon repondeur IA gere 90% de mes appels.",
    author: 'Marie Dubois',
    role: 'CEO, TechStart',
    avatar: 'M',
  },
  {
    quote: "Le dashboard est incroyablement intuitif. Meme mon equipe non-technique l'a adopte en quelques minutes.",
    author: 'Thomas Martin',
    role: 'Directeur Operations',
    avatar: 'T',
  },
  {
    quote: "Gratuit pour commencer, et la valeur est immediate. C'est rare de trouver un outil aussi complet sans engagement.",
    author: 'Sophie Laurent',
    role: 'Freelance Designer',
    avatar: 'S',
  },
];

export default function SaaSLanding() {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Announcement Banner */}
      <div className="bg-accent/10 border-b border-accent/20">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 text-accent font-medium">
            <span className="material-symbols-rounded text-base">auto_awesome</span>
            Nouveau: 72 agents IA disponibles
          </span>
          <Link href="#features" className="text-foreground/60 hover:text-foreground transition-colors">
            En savoir plus →
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              SarahOS
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm text-muted hover:text-foreground transition-colors">
                Fonctionnalites
              </Link>
              <Link href="#agents" className="text-sm text-muted hover:text-foreground transition-colors">
                Agents
              </Link>
              <Link href="#pricing" className="text-sm text-muted hover:text-foreground transition-colors">
                Tarifs
              </Link>
              <Link href="/docs" className="text-sm text-muted hover:text-foreground transition-colors">
                Documentation
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm text-muted hover:text-foreground transition-colors px-3 py-2">
              Connexion
            </Link>
            <Link href="/login?mode=register" className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-lg hover:bg-foreground/90 transition-colors">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              La plateforme complete pour{' '}
              <span className="text-accent">automatiser</span> votre business
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              72 agents IA qui travaillent ensemble pour gerer vos appels, documents, 
              reseaux sociaux et plus encore. Gratuit pour commencer.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Link 
                href="/login?mode=register" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg font-medium hover:bg-foreground/90 transition-colors"
              >
                Commencer gratuitement
                <span className="material-symbols-rounded text-lg">arrow_forward</span>
              </Link>
              <Link 
                href="#demo" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-border px-6 py-3 rounded-lg font-medium hover:bg-muted/10 transition-colors"
              >
                Voir la demo
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Sans carte bancaire. 50 credits offerts.
            </p>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-5xl mx-auto px-4 -mt-8">
          <div className="relative rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-foreground/5">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-muted/10 text-xs text-muted">
                  app.sarahos.com/dashboard
                </div>
              </div>
            </div>
            
            {/* Dashboard Content */}
            <div className="p-6 bg-gradient-to-b from-card to-muted/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Appels traites', value: '1,247', change: '+12%' },
                  { label: 'Documents generes', value: '89', change: '+8%' },
                  { label: 'Temps economise', value: '48h', change: '+15%' },
                  { label: 'Agents actifs', value: '24/72', change: '' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-lg bg-background border border-border">
                    <div className="text-xs text-muted mb-1">{stat.label}</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold">{stat.value}</span>
                      {stat.change && (
                        <span className="text-xs text-green-500 font-medium">{stat.change}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Agent Activity */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 p-4 rounded-lg bg-background border border-border">
                  <div className="text-sm font-medium mb-4">Activite des agents</div>
                  <div className="space-y-3">
                    {[
                      { agent: 'Repondeur', action: 'Appel qualifie de +33 6 12 34 56 78', time: 'il y a 2 min' },
                      { agent: 'Documents', action: 'Devis genere pour Client ABC', time: 'il y a 5 min' },
                      { agent: 'Social', action: 'Post LinkedIn publie', time: 'il y a 12 min' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-accent">{activity.agent[0]}</span>
                          </div>
                          <div>
                            <div className="text-sm">{activity.action}</div>
                            <div className="text-xs text-muted">{activity.agent}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted">{activity.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border">
                  <div className="text-sm font-medium mb-4">Repartition agents</div>
                  <div className="space-y-2">
                    {AGENTS.slice(0, 4).map((agent, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: agent.color }} />
                          <span className="text-sm">{agent.name}</span>
                        </div>
                        <span className="text-xs text-muted">{agent.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-16 border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm text-muted mb-8">
            Propulse par les meilleures technologies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {['Claude AI', 'OpenAI', 'Twilio', 'ElevenLabs', 'Vercel'].map((brand) => (
              <span key={brand} className="text-muted/60 font-medium">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Des outils puissants et accessibles pour automatiser chaque aspect de votre activite.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <div 
                key={i} 
                className="group p-6 rounded-xl border border-border bg-card hover:border-accent/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <span className="material-symbols-rounded text-2xl text-accent">
                      {feature.icon}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold">{feature.stat}</div>
                    <div className="text-xs text-muted">{feature.statLabel}</div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section id="agents" className="py-24 bg-muted/5 border-y border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <span className="material-symbols-rounded text-base">deployed_code</span>
              72 agents disponibles
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Une armee d&apos;agents a votre service
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Chaque agent est specialise dans un domaine. Ils collaborent automatiquement pour accomplir vos taches.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {AGENTS.map((agent, i) => (
              <div 
                key={i}
                className="p-4 rounded-xl border border-border bg-card text-center hover:border-accent/30 transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${agent.color}20` }}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: agent.color }}
                  />
                </div>
                <div className="font-medium text-sm mb-1">{agent.name}</div>
                <div className="text-xs text-muted">{agent.count} agents</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Pret en 3 etapes
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Commencez a automatiser votre business en quelques minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Creez votre compte',
                description: 'Inscription gratuite en 30 secondes. Aucune carte bancaire requise.',
                icon: 'person_add',
              },
              {
                step: '02',
                title: 'Configurez vos agents',
                description: 'Selectionnez et personnalisez les agents selon vos besoins.',
                icon: 'settings',
              },
              {
                step: '03',
                title: 'Laissez-les travailler',
                description: 'Vos agents prennent le relais. Suivez tout depuis le dashboard.',
                icon: 'trending_up',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-muted/10 mb-4">{item.step}</div>
                <div className="w-12 h-12 rounded-lg bg-foreground flex items-center justify-center mb-4">
                  <span className="material-symbols-rounded text-2xl text-background">
                    {item.icon}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/5 border-y border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Decouvrez ce que nos utilisateurs disent de SarahOS.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <div 
                key={i}
                className="p-6 rounded-xl border border-border bg-card"
              >
                <p className="text-sm leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="font-medium text-accent">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{testimonial.author}</div>
                    <div className="text-xs text-muted">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium mb-4">
              <span className="material-symbols-rounded text-base">verified</span>
              Gratuit pour commencer
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Prix simple et transparent
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Pas d&apos;abonnement. Payez uniquement ce que vous utilisez.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Tier */}
            <div className="p-8 rounded-xl border border-border bg-card">
              <div className="text-sm font-medium text-muted mb-2">Pour commencer</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-semibold">0</span>
                <span className="text-muted">EUR</span>
              </div>
              <p className="text-sm text-muted mb-6">
                50 credits offerts a l&apos;inscription. Parfait pour tester.
              </p>
              <Link 
                href="/login?mode=register"
                className="block w-full text-center py-3 rounded-lg border border-border font-medium hover:bg-muted/10 transition-colors"
              >
                Commencer gratuitement
              </Link>
              <ul className="mt-6 space-y-3">
                {[
                  'Acces a tous les 72 agents',
                  'Dashboard complet',
                  'Support par email',
                  '50 credits offerts',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-rounded text-lg text-green-500">check</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pay as you go */}
            <div className="p-8 rounded-xl border-2 border-accent bg-card relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent text-background text-xs font-medium px-3 py-1 rounded-bl-lg">
                Populaire
              </div>
              <div className="text-sm font-medium text-accent mb-2">A la consommation</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-semibold">0.10</span>
                <span className="text-muted">EUR / credit</span>
              </div>
              <p className="text-sm text-muted mb-6">
                Rechargez quand vous voulez. Pas d&apos;engagement.
              </p>
              <Link 
                href="/login?mode=register"
                className="block w-full text-center py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
              >
                Commencer maintenant
              </Link>
              <ul className="mt-6 space-y-3">
                {[
                  'Tout du plan gratuit',
                  'Credits illimites',
                  'API access',
                  'Support prioritaire',
                  'Integrations avancees',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-rounded text-lg text-accent">check</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-foreground text-background">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            Pret a automatiser votre business ?
          </h2>
          <p className="text-background/60 max-w-xl mx-auto mb-8">
            Rejoignez des milliers d&apos;entrepreneurs qui utilisent SarahOS pour gagner du temps chaque jour.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full sm:w-80 px-4 py-3 rounded-lg bg-background/10 border border-background/20 text-background placeholder:text-background/40 focus:outline-none focus:border-background/40"
            />
            <button className="w-full sm:w-auto px-6 py-3 rounded-lg bg-background text-foreground font-medium hover:bg-background/90 transition-colors">
              Commencer gratuitement
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="font-semibold">SarahOS</span>
              <span className="text-sm text-muted">— Votre assistant IA</span>
            </div>
            <div className="flex items-center gap-6">
              {[
                { label: 'Documentation', href: '/docs' },
                { label: 'Tarifs', href: '#pricing' },
                { label: 'CGU', href: '/terms' },
                { label: 'Confidentialite', href: '/privacy' },
              ].map((link) => (
                <Link key={link.label} href={link.href} className="text-sm text-muted hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="text-sm text-muted">
              2026 SarahOS
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
