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

## 2025-06-01 - [O(N^2) to O(N) deduplication in CypherQuery.addStatement]
**Learning:** Found a common $O(N^2)$ anti-pattern where an array was used with `indexOf` to track "already seen" items during a loop. In `addStatement`, this affected both concept and mention deduplication. Switching to a `Set` provided a ~4x speedup for this specific logic in benchmarks.
**Action:** Scan for `array.indexOf` or `array.includes` used within loops for deduplication and replace with `Set` for constant time lookups.
