package com.nido.nido_backend.shared.util;

import com.nido.nido_backend.topics.dto.TopicResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

public final class TopicsTree {

    public static List<TopicResponse> createTopicsTree(List<TopicResponse> topics) {
        // Agrupar hijos por padre
        Map<UUID, List<TopicResponse>> childrenByParent = topics.stream()
                .filter(topic -> hasParent(topic) && topic.deletedAt() == null)
                .collect(Collectors.groupingBy(TopicResponse::parentId));

        // Ejecuta metodo recursivo usando solo los topics raiz (sin padre)
        return topics.stream()
                .filter(topic -> !hasParent(topic) && topic.deletedAt() == null)
                .map(root -> attachChildren(root, childrenByParent))
                .toList();
    }

    private static TopicResponse attachChildren(TopicResponse topic,
                                                Map<UUID, List<TopicResponse>> childrenByParent) {
        // Obtiene lista de hijos, si no, regresa lista vacia
        List<TopicResponse> children = childrenByParent
                .getOrDefault(topic.topicId(), List.of())
                .stream()
                .map(child -> attachChildren(child, childrenByParent)) // Ejecución recursiva
                .toList();

        return topic.withTopics(children); // Asignación de hijos a topic iterado
    }

    private static boolean hasParent(TopicResponse topic) {
        return topic.parentId() != null;
    }
}
