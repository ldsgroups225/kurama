import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'

export const Route = createFileRoute('/_public/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <Link
          to="/"
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
            <ShieldCheck className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Politique de Confidentialité</h1>
        </div>

        <div className="space-y-8 text-slate-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Collecte des Données</h2>
            <p>
              Nous collectons les informations que vous fournissez directement lors de la création de votre compte, telles que votre nom, adresse e-mail et informations de profil éducatif. Nous collectons également des données sur votre progression d'apprentissage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Utilisation des Données</h2>
            <p>
              Vos données sont principalement utilisées pour personnaliser votre expérience d'apprentissage, suivre vos progrès, et vous fournir des statistiques pertinentes. Les parents peuvent accéder aux données de progression de leurs enfants liés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Partage des Données</h2>
            <p>
              Nous ne vendons pas vos données personnelles à des tiers. Les données peuvent être partagées avec des prestataires de services techniques nécessaires au fonctionnement de la plateforme (hébergement, authentification).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité rigoureuses pour protéger vos informations contre tout accès, modification ou divulgation non autorisés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Vos Droits</h2>
            <p>
              Conformément à la réglementation sur la protection des données, vous avez le droit d'accéder à vos informations, de les rectifier ou de demander leur suppression en nous contactant.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Cookies</h2>
            <p>
              Nous utilisons des cookies pour maintenir votre session active et analyser l'utilisation de la plateforme afin d'améliorer nos services.
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
