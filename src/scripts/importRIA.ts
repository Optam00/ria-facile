import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as dotenv from 'dotenv';
import { CheerioAPI, Element, load } from 'cheerio';
import type { Cheerio } from 'cheerio';
import fs from 'fs';
import path from 'path';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Les variables d\'environnement Supabase sont manquantes');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const RIA_URL = 'https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=OJ:L_202401689';

async function fetchRIAContent() {
    try {
        const response = await axios.get(RIA_URL);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du contenu:', error);
        return null;
    }
}

async function extractAndInsertPreambule($: cheerio.Root) {
    // On cherche le texte "considérant ce qui suit" et on remonte jusqu'au parent div
    const considerantMarker = $('p:contains("considérant ce qui suit")').first();
    console.log('Recherche du marqueur "considérant ce qui suit":', considerantMarker.length ? 'trouvé' : 'non trouvé');
    
    if (!considerantMarker.length) {
        console.error('Marqueur "considérant ce qui suit" non trouvé');
        return;
    }

    // On cherche le div parent qui contient tous les considérants
    const parentDiv = considerantMarker.parent().parent().parent();
    console.log('Recherche du div parent:', parentDiv.length ? 'trouvé' : 'non trouvé');
    
    if (!parentDiv.length) {
        console.error('Div parent des considérants non trouvé');
        return;
    }

    // On cherche toutes les tables qui contiennent les considérants
    const tables = parentDiv.find('table');
    const considerants: { numero: number; contenu: string }[] = [];
    let currentConsiderant: { numero: number; contenu: string } | null = null;

    tables.each((_index: number, table: cheerio.Element) => {
        const cells = $(table).find('td');
        if (cells.length >= 2) {
            const firstCell = cells.first();
            const lastCell = cells.last();
            const text = firstCell.text().trim();
            const numeroMatch = text.match(/^\((\d+)\)/);

            if (numeroMatch) {
                // Si on avait déjà un considérant en cours, on l'ajoute à la liste
                if (currentConsiderant) {
                    considerants.push(currentConsiderant);
                }
                // On commence un nouveau considérant
                currentConsiderant = {
                    numero: parseInt(numeroMatch[1]),
                    contenu: lastCell.find('p').text().trim()
                };
            } else if (currentConsiderant) {
                // On ajoute le contenu de la dernière cellule au considérant en cours
                const additionalContent = lastCell.find('p').text().trim();
                if (additionalContent) {
                    currentConsiderant.contenu += ' ' + additionalContent;
                }
            }
        }
    });

    // On n'oublie pas d'ajouter le dernier considérant
    if (currentConsiderant) {
        considerants.push(currentConsiderant);
    }

    console.log(`Nombre de considérants extraits: ${considerants.length}`);

    // Trier les considérants par numéro
    considerants.sort((a, b) => a.numero - b.numero);

    // Supprimer les considérants existants avant d'insérer les nouveaux
    await supabase.from('ria_preambule').delete().eq('type', 'considerant');

    for (const considerant of considerants) {
        console.log(`Considérant ${considerant.numero}:`, considerant.contenu.substring(0, 100) + '...');
        console.log(`Longueur du contenu du considérant ${considerant.numero}: ${considerant.contenu.length} caractères`);
        
        try {
            await supabase.from('ria_preambule').insert({
                type: 'considerant',
                numero: considerant.numero,
                contenu: considerant.contenu.trim(),
                ordre: considerant.numero
            });
            console.log(`Considérant ${considerant.numero} importé avec succès`);
        } catch (error) {
            console.error(`Erreur lors de l'importation du considérant ${considerant.numero}:`, error);
        }
    }
}

async function extractAndInsertStructure($: cheerio.Root) {
    console.log('Extraction des chapitres...');
    const chapitres = $('p.oj-ti-grseq');
    console.log(`Nombre de chapitres trouvés: ${chapitres.length}`);

    chapitres.each(async (i, element) => {
        const titre = $(element).text().trim();
        const match = titre.match(/CHAPITRE ([IVX]+)\s+(.+)/i);

        if (match) {
            const [, numeroRomain, titreChap] = match;
            const numero = convertirRomainEnArabe(numeroRomain);
            const titreFinal = `CHAPITRE ${numeroRomain} ${titreChap}`.toUpperCase();

            try {
                const { error } = await supabase
                    .from('chapitre')
                    .insert([
                        {
                            numero: numero,
                            titre: titreFinal
                        }
                    ]);

                if (error) {
                    console.error(`Erreur lors de l'insertion du chapitre ${numero}:`, error);
                } else {
                    console.log(`Chapitre ${numero} importé avec succès`);
                }
            } catch (error) {
                console.error(`Erreur lors de l'insertion du chapitre ${numero}:`, error);
            }
        }
    });
}

async function extractArticles($: cheerio.Root, articles: cheerio.Cheerio, parentId: string) {
    articles.each((_index: number, article: cheerio.Element) => {
        const $article = $(article);
        const articleText = $article.text().trim();
        const articleMatch = articleText.match(/Article (\d+)/);
        
        if (articleMatch) {
            const articleNumero = articleMatch[1];
            const articleContainer = $article.closest('.eli-container');
            
            // Extraire le contenu de l'article
            const contenu = articleContainer
                .find('.oj-normal')
                .map((_: number, el: cheerio.Element) => $(el).text().trim())
                .get()
                .join('\n');
            
            // Insérer l'article
            supabase
                .from('ria_structure')
                .insert({
                    type: 'article',
                    numero: articleNumero,
                    titre: articleText,
                    contenu: contenu,
                    parent_id: parentId,
                    level: 3,
                    ordre: _index + 1
                })
                .then(result => {
                    if (result.error) {
                        console.error(`Erreur lors de l'insertion de l'article ${articleNumero}:`, result.error);
                    } else {
                        console.log(`Article ${articleNumero} importé avec succès`);
                    }
                });
        }
    });
}

async function extractAndInsertArticles($: cheerio.Root) {
    console.log('Extraction des articles...');
    const articles = $('p.oj-ti-art');
    console.log(`Nombre d'articles trouvés : ${articles.length}`);

    articles.each(async (_index, element) => {
        const articleText = $(element).text().trim();
        const match = articleText.match(/Article (\d+)/);
        
        if (match) {
            const articleNumber = parseInt(match[1]);
            const title = articleText.replace(/Article \d+[ -]*/, '').trim();
            
            // Récupération du contenu entre cet article et le prochain
            let content = '';
            let currentElement = $(element).parent();
            
            while (currentElement.next().length > 0 && !currentElement.next().find('p.oj-ti-art').length) {
                content += currentElement.next().text().trim() + '\n';
                currentElement = currentElement.next();
            }

            // Log du contenu de l'article
            console.log(`Article ${articleNumber} - ${title}`);
            console.log(`Aperçu du contenu (500 premiers caractères) : ${content.substring(0, 500)}...`);
            console.log(`Longueur totale : ${content.length} caractères`);

            // Insertion dans la base de données
            const { error } = await supabase
                .from('articles')
                .insert([
                    {
                        numero: articleNumber,
                        titre: title,
                        contenu: content
                    }
                ]);

            if (error) {
                console.error(`Erreur lors de l'importation de l'article ${articleNumber}:`, error);
            } else {
                console.log(`Article ${articleNumber} importé avec succès`);
            }
        }
    });
}

async function extractAndInsertChapitres($: cheerio.Root) {
    console.log('Extraction des chapitres...');
    const chapitres = $('p.oj-ti-grseq');
    console.log(`Nombre de chapitres trouvés: ${chapitres.length}`);

    chapitres.each(async (i, element) => {
        const titre = $(element).text().trim();
        const match = titre.match(/CHAPITRE ([IVX]+)\s+(.+)/i);

        if (match) {
            const [, numeroRomain, titreChap] = match;
            const numero = convertirRomainEnArabe(numeroRomain);
            const titreFinal = `CHAPITRE ${numeroRomain} ${titreChap}`.toUpperCase();

            try {
                const { error } = await supabase
                    .from('chapitre')
                    .insert([
                        {
                            numero: numero,
                            titre: titreFinal
                        }
                    ]);

                if (error) {
                    console.error(`Erreur lors de l'insertion du chapitre ${numero}:`, error);
                } else {
                    console.log(`Chapitre ${numero} importé avec succès`);
                }
            } catch (error) {
                console.error(`Erreur lors de l'insertion du chapitre ${numero}:`, error);
            }
        }
    });
}

function convertirRomainEnArabe(romain: string): number {
    const valeurs: { [key: string]: number } = {
        'I': 1,
        'V': 5,
        'X': 10,
        'L': 50,
        'C': 100,
        'D': 500,
        'M': 1000
    };

    let resultat = 0;
    const romainMaj = romain.toUpperCase();

    for (let i = 0; i < romainMaj.length; i++) {
        const valeurActuelle = valeurs[romainMaj[i]];
        const valeurSuivante = valeurs[romainMaj[i + 1]];

        if (valeurSuivante > valeurActuelle) {
            resultat += valeurSuivante - valeurActuelle;
            i++;
        } else {
            resultat += valeurActuelle;
        }
    }

    return resultat;
}

async function main() {
    try {
        const html = await fetchRIAContent();
        const $ = cheerio.load(html);
        
        await extractAndInsertPreambule($);
        await extractAndInsertStructure($);
        
        console.log('Importation terminée');
    } catch (error) {
        console.error('Erreur lors de l\'importation:', error);
    }
}

main().catch(console.error); 