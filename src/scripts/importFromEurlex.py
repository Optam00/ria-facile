import requests
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.environ.get("SUPABASE_URL", ""),
    os.environ.get("SUPABASE_KEY", "")
)

def fetch_eurlex_html():
    url = "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=OJ:L_202401689"
    response = requests.get(url)
    response.raise_for_status()
    return response.text

def extract_articles(html):
    soup = BeautifulSoup(html, 'html.parser')
    articles = []
    
    # Trouver tous les articles
    article_elements = soup.select('.eli-subdivision[id^="art_"]')
    print(f"Nombre d'articles trouvés : {len(article_elements)}")
    
    for article in article_elements:
        # Extraire le numéro d'article depuis l'ID
        article_id = article.get('id', '')
        article_number = 0
        id_match = article_id.split('_')
        if len(id_match) > 1:
            try:
                article_number = int(id_match[1])
            except ValueError:
                continue
        
        # Extraire le titre
        title_element = article.select_one('.oj-sti-art')
        title = title_element.text.strip() if title_element else ""
        
        # Extraire le contenu
        content_elements = article.select('.oj-normal')
        content = "\n".join(element.text.strip() for element in content_elements)
        
        # Trouver le chapitre parent
        chapter_element = article.find_parent(class_='eli-subdivision', id=lambda x: x and x.startswith('cpt_'))
        chapter_number = None
        if chapter_element:
            chapter_title = chapter_element.select_one('.oj-ti-grseq')
            if chapter_title:
                chapter_text = chapter_title.text.strip()
                chapter_number = chapter_text.replace('CHAPITRE ', '').strip()
        
        articles.append({
            "numero": article_number,
            "titre": title,
            "contenu": content,
            "chapitre_id": chapter_number,
            "section_id": None
        })
        
        print(f"Article extrait : Article {article_number} - {title}")
    
    return articles

def main():
    try:
        print("Début de l'importation...")
        
        # Récupérer et parser le HTML
        html = fetch_eurlex_html()
        articles = extract_articles(html)
        
        print(f"\nExtraction terminée : {len(articles)} articles trouvés")
        
        # Insérer les articles
        print("\nInsertion des articles...")
        for article in articles:
            result = supabase.table('articles').insert(article).execute()
            if hasattr(result, 'error') and result.error:
                print(f"Erreur lors de l'insertion de l'article {article['numero']}:", result.error)
            else:
                print(f"Article {article['numero']} inséré avec succès")
        
        print("\nImportation terminée !")
        
    except Exception as e:
        print("Erreur:", str(e))

if __name__ == "__main__":
    main() 