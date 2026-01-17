# Claude Sonnet 4.6 · LLM Evaluation

**Status:** research note · AI Coach provider selection

Anthropic's Claude Sonnet 4.6 · **$3/M input · $15/M output** · 200K context (1M in beta). Best-in-class safety tuning for health content. Strong refusal patterns out of the box for diagnosis/prescription requests. Data routes US/EU — needs DPA disclosed in Privacy Policy sub-processor list. Research benchmark: baseline health advice hallucination 6.2% rising to 37.5% under emotional manipulation without RAG + guardrails. Recommended as **primary LLM** for production; Gemini 2.5 Flash as free-tier fallback for cost control.

**Sources:**
- https://platform.claude.com/docs/en/about-claude/pricing
- https://www.nature.com/articles/s41598-025-09138-0
