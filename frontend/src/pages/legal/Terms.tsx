import LegalLayout from './LegalLayout'

const H2 = ({ children }: { children: string }) => (
  <h2 className="text-content pt-2 text-lg font-semibold">{children}</h2>
)

/** Conditions Générales d'Utilisation. */
export default function Terms() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" updatedAt="13 juillet 2026">
      <p>
        Les présentes Conditions Générales d'Utilisation (« CGU ») régissent l'accès et
        l'utilisation du service Release Radar (« le Service »), accessible à l'adresse
        releaseradarapp.com. En créant un compte, vous acceptez sans réserve les présentes CGU.
      </p>

      <H2>1. Objet du service</H2>
      <p>
        Release Radar permet de suivre des artistes musicaux et d'être notifié par email de leurs
        nouvelles sorties. Les informations sur les artistes et les sorties proviennent de la base
        de données ouverte MusicBrainz.
      </p>

      <H2>2. Compte utilisateur</H2>
      <p>
        La création d'un compte nécessite une adresse email valide, qui doit être confirmée via un
        lien envoyé par email avant toute connexion. Vous êtes responsable de la confidentialité de
        vos identifiants et de toute activité effectuée depuis votre compte. Vous vous engagez à
        fournir une adresse email exacte et à la maintenir à jour.
      </p>

      <H2>3. Utilisation acceptable</H2>
      <p>
        Vous vous engagez à ne pas perturber le fonctionnement du Service, à ne pas tenter d'y
        accéder de manière non autorisée, ni à en faire un usage automatisé abusif. Tout abus peut
        entraîner la suspension ou la suppression du compte.
      </p>

      <H2>4. Données personnelles</H2>
      <p>
        Le traitement de vos données personnelles est décrit dans notre{' '}
        <a href="/privacy" className="text-accent">
          Politique de confidentialité
        </a>
        . Vous pouvez à tout moment consulter, exporter ou supprimer vos données depuis la page «
        Paramètres du compte ».
      </p>

      <H2>5. Disponibilité et responsabilité</H2>
      <p>
        Le Service est fourni « en l'état », sans garantie de disponibilité continue ni d'exactitude
        des données issues de sources tierces. La responsabilité de l'éditeur ne saurait être
        engagée en cas d'interruption, de perte de données ou de dommage indirect lié à
        l'utilisation du Service.
      </p>

      <H2>6. Résiliation</H2>
      <p>
        Vous pouvez supprimer votre compte à tout moment depuis la page « Paramètres du compte », ce
        qui entraîne l'effacement définitif de vos données personnelles. L'éditeur se réserve le
        droit de suspendre un compte en cas de manquement aux présentes CGU.
      </p>

      <H2>7. Modification des CGU</H2>
      <p>
        Les présentes CGU peuvent être modifiées à tout moment. La version en vigueur est datée en
        haut de cette page. En cas de modification substantielle, votre consentement pourra être à
        nouveau sollicité.
      </p>

      <H2>8. Droit applicable</H2>
      <p>
        Les présentes CGU sont soumises au droit français. Tout litige relatif à leur interprétation
        ou à leur exécution relève de la compétence des tribunaux français.
      </p>
    </LegalLayout>
  )
}
