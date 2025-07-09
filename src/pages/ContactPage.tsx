import React from 'react';
import { motion } from 'framer-motion';
import contactImage from '../assets/contact.jpeg';
import { Helmet } from 'react-helmet-async';
import { ContactForm } from '../components/ContactForm';

export const ContactPage = () => {
  return (
    <>
      <Helmet>
        <title>Contactez-nous | RIA Facile</title>
        <meta name="description" content="Contactez-nous pour toute question sur le Règlement IA, pour être accompagné dans votre mise en conformité ou pour nous signaler un bug." />
      </Helmet>
      <div className="min-h-[calc(100vh-5rem)] relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch h-full">
              {/* Colonne de gauche avec l'image et le texte */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8 flex flex-col"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-6"
                >
                  <h1 className="text-4xl font-bold text-[#774792] mb-4">
                    Nous contacter
                  </h1>
                  <p className="text-gray-600 leading-relaxed">
                    Vous souhaitez être accompagné dans votre mise en conformité IA ? Vous souhaitez être formé sur la réglementation IA ? Vous souhaitez nous signaler un bug ? Vous avez des suggestions pour améliorer RIA Facile ? Nous vous répondrons dans les meilleurs délais.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="relative flex-1 rounded-2xl overflow-hidden shadow-lg"
                >
                  <img
                    src={contactImage}
                    alt="Contact"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>
              </motion.div>
              {/* Colonne de droite avec le formulaire de contact moderne */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <ContactForm />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 