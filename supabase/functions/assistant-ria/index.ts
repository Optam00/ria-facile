import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  question: string
  history: Array<{ question: string; answer: string }>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { question, history = [] }: RequestBody = await req.json()

    if (!question || !question.trim()) {
      return new Response(
        JSON.stringify({ error: 'Question requise' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Récupérer la clé API Gemini depuis les variables d'environnement Supabase
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY non définie')
      return new Response(
        JSON.stringify({ error: 'Configuration serveur manquante' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Construire le contexte avec l'historique récent (max 5 derniers échanges)
    const recentHistory = history.slice(-5)
    let contextMessages = recentHistory.flatMap((h) => [
      { role: 'user', parts: [{ text: h.question }] },
      { role: 'model', parts: [{ text: h.answer }] },
    ])

    // Ajouter la question actuelle avec l'instruction supplémentaire
    const userQuestion = question + "\nMerci de fonder ta réponse uniquement sur le règlement IA dont le plan est donné dans l'instruction."
    contextMessages.push({ role: 'user', parts: [{ text: userQuestion }] })

    // Plan complet du règlement IA (comme dans le backend Python)
    const riaPlan = `CHAPITRE I - DISPOSITIONS GÉNÉRALES
Article premier - Objet
Article 2 - Champ d'application
Article 3 - Définitions
1) «système d'IA»
2) «risque»
3) «fournisseur»
4) «déployeur»
5) «mandataire»
6) «importateur»
7) «distributeur»
8) «opérateur»
9) «mise sur le marché»
10) «mise à disposition sur le marché»
11) «mise en service»
12) «destination»
13) «mauvaise utilisation raisonnablement prévisible»
14) «composant de sécurité»
15) «notice d'utilisation»
16) «rappel d'un système d'IA»
17) «retrait d'un système d'IA»
18) «performance d'un système d'IA»
19) «autorité notifiante»
20) «évaluation de la conformité»
21) «organisme d'évaluation de la conformité»
22) «organisme notifié»
23) «modification substantielle»
24) «marquage CE»
25) «système de surveillance après commercialisation»
26) «autorité de surveillance du marché»
27) «norme harmonisée»
28) «spécification commune»
29) «données d'entraînement»
30) «données de validation»
31) «jeu de données de validation»
32) «données de test»
33) «données d'entrée»
34) «données biométriques»
35) «identification biométrique»
36) «vérification biométrique»
37) «catégories particulières de données à caractère personnel»
38) «données opérationnelles sensibles»
39) «système de reconnaissance des émotions»
40) «système de catégorisation biométrique»
41) «système d'identification biométrique à distance»
42) «système d'identification biométrique à distance en temps réel»
43) «système d'identification biométrique à distance a posteriori»
44) «espace accessible au public»
45) «autorités répressives»
46) «activités répressives»
47) «Bureau de l'IA»
48) «autorité nationale compétente»
49) «incident grave»
50) «données à caractère personnel»
51) «données à caractère non personnel»
52) «profilage»
53) «plan d'essais en conditions réelles»
54) «plan du bac à sable»
55) «bac à sable réglementaire de l'IA»
56) «maîtrise de l'IA»
57) «essais en conditions réelles»
58) «participant»
59) «consentement éclairé»
60) «hypertrucage»
61) «infraction de grande ampleur»
62) «infrastructure critique»
63) «modèle d'IA à usage général»
64) «capacités à fort impact»
65) «risque systémique»
66) «système d'IA à usage général»
67) «opération en virgule flottante»
68) «fournisseur en aval»
Article 4 - Maîtrise de l'IA
CHAPITRE II - PRATIQUES INTERDITES EN MATIÈRE D'IA
Article 5 - Pratiques interdites en matière d'IA
CHAPITRE III - SYSTÈMES D'IA À HAUT RISQUE
SECTION 1 - Classification de systèmes d'IA comme systèmes à haut risque
Article 6 - Règles relatives à la classification de systèmes d'IA comme systèmes à haut risque
Article 7 - Modifications de l'annexe III
SECTION 2 - Exigences applicables aux systèmes d'IA à haut risque
Article 8 - Respect des exigences
Article 9 - Système de gestion des risques
Article 10 - Données et gouvernance des données
Article 11 - Documentation technique
Article 12 - Enregistrement
Article 13 - Transparence et fourniture d'informations aux déployeurs
Article 14 - Contrôle humain
Article 15 - Exactitude, robustesse et cybersécurité
SECTION 3 - Obligations incombant aux fournisseurs et aux déployeurs de systèmes d'IA à haut risque et à d'autres parties
Article 16 - Obligations incombant aux fournisseurs de systèmes d'IA à haut risque
Article 17 - Système de gestion de la qualité
Article 18 - Conservation des documents
Article 19 - Journaux générés automatiquement
Article 20 - Mesures corrective et devoir d'information
Article 21 - Coopération avec les autorités compétentes
Article 22 - Mandataires des fournisseurs de systèmes d'IA à haut risque
Article 23 - Obligations des importateurs
Article 24 - Obligations des distributeurs
Article 25 - Responsabilités tout au long de la chaîne de valeur de l'IA
Article 26 - Obligations incombant aux déployeurs de systèmes d'IA à haut risque
Article 27 - Analyse d'impact des systèmes d'IA à haut risque sur les droits fondamentaux
SECTION 4 - Autorités notifiantes et organismes notifiés
Article 28 - Autorités notifiantes
Article 29 - Demande de notification d'un organisme d'évaluation de la conformité
Article 30 - Procédure de notification
Article 31 - Exigences concernant les organismes notifiés
Article 32 - Présomption de conformité avec les exigences concernant les organismes notifiés
Article 33 - Filiales des organismes notifiés et sous-traitance
Article 34 - Obligations opérationnelles des organismes notifiés
Article 35 - Numéros d'identification et listes des organismes notifiés
Article 36 - Modifications apportées aux notifications
Article 37 - Contestation de la compétence des organismes notifiés
Article 38 - Coordination des organismes notifiés
Article 39 - Organismes d'évaluation de la conformité de pays tiers
SECTION 5 - Normes, évaluation de la conformité, certificats, enregistrement
Article 40 - Normes harmonisées et travaux de normalisation
Article 41 - Spécifications communes
Article 42 - Présomption de conformité avec certaines exigences
Article 43 - Évaluation de la conformité
Article 44 - Certificats
Article 45 - Obligations d'information des organismes notifiés
Article 46 - Dérogation à la procédure d'évaluation de la conformité
Article 47 - Déclaration UE de conformité
Article 48 - Marquage CE
Article 49 - Enregistrement
CHAPITRE IV - OBLIGATIONS DE TRANSPARENCE POUR LES FOURNISSEURS ET LES DÉPLOYEURS DE CERTAINS SYSTÈMES D'IA
Article 50 - Obligations de transparence pour les fournisseurs et les déployeurs de certains systèmes d'IA
CHAPITRE V - MODÈLES D'IA À USAGE GÉNÉRAL
SECTION 1 - Règles de classification
Article 51 - Classification de modèles d'IA à usage général en tant que modèles d'IA à usage général présentant un risque systémique
Article 52 - Procédure
SECTION 2 - Obligations incombant aux fournisseurs de modèles d'IA à usage général
Article 53 - Obligations incombant aux fournisseurs de modèles d'IA à usage général
Article 54 - Mandataires des fournisseurs de modèles d'IA à usage général
SECTION 3 - Obligations incombant aux fournisseurs de modèles d'IA à usage général présentant un risque systémique
Article 55 - Obligations incombant aux fournisseurs de modèles d'IA à usage général présentant un risque systémique
SECTION 4 - Codes de bonnes pratiques
Article 56 - Codes de bonne pratique
CHAPITRE VI - MESURES DE SOUTIEN À L'INNOVATION
Article 57 - Bacs à sable réglementaires de l'IA
Article 58 - Modalités détaillées pour les bacs à sable réglementaires de l'IA et fonctionnement de ceux-ci
Article 59 - Traitement ultérieur de données à caractère personnel en vue du développement de certains systèmes d'IA dans l'intérêt public dans le cadre du bac à sable réglementaire de l'IA
Article 60 - Essais de systèmes d'IA à haut risque en conditions réelles en dehors des bacs à sable réglementaires de l'IA
Article 61 - Consentement éclairé à participer aux essais en conditions réelles en dehors des bacs à sable réglementaires de l'IA
Article 62 - Mesures en faveur des fournisseurs et déployeurs, en particulier les PME, y compris les jeunes pousses
Article 63 - Dérogations pour des opérateurs spécifiques
CHAPITRE VII - GOUVERNANCE
SECTION 1 - Gouvernance au niveau de l'Union
Article 64 - Bureau de l'IA
Article 65 - Création et structure du Comité européen de l'intelligence artificielle
Article 66 - Tâches du Comité IA
Article 67 - Forum consultatif
Article 68 - Groupe scientifique d'experts indépendants
Article 69 - Accès des États membres au groupe scientifique
SECTION 2 - Autorités nationales compétentes
Article 70 - Désignation des autorités nationales compétentes et des points de contact uniques
CHAPITRE VIII - BASE DE DONNÉES DE L'UE POUR LES SYSTÈMES D'IA À HAUT RISQUE
Article 71 - Base de données de l'UE pour les systèmes d'IA à haut risque énumérés à l'annexe III
CHAPITRE IX - SURVEILLANCE APRÈS COMMERCIALISATION, PARTAGE D'INFORMATIONS ET SURVEILLANCE DU MARCHÉ
SECTION 1 - Surveillance après commercialisation
Article 72 - Surveillance après commercialisation par les fournisseurs et plan de surveillance après commercialisation pour les systèmes d'IA à haut risque
SECTION 2 - Partage d'informations sur les incidents graves
Article 73 - Signalement d'incidents graves
SECTION 3 - Contrôle de l'application
Article 74 - Surveillance du marché et contrôle des systèmes d'IA sur le marché de l'Union
Article 75 - Assistance mutuelle, surveillance du marché et contrôle des systèmes d'IA à usage général
Article 76 - Supervision des essais en conditions réelles par les autorités de surveillance du marché
Article 77 - Pouvoirs des autorités de protection des droits fondamentaux
Article 78 - Confidentialité
Article 79 - Procédure applicable au niveau national aux systèmes d'IA présentant un risque
Article 80 - Procédure applicable aux systèmes d'IA classés par le fournisseur comme n'étant pas à haut risque en application de l'annexe III
Article 81 - Procédure de sauvegarde de l'Union
Article 82 - Systèmes d'IA conformes qui présentent un risque
Article 83 - Non-conformité formelle
Article 84 - Structures de soutien de l'Union pour les essais en matière d'IA
SECTION 4 - Voies de recours
Article 85 - Droit d'introduire une réclamation auprès d'une autorité de surveillance du marché
Article 86 - Droit à l'explication des décisions individuelles
Article 87 - Signalement de violations et protection des auteurs de signalement
SECTION 5 - Surveillance, enquêtes, contrôle de l'application et contrôle en ce qui concerne les fournisseurs de modèles d'IA à usage général
Article 88 - Contrôle de l'exécution des obligations incombant aux fournisseurs de modèles d'IA à usage général
Article 89 - Mesures de contrôle
Article 90 - Alertes de risques systémiques données par le groupe scientifique
Article 91 - Pouvoir de demander de la documentation et des informations
Article 92 - Pouvoir de procéder à des évaluations
Article 93 - Pouvoir de demander des mesures
Article 94 - Droits procéduraux des opérateurs économiques du modèle d'IA à usage général
CHAPITRE X - CODES DE CONDUITE ET LIGNES DIRECTRICES
Article 95 - Codes de conduite pour l'application volontaire de certaines exigences
Article 96 - Lignes directrices de la Commission sur la mise en œuvre du présent règlement
CHAPITRE XI - DÉLÉGATION DE POUVOIR ET PROCÉDURE DE COMITÉ
Article 97 - Exercice de la délégation
Article 98 - Comité
CHAPITRE XII - SANCTIONS
Article 99 - Sanctions
Article 100 - Amendes administratives imposées aux institutions, organes et organismes de l'Union
Article 101 - Amendes applicables aux fournisseurs de modèles d'IA à usage général
CHAPITRE XIII - DISPOSITIONS FINALES
Article 102 - Modification du règlement (CE) n° 300/2008
Article 103 - Modification du règlement (UE) n° 167/2013
Article 104 - Modification du règlement (UE) n° 168/2013
Article 105 - Modification de la directive 2014/90/UE
Article 106 - Modification de la directive (UE) 2016/797
Article 107 - Modification du règlement (UE) 2018/858
Article 108 - Modifications du règlement (UE) 2018/1139
Article 109 - Modification du règlement (UE) 2019/2144
Article 110 - Modification de la directive (UE) 2020/1828
Article 111 - Systèmes d'IA déjà mis sur le marché ou mis en service et modèles d'IA à usage général déjà mis sur le marché
Article 112 - Évaluation et réexamen
Article 113 - Entrée en vigueur et application`

    // Instruction système complète (comme dans le backend Python)
    const systemInstruction = `Tu es un expert du règlement européen sur l'IA. 

Tu dois répondre aux questions avec la plus grande rigueur juridique possible. 
Tu dois avant tout te baser sur le règlement IA pour fonder tes réponses (je te donne le plan).
Lorsque tu réponds, tu ne te contente pas de prendre en compte uniquement les grands principes, tu analyses le texte et la demande en profondeur, notamment en explorant les exceptions aux principes, et les moindres détails. 
Tu ne doit pas te présenter lorsque tu donnes une réponse, tu dois répondre directement.

Tes réponses doivent être rédigées de façon claires avec des bullet points et des emoji, pour faciliter la lecture. Tes réponses ne doivent jamais contenir de tableau. Le contenu doit être très sérieux et exact, mais les réponses doivent être faciles à lire.
Si tu penses que ta réponse pourrait être plus précise en ayant plus d'informations, tu peux indiquer à l'auteur de la question que tu pourrais lui apporter une réponse plus précise si tu avais plus d'informations, et tu lui poses les questions pour obtenir les informations dont tu as besoin.

Tes réponses doivent absolument contenir les références de tes sources dans le corps de la réponses. Par exemple, si tu cites un article du règlement IA, tu dois tout de suite indiquer la référence précise de cet article. 
Je ne te demande pas de chercher la version officiel tu texte, tu dois UNIQUEMENT te fier aux règlement IA dont le plan est celui ci (j'ai donnée le détail uniquement pour l'article 3).
${riaPlan}

Chacun de tes réponses doit finir par les phrases suivantes en italique : 
Ce contenu a été généré par une IA, consultez le texte pour vérifier les informations : https://www.ria-facile.com/consulter
Pour être accompagné dans votre mise en conformité par des professionnels, contactez-nous via ce formulaire : https://www.ria-facile.com/contact`

    // Appel à l'API Gemini (modèle gemini-2.5-pro comme dans le backend Python)
    const model = "gemini-2.5-pro"
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contextMessages,
          generationConfig: {
            temperature: 0, // Comme dans le backend Python
            topP: 0.95,
            maxOutputTokens: 65536, // Comme dans le backend Python
          },
          systemInstruction: {
            parts: [
              {
                text: systemInstruction,
              },
            ],
          },
          tools: [
            {
              googleSearch: {},
            },
          ],
        }),
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Erreur Gemini API:', errorText)
      throw new Error(`Erreur API Gemini: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()

    if (!geminiData.candidates || !geminiData.candidates[0]?.content?.parts) {
      throw new Error('Format de réponse Gemini invalide')
    }

    const answer = geminiData.candidates[0].content.parts[0].text

    // Sauvegarder la question dans Supabase (optionnel, pour analytics)
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )
      await supabaseClient.from('assistant_ria').insert([{ question }])
    } catch (saveError) {
      // On continue même si la sauvegarde échoue
      console.warn('Erreur sauvegarde question:', saveError)
    }

    return new Response(
      JSON.stringify({ answer }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erreur assistant-ria:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erreur serveur',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
