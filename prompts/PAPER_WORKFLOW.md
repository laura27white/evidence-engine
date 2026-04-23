# Paper Workflow: From Methodology Docs to Publication

**Purpose:** Turn the paper-grade methodology written during the hackathon build into a submittable academic paper and a Zenodo release.

**Timing:** Begins the week after the hackathon. Target 4-6 weeks of evening and weekend work alongside day jobs.

---

## 1. What you already have after the hack

By the end of Wave 4, the following methodology artefacts are in the repo, all written at paper-appendix quality during the build:

| Source file | Becomes paper section |
|---|---|
| `packages/intelligence/METHODOLOGY.md` (forecast section) | Methods: Forecast ensemble and ensemble-agreement metric |
| `packages/intelligence/METHODOLOGY.md` (cascade section) | Methods: Cascade propagation on assumption DAGs |
| `packages/intelligence/METHODOLOGY.md` (confidence section) | Methods: Multi-component confidence scoring |
| `packages/external-data/METHODOLOGY.md` | Data: Sources, provenance, reproducibility |
| `packages/db/SYNTHETIC_DATA.md` | Data: Treatment of synthetic trajectories |
| `packages/intelligence/EDGE_WEIGHT_RATIONALES.md` | Appendix A: HPO cascade edge weights |
| `packages/intelligence/HPO_CONFIDENCE_TABLE.md` | Appendix B: Confidence-score distribution |
| `packages/narrative/PROMPT_ENGINEERING.md` | Appendix C: Brief generation prompts (if paper covers the narrative layer) |

Also: every prompt's validation tests produce reproducible result tables that become figures and tables in the paper.

The hackathon is not a paper; the build produces the paper's raw material. Week 4 onwards is where raw material becomes manuscript.

---

## 2. Paper scope decision

Before writing, commit to one of three scopes. Each is defensible. Pick the one that matches how much post-hack time you can actually put in.

**Scope A: Short methods note (3000-4000 words).** One contribution: disagreement-as-signal in forecast ensembles applied to project assumptions. Submits to a forecasting or project-risk-management journal as a short note. Fastest path; publishable within 6 weeks if disciplined.

**Scope B: Full methods paper (6000-8000 words).** Two contributions combined: forecast ensemble with disagreement-as-signal, plus Bayesian-style cascade propagation for assumption DAGs. Framed as "a framework for live assumption assurance." This is the Candidate C option from earlier conversation. Targets a higher-tier project-management journal; takes 3-4 months to submission readiness.

**Scope C: Systems paper with empirical case study (8000-10000 words).** Everything in Scope B, plus the Project Trueplan system itself as an artefact: architecture, deployment, empirical validation on real UK major programme data. This is a longer-arc piece that probably goes to a higher-impact venue. Takes 6-9 months.

Recommendation: **commit to Scope A immediately after the hack**, with the explicit intention of extending to Scope B if Scope A lands and if your schedule allows. This gets something on the record quickly while keeping the larger ambition alive.

---

## 3. Target venues

Depends on scope. Candidates:

**For Scope A (short note):**

- *International Journal of Forecasting* (Elsevier). High quality, receptive to applied short pieces. Open-access option.
- *Journal of Forecasting* (Wiley). Similar scope, slightly more theoretical.
- *Risk Analysis* (Wiley/Society for Risk Analysis). Takes methodology notes on risk scoring and propagation. Slightly tangential to pure forecasting.
- *International Journal of Project Management* (IJPM, Elsevier). Top project-management venue. Occasional short methods pieces.

**For Scope B (full methods paper):**

- *IJPM* is the natural home. Ranks as the top project-management journal globally.
- *Project Management Journal* (Sage, PMI). A strong second choice.
- *Construction Management and Economics* (Taylor & Francis), if we reframe slightly to emphasise construction-sector relevance.

**For Scope C (systems paper):**

- *IJPM* again, as a longer piece.
- Systems-oriented venues: *Journal of Systems and Software*, *Empirical Software Engineering*, if we emphasise the software artefact.
- Public-administration venues: *Public Administration Review*, *Public Money and Management*, for government-context framing.

**Parallel Zenodo release.** Regardless of journal submission timeline, publish the manuscript on Zenodo immediately after the hack, under DOI. This gives you a citable artefact from week one and doesn't prejudice journal submission (most journals are fine with preprints on Zenodo; check the chosen journal's policy).

---

## 4. The Zenodo release: week one

The fastest way to go from hack to publication is a Zenodo release. Target submitting within seven days of hack day.

**Structure of the Zenodo release:**

1. The manuscript PDF (a compiled-from-markdown version of the paper draft).
2. The code repository snapshot at the hack-day commit, archived via GitHub's Zenodo integration. Gets its own DOI.
3. The data: a CSV export of the HPO assumption register as used, the external signal data as fetched during the hack (subject to ONS/BoE/gov.uk licences; all three are Open Government Licence, so this is fine), and the forecast/cascade/confidence results produced.
4. The synthetic data generation script's random seed, so the synthetic trajectories can be reproduced.

**DOI strategy.**

Two DOIs: one for the paper, one for the code. Both under the `the maintainer` Zenodo community if you've set that up, otherwise under the author's personal Zenodo. Cross-reference them in the paper's abstract and the code's README.

---

## 5. Paper structure (Scope A)

About 3000-4000 words. Suggested outline:

1. **Abstract (200 words)**: problem, approach, contribution, evidence.
2. **Introduction (500 words)**: the gap (static registers), the question (can we forecast breach?), the contribution (disagreement-as-signal), one sentence per subsequent section.
3. **Related work (500 words)**: forecasting literature (Hyndman and Athanasopoulos), ensemble methods (Hoeting et al.), project-management uncertainty frameworks (Walker et al., Hillson). Brief; this is a short note.
4. **Methods (1200 words)**: formal definitions of drift, tolerance, lead time; the three forecast methods with equations; the ensemble median; the exp(-cv) agreement score with its derivation and interpretation.
5. **Empirical application (600 words)**: the HPO register setup, the three externally-anchored assumptions, the real-data trajectories, the forecasts produced, the disagreement cases identified.
6. **Discussion (400 words)**: what disagreement means when methods differ; how disagreement-as-signal changes practitioner behaviour; limitations of linearity and stationarity; relationship to Bayesian model averaging.
7. **Conclusion (200 words)**: recap; invitation to extend.
8. **References (BibTeX)**: about 15-25 items, drawn from the methodology docs.
9. **Appendix A**: parameter values and rationales.
10. **Appendix B**: full HPO results table.
11. **Data availability statement**: Zenodo DOIs.

---

## 6. Paper structure (Scope B)

6000-8000 words. Expands the above with:

- Introduction: position the framework not just as a forecasting note but as "a framework for live assumption assurance."
- Related work: also covers cascade/dependency propagation in project management (Hulett, Williams, Pollack), Bayesian networks (Pearl, Koller), and epistemic uncertainty (Walker).
- Methods: full forecast section plus full cascade section plus confidence scoring section. Three substantial subsections.
- Empirical application: more thorough validation. For each method, a retroactive backtest. For the cascade, a sensitivity analysis on edge weights.
- Discussion: now covers the interaction between forecast, cascade, and confidence. When disagreement is high *and* cascade exposure is high, the assumption warrants urgent attention even if lead time is long.

---

## 7. Writing workflow

Using the markdown methodology docs as source material:

**Week 1 (immediately post-hack):**
- Export all METHODOLOGY.md files into a single working document.
- Identify where they overlap, what's missing, what's redundant.
- Write the abstract and introduction (hardest parts); defer the rest.
- Submit the manuscript as a Zenodo preprint.

**Week 2:**
- Flesh out the methods section. This is mostly rewriting the METHODOLOGY.md files into continuous academic prose rather than README structure.
- Pull together references into a proper `.bib` file.

**Week 3:**
- Write the empirical application section against actual results.
- Generate publication-quality figures (same data, but formatted for print journals).

**Week 4:**
- Discussion, conclusion, polish.
- Circulate to 2-3 co-reviewers (Jonah Froggatt, Malia Hosseini, Shanti Greene, others you trust).
- Incorporate feedback.

**Week 5:**
- Format for the target journal (templates, line numbering, author details).
- Submit.

**Week 6 onwards:**
- Respond to reviews as they come.

This is a realistic timeline only if you commit to two to four hours per week; more if you can. The Zenodo version existing early removes the pressure to rush journal submission.

---

## 8. Co-authorship

Propose:

- **Laura White (corresponding author):** overall framework, methodology, implementation.
- **Laura White:** contribution for the applied use case framing and demo validation. Discuss whether Laura wants to be a co-author; it's a career-building artefact for her but requires commitment to reviewing drafts. If she declines, credit in Acknowledgements.
- **Jonah Froggatt:** if he contributes methodological review (particularly forecast ensemble), consider co-authorship.
- **Malia Hosseini:** similar.
- **Shanti Greene:** if there's a verified-autonomy angle we emphasise, consider. If not, Acknowledgements.

Pre-agree contribution expectations in writing before assigning co-authorship.

---

## 9. Related outputs

Beyond the paper, post-hack deliverables worth planning:

1. **LinkedIn post series**, 3-4 pieces, one per week: the hackathon recap, the methodology, the lessons learned, the paper preprint announcement.
2. **A short video** (60-90 seconds) of the Trace view live-updating, for LinkedIn and the Substack.
3. **A Substack piece** on laurawhite.substack.com, 800-1200 words, about "what forecasting project assumptions actually looks like." Lay reader, not academic.
4. **A project newsletter** item on the paper submission.
5. **A GitHub repo release** tagged `v0.1.0-hackathon` with the archived code.
6. **Cross-references** from the Project Trueplan repo to the paper, and from the paper's introduction to the repo. Each points to the other.

---

## 10. Honest considerations

Some things worth naming before committing:

**The hackathon data is synthetic for 44 out of 47 assumptions.** The paper must be explicit about this. Scope A is safer here because the empirical story is A039/A040/A041 only, which is real data. Scope B would need a longer empirical section or additional case studies on real data.

**The MPA hackathon context is unusual framing for an academic journal.** Consider whether the paper mentions MPA at all. The cleaner framing is that the methodology applies to any major-programme assumption register, and the HPO case is one instance. MPA is credited in Acknowledgements. This reads better to academic reviewers than "we built this for a hackathon."

**Peer review will probably ask for more validation.** A reviewer may push back: "you validate on three real assumptions; that's a small sample." Be ready to respond with either (a) pointing to the synthetic sensitivity analyses as supporting evidence, or (b) committing to a follow-up paper with real data from multiple programmes. The latter is the honest answer if Scope A gets pushback.

**The paper lists the code as a citable artefact.** Ensure the repo has:

- A `CITATION.cff` file at the repo root.
- A clear LICENCE.
- A version tagged at the hack-day commit.
- A README that leads with a citation to the paper.

---

## 11. What success looks like

By the end of the paper workflow you will have:

- A Zenodo-DOI preprint, citable from day seven post-hack.
- A journal submission in process by week five or six.
- A GitHub repo with a tagged release and a citation file.
- Two or three LinkedIn posts and a Substack article extending the work's reach.
- Clear collaboration records (who did what) for future paper iterations.

And, regardless of hackathon outcome, you will have a demonstrable research contribution to point to.

---

*End of paper workflow.*
