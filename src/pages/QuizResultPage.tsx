import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

export const QuizResultPage = () => {
  const [searchParams] = useSearchParams();
  const score = searchParams.get('score');
  const badge = searchParams.get('badge');

  useEffect(() => {
    // Rediriger vers la page du quiz si pas de score
    if (!score || !badge) {
      window.location.href = '/quiz';
    }
  }, [score, badge]);

  const title = `${badge} - Score: ${score}/10 au Quiz RIA`;
  const description = `J'ai obtenu ${score}/10 au quiz sur le Règlement européen sur l'Intelligence Artificielle ! Testez vos connaissances sur le RIA/AI Act.`;
  const imageUrl = 'https://www.ria-facile.com/images/quiz-share.jpg';

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        
        {/* OpenGraph / LinkedIn */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:secure_url" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      <div className="min-h-screen p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
              {badge}
            </h1>
            
            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                Score: {score}/10
              </div>
              <p className="text-gray-600">
                au Quiz sur le Règlement européen sur l'Intelligence Artificielle
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <a
                href="/quiz"
                className="px-6 py-3 bg-[#774792] text-white rounded-lg hover:bg-[#8a5ba3] transition-colors"
              >
                Faire le quiz
              </a>
              <a
                href="/"
                className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 