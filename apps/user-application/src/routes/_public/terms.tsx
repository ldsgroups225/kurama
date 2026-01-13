import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ScrollText } from 'lucide-react'
import { motion } from 'motion/react'

export const Route = createFileRoute('/_public/terms')({
  component: TermsPage,
})

function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <Link
          to="/"
          className="inline-flex items-center text-teal-400 hover:text-teal-300 mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20">
            <ScrollText className="h-8 w-8 text-teal-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Conditions d'Utilisation</h1>
        </div>

        <div className="space-y-8 text-slate-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptation des Conditions</h2>
            <p>
              En accédant et en utilisant Kurama, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Description du Service</h2>
            <p>
              Kurama est une plateforme d'apprentissage éducative conçue pour aider les élèves à réviser et à progresser dans leurs études. Le service comprend l'accès à des leçons, des cartes de révision et des outils de suivi de progression.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Comptes Utilisateurs</h2>
            <p>
              Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable du maintien de la confidentialité de vos identifiants et de toutes les activités qui se déroulent sous votre compte. Les parents sont responsables des comptes de leurs enfants.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Propriété Intellectuelle</h2>
            <p>
              Tout le contenu présent sur Kurama, y compris les textes, graphiques, logos et leçons, est la propriété de Kurama ou de ses concédants de licence et est protégé par les lois sur la propriété intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Résiliation</h2>
            <p>
              Nous nous réservons le droit de suspendre ou de résilier votre compte à tout moment, sans préavis, en cas de violation des présentes conditions ou pour toute autre raison que nous jugerions nécessaire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Modifications des Conditions</h2>
            <p>
              Kurama peut modifier ces conditions périodiquement. Nous vous informerons de tout changement important par e-mail ou via l'application.
            </p>
          </section>

          <footer className="pt-8 border-t border-slate-800 text-sm italic">
            Dernière mise à jour :
            {' '}
            {new Date().toLocaleDateString('fr-FR')}
          </footer>
        </div>
      </motion.div>
    </div>
  )
}
