import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { latexContent, subject, language, competencies } = await request.json();

    if (!latexContent || !subject) {
      return NextResponse.json(
        { error: "Contenu LaTeX et sujet requis" },
        { status: 400 }
      );
    }

    const competencyList = Array.isArray(competencies) ? competencies : [];
    const lang = language === "en" ? "English" : "Français";

    const prompt = `
Tu es un expert en création de QCM éducatifs. À partir du contenu LaTeX fourni, génère des questions de qualité pour évaluer les compétences acquises.

SUJET: ${subject}
LANGUE: ${lang}
COMPÉTENCES CIBLÉES: ${competencyList.join(', ') || 'Compétences générales du sujet'}

CONTENU LaTeX:
${latexContent}

INSTRUCTIONS:
1. Génère 20-30 questions variées basées sur le contenu LaTeX
2. Répartition des difficultés: 30% facile, 50% moyen, 20% difficile
3. Chaque question doit avoir 4 options (A, B, C, D) avec une seule bonne réponse
4. Questions doivent couvrir: concepts théoriques, applications pratiques, analyse critique
5. Assure-toi que les questions sont pertinentes aux compétences listées
6. Évite les questions trop littérales, privilégie la compréhension

FORMAT DE RÉPONSE OBLIGATOIRE (JSON uniquement):
{
  "questions": [
    {
      "id": "q1",
      "question": "Question claire et précise ${lang === 'English' ? 'in English' : 'en français'}",
      "options": [
        "Option A",
        "Option B", 
        "Option C",
        "Option D"
      ],
      "correctAnswer": 0,
      "difficulty": "facile|moyen|difficile",
      "competency": "Nom de la compétence évaluée"
    }
  ]
}

IMPORTANT: 
- Génère les questions dans la langue demandée (${lang})
- Assure-toi que la bonne réponse est bien indiquée par l'index (0-3)
- Les questions doivent être auto-suffisantes (pas de référence au LaTeX)
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
        temperature: 0.6, // Créativité pour la variété des questions
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
    let questionsData;
    try {
      questionsData = JSON.parse(content);
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError);
      // Tentative d'extraction du JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          questionsData = JSON.parse(jsonMatch[0]);
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
    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      return NextResponse.json(
        { error: "Structure de questions invalide" },
        { status: 500 }
      );
    }

    // Validation et nettoyage de chaque question
    const cleanQuestions = questionsData.questions.map((q: any, index: number) => {
      // Validation des options
      const options = Array.isArray(q.options) ? q.options.slice(0, 4) : [];
      while (options.length < 4) {
        options.push(`Option ${options.length + 1}`);
      }

      // Validation de la réponse correcte
      const correctAnswer = typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4 
        ? q.correctAnswer 
        : 0;

      return {
        id: q.id || `q${index + 1}`,
        question: q.question || `Question ${index + 1}`,
        options: options.map((opt: any) => String(opt).trim()),
        correctAnswer,
        difficulty: ['facile', 'moyen', 'difficile'].includes(q.difficulty) ? q.difficulty : 'moyen',
        competency: q.competency || competencyList[0] || subject,
        language: language || 'fr'
      };
    });

    // Statistiques de répartition
    const difficultyStats = {
      facile: cleanQuestions.filter((q: any) => q.difficulty === 'facile').length,
      moyen: cleanQuestions.filter((q: any) => q.difficulty === 'moyen').length,
      difficile: cleanQuestions.filter((q: any) => q.difficulty === 'difficile').length
    };

    return NextResponse.json({
      questions: cleanQuestions,
      metadata: {
        subject,
        language,
        competencies: competencyList,
        totalQuestions: cleanQuestions.length,
        difficultyDistribution: difficultyStats,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur création QCM:', error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}