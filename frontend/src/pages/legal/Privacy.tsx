import LegalLayout from './LegalLayout'

const H2 = ({ children }: { children: string }) => (
  <h2 className="text-content pt-2 text-lg font-semibold">{children}</h2>
)

/** Politique de confidentialité (RGPD). */
export default function Privacy() {
  return (
    <LegalLayout title="Politique de confidentialité" updatedAt="13 juillet 2026">
      <p>
        La présente politique décrit les données personnelles collectées par Release Radar, leurs
        finalités et vos droits, conformément au Règlement Général sur la Protection des Données
        (RGPD).
      </p>

      <H2>1. Responsable du traitement</H2>
      <p>
        Le responsable du traitement est l'éditeur du Service (voir les{' '}
        <a href="/legal" className="text-accent">
          mentions légales
        </a>
        ). Pour toute question relative à vos données : lambertheo@gmail.com.
      </p>

      <H2>2. Données collectées</H2>
      <ul className="list-disc space-y-1 pl-5">
        <li>votre adresse email ;</li>
        <li>votre mot de passe, stocké uniquement sous forme hachée (jamais en clair) ;</li>
        <li>la liste des artistes que vous suivez ;</li>
        <li>la date de création du compte ;</li>
        <li>la date et la version des CGU acceptées (preuve du consentement) ;</li>
        <li>
          des jetons de session (refresh tokens), stockés hachés, pour maintenir votre connexion.
        </li>
      </ul>

      <H2>3. Finalités et base légale</H2>
      <p>
        Vos données sont utilisées pour fournir le Service (gestion du compte et suivi des artistes)
        et pour vous envoyer des notifications de nouvelles sorties. La base légale est l'exécution
        du contrat (fourniture du Service) et votre consentement pour l'envoi des notifications par
        email.
      </p>

      <H2>4. Sous-traitants</H2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Brevo</strong> (Sendinblue SAS, France) — envoi des emails transactionnels et de
          notification ;
        </li>
        <li>
          <strong>Amazon Web Services (AWS)</strong> — hébergement de l'application, serveurs situés
          dans l'Union européenne (région Europe, Paris).
        </li>
      </ul>

      <H2>5. Durée de conservation</H2>
      <p>
        Vos données sont conservées tant que votre compte existe. Elles sont supprimées lorsque vous
        supprimez votre compte. Les jetons de session expirés sont purgés automatiquement.
      </p>

      <H2>6. Vos droits</H2>
      <p>
        Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de
        portabilité, d'opposition et de retrait de votre consentement. Vous pouvez exercer la
        plupart de ces droits directement depuis la page « Paramètres du compte » (export et
        suppression de vos données), ou en écrivant à lambertheo@gmail.com.
      </p>

      <H2>7. Cookies et traceurs</H2>
      <p>
        Release Radar n'utilise aucun cookie de suivi ni outil d'analyse tiers. Votre jeton de
        connexion est stocké localement dans votre navigateur (localStorage) à des fins strictement
        fonctionnelles. Aucun bandeau cookies n'est donc requis en l'état.
      </p>
    </LegalLayout>
  )
}
