import LegalLayout from './LegalLayout'

const H2 = ({ children }: { children: string }) => (
  <h2 className="text-content pt-2 text-lg font-semibold">{children}</h2>
)

/**
 * Mentions légales.
 * TODO(légal) : compléter l'adresse postale de l'éditeur si une obligation
 * d'information s'applique (à vérifier selon le statut — particulier / auto-entrepreneur).
 */
export default function LegalNotice() {
  return (
    <LegalLayout title="Mentions légales" updatedAt="13 juillet 2026">
      <H2>Éditeur</H2>
      <p>
        Le site Release Radar (releaseradarapp.com) est édité par Théo Lambert, à titre personnel.
        <br />
        Contact : lambertheo@gmail.com
      </p>

      <H2>Directeur de la publication</H2>
      <p>Théo Lambert.</p>

      <H2>Hébergement</H2>
      <p>
        Le site est hébergé par Amazon Web Services EMEA SARL, 38 Avenue John F. Kennedy, L-1855
        Luxembourg. Les serveurs sont situés dans l'Union européenne (région Europe, Paris).
      </p>

      <H2>Propriété intellectuelle</H2>
      <p>
        Les données relatives aux artistes et aux sorties musicales proviennent de MusicBrainz et
        sont utilisées conformément à leur licence. Les marques et visuels d'albums appartiennent à
        leurs détenteurs respectifs. Le reste du contenu et le code du service demeurent la
        propriété de l'éditeur.
      </p>

      <H2>Données personnelles</H2>
      <p>
        Le traitement de vos données personnelles est décrit dans la{' '}
        <a href="/privacy" className="text-accent">
          Politique de confidentialité
        </a>
        .
      </p>
    </LegalLayout>
  )
}
