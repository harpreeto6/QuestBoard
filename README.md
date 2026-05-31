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
