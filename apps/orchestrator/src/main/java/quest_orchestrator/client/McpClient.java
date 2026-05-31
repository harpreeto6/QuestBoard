package quest_orchestrator.client;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import quest_orchestrator.model.QuestRequest;
import quest_orchestrator.model.QuestResponse;

@Component
public class McpClient {

    private static final Logger logger = LoggerFactory.getLogger(McpClient.class);

    private final String mcpServerUrl;
    private final RestClient restClient;
    private final JsonMapper jsonMapper;

    public McpClient(@Value("${mcp.server.url}") String mcpServerUrl) {
        this.mcpServerUrl = mcpServerUrl;
        this.restClient = RestClient.create();
        this.jsonMapper = JsonMapper.builder().build();
    }

    public QuestResponse generateQuest(QuestRequest request) {
        Map<String, Object> mcpRequest = Map.of(
                "jsonrpc", "2.0",
                "id", 1,
                "method", "tools/call",
                "params", Map.of(
                        "name", "generateQuest",
                        "arguments", Map.of(
                                "goal", request.goal(),
                                "availableHours", request.availableHours(),
                                "mood", request.mood()
                        )
                )
        );

        logger.info("Calling MCP server at {}", mcpServerUrl);

        byte[] responseBody = restClient.post()
                .uri(mcpServerUrl)
                .accept(MediaType.APPLICATION_JSON, MediaType.TEXT_EVENT_STREAM)
                .body(mcpRequest)
                .retrieve()
                .body(byte[].class);

        logger.info("Received response from MCP server");

        if (responseBody == null) {
            throw new IllegalStateException("MCP server returned an empty response");
        }

        String eventStream = new String(responseBody, StandardCharsets.UTF_8);
        JsonNode mcpResponse = parseEventStream(eventStream);
        JsonNode quest = mcpResponse.path("result").path("structuredContent");
        List<String> steps = new ArrayList<>();

        for (JsonNode step : quest.path("steps")) {
            steps.add(step.asString());
        }

        return new QuestResponse(
                request.goal(),
                quest.path("questTitle").asString(),
                steps,
                quest.path("difficulty").asString()
        );
    }

    private JsonNode parseEventStream(String eventStream) {
        if (eventStream == null) {
            throw new IllegalStateException("MCP server returned an empty response");
        }

        for (String line : eventStream.lines().toList()) {
            if (line.startsWith("data: ")) {
                try {
                    return jsonMapper.readTree(line.substring("data: ".length()));
                } catch (JacksonException exception) {
                    throw new IllegalStateException("Could not read MCP server response", exception);
                }
            }
        }

        throw new IllegalStateException("MCP server response did not contain a data event");
    }
}
