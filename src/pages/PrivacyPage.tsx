import { motion } from 'framer-motion'

export const PrivacyPage = () => {
  return (
    <div className="min-h-screen p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Politique de confidentialité</h1>

          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Introduction</h2>
              <p className="text-gray-700 mb-4">
                La présente notice d'information détaille les conditions dans lesquelles RIA Facile procède, en qualité de responsable de traitement, aux traitements décrits ci-après et portant sur les données personnelles de ses clients et prospects (ci-après « vous »).
              </p>
              <p className="text-gray-700 mb-4">
                RIA Facile traite vos données personnelles dans le respect des principes fixés par la réglementation applicable à la protection des données personnelles, notamment le Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 relatif à la protection des personnes physiques à l'égard du traitement des données personnelles et à la libre circulation de ces données personnelles, et la Loi n° 78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés, telle que modifiée (ci-après la « Règlementation relative aux Données Personnelles »).
              </p>
              <p className="text-gray-700">
                Cette politique de protection des données personnelles pourra être amenée à évoluer en fonction des exigences réglementaires applicables ou de l'évolution de notre fonctionnement ou de notre activité. Vous serez tenus informés de toute modification substantielle apportée à ce document.
              </p>
            </section>

            {/* Définitions */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Définitions</h2>
              <div className="space-y-3">
                <p className="text-gray-700"><strong>Données personnelles :</strong> désigne toute information qui permet d'identifier une personne, directement ou indirectement.</p>
                <p className="text-gray-700"><strong>Traitement :</strong> désigne l'utilisation des Données personnelles. Cela comprend la collecte, la sauvegarde, la modification, la consultation, la suppression, etc.</p>
                <p className="text-gray-700"><strong>Responsable du traitement :</strong> désigne la personne ou l'organisation qui décide comment et pourquoi les Données personnelles sont traitées.</p>
                <p className="text-gray-700"><strong>Sous-traitant :</strong> désigne une personne ou une entreprise qui traite des Données personnelles pour le compte du Responsable du traitement.</p>
                <p className="text-gray-700"><strong>Destinataire :</strong> désigne la personne ou l'organisation qui peut accéder aux données personnelles.</p>
                <p className="text-gray-700"><strong>Personne concernée :</strong> désigne la personne dont les Données personnelles sont traitées.</p>
                <p className="text-gray-700"><strong>Finalité du traitement :</strong> désigne la raison pour laquelle les données personnelles sont traitées.</p>
                <p className="text-gray-700"><strong>Durée de conservation :</strong> désigne la période pendant laquelle les Données personnelles sont conservées avant anonymisation ou suppression.</p>
              </div>
            </section>

            {/* Les traitements de données */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Les traitements de données mis en œuvre</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Gestion des demandes de contact</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>Finalité :</strong> les données sont traitées pour prendre connaissance de votre demande et vous apporter une réponse dans les plus brefs délais</li>
                    <li><strong>Base légale :</strong> ce traitement de données est fondé sur l'intérêt légitime de RIA Facile, plus précisément d'apporter la plus grande satisfaction possible aux utilisateurs de sa plateforme</li>
                    <li><strong>Durées de conservation :</strong> ces données sont conservées 6 mois à compter de la dernière interaction en lien avec votre demande</li>
                    <li><strong>Destinataires :</strong> ces données sont accessible à notre sous-traitant éditeur de notre solution de gestion des emails</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Gestion des droits RGPD</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>Finalité :</strong> les données sont traitées pour satisfaire votre demande d'exercice de droit RGPD</li>
                    <li><strong>Base légale :</strong> ce traitement de données est fondé sur le respect d'une obligation légale</li>
                    <li><strong>Durées de conservation :</strong> ces données sont conservées 5 mois à compter de la fin de l'année durant laquelle vous avez exercé votre droit</li>
                    <li><strong>Destinataires :</strong> ces données sont accessible à notre sous-traitant éditeur de l'outil dans lequel nous documentons les exercices de droits</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Éléments communs à l'ensemble des traitements de données</h3>
                  <p className="text-gray-700">
                    Dans la mesure du possible, vos données sont hébergées sur des serveurs situés dans l'Espace Economique Européen (EEE). Toutefois, si des données sont traitées en dehors de ce territoire, nous apportons une attention particulière à ce que ce transfert soit effectué en conformité avec le cadre juridique existant et mettons en place des garanties assurant un niveau de protection de votre vie privée et de vos droits fondamentaux équivalent à celui offert par l'Union Européenne (ex : utilisation des Clauses Contractuelles Types de la Commission européenne).
                  </p>
                </div>
              </div>
            </section>

            {/* Les cookies */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Les cookies</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Qu'est-ce qu'un cookie ?</h3>
                  <p className="text-gray-700 mb-4">
                    Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette ou mobile) lors de la visite d'un site web. Il permet au site de mémoriser des informations sur votre visite, comme vos préférences de langue et d'autres paramètres.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Les cookies que nous utilisons</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>
                      <strong>Cookie de consentement (tarteaucitron) :</strong>
                      <ul className="list-none ml-4 mt-2">
                        <li><strong>Finalité :</strong> Stocker vos choix en matière de cookies</li>
                        <li><strong>Durée de conservation :</strong> 365 jours</li>
                        <li><strong>Base légale :</strong> Intérêt légitime, à savoir le bon fonctionnement du site web</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Cookies Google Analytics :</strong>
                      <ul className="list-none ml-4 mt-2">
                        <li><strong>Finalité :</strong> Mesurer l'audience du site et comprendre son utilisation</li>
                        <li><strong>Durée de conservation :</strong> Maximum 13 mois</li>
                        <li><strong>Base légale :</strong> Votre consentement</li>
                        <li><strong>Politique de confidentialité :</strong> <a href="https://policies.google.com/privacy" className="text-[#774792] hover:underline" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a></li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Gestion des cookies</h3>
                  <p className="text-gray-700 mb-4">
                    Vous pouvez à tout moment revoir et modifier vos choix en matière de cookies en cliquant sur l'icône présente en bas à droite de votre écran. Par défaut, les cookies non essentiels sont désactivés et ne sont déposés qu'après avoir obtenu votre consentement explicite.
                  </p>
                  <p className="text-gray-700">
                    En cas de refus des cookies d'analyse, nous collectons uniquement des données anonymes qui ne permettent pas de vous identifier.
                  </p>
                </div>
              </div>
            </section>

            {/* Les droits concernant vos données */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Les droits concernant vos données</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Présentation des droits</h3>
                  <p className="text-gray-700 mb-4">
                    Conformément à la Règlementation relative aux Données Personnelles vous disposez des droits suivants :
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>Droit d'accès :</strong> vous pouvez obtenir la confirmation que vos données sont traitées, et le cas échant, d'accéder à vos données et obtenir des informations sur la façon dont ces données sont traitées</li>
                    <li><strong>Droit de rectification :</strong> si vos données sont inexactes, incomplètes, ou que vous souhaitez les modifier, vous pouvez en obtenir la rectification.</li>
                    <li><strong>Droit à l'effacement :</strong> vous pouvez obtenir l'effacement de vos données, sous réserve de l'applicabilité de ce droit. Ainsi, par exemple, ce droit ne sera pas applicable si le traitement de données répond à une obligation légale</li>
                    <li><strong>Droit d'opposition :</strong> vous pouvez vous opposer à tout moment à un traitement de vos données, sous réserve de l'applicabilité de ce droit. Ainsi, par exemple, si le traitement de vos données est nécessaire pour l'exécution d'un contrat que nous avons conclu avec vous, ce droit n'est pas applicable</li>
                    <li><strong>Droit à la limitation :</strong> vous pouvez obtenir la limitation du traitement lorsque vous vous y opposez, lorsque vous contestez l'exactitude de vos données, lorsque vous pensez que le traitement est illicite, ou lorsque vous en avez besoin pour la constatation, l'exercice ou la défense de vos droits en justice</li>
                    <li><strong>Droit à la portabilité :</strong> vous pouvez recevoir vos données dans un format structuré, couramment utilisé, lisible par machine et interopérable, et de les transmettre à un autre responsable de traitement</li>
                    <li><strong>Droit de ne pas faire l'objet d'une décision fondée sur un traitement automatisé :</strong> vous avez le droit de ne pas faire l'objet d'une décision fondée exclusivement sur un traitement automatisé et produisant des effets juridiques vous concernant ou vous affectant similairement de manière significative, sauf lorsque ce traitement est nécessaire à la conclusion ou l'exécution d'un contrat ou est autorisée par la loi</li>
                    <li><strong>Droit d'introduire une réclamation :</strong> vous avez le droit d'introduire une réclamation auprès d'une autorité de contrôle, notamment la CNIL</li>
                    <li><strong>Droit de donner des directives sur la gestion de vos données post-mortem :</strong> vous avez le droit de formuler des directives concernant le sort de vos données après votre décès</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Les modalités d'exercice de vos droits</h3>
                  <p className="text-gray-700">
                    Vous pouvez exercer vos droits via le formulaire de contact, en sélectionnant "autre" dans le menu déroulant du sujet, et en précisant le droit exercé au sein de votre demande.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Adresser une réclamation à la CNIL</h3>
                  <p className="text-gray-700">
                    Vous disposez du droit de déposer une réclamation auprès de la CNIL en vous rendant sur son site web (<a href="https://www.cnil.fr/fr/plaintes" className="text-[#774792] hover:underline" target="_blank" rel="noopener noreferrer">https://www.cnil.fr/fr/plaintes</a>) ou par courrier à l'adresse suivante : CNIL - 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 