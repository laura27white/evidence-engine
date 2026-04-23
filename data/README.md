# Project Trueplan: data directory

## `HPO_All_Assumptions_Register_Approved.xlsx`

Source: Projecting Success, provided as the reference dataset for MPA Challenge 5 (Critical Assumption Drift, April 2026).

Contains 47 assumptions for the synthetic "Holographic Project Office" (HPO24A01) programme described in the accompanying Statement of Requirements. The programme itself is fictional, part of the challenge briefing; the assumptions are illustrative of the kinds of assumption registers major programmes produce.

Committed to this repo for reproducibility of the Project Trueplan demonstration and the companion academic paper.

### Deviations from the Prompt 1 spec that appear in the data

- The 47 codes span A001 to A048 with **A037 missing** (gap between A036 and A038).
- The three externally-anchored economic assumptions are **A046 Inflation**, **A047 Interest Rates**, **A048 Tax Policy**. The Prompt 1 spec referenced A039, A040, A041. The semantic meaning is the same; the spec was written before the actual xlsx was reviewed.

## Licensing

Committed on the understanding that Projecting Success's challenge materials are provided openly for participant use under the Open Government Licence. If that understanding turns out to be incorrect the file will be removed and the import script adapted to read from a path outside the repo. No copyright is claimed by the Project Trueplan authors over the content of this file.

## Other reference documents (not committed)

- `Challenge 5 Assumption Drift & Early-Warning Intelligence.pdf`: the challenge brief.
- `RFP - SOR.docx`: the Statement of Requirements.

These are available from Projecting Success; they live in `prompts/` in the author's local scratchpad (gitignored) for reference but are not part of the committed repo.
