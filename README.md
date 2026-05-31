# QuestBoard

QuestBoard is organized as a monorepo:

```text
QuestBoard/
|-- apps/
|   |-- orchestrator/
|   |-- quest-mcp-server/
|   `-- frontend/
|-- infra/
|   `-- cdk/
|-- docker-compose.yml
`-- README.md
```

- `apps/orchestrator/` contains the Java Spring Boot API.
- `apps/quest-mcp-server/` contains the TypeScript MCP server.
- `apps/frontend/` is reserved for the frontend application.
- `infra/cdk/` is reserved for AWS CDK infrastructure code.

## Run Locally

### Prerequisites

Install:

- Node.js and npm
- Java 17 or newer

### 1. Start the MCP server

Open a terminal from the repository root:

```powershell
cd apps/quest-mcp-server
npm install
npm run dev
```

The MCP server runs on `http://localhost:7070`.

Check that it is running:

```powershell
Invoke-RestMethod http://localhost:7070/health
```

### 2. Start the orchestrator

Keep the MCP server running. Open a second terminal from the repository root:

```powershell
cd apps/orchestrator
.\mvnw.cmd spring-boot:run
```

The Spring Boot orchestrator runs on `http://localhost:8080`.

Check that it is running:

```powershell
Invoke-RestMethod http://localhost:8080/health
```

### 3. Generate a quest

Send a request to the orchestrator:

```powershell
$body = @{
    goal = "Study Spring Boot"
    availableHours = 2
    mood = "motivated"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri http://localhost:8080/quest/generate `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

The orchestrator calls the local MCP server and returns a quest plan.
