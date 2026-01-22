# Video Matching Report

**Generated:** 22 January 2026
**Total Videos:** 803 | **Matched:** 749 (93%) | **Unmatched:** 54

---

## Summary

Videos are stored in folders named by **parent SKU**. When a product page loads, it looks up the video using the product's `parentSku` field, so all variants of a part share the same turntable video.

---

## ✅ Matched Videos (749)

These 749 videos will automatically display on product pages. No action needed.

---

## ❓ Unmatched Videos (54)

### 📦 Kit Combinations (12)

Videos showing multiple parts together. **Action needed:** Decide which SKU(s) should display this video.

| Video Folder | Parts Shown |
|--------------|-------------|
| UV36385PA & UV36386PA | UV36385PA, UV36386PA |
| UV36384PA & UV36383PA | UV36384PA, UV36383PA |
| UR71624 & UR71625 | UR71624, UR71625 |
| CD4820 & CD6223GMF | CD4820, CD6223GMF |
| PP20309PA & PP20308PA | PP20309PA, PP20308PA |
| FW1926-27KIT | FW1926, FW1927 (kit) |
| 3Z7857588 & 3Z7857587 | 3Z7857588, 3Z7857587 |
| UR4952-53KIT | UR4952, UR4953 (kit) |
| PR55888PB.01 & PR55888PB | PR55888PB variants |
| UE37810 & UE46097 | UE37810, UE46097 |
| RH9143 & UE30193 | RH9143, UE30193 |
| RE22997 & RE19011 | RE22997, RE19011 |

**Options:**
1. Rename folder to primary SKU (e.g., `UV36385PA`)
2. Create duplicate video entries in the index
3. Leave as-is (video won't display)

---

### ✏️ Placeholder Folders (2)

These should be renamed or removed from the Turntable folder.

| Folder Name |
|-------------|
| Search part number |
| To Edit |

---

### 🔢 Version Suffixes (16)

Folders with version numbers. Some will auto-match when suffix is stripped.

| Video Folder | Base SKU | Auto-Match? |
|--------------|----------|-------------|
| UD22715PM.01 | UD22715PM | ✅ Yes |
| PF27287PBKT-03 | PF27287PBKT | ✅ Yes |
| PF27287PBKT-02 | PF27287PBKT | ✅ Yes |
| UG13562-3 | UG13562 | ✅ Yes |
| UD13209-10 | UD13209 | ✅ Yes |
| UG13552-3 | UG13552 | ✅ Yes |
| UG13564-5 | UG13564 | ✅ Yes |
| 07V103147.01 | 07V103147 | ✅ Yes |
| RH9162-10 | RH9162 | ✅ Yes |
| UR22413-01 | UR22413 | ✅ Yes |
| UE73810KT-01 | UE73810KT | ❌ No - SKU not in database |
| UR73257GT-01 | UR73257GT | ❌ No - SKU not in database |
| RH8889-1-3 | RH8889-1 | ❌ No - SKU not in database |
| 3D2819619-20 | 3D2819619 | ❌ No - SKU not in database |
| 3W0839397-8 | 3W0839397 | ❌ No - SKU not in database |
| UE73812KT-01 | UE73812KT | ❌ No - SKU not in database |

**Note:** 10 of these will work automatically. The 6 marked "No" don't exist in the product database.

---

### ❓ Other Unmatched (24)

These SKUs don't exist in the product database. May be typos, discontinued, or not yet added.

| Video Folder | Notes |
|--------------|-------|
| UR18082SXR | |
| UE39519SXR | |
| RD3135KB | |
| UD2255614 | Possible typo? |
| PD30984PAPL | |
| 3Z00615301 | |
| UE43934NF | Folder is UE43934NF.02 |
| PD30985PAPL | |
| CD5999GMFSXR | |
| UR73256-7GT | |
| PD57492PDGT | Folder is PD57492PDGT.01 |
| PD109054PAPL | |
| PD109055PAPL | |
| 07C9195296L | |
| UE37583SXR | |
| UR13269SA2 | |
| RH2343SX | |
| COIL3CPUSH | Custom coil spring? |
| COIL3BPUSH | Custom coil spring? |
| GRH453 | |
| COIL1.5CPUSH | Custom coil spring? |
| COIL1.5BPUSH | Custom coil spring? |
| SPM1534PL | |
| UV10712CVCHR | |

---

## Recommendations

1. **Kit combinations** - Rename folders to primary SKU, or let me know which SKU each should link to
2. **Placeholders** - Delete `Search part number` and `To Edit` folders
3. **Version suffixes** - 10 already work; 6 need SKUs added to database or folders renamed
4. **Other unmatched** - Review and either add products to database or rename folders

---

## Next Steps

Once you've reviewed this report:
1. Let me know any folder renames or mappings needed
2. Push changes to GitHub
3. Run `node scripts/upload-videos.js` to upload to Cloudinary
