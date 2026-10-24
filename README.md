# Hi, I'm Ananya Chepuri 👋

I'm a data scientist at the New Jersey Department of Community Affairs, where I use data to help the state understand and prevent homelessness. I earned my M.S. in Data Science from Rutgers in May 2026, and before that a B.Tech in Electronics & Communication Engineering from GCET.

I build the machinery between raw data and real decisions: ETL pipelines that hold up in production, dashboards people actually open, and models that survive validation.

**→ See my portfolio: https://ananyach-19.github.io/Ananya-Chepuri/**

## What I'm working on now

Since February 2026 I've been a data scientist in the Data Center of the Division of Housing and Community Resources at NJDCA. My main project is **HERF (Homelessness Economic Risk Framework)**, a statewide model that estimates where New Jersey households are at risk of becoming homeless.

- Extended HERF from a basic housing risk score into a forecasting system with statewide, county, ZIP-of-origin and congressional-district models built on de-identified homeless services (HMIS) data.
- Redefined the ZIP-level target as distinct people entering homelessness instead of shelter entries, cutting county-share forecast error by 45% (WAPE 16.2% → 8.9%).
- Built a seasonal statewide forecast of people entering homelessness with about 6–8% average error for the sheltered population.
- Deployed HERF as a FastAPI service on AWS Lambda with CI/CD, and connected it to the department's AI assistant through a PII-redaction proxy so staff can ask it questions in plain language.
- Made the model more trustworthy by fixing target leakage and adding county-grouped cross-validation and a fairness audit tool.
- Built public and internal homelessness dashboards viewed by thousands of people, including moving the Bringing Veterans Home dashboard to Databricks and Power BI.
- Built the HERF presentation for the NAHRO conference in Denver, where the work won a national recognition award.

## Earlier projects

- **Parkinson's pattern profiling:** a hybrid Vision Transformer and motor-feature classifier for handwriting analysis that reached 92% accuracy, outperforming a CNN baseline.
- **Energy data pipeline:** automated ETL in Apache Airflow with data-quality checks, feeding Tableau dashboards for fleet operations.
- **Green Coin:** a CNN waste classifier paired with a reward system that encourages companies to improve waste quality.
- **Biometric voting system:** an IoT authentication system on Arduino with GPS and Aadhaar verification. It earned a published Indian patent (No. 202241052177) and 3rd place in Region 9 of the JHUB Hackathon 2k22.

**Tools I use most:** Python (pandas, statsmodels, scikit-learn, geopandas), SQL, Databricks, Power BI, FastAPI, AWS Lambda, Docker, PyTorch, Airflow, Tableau.

## About this site

The portfolio is styled as an instrument console and research journal. It's plain HTML, CSS and JavaScript with no build step. Press `/` on the site to open its built-in terminal.

To run it locally:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```
