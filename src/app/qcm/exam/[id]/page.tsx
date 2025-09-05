"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "facile" | "moyen" | "difficile";
  competency: string;
}

interface ExamResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  questionResults: Array<{
    questionId: string;
    correct: boolean;
    userAnswer: number | null;
    correctAnswer: number;
  }>;
}

export default function ExamPage() {
  const params = useParams();
  const examId = params.id as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes par défaut
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [skippedQuestions, setSkippedQuestions] = useState<Set<string>>(new Set());
  const [reportedQuestions, setReportedQuestions] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());

  const handleSubmitExam = useCallback(async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    // Calculer les résultats
    let correctAnswers = 0;
    const questionResults = questions.map(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      
      return {
        questionId: question.id,
        correct: isCorrect,
        userAnswer: userAnswer ?? null,
        correctAnswer: question.correctAnswer
      };
    });

    const score = Math.round((correctAnswers / questions.length) * 100);

    const result: ExamResult = {
      score,
      correctAnswers,
      totalQuestions: questions.length,
      timeSpent,
      questionResults
    };

    setExamResult(result);
    setIsSubmitted(true);

    // Sauvegarder les résultats (simulation)
    console.log('Résultats sauvegardés:', result);
  }, [questions, answers, startTime]);

  const loadExamQuestions = async () => {
    // Simulation - En réalité, cela viendrait de l'API/DB
    const mockQuestions: Question[] = [
      {
        id: "q1",
        question: "Quelle est la complexité temporelle de l'algorithme de tri rapide (QuickSort) dans le meilleur cas ?",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        correctAnswer: 1,
        difficulty: "moyen",
        competency: "Algorithmique"
      },
      {
        id: "q2",
        question: "Quel principe de programmation orientée objet permet à une classe d'hériter des propriétés d'une autre classe ?",
        options: ["Encapsulation", "Polymorphisme", "Héritage", "Abstraction"],
        correctAnswer: 2,
        difficulty: "facile",
        competency: "POO"
      },
      {
        id: "q3",
        question: "Dans une structure de données de pile (Stack), quelle est la politique d'accès aux éléments ?",
        options: ["FIFO (First In, First Out)", "LIFO (Last In, First Out)", "Random Access", "Sequential Access"],
        correctAnswer: 1,
        difficulty: "facile",
        competency: "Structures de données"
      },
      {
        id: "q4",
        question: "Quelle technique d'optimisation est utilisée dans la programmation dynamique ?",
        options: ["Mémoïsation", "Récursion simple", "Itération aveugle", "Force brute"],
        correctAnswer: 0,
        difficulty: "difficile",
        competency: "Algorithmique avancée"
      },
      {
        id: "q5",
        question: "Dans un arbre binaire de recherche équilibré, quelle est la complexité de la recherche ?",
        options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
        correctAnswer: 1,
        difficulty: "moyen",
        competency: "Structures de données"
      }
    ];

    // Mélanger les questions et les réponses
    const shuffledQuestions = mockQuestions.map(q => ({
      ...q,
      options: shuffleArray(q.options)
    })).sort(() => Math.random() - 0.5);

    setQuestions(shuffledQuestions);
  };

  // Charger les questions de l'examen
  useEffect(() => {
    loadExamQuestions();
  }, [examId]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmitExam();
    }
  }, [timeLeft, isSubmitted, handleSubmitExam]);

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleSkipQuestion = (questionId: string) => {
    setSkippedQuestions(prev => new Set(prev).add(questionId));
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleReportQuestion = (questionId: string) => {
    setReportedQuestions(prev => new Set(prev).add(questionId));
    alert("Question signalée. Merci pour votre retour !");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "facile": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "moyen": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "difficile": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold mb-2">Chargement de l'examen...</h2>
          <p className="text-slate-600">Préparation des questions</p>
        </div>
      </div>
    );
  }

  // Page de résultats
  if (isSubmitted && examResult) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">
                {examResult.score >= 80 ? "🎉" : examResult.score >= 60 ? "👍" : "📚"}
              </div>
              <CardTitle className="text-3xl">
                Examen Terminé !
              </CardTitle>
              <CardDescription>
                Voici vos résultats détaillés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{examResult.score}</div>
                  <div className="text-sm text-slate-600">Score sur 100</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {examResult.correctAnswers}/{examResult.totalQuestions}
                  </div>
                  <div className="text-sm text-slate-600">Bonnes réponses</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatTime(examResult.timeSpent)}
                  </div>
                  <div className="text-sm text-slate-600">Temps passé</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {skippedQuestions.size}
                  </div>
                  <div className="text-sm text-slate-600">Questions ignorées</div>
                </div>
              </div>

              <Progress value={examResult.score} className="h-3 mb-4" />
              
              <div className="text-center">
                <p className="text-lg mb-4">
                  {examResult.score >= 80 
                    ? "Excellente performance ! Vous maîtrisez bien le sujet." 
                    : examResult.score >= 60 
                    ? "Bonne performance ! Continuez à vous améliorer."
                    : "Il y a encore du travail, mais vous progressez !"}
                </p>
                
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => window.close()} variant="outline">
                    Fermer l'examen
                  </Button>
                  <Button onClick={() => window.print()}>
                    Imprimer les résultats
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Détails des réponses */}
          <Card>
            <CardHeader>
              <CardTitle>Détail des Réponses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const result = examResult.questionResults.find(r => r.questionId === question.id);
                  const isCorrect = result?.correct ?? false;
                  
                  return (
                    <div key={question.id} className={`p-4 rounded-lg border ${
                      isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xl ${isCorrect ? '✅' : '❌'}`}>
                          {isCorrect ? '✅' : '❌'}
                        </span>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline">{question.competency}</Badge>
                      </div>
                      
                      <h3 className="font-semibold mb-2">Question {index + 1}: {question.question}</h3>
                      
                      <div className="space-y-1 text-sm">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className={`p-2 rounded ${
                            optIndex === question.correctAnswer 
                              ? 'bg-green-100 font-semibold' 
                              : optIndex === result?.userAnswer 
                              ? 'bg-red-100' 
                              : ''
                          }`}>
                            {String.fromCharCode(65 + optIndex)}. {option}
                            {optIndex === question.correctAnswer && ' ✓ (Bonne réponse)'}
                            {optIndex === result?.userAnswer && optIndex !== question.correctAnswer && ' (Votre réponse)'}
                          </div>
                        ))}
                        
                        {result?.userAnswer === null && (
                          <div className="text-orange-600 font-medium">
                            ⚠️ Question non répondue
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Interface d'examen
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const timeWarning = timeLeft < 300; // Dernières 5 minutes

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header avec timer et progression */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>QCM - Question {currentQuestionIndex + 1} / {questions.length}</CardTitle>
                <Progress value={progress} className="w-64 mt-2" />
              </div>
              <div className={`text-2xl font-mono font-bold ${timeWarning ? 'text-red-600' : 'text-slate-600'}`}>
                {formatTime(timeLeft)}
                {timeWarning && <div className="text-xs">Temps limité !</div>}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Question courante */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                {currentQuestion.difficulty}
              </Badge>
              <Badge variant="outline">{currentQuestion.competency}</Badge>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQuestion.id]?.toString() || ""}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base leading-relaxed">
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Contrôles de navigation */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              ← Précédent
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSkipQuestion(currentQuestion.id)}
            >
              Ignorer
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleReportQuestion(currentQuestion.id)}
              disabled={reportedQuestions.has(currentQuestion.id)}
            >
              {reportedQuestions.has(currentQuestion.id) ? "Signalée ✓" : "Signaler"}
            </Button>
          </div>

          <div className="flex gap-2">
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={handleSubmitExam} className="bg-green-600 hover:bg-green-700">
                Terminer l'examen
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              >
                Suivant →
              </Button>
            )}
          </div>
        </div>

        {/* Statistiques en temps réel */}
        <Card className="mt-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-8 text-sm text-slate-600">
              <div>
                <span className="font-medium">Répondues:</span> {Object.keys(answers).length}/{questions.length}
              </div>
              <div>
                <span className="font-medium">Ignorées:</span> {skippedQuestions.size}
              </div>
              <div>
                <span className="font-medium">Signalées:</span> {reportedQuestions.size}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}