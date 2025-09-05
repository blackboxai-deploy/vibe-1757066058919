import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code, questions, answers } = await request.json();

    if (!code || !questions || !answers) {
      return NextResponse.json(
        { error: "Code, questions et réponses requis" },
        { status: 400 }
      );
    }

    // Construction du contexte pour l'évaluation
    const questionsWithAnswers = questions.map((q: any) => ({
      ...q,
      studentAnswer: answers[q.id] || "Pas de réponse"
    }));

    const prompt = `
Tu es un expert en évaluation de code et d'apprentissage. Évalue les réponses de l'étudiant aux questions sur ce code.

CODE ORIGINAL:
\`\`\`
${code}
\`\`\`

QUESTIONS ET RÉPONSES À ÉVALUER:
${questionsWithAnswers.map((q: any, index: number) => `
QUESTION ${index + 1} (${q.difficulty}): ${q.question}
RÉPONSE ÉTUDIANT: ${q.studentAnswer}
`).join('\n')}

INSTRUCTIONS D'ÉVALUATION:
- Évalue chaque réponse sur 100 points
- Considère la précision technique, la compréhension conceptuelle, et la pertinence
- Fournis un feedback constructif et spécifique pour chaque réponse
- Calcule un score global pondéré selon la difficulté (facile: x1, moyen: x1.5, difficile: x2)
- Sois bienveillant mais rigoureux

FORMAT DE RÉPONSE OBLIGATOIRE (JSON uniquement):
{
  "globalScore": 85,
  "questionResults": [
    {
      "questionId": 1,
      "score": 90,
      "feedback": "Excellente compréhension du concept. La réponse démontre une maîtrise solide..."
    }
  ],
  "overallFeedback": "Analyse globale de la performance",
  "recommendations": ["Suggestion 1", "Suggestion 2"]
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON, aucun texte supplémentaire.`;

    const response = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'CustomerId': 'cus_SGPn4uhjPI0F4w',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx',
      },
      body: JSON.stringify({
        model: 'openrouter/claude-sonnet-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Plus faible pour la cohérence d'évaluation
        max_tokens: 3000
      }),
    });

    if (!response.ok) {
      console.error('Erreur API OpenRouter:', response.status, response.statusText);
      return NextResponse.json(
        { error: "Erreur lors de l'appel à l'API IA" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Réponse vide de l'API IA" },
        { status: 500 }
      );
    }

    // Parser la réponse JSON
    let evaluationResult;
    try {
      evaluationResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError);
      // Tentative d'extraction du JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          evaluationResult = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(
            { error: "Format de réponse invalide" },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Format de réponse invalide" },
          { status: 500 }
        );
      }
    }

    // Validation et nettoyage des données
    const cleanResult = {
      globalScore: Math.min(100, Math.max(0, evaluationResult.globalScore || 0)),
      questionResults: evaluationResult.questionResults || [],
      overallFeedback: evaluationResult.overallFeedback || "Évaluation complétée",
      recommendations: evaluationResult.recommendations || [],
      evaluatedAt: new Date().toISOString(),
      totalQuestions: questions.length,
      answeredQuestions: Object.keys(answers).length
    };

    // Validation des résultats par question
    cleanResult.questionResults = cleanResult.questionResults.map((result: any, index: number) => ({
      questionId: result.questionId || (index + 1),
      score: Math.min(100, Math.max(0, result.score || 0)),
      feedback: result.feedback || "Réponse évaluée"
    }));

    return NextResponse.json(cleanResult);

  } catch (error) {
    console.error('Erreur évaluation réponses:', error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}