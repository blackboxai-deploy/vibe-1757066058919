"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    evaluations: 0,
    codeReviews: 0,
    qcmSessions: 0,
    totalQuestions: 0
  });

  useEffect(() => {
    // Simulation de chargement des statistiques
    setStats({
      evaluations: 25,
      codeReviews: 12,
      qcmSessions: 8,
      totalQuestions: 156
    });
  }, []);

  const modules = [
    {
      id: "evaluation",
      title: "Évaluation Interactive",
      description: "Analysez le code étudiant et générez des questions personnalisées pour évaluer la compréhension",
      href: "/evaluation",
      icon: "🎯",
      color: "bg-blue-500",
      features: ["Génération automatique de questions", "Validation contextuelle", "Notation intelligente", "Feedback détaillé"]
    },
    {
      id: "code-review",
      title: "Amélioration de Code",
      description: "Obtenez des suggestions d'amélioration et des questions pour faciliter la compréhension externe",
      href: "/code-review",
      icon: "🔍",
      color: "bg-green-500",
      features: ["Analyse de conformité", "Suggestions d'amélioration", "Questions pour externes", "Rapport exportable"]
    },
    {
      id: "qcm",
      title: "QCM Intelligent",
      description: "Créez des QCM aléatoires à partir de sujets LaTeX avec gestion de base de données",
      href: "/qcm",
      icon: "📝",
      color: "bg-purple-500",
      features: ["Parser LaTeX", "Questions aléatoires", "Support multilingue", "Système skip/report"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Plateforme Éducative Intelligente
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Système d'évaluation et d'amélioration basé sur l'Intelligence Artificielle
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-blue-600">{stats.evaluations}</CardTitle>
              <CardDescription>Évaluations réalisées</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-green-600">{stats.codeReviews}</CardTitle>
              <CardDescription>Analyses de code</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-purple-600">{stats.qcmSessions}</CardTitle>
              <CardDescription>Sessions QCM</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-orange-600">{stats.totalQuestions}</CardTitle>
              <CardDescription>Questions en base</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card key={module.id} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center text-2xl`}>
                    {module.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                      {module.title}
                    </CardTitle>
                    <Badge variant="outline" className="mt-1">
                      IA-Powered
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Fonctionnalités clés :</h4>
                  <ul className="space-y-1">
                    {module.features.map((feature, index) => (
                      <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={module.href}>
                  <Button className="w-full group-hover:scale-105 transition-transform">
                    Accéder au module
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Section Workflow */}
        <Card className="mt-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl">Workflow Recommandé</CardTitle>
            <CardDescription>
              Processus optimal pour une évaluation complète
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-medium mb-1">1. Évaluation</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Analysez et questionnez le code</p>
              </div>
              <div className="text-slate-400 text-2xl">→</div>
              <div className="flex-1 text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="text-2xl mb-2">🔍</div>
                <h3 className="font-medium mb-1">2. Amélioration</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Suggérez des optimisations</p>
              </div>
              <div className="text-slate-400 text-2xl">→</div>
              <div className="flex-1 text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="text-2xl mb-2">📝</div>
                <h3 className="font-medium mb-1">3. Validation</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Testez avec des QCM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}