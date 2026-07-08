#!/usr/bin/env bash
# =========================================================================
# Prépare une VM EC2 Amazon Linux 2023 pour héberger Release Radar :
#   - installe Docker + le plugin Compose
#   - crée un swapfile de 2 Go (indispensable sur une t3.micro à 1 Go de RAM)
#
# Usage (sur la VM, après connexion SSH) :
#   curl -fsSL <url-brut-de-ce-fichier> | bash
#   — ou — copier le fichier puis : bash ec2-setup.sh
# Puis se reconnecter (pour appliquer l'appartenance au groupe docker).
# =========================================================================
set -euo pipefail

echo "==> Mise à jour du système"
sudo dnf update -y

echo "==> Installation de Docker"
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"

echo "==> Installation des plugins Docker Compose + Buildx"
DOCKER_CLI_PLUGINS=/usr/libexec/docker/cli-plugins
sudo mkdir -p "$DOCKER_CLI_PLUGINS"

# Compose
sudo curl -fsSL \
  "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
  -o "$DOCKER_CLI_PLUGINS/docker-compose"
sudo chmod +x "$DOCKER_CLI_PLUGINS/docker-compose"

# Buildx (requis par `docker compose build`)
BUILDX_VER=$(curl -s https://api.github.com/repos/docker/buildx/releases/latest | grep '"tag_name"' | cut -d'"' -f4)
case "$(uname -m)" in
  x86_64) BUILDX_ARCH=amd64 ;;
  aarch64) BUILDX_ARCH=arm64 ;;
  *) BUILDX_ARCH=amd64 ;;
esac
sudo curl -fsSL \
  "https://github.com/docker/buildx/releases/download/${BUILDX_VER}/buildx-${BUILDX_VER}.linux-${BUILDX_ARCH}" \
  -o "$DOCKER_CLI_PLUGINS/docker-buildx"
sudo chmod +x "$DOCKER_CLI_PLUGINS/docker-buildx"

echo "==> Création d'un swapfile de 2 Go (si absent)"
if [ ! -f /swapfile ]; then
  sudo dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

echo
echo "==> Terminé. Vérifications :"
docker --version
docker compose version
free -h | grep -i swap
echo
echo "IMPORTANT : déconnecte-toi puis reconnecte-toi en SSH pour que 'docker' fonctionne sans sudo."
