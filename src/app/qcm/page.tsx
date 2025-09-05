"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "facile" | "moyen" | "difficile";
  competency: string;
  language: "fr" | "en";
}

interface QCM {
  id: string;
  title: string;
  subject: string;
  questions: Question[];
  createdAt: string;
  language: string;
}

export default function QCMPage() {
  const [latexContent, setLatexContent] = useState("");
  const [subject, setSubject] = useState("");
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [competencies, setCompetencies] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [savedQCMs, setSavedQCMs] = useState<QCM[]>([]);
  
  // État pour la création de QCM
  const [qcmTitle, setQcmTitle] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [numQuestions, setNumQuestions] = useState(10);

  useEffect(() => {
    // Charger les QCM sauvegardés
    loadSavedQCMs();
  }, []);

  const loadSavedQCMs = () => {
    // Simulation - En réalité, cela viendrait de la base de données
    const mockQCMs: QCM[] = [
      {
        id: "qcm-1",
        title: "Algorithmique Avancée",
        subject: "Informatique",
        questions: [],
        createdAt: new Date().toISOString(),
        language: "fr"
      },
      {
        id: "qcm-2", 
        title: "Machine Learning Basics",
        subject: "AI/ML",
        questions: [],
        createdAt: new Date().toISOString(),
        language: "en"
      }
    ];
    setSavedQCMs(mockQCMs);
  };

  const handleGenerateQuestions = async () => {
    if (!latexContent.trim() || !subject.trim()) {
      alert("Veuillez remplir le contenu LaTeX et le sujet");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/create-qcm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latexContent,
          subject,
          language,
          competencies: competencies.split(',').map(c => c.trim()).filter(c => c)
        }),
      });

      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error("Erreur génération QCM:", error);
      alert("Erreur lors de la génération des questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateQCM = () => {
    if (!qcmTitle.trim() || selectedQuestions.size === 0) {
      alert("Veuillez saisir un titre et sélectionner des questions");
      return;
    }

    const selectedQuestionsArray = questions.filter(q => selectedQuestions.has(q.id));
    const shuffledQuestions = selectedQuestionsArray
      .sort(() => Math.random() - 0.5)
      .slice(0, numQuestions);

    // Créer une nouvelle session de QCM
    const newQCM: QCM = {
      id: `qcm-${Date.now()}`,
      title: qcmTitle,
      subject,
      questions: shuffledQuestions,
      createdAt: new Date().toISOString(),
      language
    };

    // Sauvegarder (simulation)
    setSavedQCMs(prev => [newQCM, ...prev]);
    
    // Rediriger vers l'examen
    window.open(`/qcm/exam/${newQCM.id}`, '_blank');
  };

  const handleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "facile": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "moyen": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "difficile": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            QCM Intelligent
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Créez des QCM aléatoires à partir de sujets LaTeX avec gestion de base de données
          </p>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Créer Questions</TabsTrigger>
            <TabsTrigger value="manage">Gérer QCM</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Génération de Questions</CardTitle>
                <CardDescription>
                  Créez des questions à partir d'un sujet au format LaTeX
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="subject">Sujet</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="ex: Algorithmique"
                    />
                  </div>
                  <div>
                    <Label htmlFor="language">Langue</Label>
                    <Select value={language} onValueChange={(value: "fr" | "en") => setLanguage(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="competencies">Compétences</Label>
                    <Input
                      id="competencies"
                      value={competencies}
                      onChange={(e) => setCompetencies(e.target.value)}
                      placeholder="Séparées par des virgules"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="latex">Contenu LaTeX</Label>
                  <Textarea
                    id="latex"
                    value={latexContent}
                    onChange={(e) => setLatexContent(e.target.value)}
                    placeholder={`Collez votre contenu LaTeX ici...

Exemple:
\\section{Algorithmique}
\\subsection{Complexité}
La complexité algorithmique mesure l'efficacité d'un algorithme...

\\subsection{Structures de données}
Les tableaux, listes chaînées, arbres...`}
                    className="min-h-64 font-mono text-sm"
                  />
                </div>

                <Button 
                  onClick={handleGenerateQuestions} 
                  disabled={isGenerating || !latexContent.trim() || !subject.trim()}
                  className="w-full"
                >
                  {isGenerating ? "Génération en cours..." : "Générer les Questions"}
                </Button>
              </CardContent>
            </Card>

            {questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Questions Générées ({questions.length})
                    <Badge variant="outline">
                      {selectedQuestions.size} sélectionnées
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez les questions à inclure dans votre QCM
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {questions.map((question) => (
                      <div
                        key={question.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedQuestions.has(question.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => handleQuestionSelection(question.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getDifficultyColor(question.difficulty)}>
                                {question.difficulty}
                              </Badge>
                              <Badge variant="outline">{question.competency}</Badge>
                              {selectedQuestions.has(question.id) && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  ✓ Sélectionnée
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-medium mb-2">{question.question}</h3>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {question.options.map((option, index) => (
                                <div key={index} className={`${index === question.correctAnswer ? 'font-semibold text-green-600' : ''}`}>
                                  {String.fromCharCode(65 + index)}. {option}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            {questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Créer un QCM</CardTitle>
                  <CardDescription>
                    Configurez votre QCM à partir des questions sélectionnées
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="qcm-title">Titre du QCM</Label>
                      <Input
                        id="qcm-title"
                        value={qcmTitle}
                        onChange={(e) => setQcmTitle(e.target.value)}
                        placeholder="Titre de l'examen"
                      />
                    </div>
                    <div>
                      <Label htmlFor="num-questions">Nombre de questions</Label>
                      <Select value={numQuestions.toString()} onValueChange={(value) => setNumQuestions(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 10, 15, 20, 25, 30].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <div className="text-sm font-medium">Questions disponibles</div>
                      <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Questions sélectionnées</div>
                      <div className="text-2xl font-bold text-green-600">{selectedQuestions.size}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Questions dans le QCM</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.min(numQuestions, selectedQuestions.size)}
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCreateQCM} 
                    disabled={selectedQuestions.size === 0 || !qcmTitle.trim()}
                    className="w-full"
                  >
                    Créer et Lancer le QCM
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>QCM Sauvegardés</CardTitle>
                <CardDescription>
                  Historique de vos QCM créés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedQCMs.map((qcm) => (
                    <div key={qcm.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{qcm.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{qcm.subject}</Badge>
                          <Badge variant="outline">{qcm.language.toUpperCase()}</Badge>
                          <span className="text-sm text-slate-500">
                            {new Date(qcm.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/qcm/exam/${qcm.id}`}>
                          <Button variant="outline" size="sm">
                            Passer l'examen
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          Modifier
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {savedQCMs.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      Aucun QCM sauvegardé pour le moment
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}