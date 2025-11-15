# CineFlix Full — Projet complet (démo)

Projet demo complet avec:
- Node.js + Express + MongoDB (Mongoose)
- Auth (JWT + bcrypt)
- Admin panel (upload de vidéos + poster)
- Stockage local (uploads/) — en prod remplace par S3/Cloudflare Stream
- Dockerfile + docker-compose
- render.yaml (pour Render)

## Mise en route locale (avec Docker - recommandé)
1. Copier `.env.example` en `.env` et modifier les valeurs si besoin.
2. `docker-compose up --build`
3. Ouvrir http://localhost:3000
4. Créer un admin: POST /api/auth/register (body: { "email":"admin@example.com","password":"..."} )
5. Se connecter via /admin/index.html

## Déploiement Render
1. Mettre le repo sur GitHub.
2. Mettre `render.yaml` et connecter ton repo sur Render.
3. Pour MongoDB en prod utilise MongoDB Atlas et règle MONGO_URI.
4. Définis JWT_SECRET dans les variables d'environnement de Render.

## Notes importantes
- Ce projet stocke les vidéos localement. En production utilise un stockage cloud & CDN (S3 + CloudFront ou Cloudflare Stream).
- Pour diffusion à grande échelle, encode en HLS/DASH et utilise DRM si contenu protégé.
- Respecte toujours les licences des vidéos que tu publies.

## Fichiers clés
- `src/` : backend
- `public/` : frontend + admin
- `uploads/` : vidéos et posters uploadés
- `docker-compose.yml` : docker avec Mongo
- `render.yaml` : configuration Render
