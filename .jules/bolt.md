## 2025-05-15 - [O(N^2) to O(N) Optimization in Entry.getNodes]
**Learning:** Significant performance bottleneck in graph data processing was caused by nested loops (O(N*M)) used for node weighting and linear searches (`Instruments.findInArray`) for context mapping. Replacing these with `Map` and `Set` lookups improved performance by ~97%.
**Action:** Prioritize `Map` and `Set` for data-heavy paths involving lookups or weight aggregation in this codebase.

## 2025-05-20 - [Optimized uniqualizeArray with Set]
**Learning:** Replaced object-based deduplication with `Set` in `Instruments.uniqualizeArray`. Using a `Set` provides O(1) average lookup and avoids issues with `Object.prototype` key collisions. Benchmark showed a 50-80% performance improvement for large arrays depending on the key function overhead.
**Action:** Always prefer `Set` over objects for tracking unique items to ensure both performance and safety against prototype-inherited keys.
## 2025-05-15 - [O(N) Set-based Deduplication in Instruments.uniqualizeArray]
**Learning:** Core utility functions like `Instruments.uniqualizeArray` are critical for graph processing (e.g., node deduplication). Replacing object-based lookups with `Set` improves performance by ~20% and ensures more predictable behavior for large data sets.
**Action:** Use `Set` for all deduplication logic in utility functions to maintain O(1) performance and avoid hidden overhead of object key stringification.

## 2025-05-25 - [Preventive Deduplication vs Post-processing]
**Learning:** In `Entry.getNodes`, the pattern of pushing all potential nodes to an array and then deduplicating with `JSON.stringify` was a major bottleneck. Replacing it with an in-loop `Set` check for unique IDs improved performance by ~90% (35ms -> 3.4ms for 10k edges).
**Action:** Avoid post-processing deduplication for large arrays when you can track uniqueness during the initial population of the array. Never use `JSON.stringify` as a key for deduplication if a unique ID is available.

## 2025-05-30 - [O(N^2) to O(N) Optimization and Logger Overhead in addStatement]
**Learning:** `CypherQuery.addStatement` suffered from O(N^2) complexity due to `Array.indexOf` lookups for concept deduplication. More importantly, `console.log(JSON.stringify(params))` was a massive bottleneck, consuming over 90% of processing time for large statements.
**Action:** Replace `indexOf` with `Set` for deduplication. Never log large stringified objects in performance-critical paths; use conditional debugging or specialized loggers.

## 2025-06-05 - [O(N*M) to O(N+M) Optimization in extractConcepts]
**Learning:** Text processing in `extractConcepts` was significantly slowed down by repeated `indexOf` lookups in potentially large arrays (`stopwords`, `hashtags`). Using `Set` for these lookups reduced processing time for 1000 concepts from ~841ms to ~38ms (~22x speedup).
**Action:** In data-intensive text processing paths, always convert lookup arrays into Sets before entering loops to ensure O(1) membership checks.
