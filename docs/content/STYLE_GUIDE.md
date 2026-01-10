# RituChakra — Content Style Guide & Taxonomy

**Version:** 1.0 · 2026-04-18
**Audience:** writers, editors, reviewing practitioners, and the content system.
**Purpose:** every article we publish should feel like the same voice. This guide tells us what that voice sounds like.

---

## 1. Our voice in one paragraph

Warm, grounded, curious, evidence-respecting. We speak to an intelligent young Indian woman like an older sister who happens to be both well-read and well-trained — someone who has read *Charaka*, studied biology, and also holds your hand. We don't talk down. We don't woo-woo. We don't diagnose. We offer a lens, a ritual, a translation between ancient language and modern body.

## 2. Voice guardrails

### We DO:
- **Speak in second-person.** "Your body," "you'll notice," "when you feel." Intimate, never clinical.
- **Honor the classical texts by name.** When citing Charaka Samhita or Ashtanga Hridaya, cite them. Names give authority and keep us honest.
- **Pair Ayurveda with science.** Never one without the other. Every phase description should touch both frameworks.
- **Write in rhythm.** Short sentence. Then a longer one that breathes. Then a short one again.
- **Use Indian English naturally.** "A fortnight," "half past seven," "tell me no." Readers are Indian.
- **Name rituals in their original tongue, then translate.** "Abhyanga (self-massage with warm oil)."
- **Acknowledge variability.** Every body is different. Every cycle is different. We offer a lens, not a law.
- **Quote practitioners we respect.** Claudia Welch, Robert Svoboda, Maya Tiwari, Dr. Vasant Lad. Attribute.

### We DON'T:
- Talk down ("girlies," "ladies," "beauties," "sweetie"). Nope.
- Diagnose ("You have PCOS"). Ever.
- Prescribe ("Take 3 g of shatavari"). We describe, we don't prescribe.
- Claim cures ("This will balance your hormones"). We say: "Ayurveda suggests this supports balance."
- Use hype words ("game-changer," "revolutionary," "miracle"). Calm confidence only.
- Use astrology as a primary framework. Ayurveda and biology — that's our ground.
- Shame cycles ("dirty," "curse," "burden"). Rajah is sacred in our framework.
- Use unexplained jargon. If we say *apana vayu*, we translate.
- Make Western medicine the villain. It's partner, not enemy.

## 3. Article structure (template)

Every Phase Wisdom / Ritual / Herb / Disorder / Science article follows this skeleton:

```
---
slug: string (URL-safe, lowercase, hyphenated)
title: string (60 chars max)
subtitle: string (100 chars, sets the mood)
category: "phase-wisdom" | "ritual" | "herb" | "disorder" | "science" | "regimen"
phases: ["menstrual", "follicular", "ovulation", "luteal"]  # which phases this applies to
doshas: ["vata", "pitta", "kapha"]                         # which doshas dominate
tier: "free" | "premium"
reading_minutes: number
cover_image_url: string
reviewed_by: "Dr. [Name], BAMS"
reviewed_at: date
citations:
  - text: "short quote or paraphrase"
    source: "Ashtanga Hridaya Uttara Tantra 33.4"
    translator: "Shri Kanta Murthy, Chaukhamba Orientalia, 1991"
published: boolean
---

# [Title in Fraunces Light]

**Opening paragraph (2-3 sentences).** Hook the reader in plain language. Set the mood. Don't start with a classical quote — lead with the body first.

## Section 1 — The body

What's actually happening biologically. Hormone levels, tissue changes, the physiology. Keep it accessible: "your estrogen is rising" not "plasma estradiol concentration is in the follicular ramp."

## Section 2 — What the classical texts say

The Ayurvedic lens. Cite specific texts with chapter references. Translate Sanskrit terms on first use. This section is usually where the article's depth lives.

## Section 3 — What this means for today

Practical: what to lean into, what to pull back from. 2-4 concrete suggestions. Link to ritual articles for deeper dives.

## Section 4 — When to see a doctor

Always include this at the bottom of phase/disorder/herb articles. Concrete red flags that mean "close this app and call someone."

## Further reading
- Link to 2-3 related articles
- Link to 1 classical source we drew from

---

**Reviewed by [Dr. Name], BAMS · [Date]**
*Citations: footnotes or bibliography below.*
```

## 4. Citation format

We use a hybrid of traditional Sanskrit-scholarship format and modern academic clarity.

### Classical Ayurvedic texts
Format: **Text name · sub-treatise · chapter.verse** followed by translator in parentheses.

Examples:
- *Ashtanga Hridaya Uttara Tantra 33.4* (Shri Kanta Murthy trans., Chaukhamba Orientalia, 1991)
- *Sushruta Samhita Sharira Sthana 3.6* (K.L. Bhishagratna trans., Chaukhamba Orientalia, 1991)
- *Charaka Samhita Chikitsa Sthana 30.115* (P.V. Sharma trans., Chaukhamba Orientalia, 1981)

### Secondary integrative sources
Format: **Author, *Book Title*, page or chapter.**

Examples:
- Claudia Welch, *Balance Your Hormones, Balance Your Life*, Chapter 4, "Phases of the Month"
- Robert Svoboda, *Ayurveda for Women*, Chapter 6, "The Monthly Rhythm"
- Maya Tiwari, *Women's Power to Heal Through Inner Medicine*, Part III
- Dr. Vasant Lad, *The Complete Book of Ayurvedic Home Remedies*, Menstrual section
- **Tiwari Premwati (ed.)**, *Ayurvediya Prasuti Tantra evum Stri Roga*, Chaukhambha Orientalia, 2nd ed., 2003 — **the standard modern Ayurvedic gynecology textbook in Hindi; first-choice for classical Indian vernacular citations**

### Standard biomedical references
- **D.C. Dutta**, *Textbook of Gynecology*, 4th ed. — standard Indian OB-GYN textbook; cite for physiology and disorder classification
- **Ganong's *Review of Medical Physiology***, 23rd ed. — for underlying physiology
- **Endotext** (NIH Bookshelf) — open-access endocrinology chapters, citeable
- **StatPearls** (NCBI Bookshelf) — open-access clinical summaries, citeable

### Alternate translators of the Brihat Trayi (useful for cross-checking)
- **Sushruta Samhita** — *Ayurveda-tattva-sandeepika* Hindi commentary by **Kaviraj Ambikadutta Shastri** (AMS), Chaukhambha Sanskrit Sansthan, Varanasi — the standard Indian vernacular edition
- **Ashtanga Hridaya** — *Nirmala* Hindi commentary by **Dr. Brahmanand Tripathi**, Chaukhambha Sanskrit Pratishthan, Delhi
- **Kashyap Samhita** (Vriddh Jeevaka, revised by Vaatsya) — *Vidyotini* Hindi commentary by **Shri Satyapala Bhishagacharya**, Chaukhambha Sanskrit Sansthan, Varanasi — classical pediatric + gynecology source, underused in modern literature

### Peer-reviewed Ayurvedic review articles
- Nibe PL, Ghanawat PN, Wagh KG, Khedkar AD, Dukale SR. *Ayurveda perspective on different stages of Rituchakra: a review*. WJPMR. 2021; 7(5): 262-264. — useful consolidated review

### Peer-reviewed medical studies
Format: **Authors et al., "Title," *Journal*, Year, DOI link.**

Always link to PubMed or original DOI. Do not cite blogs, wellness influencers, or unverified websites as medical authority.

## 5. Taxonomy (categories)

### 5.1 Phase Wisdom
*Purpose:* Deep introductions to each cycle phase through both Ayurvedic + biological lenses.
*Target count:* 4 per phase × 4 phases = 16 articles at launch.
*Tier:* first 1 per phase is FREE (teaser); rest are PREMIUM.

Subtopics per phase:
1. **Introduction** (the lens) — 600-800 words
2. **The body** (physiology deep-dive) — 500-700 words
3. **The dosha** (Ayurvedic framework) — 500-700 words
4. **Everyday invitations** (what to do / not do) — 400-600 words

### 5.2 Daily Rituals
*Purpose:* Practical, step-by-step rituals tagged by phase and dosha.
*Target count:* 40-60 at launch (3-4 rituals × 4 phases × 3 doshas, overlapping).
*Tier:* 5 rituals FREE (one per phase + one welcome ritual); rest PREMIUM.

Examples:
- Warm sesame abhyanga (follicular, kapha-balancing)
- Castor oil belly pack (menstrual, vata-reducing)
- Triphala tonic before bed (luteal, agni-gentle)
- Pranayama for pitta peak (ovulation)

### 5.3 Herbs & Foods
*Purpose:* Reference entries for herbs and foods commonly used in cycle support. Each with safety, contraindications, sources.
*Target count:* 25-40 at launch.
*Tier:* PREMIUM (with 3-5 free teasers).

Each herb page includes:
- Sanskrit + common name
- Properties (rasa/virya/vipaka in Ayurveda; key compounds in science)
- Indications per phase
- Contraindications (pregnancy, medication interactions, etc.)
- Sources + further reading

### 5.4 Cycle Disorders (*Yoni-vyapat*)
*Purpose:* Educational explanations of classical menstrual disorders alongside modern equivalents.
*Target count:* 8-12 at launch.
*Tier:* PREMIUM (critical gating — never replaces medical advice).

Always includes heavy "when to see a doctor" section. Examples:
- *Rajonasha* / amenorrhea
- *Ati-artava* / menorrhagia
- *Krichra-artava* / dysmenorrhea
- *Kashta-artava* / painful cycles

### 5.5 Hormone Science
*Purpose:* Clean, intimate explainers of hormone biology. Demystify without condescending.
*Target count:* 12-15 at launch.
*Tier:* 4-5 FREE; rest PREMIUM.

Examples:
- What estrogen actually does on day 7 vs day 14
- Progesterone and the basal body temperature rise
- The LH surge: the body's ovulation signal
- Prolactin, oxytocin, and the post-period softness
- Cortisol × cycle: how stress distorts rhythm

### 5.6 *Ritumaticharya* (Menstrual Regimen)
*Purpose:* Classical Ayurvedic recommendations for conduct during menses, adapted for modern life.
*Target count:* 4-6 at launch.
*Tier:* FREE (foundational).

Source: heavily from *Ashtanga Hridaya Uttara Tantra*, *Charaka Samhita Sharira Sthana*.

## 6. Review workflow

Every article passes through this pipeline before publication:

```
1. Draft (writer, typically the founding team)
   └─ 400-800 words depending on category
   └─ All citations included
   └─ Frontmatter complete
      ↓
2. Practitioner review (BAMS-qualified)
   └─ Accuracy check
   └─ Flags anything that oversteps traditional authority
   └─ Cultural sensitivity pass
      ↓
3. Founder / editor approval
   └─ Voice + tone pass
   └─ Readability
   └─ Link integrity
      ↓
4. Copy edit + proofread
   └─ Grammar, spelling, consistency
      ↓
5. Seed into Supabase articles table
   └─ published = false → review in staging
   └─ published = true → live
      ↓
6. 30-day post-publish check
   └─ Any user feedback flags
   └─ Any new research requires update
```

Target cadence during Phase 5 of the build: 5-8 articles/week.
Target cadence post-launch: 4-6 articles/week.

## 7. Red flags the reviewer checks for

Reviewing practitioners (BAMS or equivalent) should reject or revise articles that:

- Make claims of cure or treatment
- Prescribe specific dosages
- Diagnose conditions
- Offer contraceptive guidance
- Make absolute claims ("always," "never," "will definitely")
- Skip the "when to see a doctor" section on disorder articles
- Mis-attribute a classical source
- Translate Sanskrit incorrectly
- Promise results from rituals
- Use Ayurveda to dismiss modern medicine
- Describe cycles or menstruation with shame or stigma
- Exclude non-heterosexual or non-cisgender readers where relevant (we are inclusive, we don't erase)

## 8. Accessibility & sensitivity

- **Inclusive language** where reasonable. Our user may be cis, trans, non-binary — our content shouldn't assume. "People who menstruate" is our fallback when addressing the broad topic; "women" is fine when contextually appropriate.
- **Avoid shame language.** Never "that time of month," "curse," "woman's problem." Prefer "cycle," "rajah," "menstruation," "period."
- **Body-positive.** We don't recommend weight loss. We don't frame bloat / acne / swelling as "bad." These are body signals worth noticing, not problems to fix.
- **Mental health sensitive.** When discussing PMS, luteal mood dip, or PMDD, include resources (see Medical Disclaimer §5).

## 9. Image guidelines (for covers)

- **Phase palette match** — ovulation articles use sun/gold; menstrual uses cherry/plum; etc. (Refer to Design System Page in Figma.)
- **Gradient meshes** preferred over stock photography.
- **No stock photos of smiling white women** in wellness clothes. Ever.
- **No explicit anatomical diagrams** on cover. Those can live inside the article if needed, illustrated in our style.
- **Botanical motifs OK** — lotus, marigold, jasmine, turmeric flower, ashoka tree — aligned with the article's herb/ritual focus.

## 10. Localization roadmap

Launch: English (India) only.
v1.5 (post-launch month 3+): Hindi primary translation, Tamil and Telugu if usage warrants.
Later: Bengali, Malayalam, Kannada.

Content should be written in English that translates cleanly — avoid wordplay or idioms that don't cross languages.

## 11. Versioning

- Articles have a `version` integer. Incrementing on material edits.
- Users who saved an older version will see a gentle "this article has been updated — read the new version?" prompt.
- The practitioner-review step is repeated on material edits.

## 12. Checklist before publishing

- [ ] Frontmatter complete (slug, title, category, phases, doshas, tier, reviewer, citations)
- [ ] Opening paragraph hooks without overpromising
- [ ] Both Ayurveda and biology lenses included (if applicable)
- [ ] All Sanskrit terms translated on first use
- [ ] All citations properly formatted
- [ ] "When to see a doctor" section present (disorder/herb articles)
- [ ] Practitioner review complete (name + date in frontmatter)
- [ ] Copy edited
- [ ] Cover image matches phase palette
- [ ] Reading time accurate
- [ ] Tier correctly set (free vs premium)
- [ ] Links verified (internal + external)

---

*This guide is a living document. Update as we learn. Version 1.0 drafted 2026-04-18.*
