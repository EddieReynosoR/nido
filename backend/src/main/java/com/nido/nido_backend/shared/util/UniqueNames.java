package com.nido.nido_backend.shared.util;

import java.util.List;
import java.util.Set;
import java.util.function.Function;

public final class UniqueNames {

    private static final int RESERVED_SUFFIX_LENGTH = 6;

    private UniqueNames() {
    }

    public static String resolve(String name, int maxLength, Function<String, List<String>> findSiblingsStartingWith) {
        String prefix = name.substring(0, Math.clamp(maxLength - RESERVED_SUFFIX_LENGTH, 1, name.length()));

        Set<String> taken = Set.copyOf(findSiblingsStartingWith.apply(prefix));

        if (!taken.contains(name)) return name;

        int n = 2;
        String candidate = withSuffix(name, n, maxLength);
        while (taken.contains(candidate)) {
            candidate = withSuffix(name, ++n, maxLength);
        }
        return candidate;
    }

    private static String withSuffix(String name, int n, int maxLength) {
        String suffix = " (" + n + ")";
        String base = name.length() + suffix.length() > maxLength
                ? name.substring(0, maxLength - suffix.length()).stripTrailing()
                : name;
        return base + suffix;
    }
}
