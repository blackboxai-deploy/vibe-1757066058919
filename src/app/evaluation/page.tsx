"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { Progress } from "@/components/ui/progress";

interface Question {
  id: number;
  question: string;
  difficulty: "facile" | "moyen" | "difficile";
  answer: string;
}

export default function EvaluationPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [phase, setPhase] = useState<"input" | "questions" | "results">("input");

  const handleGenerateQuestions = async () => {
    if (!code.trim()) {
      alert("Veuillez saisir du code à analyser");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();
      setQuestions(data.questions);
      setPhase("questions");
    } catch (error) {
      console.error("Erreur génération questions:", error);
      alert("Erreur lors de la génération des questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitAnswers = async () => {
    setIsEvaluating(true);
    try {
      const response = await fetch("/api/ai/evaluate-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, questions, answers }),
      });

      const result = await response.json();
      setEvaluationResult(result);
      setPhase("results");
    } catch (error) {
      console.error("Erreur évaluation:", error);
      alert("Erreur lors de l'évaluation");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setCode("");
    setLanguage("");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setEvaluationResult(null);
    setPhase("input");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "facile": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "moyen": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "difficile": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Phase 1: Saisie du code
  if (phase === "input") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Évaluation Interactive
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Analysez du code étudiant et générez automatiquement des questions personnalisées
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Analyse de Code</CardTitle>
              <CardDescription>
                Collez le code à analyser et sélectionnez le langage de programmation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div>
                <Label htmlFor="code">Code à analyser</Label>
                <Textarea
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Collez ici le code à analyser..."
                  className="min-h-64 font-mono text-sm"
                />
              </div>

              <Button 
                onClick={handleGenerateQuestions} 
                disabled={isGenerating || !code.trim()}
                className="w-full"
              >
                {isGenerating ? "Génération en cours..." : "Générer les Questions"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Phase 2: Questions
  if (phase === "questions") {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Questions d'Évaluation
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Question {currentQuestionIndex + 1} sur {questions.length}
              </p>
              <Progress value={progress} className="flex-1 max-w-md" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                  {currentQuestion.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-lg mb-4">{currentQuestion.question}</p>
                <Textarea
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Saisissez votre réponse ici..."
                  className="min-h-32"
                />
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  Précédent
                </Button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmitAnswers}
                    disabled={isEvaluating}
                  >
                    {isEvaluating ? "Évaluation en cours..." : "Terminer l'évaluation"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  >
                    Suivant
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Phase 3: Résultats
  if (phase === "results" && evaluationResult) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Résultats de l'Évaluation
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Analyse détaillée de vos réponses
            </p>
          </div>

          <div className="space-y-6">
            {/* Score global */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Score Global
                  <span className="text-3xl font-bold text-blue-600">
                    {evaluationResult.globalScore}/100
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={evaluationResult.globalScore} className="h-3" />
              </CardContent>
            </Card>

            {/* Détails par question */}
            {evaluationResult.questionResults?.map((result: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    <Badge className={result.score > 70 ? "bg-green-100 text-green-800" : result.score > 40 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                      {result.score}/100
                    </Badge>
                  </div>
                  <CardDescription>{questions[index].question}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Votre réponse :</Label>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                        {answers[questions[index].id]}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Feedback :</Label>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {result.feedback}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-4">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Nouvelle Évaluation
              </Button>
              <Button onClick={() => window.print()} className="flex-1">
                Imprimer le Rapport
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}