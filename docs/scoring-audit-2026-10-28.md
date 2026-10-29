# Worker scoring audit: October 28, 2026

This audit covers the federal CRS and the five provincial worker calculators implemented in this repository. It also inventories worker-program coverage for all ten provinces and three territories. It does not certify eligibility for every immigration stream. Entrepreneur and business grids are outside the calculators' scope.

## Federal CRS

Sources:

- [Current CRS criteria](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html)
- [November 3 changes](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/changes.html)
- [IRCC backgrounder, October 16](https://www.canada.ca/en/immigration-refugees-citizenship/news/2026/10/changes-to-express-entry-for-high-wage-occupations.html)
- [High-wage occupation list](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/high-wage.html)

The old age, education, language, spouse, transferability and additional-factor tables remain applicable. From March 25, 2025 through November 2, 2026, job offers receive no CRS points. The announced Labour Market Integration factor must not be applied early or treated as an additional-points bonus.

From November 3, move Canadian work-duration points out of core factors and award the higher of:

- Duration points plus eligible high-wage Canadian experience points: 20, 40 or 70 after 12 qualifying months at the corresponding occupation threshold.
- A qualifying offer in a listed occupation: 50, 70 or 100.

Duration tables still distinguish accompanying spouses. Combined maxima are 150 without a spouse and 140 with one. Work across NOCs can combine at or above each wage threshold. Transferability still uses total qualifying Canadian years. The NOC's published classification determines the tier, independently of the applicant's salary. The checked list has 186 NOCs: 31 at 2x, 89 at 1.5x and 66 at 1.3x.

Implementation: explicit rule versions, a date-selected UI default, qualifying-offer attestation, NOC selection and non-overlapping full-time-equivalent work periods. The earlier version remains available for comparison. Recommendation gains continue to rerun the score function on copied inputs.

**Maximum caveat:** IRCC's new factor tables imply 1,270 (420 core + 150 LMIF + 100 transferability + 600 additional without a spouse, or 390 + 40 spouse + 140 + 100 + 600). IRCC has not yet published an updated overall maximum on its main criteria page. The preview labels 1,270 as the sum of published factor maxima, rather than silently clipping new scores at 1,200. Recheck the complete grid when it is updated.

The form relies on the user to enter qualifying, non-overlapping work. It cannot verify duties, hours, work authorization, offer genuineness, or special provisions for publicly funded physicians and skilled trades. A CRS estimate is not an assessment of CEC, FSW or FST eligibility. Historical draw scores use the rules effective on each draw date.

## Implemented provincial grids

| Province | Official matrix checked | Result and changes |
| --- | --- | --- |
| Ontario | [Workforce Priority](https://www.ontario.ca/page/ontario-workforce-priority-stream), including the [October 5 earnings update](https://www.ontario.ca/page/2026-ontario-immigrant-nominee-program-updates) | Added $80,000+ = 10, retaining $70,000-$79,999 = 8. Maxima become 132 for job-offer applicants and 117 for self-employed physicians. Added physician scoring with cumulative medical practice, fixed health/TEER values and no hourly-wage points. Added exact eligibility months, experience alternatives, language floors and valid visitor/overseas status. Unanswered NOC category awards zero. |
| British Columbia | [Skills Immigration guide](https://www.welcomebc.ca/immigrate-to-b-c/bc-pnp-si-program-guide-pdf), effective June 10, 2026, Part 8 carried forward from May 28 | Ranking grid remains 200: experience 40, education 40, language 40, wage 55, area 25. Initial Skilled Worker checks now use family size, residence, paid hours and eligible spouse income. Added TEER 0/1 language-test exception, June 13 excluded NOCs and separation of general skilled experience from directly related ranking experience. |
| Saskatchewan | [Current ISW grid](https://www.saskatchewan.ca/residents/moving-to-saskatchewan/live-in-saskatchewan/by-immigrating/saskatchewan-immigrant-nominee-program/assess-your-eligibility) | Retains 110, the 60-point threshold and mutually exclusive connection factors for Employment Offer versus OID/EE. Added French as first language and a zero-point no-credential option. The older-experience ambiguity below is visible in the form. |
| Alberta | [Worker EOI grid](https://www.alberta.ca/system/files/im-worker-stream-expression-of-interest-points-grid.pdf), September 28, 2026; [application process](https://www.alberta.ca/how-to-apply-to-aaip-worker-streams) | Matrix remains 100: human capital 69 and economic factors 31. No universal job-offer or 12-month experience floor is imposed by the calculator. The initial check covers the published EOI language floor; applicants must still meet an actual stream's requirements. Job location and regulated-offer points require an offer. Canadian experience bonus requires a compatible total-experience band. |
| Manitoba | [EOI ranking grid](https://immigratemanitoba.com/mpnp/apply/eoi/); [Overseas eligibility](https://immigratemanitoba.com/mpnp/skilled-worker/swo/eligibility/) | Retains the 1,000-point EOI grid, per-ability language points and risk deductions. Applies the separate 60/100 assessment to Overseas profiles, rather than to ongoing Skilled Worker in Manitoba employment. Language checks use occupation TEER. French can be the first language, and a second-language test must be in the other official language. Regional wording now refers to an existing connection outside the Manitoba Capital Region. |

**Saskatchewan source ambiguity:** the published years 6-10 table lists five, four, three and two years, then “less than 1 year.” It omits a one-year row. The previous code invented one point. The calculator now conservatively awards zero for that case and explicitly asks users to confirm it with SINP. This is an unresolved source ambiguity, not a confirmed government zero-point row. The unchanged first-five-years table awards two points for one year.

All provincial banners now describe initial checks, not a complete eligibility decision. Employer, occupation, settlement, licensing, invitation and intake requirements can remain outside the forms.

## Province and territory coverage gaps

These gaps are explicitly displayed at `/programs`, linked from the home page and tool switcher. They must not be presented as existing calculators.

| Jurisdiction | Official worker program reviewed | Repository status |
| --- | --- | --- |
| Quebec | [PSTQ invitation criteria and scoring](https://www.quebec.ca/en/immigration/permanent/skilled-workers/skilled-worker-selection-program/invitation) | Missing calculator. Separate four-stream Arrima selection, with its own grid and spouse factors. Do not reuse CRS or the former PRTQ grid. Official self-evaluation forms are linked from the government page. |
| Prince Edward Island | [January 2026 Workforce Application Guide](https://www.princeedwardisland.ca/sites/default/files/publications/pei_workforce_application_guide.pdf), Appendices A and B; [current EE requirements](https://www.princeedwardisland.ca/en/information/office-of-immigration/pei-express-entry) | Missing calculators for distinct 100-point labour and EE grids, including job-offer/no-offer and International Graduate differences. Older `workforce_application_guide_v3.pdf` is April 2021 and should not be used as the current source. |
| New Brunswick | [Express Entry](https://www.gnb.ca/en/topic/family-home-community/immigration/provincial-nominee-program/express-entry-stream.html); [Skilled Worker](https://www.gnb.ca/en/topic/family-home-community/immigration/provincial-nominee-program/skilled-worker-stream.html) | Missing calculator for the separate EE selection assessment, which requires 67/100. Other pathways have their own criteria; a historic Skilled Worker grid must not be assumed current. |
| Newfoundland and Labrador | [EE Skilled Worker](https://www.gov.nl.ca/immigration/immigrating-to-newfoundland-and-labrador/provincial-nominee-program/applicants/express-entry-skilled-worker/), updated September 25, 2026; [EOI process](https://www.gov.nl.ca/immigration/expression-of-interest-model-overview/) | Missing provincial assessment calculator. The current page requires at least 67 on its provincial grid, separately from CRS and the EOI invitation process. |
| Nova Scotia | [Current NSNP pathways](https://liveinnovascotia.com/nova-scotia-nominee-program); [Skilled Worker](https://liveinnovascotia.com/skilled-worker) | Guidance only. Worker, graduate and Express Entry selection uses stream requirements and provincial priorities. Do not invent a single province-wide worker ranking score from old stream names. |
| Northwest Territories | [Employer-driven EOI grid](https://www.immigratenwt.ca/sites/immigratenwt/files/employer-driven_stream_expression_of_interest_points_grid.pdf) | Missing 845-point calculator: human capital 375, labour-market connection 340, adaptability 130. This is not the Manitoba grid despite some shared language values. |
| Yukon | [2026 nominee process](https://yukon.ca/en/yukon-nominee-program) | Guidance only. Employer EOIs are scored against 2026 priorities. No invented numeric table is implemented. |
| Nunavut | [IRCC provincial nominee directory](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html) | No PNP. Links to federal immigration guidance; not labelled a missing provincial calculator. |

The five implemented provinces are listed in the previous table. Additional streams within those provinces are not automatically covered by their one ranking calculator.

## Maintenance and verification

Use the official page's current document link, rather than assuming a PDF filename or an old guide is still current. Record both the verification date and effective date. Treat intake restrictions and draw targeting separately from score tables. Keep announced rules separately selectable until their effective date, and recheck the CRS maximum when IRCC updates the main grid.

Regression tests cover offer-versus-experience selection, spouse tables, cumulative NOC experience, the effective-date boundary, the old grid, scores above 1,200, simulated recommendations, provincial threshold cases and language-direction changes. Run `bun run typecheck`, `bun run test` and `bun run build` before publishing changes.
