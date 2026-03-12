import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Modules',
  description:
    "Modules Freenzy.io — Activez et personnalisez les fonctionnalités de votre plateforme IA. Extensions modulaires pour l'automatisation d'entreprise.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
