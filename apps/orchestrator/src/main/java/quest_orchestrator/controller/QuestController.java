package quest_orchestrator.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import quest_orchestrator.model.QuestRequest;
import quest_orchestrator.model.QuestResponse;
import quest_orchestrator.service.QuestService;

@RestController
@RequestMapping
public class QuestController {

    private final QuestService questService;

    public QuestController(QuestService questService) {
        this.questService = questService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @PostMapping("/quest/generate")
    public QuestResponse generateQuest(@RequestBody QuestRequest request) {
        return questService.generateQuest(request);
    }
}
