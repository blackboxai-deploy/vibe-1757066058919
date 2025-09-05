import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code et langage requis" },
        { status: 400 }
      );
    }

    // Configuration de l'API OpenRouter via endpoint personnalisé
    const prompt = `
Tu es un expert en évaluation de code. Analyse le code ${language} suivant et génère exactement 10 questions pour évaluer la compréhension de l'étudiant.

CODE À ANALYSER:
\`\`\`${language}
${code}
\`\`\`

INSTRUCTIONS:
- Génère 10 questions variées (3 faciles, 4 moyennes, 3 difficiles)
- Les questions doivent porter sur: logique, syntaxe, concepts, optimisation, debugging
- Assure-toi que les questions sont pertinentes au code fourni
- Format de réponse OBLIGATOIRE en JSON:

{
  "questions": [
    {
      "id": 1,
      "question": "Question claire et précise",
      "difficulty": "facile|moyen|difficile"
    }
  ]
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
        temperature: 0.5,
        max_tokens: 2000
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
    let questionsData;
    try {
      questionsData = JSON.parse(content);
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError);
      // Tentative d'extraction du JSON depuis la réponse
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questionsData = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json(
          { error: "Format de réponse invalide" },
          { status: 500 }
        );
      }
    }

    // Validation des données
    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      return NextResponse.json(
        { error: "Structure de questions invalide" },
        { status: 500 }
      );
    }

    // Assigner des IDs uniques si manquants
    const questionsWithIds = questionsData.questions.map((q: any, index: number) => ({
      id: q.id || (index + 1),
      question: q.question,
      difficulty: q.difficulty || 'moyen'
    }));

    return NextResponse.json({
      questions: questionsWithIds,
      metadata: {
        codeLanguage: language,
        generatedAt: new Date().toISOString(),
        totalQuestions: questionsWithIds.length
      }
    });

  } catch (error) {
    console.error('Erreur génération questions:', error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}