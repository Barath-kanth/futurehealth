"""
Build a small CSV of men aged 18-54 from NHANES 2015-2016 (US CDC, public domain).

Inputs (SAS transport files) go in data/nhanes/raw/ and are NOT committed:
  https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2015/DataFiles/<NAME>.xpt
  DEMO_I  demographics        (RIAGENDR, RIDAGEYR)
  BMX_I   body measures       (BMXWT, BMXBMI, BMXWAIST)
  GLU_I   fasting glucose     (LBXGLU, mg/dL, fasting subsample only)
  TST_I   total testosterone  (LBXTST, ng/dL; LBDTSTLC = below detection limit)
  SLQ_I   sleep               (SLD012, hours on weekdays/workdays)

Run: python3 scripts/nhanes/prepare.py   (needs pandas)
"""
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "nhanes" / "raw"
OUT = ROOT / "data" / "nhanes" / "men_18_54_2015_2016.csv"


def load(name: str, cols: list[str]) -> pd.DataFrame:
    df = pd.read_sas(RAW / f"{name}.xpt", format="xport", encoding="utf-8")
    return df[cols]


demo = load("DEMO_I", ["SEQN", "RIAGENDR", "RIDAGEYR"])
bmx = load("BMX_I", ["SEQN", "BMXWT", "BMXBMI", "BMXWAIST"])
glu = load("GLU_I", ["SEQN", "LBXGLU"])
tst = load("TST_I", ["SEQN", "LBXTST", "LBDTSTLC"])
slq = load("SLQ_I", ["SEQN", "SLD012"])

df = demo
for part in (bmx, glu, tst, slq):
    df = df.merge(part, on="SEQN", how="left")

men = df[(df["RIAGENDR"] == 1) & (df["RIDAGEYR"] >= 18) & (df["RIDAGEYR"] <= 54)].copy()
men = men.rename(
    columns={
        "SEQN": "seqn",
        "RIDAGEYR": "age",
        "BMXWT": "weight_kg",
        "BMXBMI": "bmi",
        "BMXWAIST": "waist_cm",
        "LBXGLU": "glucose_mgdl",
        "LBXTST": "testosterone_ngdl",
        "LBDTSTLC": "t_below_lod",
        "SLD012": "sleep_hours",
    }
).drop(columns=["RIAGENDR"])
men["t_below_lod"] = men["t_below_lod"].round().astype("Int64")
men["seqn"] = men["seqn"].astype(int)
men["age"] = men["age"].astype(int)

OUT.parent.mkdir(parents=True, exist_ok=True)
men.to_csv(OUT, index=False, float_format="%.6g")

print(f"men 18-54: {len(men)}")
for col in ["bmi", "waist_cm", "glucose_mgdl", "testosterone_ngdl", "sleep_hours"]:
    print(f"  {col}: {int(men[col].notna().sum())} measured")
print(f"wrote {OUT.relative_to(ROOT)}")
