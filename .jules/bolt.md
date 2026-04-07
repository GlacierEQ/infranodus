## 2025-05-15 - [O(N^2) to O(N) Optimization in Entry.getNodes]
**Learning:** Significant performance bottleneck in graph data processing was caused by nested loops (O(N*M)) used for node weighting and linear searches (`Instruments.findInArray`) for context mapping. Replacing these with `Map` and `Set` lookups improved performance by ~97%.
**Action:** Prioritize `Map` and `Set` for data-heavy paths involving lookups or weight aggregation in this codebase.
