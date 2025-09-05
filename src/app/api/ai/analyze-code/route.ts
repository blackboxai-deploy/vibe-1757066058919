import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code, language, specifications } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code et langage requis" },
        { status: 400 }
      );
    }

    const prompt = `
Tu es un expert senior en développement logiciel et en code review. Analyse le code ${language} suivant et fournis une évaluation détaillée.

CODE À ANALYSER:
\`\`\`${language}
${code}
\`\`\`

${specifications ? `SPÉCIFICATIONS/NORMES:
${specifications}

` : ''}INSTRUCTIONS D'ANALYSE:

1. ÉVALUATION GLOBALE (score sur 100):
   - Qualité du code, lisibilité, maintenabilité
   - Respect des bonnes pratiques et conventions
   - Performance et optimisation
   - Gestion d'erreurs et robustesse
   - Architecture et organisation

2. SUGGESTIONS D'AMÉLIORATION:
   - Identifie les améliorations concrètes avec priorités
   - Fournis des exemples de code corrigé quand pertinent
   - Indique les lignes problématiques si possible

3. QUESTIONS POUR FACILITATEURS EXTERNES:
   - Génère 5-7 questions pour aider quelqu'un d'externe à comprendre et évaluer le code
   - Questions sur l'architecture, les choix techniques, la logique métier
   - Contexte pour chaque question

FORMAT DE RÉPONSE OBLIGATOIRE (JSON uniquement):
{
  "score": 85,
  "summary": "Résumé global de l'analyse en 2-3 phrases",
  "strengths": [
    "Point fort 1: Description détaillée",
    "Point fort 2: Description détaillée"
  ],
  "weaknesses": [
    "Faiblesse 1: Description et impact",
    "Faiblesse 2: Description et impact"
  ],
  "improvements": [
    {
      "category": "Performance",
      "priority": "haute|moyenne|faible",
      "description": "Description détaillée du problème et de la solution",
      "example": "// Code d'exemple corrigé (optionnel)",
      "line": 15
    }
  ],
  "externalQuestions": [
    {
      "id": 1,
      "question": "Question claire et précise",
      "context": "Contexte et objectif de cette question"
    }
  ]
}

IMPORTANT: 
- Sois constructif et bienveillant dans tes commentaires
- Priorise les améliorations selon leur impact
- Adapte l'analyse au niveau apparent du code (débutant/intermédiaire/avancé)
- Réponds UNIQUEMENT avec le JSON, aucun texte supplémentaire`;

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
        temperature: 0.4, // Légèrement plus créatif pour les suggestions
        max_tokens: 4000
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
    let analysisResult;
    try {
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError);
      // Tentative d'extraction du JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysisResult = JSON.parse(jsonMatch[0]);
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
      score: Math.min(100, Math.max(0, analysisResult.score || 0)),
      summary: analysisResult.summary || "Analyse complétée",
      strengths: Array.isArray(analysisResult.strengths) ? analysisResult.strengths : [],
      weaknesses: Array.isArray(analysisResult.weaknesses) ? analysisResult.weaknesses : [],
      improvements: Array.isArray(analysisResult.improvements) ? analysisResult.improvements : [],
      externalQuestions: Array.isArray(analysisResult.externalQuestions) ? analysisResult.externalQuestions : [],
      analyzedAt: new Date().toISOString(),
      codeLanguage: language,
      hasSpecifications: !!specifications
    };

    // Validation des améliorations
    cleanResult.improvements = cleanResult.improvements.map((improvement: any, index: number) => ({
      category: improvement.category || `Amélioration ${index + 1}`,
      priority: ['haute', 'moyenne', 'faible'].includes(improvement.priority) ? improvement.priority : 'moyenne',
      description: improvement.description || "Description non disponible",
      example: improvement.example || undefined,
      line: improvement.line || undefined
    }));

    // Validation des questions externes
    cleanResult.externalQuestions = cleanResult.externalQuestions.map((q: any, index: number) => ({
      id: q.id || (index + 1),
      question: q.question || `Question ${index + 1}`,
      context: q.context || "Contexte non spécifié"
    }));

    return NextResponse.json(cleanResult);

  } catch (error) {
    console.error('Erreur analyse code:', error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}