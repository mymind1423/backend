import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dbService from "../services/dbService.js";

// Initialize Gemini
// Assurez-vous d'avoir GEMINI_API_KEY dans votre .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

async function analyzeProfile(req, res) {
    try {
        const userId = req.user.uid;

        // 1. Récupérer les données riches du profil depuis la DB
        const profile = await dbService.getStudentProfileForAI(userId);

        if (!profile) {
            return res.status(404).json({ error: "Profil introuvable" });
        }

        // 2. Construire le prompt pour l'IA
        const prompt = `
      Tu es un Coach Carrière Expert pour étudiants et jeunes diplômés. Ton but est d'analyser ce profil et de donner des conseils concrets et bienveillants pour aider l'étudiant à trouver un stage ou un emploi.
      
      Voici les données du profil :
      - Nom : ${profile.fullname}
      - Titre actuel : ${profile.title || "Non défini"}
      - Bio : ${profile.bio || "Non définie"}
      - Domaine : ${profile.domaine || "Non défini"}
      - Niveau d'études : ${profile.grade || "Non défini"}
      - Compétences importées du CV : ${profile.skills || "Aucune compétence détectée"}
      - A un CV uploadé ? : ${profile.cv_url ? "Oui" : "Non"}
      - A un LinkedIn ? : ${profile.linkedin ? "Oui" : "Non"}

      Analyse ce profil et réponds UNIQUEMENT au format JSON strict suivant (sans markdown ni backticks) :
      {
        "score": (entier de 0 à 100 estimant la qualité du profil),
        "summary": "Court résumé de 2 phrases sur l'état du profil",
        "strengths": ["Force 1", "Force 2", "Force 3"],
        "weaknesses": ["Faiblesse 1", "Faiblesse 2"],
        "actionPlan": [
            { "step": "Action 1", "impact": "Haut/Moyen/Bas" },
            { "step": "Action 2", "impact": "Haut/Moyen/Bas" }
        ],
        "jobSuggestions": ["Poste 1", "Poste 2"]
      }
      
      Sois critique mais constructif. Si le profil est vide, donne un score bas et dis lui de remplir son profil.
    `;

        // 3. Appeler Gemini
        // Fallback si pas de clé API : simulation intelligente
        if (!process.env.GEMINI_API_KEY) {
            console.warn("⚠️ NO GEMINI KEY: Using Mock AI Analysis");
            return res.json(mockSmartAnalysis(profile));
        }

        const modelsToTry = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro", "gemini-1.0-pro"];
        let lastError = null;
        let success = false;

        for (const modelName of modelsToTry) {
            try {
                console.log(`🤖 Tentative d'analyse avec le modèle: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Nettoyage du JSON
                const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

                // Vérification du parsing JSON avant de répondre
                const jsonAnalysis = JSON.parse(cleanedText);

                console.log(`✅ Succès avec ${modelName}`);
                res.json(jsonAnalysis);
                success = true;
                break; // Sortir de la boucle si succès

            } catch (err) {
                console.warn(`⚠️ Échec avec ${modelName}: ${err.message}`);
                lastError = err;
                // On continue avec le suivant
            }
        }

        if (!success) {
            console.error("❌ TOUS les modèles Gemini ont échoué. Fallback sur le mock.");
            console.error("Dernière erreur:", lastError);
            // Fallback ultime : Mock
            res.json(mockSmartAnalysis(profile));
        }

    } catch (error) {
        console.error("AI Coach Error:", error);
        res.status(500).json({ error: "Impossible de générer l'analyse IA." });
    }
}

// Fonction de secours si pas de clé API, pour ne pas casser l'app
function mockSmartAnalysis(p) {
    const missing = [];
    if (!p.cv_url) missing.push("CV");
    if (!p.bio) missing.push("Bio");
    if (!p.linkedin) missing.push("LinkedIn");

    let score = 80;
    if (!p.cv_url) score -= 30;
    if (!p.bio) score -= 15;

    return {
        score: Math.max(10, score),
        summary: `Votre profil est ${score > 50 ? "en bonne voie" : "incomplet"}. ${missing.length > 0 ? "Il manque des éléments clés." : "C'est un bon début !"}`,
        strengths: ["Compte créé", p.domaine ? `Domaine ciblé : ${p.domaine}` : "Volonté d'apprendre"],
        weaknesses: missing.length > 0 ? missing.map(m => `${m} manquant`) : ["Description peut être plus détaillée"],
        actionPlan: [
            { step: !p.cv_url ? "Importer un CV PDF" : "Rafraîchir le CV", impact: "Haut" },
            { step: "Ajouter une photo pro", impact: "Moyen" }
        ],
        "jobSuggestions": p.domaine ? [`Stage ${p.domaine}`, `Alternance ${p.domaine}`] : ["Stage Découverte"]
    };
}


async function generatePitch(req, res) {
    try {
        const { jobDescription, studentId } = req.body;

        // On récupère le profil étudiant
        const profile = await dbService.getStudentProfileForAI(studentId);

        if (!profile) return res.status(404).json({ error: "Étudiant non trouvé" });

        const prompt = `
            Tu es un expert en recrutement.
            
            OFFRE D'EMPLOI / ENTREPRISE :
            "${jobDescription}"
            
            CANDIDAT :
            Nom: ${profile.fullname}
            Domaine: ${profile.domaine}
            Grade: ${profile.grade}
            
            Tâche : Donne-moi 3 "Talking Points" (sujets de discussion) très précis que ce candidat devrait aborder pour convaincre ce recruteur spécifique.
            Sois bref, direct et stratégique.
            
            Réponds UNIQUEMENT au format JSON :
            {
                "points": [
                    "Point 1...",
                    "Point 2...",
                    "Point 3..."
                ]
            }
        `;

        if (!process.env.GEMINI_API_KEY) {
            console.warn("⚠️ NO GEMINI KEY: Using Mock Pitch Generation");
            return res.json({
                points: [
                    `Mettre en avant votre formation en ${profile.domaine}`,
                    "Parler de votre capacité d'adaptation",
                    "Poser une question sur les missions proposées"
                ]
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const json = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());

        res.json(json);

    } catch (error) {
        console.error("AI Pitch Error:", error);
        res.status(500).json({ error: "Erreur lors de la génération du pitch" });
    }
}

export default { analyzeProfile, generatePitch };

