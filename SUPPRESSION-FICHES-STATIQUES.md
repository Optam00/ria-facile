# Guide pour supprimer les anciennes fiches pratiques statiques

Une fois que tu auras migré une fiche pratique depuis l'ancien système (statique) vers le nouveau système (dynamique via l'éditeur admin), tu peux supprimer l'ancienne version statique.

## Fiches statiques actuellement présentes

Voici la liste des fiches statiques qui peuvent être supprimées une fois migrées :

1. **exactitude** → `FichePratiqueExactitudePage.tsx`
2. **explicabilite** → `FichePratiqueExplicabilitePage.tsx`
3. **rms** → `FichePratiqueRMSPage.tsx`
4. **fria** → `FichePratiqueFRIAPage.tsx`
5. **controle-humain** → `FichePratiqueControleHumainPage.tsx`
6. **droits-rgpd** → `FichePratiqueDroitsRGPDPage.tsx`
7. **secteur-bancaire** → `FichePratiqueSecteurBancairePage.tsx`
8. **exception-haut-risque** → `FichePratiqueExceptionHautRisquePage.tsx`
9. **maitrise-ia** → `FichePratiqueMaitriseIAPage.tsx`
10. **transparence** → `FichePratiqueTransparencePage.tsx` (déjà supprimée de la route, mais le fichier existe encore)

## Comment me demander de supprimer une fiche

Une fois que tu auras migré une fiche et vérifié qu'elle fonctionne correctement avec le nouveau système, dis-moi simplement :

**"Supprime l'ancienne fiche statique [NOM_DE_LA_FICHE]"**

Par exemple :
- "Supprime l'ancienne fiche statique exactitude"
- "Supprime l'ancienne fiche statique maitrise-ia"
- "Supprime l'ancienne fiche statique exception-haut-risque"

## Ce que je ferai

Pour chaque fiche que tu me demanderas de supprimer, je vais :

1. **Supprimer la route** dans `src/App.tsx` (ligne correspondante dans les routes statiques)
2. **Supprimer l'import** dans `src/App.tsx` (ligne `import FichePratiqueXXXPage from ...`)
3. **Supprimer le fichier** de la page (ex: `src/pages/FichePratiqueXXXPage.tsx`)

## Important

⚠️ **Assure-toi que la fiche est bien migrée et fonctionne** dans le nouveau système avant de me demander de supprimer l'ancienne version statique. Une fois supprimée, il n'y aura plus de fallback et seule la version dynamique sera accessible.

## Ordre recommandé

Tu peux les supprimer une par une au fur et à mesure que tu migres les fiches, ou toutes en même temps une fois que toutes sont migrées. C'est à toi de décider selon ta préférence.
