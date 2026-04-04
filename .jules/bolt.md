## 2025-05-15 - [Optimize node processing in Entry.getNodes]
**Learning:** The node weighting and sorting logic in `Entry.getNodes` suffered from $O(N \times M)$ complexity due to nested loops searching an array of already seen nodes. This becomes a major bottleneck as the number of nodes in the graph increases.
**Action:** Use a `Map` for $O(1)$ node lookups by name and a `Set` for $O(1)$ stopword filtering and top-node membership checks. Pre-calculate lookup objects for repeatedly searched data like `contexts_map`.
