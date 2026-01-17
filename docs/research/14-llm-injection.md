# Medical LLM · Prompt Injection Patterns

**Status:** research note · AI Coach guardrail design basis

**JAMA Network Open 2025 study:** LLMs vulnerable to prompt injection in medical advice contexts. Initial blocks don't guarantee sustained protection — some models succumbed in **80% of cases** under persistent multi-turn follow-up. Emotional manipulation coupled with prompt injection raised dangerous-misinformation rate from baseline **6.2% → 37.5%**. **Critical insight:** system prompts are NOT security — they're guidance the model can be manipulated past. **Defense stack:** external input classifier (keyword + lightweight LLM) + RAG confidence gate + output classifier (diagnosis/prescription/disclaimer detection) + audit trail of all refused queries.

**Sources:**
- https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2842987
- https://www.nature.com/articles/s41598-025-09138-0
