# AGB Stat Balancing — Draft v0.1 end-to-end build
# Generates /data/agb_cards_adjusted.csv for your Next.js app.
# Run with:  python scripts/agb_build_csv.py

import pandas as pd
import numpy as np
import math
import re

# -----------------------------
# 1) Card roster (54 cards)
# -----------------------------
cards = [
    # -------------------- Highlanders --------------------
    ("00000001","Highlands Stable Boy","Highlanders","Warrior-Fighter","Common","Hero","physical"),
    ("00000002","Highlands Stable Master","Highlanders","Warrior-Balanced","Uncommon","Hero","physical"),
    ("00000003","Highlands Horseman","Highlanders","Warrior-Fighter","Rare","Hero","physical"),
    ("00000004","Highlands Master Horseman","Highlanders","Warrior-Balanced","Epic","Hero","physical"),

    ("00000005","Highlands Student","Highlanders","Mage","Common","Hero","magical"),
    ("00000006","Highlands Academic","Highlanders","Mage","Uncommon","Hero","magical"),
    ("00000007","Highlands Professor","Highlanders","Mage","Rare","Hero","magical"),

    ("00000008","Highlands Scholar","Highlanders","Healer","Common","Hero","support"),
    ("00000009","Highlands Medic","Highlanders","Healer","Uncommon","Hero","support"),
    ("0000000A","Highlands Surgeon","Highlanders","Healer","Rare","Hero","support"),
    ("0000000B","Highlands Priest","Highlanders","Healer","Epic","Hero","support"),
    ("0000000C","Highlands Pope","Highlanders","Healer","Legendary","Champion","support"),

    ("0000000D","Highlands Slinger","Highlanders","Sharpshooter","Common","Hero","physical"),
    ("0000000E","Highlands Archer","Highlanders","Sharpshooter","Uncommon","Hero","physical"),
    ("0000000F","Highlands Hitman","Highlanders","Sharpshooter-Power","Rare","Hero","physical"),
    ("00000010","Highlands Spy","Highlanders","Sharpshooter-Speed","Epic","Hero","physical"),

    ("00000021","Highlands Commander","Highlanders","Warrior-Balanced","Legendary","Champion","physical"),
    ("00000022","Highlands Mentalist","Highlanders","Mage","Legendary","Champion","magical"),
    ("00000023","Highlands Forrester","Highlanders","Sharpshooter","Legendary","Champion","physical"),

    ("00000024","Heathcliff - King of the Highlands","Highlanders","Warrior-Balanced","Mythic","Guardian","physical"),
    ("00000025","Doogen Howzit - Chief Doctor of the Highlands","Highlanders","Healer","Mythic","Guardian","support"),
    ("00000026","Elijah Forester - The High Priest","Highlanders","Healer","Mythic","Guardian","support"),
    ("00000027","Supreme Knight of the Highlands - Sir Caerlon Saddler","Highlanders","Warrior-Tank","Mythic","Guardian","physical"),
    ("00000028","Brick “Ironshoe” Davidson - The Grand Equestrian of the Highlands","Highlanders","Warrior-Balanced","Mythic","Guardian","physical"),
    ("00000029","Edward McCallister - Dean of the Highlands","Highlanders","Mage","Mythic","Guardian","magical"),
    ("0000002A","Marshall Westborough - Scout of the Highlands","Highlanders","Sharpshooter-Speed","Mythic","Guardian","physical"),
    ("0000002B","Unknown of the Highlands","Highlanders","Balanced","Mythic","Guardian","physical"),

    # -------------------- Keepers of the Crypt --------------------
    ("00000011","Skeleton Remains of the Crypt (L1)","Keepers","Warrior-Tank","Common","Hero","physical"),
    ("00000012","Bone Marrow of the Crypt (L2)","Keepers","Warrior-Tank","Uncommon","Hero","physical"),
    ("00000013","Bone Soldier of the Crypt (L3)","Keepers","Warrior-Balanced","Rare","Hero","physical"),
    ("00000014","Bone General of the Crypt (L4)","Keepers","Warrior-Tank","Epic","Hero","physical"),

    ("00000015","Skeleton Occultist of the Crypt (L1)","Keepers","Mage","Common","Hero","magical"),
    ("00000016","Bone Lich of the Crypt (L2, revised)","Keepers","Mage","Uncommon","Hero","magical"),
    ("00000017","Cabalist of the Crypt (L3, revised)","Keepers","Mage","Rare","Hero","magical"),
    ("00000018","Necromancer of the Crypt (L4, revised)","Keepers","Mage","Epic","Hero","magical"),

    ("00000019","Apparition of the Crypt (L1)","Keepers","Support","Common","Hero","support"),
    ("0000001A","Poltergeist of the Crypt (L2)","Keepers","Support","Uncommon","Hero","support"),
    ("0000001B","Banshee of the Crypt (L3)","Keepers","Support","Rare","Hero","support"),

    ("0000001C","Tainted of the Crypt (L1, revised human Highlander infected)","Keepers","Sharpshooter","Common","Hero","physical"),
    ("0000001D","Vampire of the Crypt (L2)","Keepers","Sharpshooter","Uncommon","Hero","physical"),
    ("0000001E","Vampire Lord of the Crypt (L3)","Keepers","Sharpshooter-Power","Rare","Hero","physical"),
    ("0000001F","Werewolf of the Crypt (L2)","Keepers","Sharpshooter","Uncommon","Hero","physical"),
    ("00000020","Lycanthrope of the Crypt (L3)","Keepers","Sharpshooter-Strength","Rare","Hero","physical"),

    ("0000002C","Skeleton Prince of the Crypt","Keepers","Warrior-Tank","Legendary","Champion","physical"),
    ("0000002D","Skull Magician of the Crypt (redone correctly)","Keepers","Mage","Legendary","Champion","magical"),
    ("0000002E","Bone Archer of the Crypt","Keepers","Sharpshooter","Legendary","Champion","physical"),

    ("0000002F","Charles Jameson - Skeleton King of the Crypt","Keepers","Warrior-Balanced","Mythic","Guardian","physical"),
    ("00000030","Furusiyya – The Bone General of the Crypt","Keepers","Warrior-Fighter","Mythic","Guardian","physical"),
    ("00000031","Mekubbal – The Skeletal Cabalist of the Crypt","Keepers","Mage","Mythic","Guardian","magical"),
    ("00000032","Soriben – The Skeletal Necromancer of the Crypt","Keepers","Mage","Mythic","Guardian","magical"),
    ("00000033","Bram – Vampire Lord of the Crypt","Keepers","Sharpshooter-Power","Mythic","Guardian","physical"),
    ("00000034","Jay Cub – The Frenzied Lycanthrope of the Crypt","Keepers","Sharpshooter-Strength","Mythic","Guardian","physical"),
    ("00000035","Caroline McNancy – The Hallowed Banshee of the Crypt","Keepers","Support","Mythic","Guardian","support"),
    ("00000036","Simon Peter - The Exalted Reborn of the Crypt","Keepers","Mage","Mythic","Guardian","magical"),
]

# --- Clean display names (remove parentheticals like "(L1)", "(revised)", quotes, etc.) ---
def clean_name(name: str) -> str:
    # remove anything in parentheses: " (L1)", "(L2, revised)", etc.
    name = re.sub(r"\s*\([^)]*\)", "", name)
    # normalize curly quotes to straight, then drop quotes
    name = name.replace("“", '"').replace("”", '"')
    name = name.replace("'", "").replace('"', "")
    # collapse double spaces and trim
    name = re.sub(r"\s{2,}", " ", name).strip()
    return name

cards = [(cid, clean_name(n), fac, cls, rar, hero, atk) for (cid, n, fac, cls, rar, hero, atk) in cards]

# Build initial DataFrame after cleaning
df = pd.DataFrame(cards, columns=["id","name","faction","class","rarity","heroType","attackType"])

stats = ["hp","prana","focus","stamina","strength","intelligence","defense","speed","power"]

# -----------------------------
# 2) Rarity budgets & caps
# -----------------------------
rarity_budget = {"Common":360,"Uncommon":400,"Rare":440,"Epic":480,"Legendary":520,"Mythic":560}
rarity_caps   = {"Common":(25,70),"Uncommon":(30,80),"Rare":(35,85),"Epic":(40,90),"Legendary":(45,92),"Mythic":(50,95)}

# -----------------------------
# 3) Base class profiles (percent)
# -----------------------------
def pct_dict(seq): return dict(zip(stats, [s/100 for s in seq]))
base_profiles = {
    "Warrior-Fighter": pct_dict([11,5,6,15,16,5,12,12,18]),
    "Warrior-Tank":    pct_dict([16,5,6,15,12,5,18,9,14]),
    "Warrior-Balanced":pct_dict([14,5,6,14,14,6,14,11,16]),
    "Mage":            pct_dict([8,18,16,8,5,18,8,11,8]),
    "Healer":          pct_dict([10,17,18,9,4,14,12,8,8]),
    "Sharpshooter":    pct_dict([8,7,14,11,12,8,7,20,13]),
    "Sharpshooter-Power":    pct_dict([8,7,12,11,13,7,7,18,17]),
    "Sharpshooter-Speed":    pct_dict([7,7,15,10,11,8,6,23,13]),
    "Sharpshooter-Strength": pct_dict([9,6,12,12,15,7,7,18,14]),
    "Support":         pct_dict([8,17,19,8,4,16,9,13,6]),
    "Balanced":        pct_dict([12,10,12,12,12,10,12,10,10]),
}

# -----------------------------
# 4) Faction nudges (budget-neutral)
# Highlands: +2% prana/focus/int/speed; -2% str/stam/def/power
# Keepers:   +2% hp/str/stam/def;       -2% prana/focus/int/speed
# -----------------------------
faction_nudges = {
    "Highlanders": {"hp":0,"prana":0.02,"focus":0.02,"stamina":-0.02,"strength":-0.02,"intelligence":0.02,"defense":-0.02,"speed":0.02,"power":-0.02},
    "Keepers":     {"hp":0.02,"prana":-0.02,"focus":-0.02,"stamina":0.02,"strength":0.02,"intelligence":-0.02,"defense":0.02,"speed":-0.02,"power":0},
}

# -----------------------------
# 5) Guardian signatures (+3%/+3%)
# -----------------------------
guardian_signatures = {
    # Highlanders
    "00000024": ("hp","power"),
    "00000025": ("focus","prana"),
    "00000026": ("focus","intelligence"),
    "00000027": ("strength","defense"),
    "00000028": ("stamina","speed"),
    "00000029": ("intelligence","power"),
    "0000002A": ("speed","defense"),
    "0000002B": ("hp","speed"),
    # Keepers
    "0000002F": ("power","defense"),
    "00000030": ("strength","stamina"),
    "00000031": ("intelligence","focus"),
    "00000032": ("prana","focus"),
    "00000033": ("power","speed"),
    "00000034": ("speed","strength"),
    "00000035": ("focus","speed"),
    "00000036": ("power","intelligence"),
}
least_thematic = {
    "Highlanders": ["strength","stamina","defense","power"],
    "Keepers": ["prana","focus","intelligence","speed"],
}

def normalize_profile(p):
    s = sum(p.values())
    return {k: v/s for k,v in p.items()} if s else p

# Build percentage profiles per card
profiles = []
for _, row in df.iterrows():
    base = base_profiles.get(row["class"], base_profiles["Balanced"]).copy()
    nudge = faction_nudges[row["faction"]]
    prof = {k: max(0.0, base[k] + nudge.get(k,0.0)) for k in base}
    prof = normalize_profile(prof)
    if row["rarity"]=="Mythic" and row["id"] in guardian_signatures:
        s1,s2 = guardian_signatures[row["id"]]
        prof[s1]+=0.03; prof[s2]+=0.03
        take_from = [st for st in least_thematic[row["faction"]] if st not in (s1,s2)] or least_thematic[row["faction"]]
        each = 0.06/len(take_from)
        for st in take_from: prof[st]=max(0.0, prof[st]-each)
        prof = normalize_profile(prof)
    prof["id"] = row["id"]
    profiles.append(prof)

prof_df = pd.DataFrame(profiles)

def allocate_stats(pcts, total, caps):
    raw = {k: pcts[k]*total for k in stats}
    alloc = {k: int(round(raw[k])) for k in stats}
    diff = total - sum(alloc.values())
    if diff != 0:
        order = sorted(stats, key=lambda k: (raw[k]-alloc[k]), reverse=True) if diff>0 else \
                sorted(stats, key=lambda k: (alloc[k]-raw[k]), reverse=True)
        i=0
        while diff!=0 and i<1000:
            alloc[order[i%len(order)]] += (1 if diff>0 else -1)
            diff += (-1 if diff>0 else 1); i+=1
    min_cap,max_cap = caps
    for k in stats: alloc[k] = int(min(max(alloc[k], min_cap), max_cap))
    cur = sum(alloc.values())
    if cur != total:
        diff = total - cur
        for _ in range(2000):
            if diff==0: break
            if diff>0:
                c=[k for k in stats if alloc[k]<max_cap]
                if not c: break
                k=max(c,key=lambda s:max_cap-alloc[s]); alloc[k]+=1; diff-=1
            else:
                c=[k for k in stats if alloc[k]>min_cap]
                if not c: break
                k=max(c,key=lambda s:alloc[s]-min_cap); alloc[k]-=1; diff+=1
    return alloc

alloc_rows=[]
for _, row in df.iterrows():
    total = rarity_budget[row["rarity"]]
    caps  = rarity_caps[row["rarity"]]
    pcts  = prof_df[prof_df["id"]==row["id"]].iloc[0].to_dict()
    pcts  = {k:v for k,v in pcts.items() if k in stats}
    alloc = allocate_stats(pcts, total, caps)
    alloc["id"]=row["id"]; alloc_rows.append(alloc)

alloc_df = pd.DataFrame(alloc_rows)
final_cols = ["id","name","faction","class","rarity","heroType","attackType"] + stats
final_df = df.merge(alloc_df, on="id")[final_cols]

out_path = "data/agb_cards_adjusted.csv"
final_df.to_csv(out_path, index=False)
print(f"✅ Wrote {out_path} with {len(final_df)} cards.")
