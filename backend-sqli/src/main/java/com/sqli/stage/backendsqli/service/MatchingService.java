package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.dto.MatchingDTO.MatchingLogResponse;
import com.sqli.stage.backendsqli.dto.MatchingDTO.MatchingScoreResponse;

import java.util.List;

public interface MatchingService {
    List<MatchingScoreResponse> calculateMatchingScoresForProject(int projectId);
    MatchingScoreResponse getMatchingScore(int projectId, int userId);
    void assignBestDevelopers(int projectId);
    List<MatchingLogResponse> getMatchingLogs(int projectId);
}
