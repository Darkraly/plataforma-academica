git checkout -b main
git add .gitignore .editorconfig LICENSE README.md .github/ISSUE_TEMPLATE .github/PULL_REQUEST_TEMPLATE.md
git commit -m "chore: initialize repository with project structure and documentation"

git checkout -b develop
git add docs/
git commit -m "docs(architecture): add system architecture and conceptual model documentation"

git checkout -b feature/auth-service
git add services/auth-service/package.json services/auth-service/src/app.js services/auth-service/src/server.js services/auth-service/src/config/database.js services/auth-service/src/models/ services/auth-service/src/routes/health.js services/auth-service/.env.example
git commit -m "feat(auth): scaffold auth-service with Express, Sequelize, and user models"

git add services/auth-service/src/controllers/ services/auth-service/src/routes/auth.js services/auth-service/src/middlewares/
git commit -m "feat(auth): implement JWT authentication with register and login endpoints"

git checkout develop
git merge feature/auth-service --no-ff -m "Merge pull request #1 from feature/auth-service"

git checkout -b feature/academic-service
git add services/academic-service/package.json services/academic-service/src/app.js services/academic-service/src/server.js services/academic-service/src/config/database.js services/academic-service/src/models/ services/academic-service/src/routes/health.js services/academic-service/.env.example
git commit -m "feat(academic): scaffold academic-service with discipline and class models"

git add services/academic-service/src/controllers/ services/academic-service/src/routes/ services/academic-service/src/middlewares/
git commit -m "feat(academic): implement CRUD endpoints for disciplines, classes, and enrollments"

git checkout develop
git merge feature/academic-service --no-ff -m "Merge pull request #2 from feature/academic-service"

git checkout -b feature/assignment-service
git add services/assignment-service/package.json services/assignment-service/src/app.js services/assignment-service/src/server.js services/assignment-service/src/config/database.js services/assignment-service/src/models/ services/assignment-service/src/routes/health.js services/assignment-service/.env.example
git commit -m "feat(assignment): scaffold assignment-service with activity and submission models"

git add services/assignment-service/src/controllers/ services/assignment-service/src/routes/ services/assignment-service/src/middlewares/
git commit -m "feat(assignment): implement CRUD endpoints for activities and submissions"

git checkout develop
git merge feature/assignment-service --no-ff -m "Merge pull request #3 from feature/assignment-service"

git checkout -b feature/gateway
git add gateway/
git commit -m "feat(gateway): configure Nginx API Gateway with reverse proxy to all services"
git checkout develop
git merge feature/gateway --no-ff -m "Merge pull request #4 from feature/gateway"

git checkout -b chore/docker-setup
git add services/auth-service/Dockerfile services/auth-service/.dockerignore services/academic-service/Dockerfile services/academic-service/.dockerignore services/assignment-service/Dockerfile services/assignment-service/.dockerignore
git commit -m "chore(docker): add Dockerfile for each microservice with multi-stage build"

git add infra/
git commit -m "chore(infra): configure docker-compose with all services, databases, and gateway"
git checkout develop
git merge chore/docker-setup --no-ff -m "Merge pull request #5 from chore/docker-setup"

git checkout -b feature/observability-lint
git add services/
git commit -m "feat(observability): add Winston structured logging and ESLint/Prettier"

git checkout develop
git merge feature/observability-lint --no-ff -m "Merge pull request #6 from feature/observability-lint"

git checkout -b ci/github-actions
git add .github/workflows/ci.yml
git commit -m "ci(github-actions): add CI pipeline with lint, test, build, and security checks"
git checkout develop
git merge ci/github-actions --no-ff -m "Merge pull request #7 from ci/github-actions"

git branch -D feature/auth-service feature/academic-service feature/assignment-service feature/gateway chore/docker-setup feature/observability-lint ci/github-actions
