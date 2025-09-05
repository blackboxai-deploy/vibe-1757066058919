"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface Improvement {
  category: string;
  priority: "haute" | "moyenne" | "faible";
  description: string;
  example?: string;
  line?: number;
}

interface ExternalQuestion {
  id: number;
  question: string;
  context: string;
}

interface AnalysisResult {
  score: number;
  improvements: Improvement[];
  externalQuestions: ExternalQuestion[];
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export default function CodeReviewPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalyzeCode = async () => {
    if (!code.trim()) {
      alert("Veuillez saisir du code à analyser");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ai/analyze-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, specifications }),
      });

      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error("Erreur analyse code:", error);
      alert("Erreur lors de l'analyse du code");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCode("");
    setLanguage("");
    setSpecifications("");
    setAnalysisResult(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "haute": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "moyenne": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "faible": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "haute": return "🔴";
      case "moyenne": return "🟡";
      case "faible": return "🔵";
      default: return "⚪";
    }
  };

  // Phase de saisie
  if (!analysisResult) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Amélioration de Code
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Obtenez des suggestions d'amélioration détaillées et des questions pour faciliter la compréhension
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Analyse de Code</CardTitle>
              <CardDescription>
                Soumettez votre code pour une analyse complète avec suggestions d'amélioration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Langage de programmation</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un langage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="csharp">C#</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="php">PHP</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                      <SelectItem value="rust">Rust</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="specifications">Spécifications du projet (optionnel)</Label>
                <Textarea
                  id="specifications"
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  placeholder="Décrivez les spécifications, normes ou objectifs du projet..."
                  className="min-h-24"
                />
              </div>

              <div>
                <Label htmlFor="code">Code à analyser</Label>
                <Textarea
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Collez ici le code à analyser..."
                  className="min-h-96 font-mono text-sm"
                />
              </div>

              <Button 
                onClick={handleAnalyzeCode} 
                disabled={isAnalyzing || !code.trim()}
                className="w-full"
              >
                {isAnalyzing ? "Analyse en cours..." : "Analyser le Code"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Phase de résultats
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Rapport d'Analyse
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Suggestions d'amélioration et questions pour la compréhension
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Nouvelle Analyse
            </Button>
            <Button onClick={() => window.print()}>
              Exporter PDF
            </Button>
          </div>
        </div>

        {/* Score global */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Score de Qualité</CardTitle>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {analysisResult.score}/100
                </div>
                <div className="text-sm text-slate-500">
                  {analysisResult.score >= 80 ? "Excellent" : 
                   analysisResult.score >= 60 ? "Bon" :
                   analysisResult.score >= 40 ? "Acceptable" : "À améliorer"}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={analysisResult.score} className="h-3 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              {analysisResult.summary}
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="improvements" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="improvements">Améliorations</TabsTrigger>
            <TabsTrigger value="strengths">Points Forts</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          </TabsList>

          <TabsContent value="improvements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Suggestions d'Amélioration</CardTitle>
                <CardDescription>
                  Recommandations pour optimiser la qualité du code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.improvements.map((improvement, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-xl">{getPriorityIcon(improvement.priority)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{improvement.category}</h3>
                            <Badge className={getPriorityColor(improvement.priority)}>
                              {improvement.priority}
                            </Badge>
                            {improvement.line && (
                              <Badge variant="outline">Ligne {improvement.line}</Badge>
                            )}
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mb-3">
                            {improvement.description}
                          </p>
                          {improvement.example && (
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded font-mono text-sm">
                              {improvement.example}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strengths" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Points Forts</CardTitle>
                <CardDescription>
                  Aspects positifs identifiés dans le code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResult.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-green-600 text-xl">✅</span>
                      <p className="text-slate-700 dark:text-slate-300">{strength}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Points à Améliorer</CardTitle>
                <CardDescription>
                  Axes de développement identifiés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResult.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <span className="text-orange-600 text-xl">⚠️</span>
                      <p className="text-slate-700 dark:text-slate-300">{weakness}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Questions pour Facilitateurs</CardTitle>
                <CardDescription>
                  Questions suggérées pour aider une personne externe à comprendre et évaluer le code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.externalQuestions.map((q) => (
                    <div key={q.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Question {q.id}</h3>
                      <p className="text-slate-700 dark:text-slate-300 mb-3">{q.question}</p>
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                        <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Contexte
                        </Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {q.context}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Améliorations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {analysisResult.improvements.length}
                  </div>
                  <p className="text-sm text-slate-500">suggestions identifiées</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Priorité Haute</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {analysisResult.improvements.filter(i => i.priority === "haute").length}
                  </div>
                  <p className="text-sm text-slate-500">corrections urgentes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {analysisResult.externalQuestions.length}
                  </div>
                  <p className="text-sm text-slate-500">pour facilitation</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Résumé Exécutif</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {analysisResult.summary}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}