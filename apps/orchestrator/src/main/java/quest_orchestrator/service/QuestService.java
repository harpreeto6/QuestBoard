package quest_orchestrator.service;

import org.springframework.stereotype.Service;

import quest_orchestrator.client.McpClient;
import quest_orchestrator.model.QuestRequest;
import quest_orchestrator.model.QuestResponse;

@Service
public class QuestService {

    private final McpClient mcpClient;

    public QuestService(McpClient mcpClient) {
        this.mcpClient = mcpClient;
    }

    public QuestResponse generateQuest(QuestRequest request) {
        return mcpClient.generateQuest(request);
    }
}
