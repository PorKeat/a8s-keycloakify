<p align="center">
    <i>🚀 <a href="https://keycloakify.dev">Keycloakify</a> v11 starter 🚀</i>
    <br/>
    <br/>
</p>

# Quick start

```bash
git clone https://github.com/keycloakify/keycloakify-starter
cd keycloakify-starter
yarn install # Or use an other package manager, just be sure to delete the yarn.lock if you use another package manager.
```

# Testing the theme locally

[Documentation](https://docs.keycloakify.dev/testing-your-theme)

# How to customize the theme

[Documentation](https://docs.keycloakify.dev/css-customization)

# Building the theme

You need to have [Maven](https://maven.apache.org/) installed to build the theme (Maven >= 3.1.1, Java >= 7).  
The `mvn` command must be in the $PATH.

-   On macOS: `brew install maven`
-   On Debian/Ubuntu: `sudo apt-get install maven`
-   On Windows: `choco install openjdk` and `choco install maven` (Or download from [here](https://maven.apache.org/download.cgi))

```bash
npm run build-keycloak-theme
```

Note that by default Keycloakify generates multiple .jar files for different versions of Keycloak.  
You can customize this behavior, see documentation [here](https://docs.keycloakify.dev/features/compiler-options/keycloakversiontargets).

# Installing The Theme In Docker Keycloak

If your server runs Keycloak in Docker, you should copy the generated `.jar` into the Keycloak
`providers` directory, not into a `themes` folder.

For example, with a setup like:

-   SSH user: `alexkgm2412`
-   Keycloak container name: `keycloak`
-   Postgres container name: `db-kc`
-   Server project path: `/home/alexkgm2412/keycloak-postgres-docker`
-   Public URL: `https://keycloak-a8s.cambostack.codes`

If your Keycloak version is `26.3.1`, use this file:

```bash
dist_keycloak/keycloak-theme-for-kc-all-other-versions.jar
```

## Quick Install Into A Running Container

Copy the generated jar from your local machine to the server:

```bash
scp /Users/alexkgm/keycloakify-starter/dist_keycloak/keycloak-theme-for-kc-all-other-versions.jar alexkgm2412@keycloak:/home/alexkgm2412/
```

Then connect to the server and install it into the running Keycloak container:

```bash
ssh alexkgm2412@keycloak
docker cp /home/alexkgm2412/keycloak-theme-for-kc-all-other-versions.jar keycloak:/opt/keycloak/providers/
docker exec keycloak /opt/keycloak/bin/kc.sh build
docker restart keycloak
```

After Keycloak restarts, go to:

-   `Realm settings` -> `Themes`
-   Set `Login theme` to `keycloakify-starter`

## Recommended Persistent Docker Compose Setup

The `docker cp` approach works, but the jar will be lost if the container is recreated. For a
persistent setup, store the jar on the server and mount it into `/opt/keycloak/providers`.

Create a providers directory next to your compose project:

```bash
mkdir -p /home/alexkgm2412/keycloak-postgres-docker/keycloak/providers
cp /home/alexkgm2412/keycloak-theme-for-kc-all-other-versions.jar /home/alexkgm2412/keycloak-postgres-docker/keycloak/providers/
```

Then make sure your Keycloak service has a bind mount like this in `docker-compose.yml`:

```yaml
services:
  keycloak:
    volumes:
      - ./keycloak/providers:/opt/keycloak/providers
```

Apply the change:

```bash
cd /home/alexkgm2412/keycloak-postgres-docker
docker compose exec keycloak /opt/keycloak/bin/kc.sh build
docker compose restart keycloak
```

## Existing Docker Setup Example

If you are starting from scratch with Docker secrets and environment variables, your flow can look
like this:

```bash
mkdir -p secrets
echo "your_postgres_password" > secrets/postgres_password.txt
echo "your_admin_username" > secrets/kc_admin_user.txt
echo "your_admin_password" > secrets/kc_admin_password.txt

chmod 600 secrets/*
chmod 700 secrets
```

```bash
export POSTGRES_PASSWORD=$(cat secrets/postgres_password.txt)
export KC_ADMIN=$(cat secrets/kc_admin_user.txt)
export KC_ADMIN_PASSWORD=$(cat secrets/kc_admin_password.txt)
```

```bash
docker compose up -d
```

Then install the theme using one of the methods above.

# Initializing the account theme

```bash
npx keycloakify initialize-account-theme
```

# Initializing the email theme

```bash
npx keycloakify initialize-email-theme
```

# GitHub Actions

The starter comes with a generic GitHub Actions workflow that builds the theme and publishes
the jars [as GitHub releases artifacts](https://github.com/keycloakify/keycloakify-starter/releases/tag/v10.0.0).  
To release a new version **just update the `package.json` version and push**.

To enable the workflow go to your fork of this repository on GitHub then navigate to:
`Settings` > `Actions` > `Workflow permissions`, select `Read and write permissions`.
