# RAG Safety · Hallucination Mitigation

**Status:** research note · AI Coach safety architecture basis

**MEGA-RAG framework** (Frontiers in Public Health, 2025): reduces public-health LLM hallucinations by **40%+** over baseline. Multi-evidence retrieval (dense + keyword + knowledge graph) with cross-encoder reranker. **Radiology contrast media study:** RAG eliminated hallucinations completely (0% vs 8% baseline); improved mean rank by 1.3; 54% of cases marked "markedly improved" in safety-critical content. **Industry reports:** 70-80% fewer hallucinations after RAG. **Critical design:** retrieval confidence gate — refuse when top chunks fall below similarity threshold rather than hallucinate.

**Sources:**
- https://pmc.ncbi.nlm.nih.gov/articles/PMC12540348/
- https://www.mdpi.com/2673-2688/6/9/226
