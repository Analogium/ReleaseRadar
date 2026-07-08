# Déploiement AWS — Release Radar

Guide pas à pas pour héberger Release Radar sur **une seule VM EC2** (free tier 12 mois),
avec HTTPS automatique via Caddy. Coût cible : **0 €/mois pendant 1 an** (hors domaine).

> Architecture : `Internet → Caddy (443, TLS) → nginx (SPA + /api) → Spring Boot → Postgres`,
> le tout en conteneurs Docker sur la VM. Aucun service AWS payant (ni ALB, ni RDS).

---

## 0. AVANT TOUT — se protéger d'une facture surprise ⚠️

Le free tier a des limites ; un dépassement = facturation. **Fais ceci en premier.**

1. **Budget d'alerte** : Console AWS → *Billing and Cost Management* → *Budgets* →
   *Create budget* → « Zero spend budget » (ou un budget mensuel de 1 €) → alerte email.
2. **Active les alertes de facturation** : *Billing preferences* → coche *Receive
   Billing Alerts*.
3. **N'utilise jamais le compte root au quotidien** (voir étape 1).

---

## 1. Compte & utilisateur IAM

Le compte *root* (celui de l'inscription) ne sert qu'à la facturation et à créer des accès.

1. Active la **MFA** sur le compte root (*IAM → Security credentials*).
2. Crée un **utilisateur IAM** pour toi : *IAM → Users → Create user*, avec accès
   console. Attache une policy (`AdministratorAccess` pour commencer, à restreindre plus tard).
3. Connecte-toi désormais avec cet utilisateur IAM.

---

## 2. Domaine & DNS

Tu peux acheter le domaine où tu veux (OVH, Namecheap, Gandi…). Deux options DNS :

- **Simple** : garder le DNS du registrar, on y créera un enregistrement A.
- **Tout AWS** : créer une *Hosted Zone* dans **Route 53** (~0,50 $/mois) et pointer
  les *nameservers* du registrar vers Route 53. Plus « pro » pour le CV.

> On créera l'enregistrement A (domaine → IP) **à l'étape 6**, une fois l'IP connue.

---

## 3. Lancer l'instance EC2

*Console EC2 → Launch instance* :

| Réglage | Valeur |
|---|---|
| **Name** | `release-radar` |
| **AMI** | Amazon Linux 2023 (éligible free tier) |
| **Type** | `t3.micro` (ou `t2.micro`) — *Free tier eligible* |
| **Key pair** | *Create key pair* → type `.pem` → **télécharge et garde-le** |
| **Storage** | 20–30 Go gp3 (le free tier inclut 30 Go) |
| **Security group** | en créer un nouveau (étape 4) |

---

## 4. Security group (pare-feu réseau)

Règles **entrantes** (inbound) :

| Type | Port | Source | Pourquoi |
|---|---|---|---|
| SSH | 22 | **My IP** (ton IP uniquement) | administration |
| HTTP | 80 | Anywhere (0.0.0.0/0) | redirection HTTPS + challenge Let's Encrypt |
| HTTPS | 443 | Anywhere (0.0.0.0/0) | le site |

> La base (5432) et l'API (8080) **ne sont pas** dans cette liste : elles ne sont
> jamais exposées à Internet (réseau interne Docker uniquement). C'est voulu.

---

## 5. Elastic IP (IP publique fixe)

Par défaut l'IP publique change à chaque redémarrage. On en fixe une :

*EC2 → Elastic IPs → Allocate* → puis *Associate* à l'instance `release-radar`.

> Gratuit **tant qu'elle est associée à une instance en marche**. Une EIP non
> associée est facturée : ne l'alloue que pour l'associer aussitôt.

---

## 6. DNS : pointer le domaine vers l'IP

Chez ton registrar (ou Route 53), crée un enregistrement :

```text
Type: A    Nom: @ (ou releaseradar)    Valeur: <ton-Elastic-IP>    TTL: 300
```

Vérifie la propagation (peut prendre quelques minutes) :

```bash
nslookup releaseradar.example.com
```

---

## 7. Se connecter & préparer la VM

Depuis ton poste (PowerShell ou Git Bash) :

```bash
chmod 400 release-radar.pem            # (Git Bash/WSL ; sous Windows pur, ajuste les ACL)
ssh -i release-radar.pem ec2-user@<ton-Elastic-IP>
```

Sur la VM, installe Docker + Compose + swap (le script fait tout) :

```bash
curl -fsSL https://raw.githubusercontent.com/Analogium/ReleaseRadar/master/scripts/ec2-setup.sh | bash
exit        # se déconnecter puis se reconnecter pour activer le groupe docker
```

Reconnecte-toi, puis vérifie : `docker compose version` et `free -h` (swap actif).

---

## 8. Déployer l'application

Sur la VM :

```bash
git clone https://github.com/<ton-user>/ReleaseRadar.git
cd ReleaseRadar

# Configuration des secrets
cp .env.prod.example .env
nano .env            # remplir DOMAIN, POSTGRES_PASSWORD, JWT_SECRET, SMTP_*, MAIL_FROM
```

Génère des secrets forts (sur la VM ou en local) :

```bash
openssl rand -base64 24     # → POSTGRES_PASSWORD
openssl rand -base64 48     # → JWT_SECRET
```

Lance la stack :

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps        # tout doit être "Up"/"healthy"
docker compose -f docker-compose.prod.yml logs -f caddy   # voir l'émission du certificat TLS
```

---

## 9. Vérifier

```bash
curl -I https://releaseradar.example.com          # 200, en-têtes de sécurité présents
```

Ouvre le domaine dans le navigateur : cadenas HTTPS valide, inscription/connexion OK.

- Premier admin : inscris-toi via l'app, puis promeus ton compte en base :
  ```bash
  docker exec -it release-radar-db psql -U release_radar -d release_radar \
    -c "UPDATE users SET role='ADMIN' WHERE email='ton-email';"
  ```

---

## 10. Mettre à jour (redéploiement)

```bash
cd ReleaseRadar
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker image prune -f        # nettoyer les anciennes images
```

---

## 11. Sauvegardes de la base (recommandé)

Dump manuel :

```bash
docker exec release-radar-db pg_dump -U release_radar release_radar > backup_$(date +%F).sql
```

Automatiser via cron (ex. chaque nuit à 3 h) : `crontab -e`

```text
0 3 * * * docker exec release-radar-db pg_dump -U release_radar release_radar > ~/backups/rr_$(date +\%F).sql
```

---

## 12. Après 12 mois (fin du free tier)

Coût estimé d'une t3.micro + EIP + stockage : **~8–12 €/mois**. Options :

- garder en payant,
- redimensionner / passer sur une VM « always free » (Oracle Cloud) — le même
  `docker-compose.prod.yml` s'y déploie à l'identique,
- ou détruire l'instance (le repo permet de tout reconstruire).

---

## Améliorations sécurité post-lancement (facultatif)

- **Rate-limiting anti-brute-force** sur `/api/auth/*` (Bucket4j, ou passer par
  **Cloudflare** en frontal — plan gratuit : TLS, WAF, limitation de débit, IP origine masquée).
- **Refresh tokens** + durée d'access token courte (révocation).
- **Vérification d'email** à l'inscription.
