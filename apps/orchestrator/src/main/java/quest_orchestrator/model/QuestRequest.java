package quest_orchestrator.model;

public record QuestRequest(
        String goal,
        double availableHours,
        String mood
) {
}
