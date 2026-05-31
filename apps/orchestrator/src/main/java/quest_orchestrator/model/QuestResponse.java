package quest_orchestrator.model;

import java.util.List;

public record QuestResponse(
        String goal,
        String questTitle,
        List<String> steps,
        String difficulty
) {
}
