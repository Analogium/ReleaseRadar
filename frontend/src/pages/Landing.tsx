import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Disc3,
  LayoutDashboard,
  Radar,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import Logo from '@/components/Logo'
import Seo from '@/components/Seo'

const FEATURES = [
  {
    icon: Radar,
    title: 'Suivez vos artistes',
    text: 'Recherchez n’importe quel artiste via MusicBrainz et ajoutez-le à votre radar en un clic.',
  },
  {
    icon: Bell,
    title: 'Notifications par email',
    text: 'Dès qu’une nouvelle sortie est détectée, vous recevez un email — sans avoir à ouvrir l’app.',
  },
  {
    icon: Disc3,
    title: 'Un fil des sorties',
    text: 'Albums, EP, singles et collaborations de vos artistes, réunis et triés par date de sortie.',
  },
  {
    icon: ShieldCheck,
    title: 'Respect de votre vie privée',
    text: 'Aucun tracking, aucune publicité. Vos données vous appartiennent — export et suppression en un clic.',
  },
]

const STEPS = [
  {
    n: '1',
    title: 'Créez votre compte',
    text: 'Inscription en quelques secondes, avec confirmation par email.',
  },
  {
    n: '2',
    title: 'Suivez vos artistes',
    text: 'Ajoutez les artistes que vous ne voulez plus jamais manquer.',
  },
  {
    n: '3',
    title: 'Recevez les sorties',
    text: 'On surveille MusicBrainz pour vous et on vous prévient.',
  },
]

/** Page d'accueil publique (vitrine) — principale surface indexable pour le SEO.
 *  Accessible à tous ; les CTA s'adaptent selon que le visiteur est connecté ou non. */
export default function Landing() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="bg-bg text-content relative min-h-svh overflow-hidden">
      <Seo
        title="Release Radar — Ne manquez plus aucune sortie de vos artistes préférés"
        description="Release Radar surveille les nouvelles sorties musicales de vos artistes suivis (via MusicBrainz) et vous notifie par email. Suivez, oubliez, soyez prévenu."
        path="/"
      />
      {/* Halos d'ambiance */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-violet/20 absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full blur-[140px]" />
        <div className="bg-magenta/20 absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        {/* En-tête */}
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-lg font-extrabold">Release Radar</span>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="gradient-brand flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-white transition hover:opacity-95"
              >
                <LayoutDashboard className="h-4 w-4" /> Tableau de bord
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-content-subtle hover:text-content font-semibold">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="gradient-brand rounded-full px-4 py-2 font-semibold text-white transition hover:opacity-95"
                >
                  Créer un compte
                </Link>
              </>
            )}
          </nav>
        </header>

        {/* Hero */}
        <section className="py-20 text-center md:py-28">
          <p className="text-accent text-xs font-bold tracking-widest uppercase">
            Ne manquez plus aucune sortie
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">
            Toute la nouvelle musique de vos artistes préférés,{' '}
            <span className="text-gradient-brand">au même endroit</span>.
          </h1>
          <p className="text-content-subtle mx-auto mt-6 max-w-2xl text-lg">
            Release Radar surveille les nouvelles sorties de vos artistes suivis et vous notifie par
            email. Suivez, oubliez, soyez prévenu.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="gradient-brand flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition hover:opacity-95"
              >
                Accéder à mon tableau de bord <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="gradient-brand flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition hover:opacity-95"
                >
                  Commencer gratuitement <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="border-line bg-surface hover:bg-surface-2 text-content rounded-full border px-6 py-3 font-semibold transition"
                >
                  J'ai déjà un compte
                </Link>
              </>
            )}
          </div>
          <p className="text-content-subtle mt-6 text-sm">
            Propulsé par les données ouvertes de{' '}
            <a
              href="https://musicbrainz.org"
              target="_blank"
              rel="noreferrer"
              className="text-accent"
            >
              MusicBrainz
            </a>
            .
          </p>
        </section>

        {/* Fonctionnalités */}
        <section className="py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="border-line bg-surface rounded-[var(--radius-card)] border p-6"
              >
                <div className="gradient-brand flex h-11 w-11 items-center justify-center rounded-xl text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-content mt-4 text-lg font-bold">{title}</h2>
                <p className="text-content-subtle mt-2 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="py-16">
          <h2 className="text-content text-center text-3xl font-bold">Comment ça marche</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map(({ n, title, text }) => (
              <div key={n} className="text-center">
                <div className="gradient-brand mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white">
                  {n}
                </div>
                <h3 className="text-content mt-4 text-lg font-bold">{title}</h3>
                <p className="text-content-subtle mt-2 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="py-12">
          <div className="border-line from-violet/20 to-magenta/20 relative overflow-hidden rounded-[var(--radius-card)] border bg-gradient-to-br p-10 text-center">
            <UserPlus className="text-accent mx-auto h-10 w-10" />
            {isAuthenticated ? (
              <>
                <h2 className="text-content mt-4 text-2xl font-bold md:text-3xl">
                  Vos sorties vous attendent
                </h2>
                <p className="text-content-subtle mx-auto mt-3 max-w-xl">
                  Retrouvez le fil des nouveautés de vos artistes suivis.
                </p>
                <Link
                  to="/dashboard"
                  className="gradient-brand mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition hover:opacity-95"
                >
                  Ouvrir mon tableau de bord <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-content mt-4 text-2xl font-bold md:text-3xl">
                  Prêt à ne plus rien manquer ?
                </h2>
                <p className="text-content-subtle mx-auto mt-3 max-w-xl">
                  Créez votre compte et ajoutez vos premiers artistes en moins d'une minute.
                </p>
                <Link
                  to="/register"
                  className="gradient-brand mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition hover:opacity-95"
                >
                  Créer mon compte <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-line text-content-subtle flex flex-col items-center justify-between gap-4 border-t py-8 text-sm sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo size={22} />
            <span className="font-semibold">Release Radar</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link to="/terms" className="hover:text-content">
              CGU
            </Link>
            <Link to="/privacy" className="hover:text-content">
              Confidentialité
            </Link>
            <Link to="/legal" className="hover:text-content">
              Mentions légales
            </Link>
          </nav>
          <span>© {new Date().getFullYear()} Release Radar</span>
        </footer>
      </div>
    </div>
  )
}
