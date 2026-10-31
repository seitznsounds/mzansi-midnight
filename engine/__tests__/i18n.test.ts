import { describe, it, expect } from 'vitest';
import {
  t,
  SUPPORTED_LANGUAGES,
  getLanguageInfo,
  getLocalizedNode,
  getLocalizedClockTitle,
  getLocalizedItemName,
  getLocalizedFactionName,
  getLocalizedStatName,
  getLocalizedLogEntry,
  getLocalizedTextByEnglishValue,
} from '../i18n';

describe('i18n Localization Engine (All 11 South African Official Languages)', () => {
  it('defines 11 supported languages (English + 10 SA official languages)', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(11);
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain('en');
    expect(codes).toContain('zu'); // isiZulu
    expect(codes).toContain('xh'); // isiXhosa
    expect(codes).toContain('af'); // Afrikaans
    expect(codes).toContain('st'); // Sesotho
    expect(codes).toContain('nso'); // Sepedi
    expect(codes).toContain('tn'); // Setswana
    expect(codes).toContain('ts'); // Xitsonga
    expect(codes).toContain('ss'); // siSwati
    expect(codes).toContain('ve'); // Tshivenda
    expect(codes).toContain('nr'); // isiNdebele
  });

  it('retrieves language info with native names and regional tags', () => {
    const zulu = getLanguageInfo('zu');
    expect(zulu.nativeName).toBe('isiZulu');
    expect(zulu.region).toContain('KwaZulu-Natal');

    const xhosa = getLanguageInfo('xh');
    expect(xhosa.nativeName).toBe('isiXhosa');

    const afrikaans = getLanguageInfo('af');
    expect(afrikaans.nativeName).toBe('Afrikaans');

    const ndebele = getLanguageInfo('nr');
    expect(ndebele.nativeName).toBe('isiNdebele');
    expect(ndebele.region).toContain('Mpumalanga');
  });

  it('returns canonical English string by default', () => {
    expect(t('ui.cash')).toBe('Cash');
    expect(t('ui.composure')).toBe('Composure');
    expect(t('ui.end_cycle')).toBe('End Cycle');
  });

  it('resolves authentic isiZulu translations when language is zu', () => {
    const cashZulu = t('ui.cash', 'Cash', 'zu');
    expect(cashZulu).toBe('Ukheshi');

    const safehouseZulu = t('node.n1_safehouse.title', 'Safehouse', 'zu');
    expect(safehouseZulu).toBeTruthy();
    expect(safehouseZulu).not.toBe('Safehouse');
  });

  it('resolves authentic isiNdebele translations when language is nr', () => {
    const cashNdebele = t('ui.cash', 'Cash', 'nr');
    expect(cashNdebele).toBeTruthy();
    expect(cashNdebele).not.toBe('Cash');

    const safehouseNdebele = t('node.n1_safehouse.title', 'Safehouse', 'nr');
    expect(safehouseNdebele).toBeTruthy();
    expect(safehouseNdebele).not.toBe('Safehouse');
  });

  it('falls back cleanly to English if key is not found in language', () => {
    const res = t('ui.cash', 'Fallback', 've');
    // If translated in Tshivenda, returns Tshivenda; if missing, returns English 'Cash', never crashes
    expect(res).toBeTruthy();
  });

  it('falls back to custom fallback string if key is completely unknown', () => {
    const res = t('unknown.bogus.key', 'Custom Fallback', 'zu');
    expect(res).toBe('Custom Fallback');
  });

  it('returns localized node title and district', () => {
    const enNode = getLocalizedNode('n1_safehouse', 'Safehouse', 'Player Safehouse • CBD Central', 'en');
    expect(enNode.title).toBe('Mercury Arcade Flat');
    expect(enNode.district).toBe('Player Safehouse • CBD Central');

    const zuNode = getLocalizedNode('n1_safehouse', 'Safehouse', 'Player Safehouse • CBD Central', 'zu');
    expect(zuNode.title).toBeTruthy();
  });

  it('returns localized clock title', () => {
    const clockEn = getLocalizedClockTitle('mokoena_sweep', "Brigadier Mokoena's Sweep", 'en');
    expect(clockEn).toBe("Brigadier Mokoena's Sweep");

    const clockZu = getLocalizedClockTitle('mokoena_sweep', "Brigadier Mokoena's Sweep", 'zu');
    expect(clockZu).toBeTruthy();
  });

  it('returns localized item name and faction name', () => {
    const itemEn = getLocalizedItemName('docket_409_raw', 'Docket #409', 'en');
    expect(itemEn).toBe('Docket #409 (Raw)');

    const factionEn = getLocalizedFactionName('city_hall', 'City Hall', 'en');
    expect(factionEn).toBe('City Hall (Ma-Sibi)');
  });

  it('translates stat names properly across languages', () => {
    expect(t('stat.any', 'Any', 'af')).toBe('Enige');
    expect(t('stat.dockets', 'Dockets', 'af')).toBe('Dossiere');
    expect(t('stat.any', 'Any', 'zu')).toBe('Noma Yikuphi');
    expect(t('stat.dockets', 'Dockets', 'zu')).toBe('Ama-Docket');
  });

  it('translates outcome tiers ui.risky and ui.fail authentically', () => {
    expect(t('ui.risky', 'Risky', 'af')).toBe('Gevaarlik');
    expect(t('ui.fail', 'Fail', 'af')).toBe('Mislukking');
    expect(t('ui.risky', 'Risky', 'zu')).toBe('Kuyingozi');
    expect(t('ui.fail', 'Fail', 'zu')).toBe('Kwehluleka');
  });

  it('translates contact roles in right drawer such as Commission Evidence Leader', () => {
    expect(t('dialogue.n10_high_court.role', 'Evidence Leader', 'af')).toBe('Kommissie-bewysleier • DPCI Hawks');
    expect(t('dialogue.n10_high_court.role', 'Evidence Leader', 'zu')).toBe('Umholi Wobufakazi beKhomishini • DPCI Hawks');
  });

  it('localizes Metro Dispatch comms log entries for dice rolls and background selection', () => {
    const rawRoll = '[Roll 6 -> 8] Cross-Reference Docket #409: You trace the payments straight to Zululand Aqua-Logistics and Pier 2.';
    const zuEntry = getLocalizedLogEntry(rawRoll, 'zu');
    expect(zuEntry).toContain('Phonsa 6 -> 8');
    expect(zuEntry).toContain('Hlola i-Docket #409');
    expect(zuEntry).toContain('Ulandelela izinkokhelo uze ufike kwa-Zululand Aqua-Logistics');

    // Also handles already prefixed roll entry like [Phonsa 6 -> 8]
    const preRoll = '[Phonsa 6 -> 8] Cross-Reference Docket #409: You trace the payments straight to Zululand Aqua-Logistics and Pier 2.';
    const zuPreEntry = getLocalizedLogEntry(preRoll, 'zu');
    expect(zuPreEntry).toContain('Phonsa 6 -> 8');
    expect(zuPreEntry).toContain('Hlola i-Docket #409');

    // Background selection
    const rawBg = 'Background Selected: The Paper-Trail Auditor (DPCI (Hawks) Serious Commercial Crime Unit)';
    const afBg = getLocalizedLogEntry(rawBg, 'af');
    expect(afBg).toBe('Agtergrond Gekies: Die Ouditeur van die Papier-spoor (DPCI (Valke) Eenheid vir Ernstige Handelsmisdaad)');
  });

  it('translates How You Win paragraphs with styled spans preserved across languages', () => {
    // Act 1 (Docket #409 / Berth 14)
    const enAct1 = t('mission.how_to_win_act1', '', 'en');
    expect(enAct1).toContain('Docket #409');
    expect(enAct1).toContain('Berth 14 Finale');
    expect(enAct1).toContain('text-amber-300 font-semibold');

    // Act 2 (Sovereign Pearl Trust Deed / Hangar 7 Finale)
    const enAct2 = t('mission.how_to_win_act2', '', 'en');
    expect(enAct2).toContain('Sovereign Pearl Trust Deed');
    expect(enAct2).toContain('Super-Lab Telemetry');
    expect(enAct2).toContain('Hangar 7 Finale');
    expect(enAct2).toContain('text-purple-300 font-semibold');

    // Afrikaans Act 2
    const afAct2 = t('mission.how_to_win_act2', '', 'af');
    expect(afAct2).toContain('Sovereign Pearl Trust-Akte');
    expect(afAct2).toContain('Super-Lab Telemetrie');
    expect(afAct2).toContain('text-amber-300 font-semibold');
    expect(afAct2).toContain('text-purple-300 font-semibold');

    // isiZulu Act 2
    const zuAct2 = t('mission.how_to_win_act2', '', 'zu');
    expect(zuAct2).toContain('Sovereign Pearl Trust Deed');
    expect(zuAct2).toContain('Super-Lab Telemetry');
    expect(zuAct2).toContain('text-amber-300 font-semibold');
    expect(zuAct2).toContain('text-purple-300 font-semibold');
  });

  it('translates FAQ headers, answers, stat abbreviations, and end cycle warnings', () => {
    expect(t('mission.faq_q1_title', '', 'af')).toContain('Wat is \'n "Siklus"');
    expect(t('mission.faq_q1_title', '', 'zu')).toContain('Kuyini "i-Cycle"');

    expect(t('stat_abbr.street', '', 'af')).toBe('STRAAT');
    expect(t('stat_abbr.dockets', '', 'af')).toBe('DOKK');
    expect(t('stat_abbr.wire', '', 'af')).toBe('DRAAD');
    expect(t('stat_abbr.influence', '', 'af')).toBe('INVL');

    expect(t('endcycle.all_dice_spent_title', '', 'af')).toBe('Alle Daaglikse Aksie-Dobbelstene Gebruik');
    expect(t('endcycle.all_dice_spent_title', '', 'zu')).toBe('Wonke Amadayisi Esenzo Osuku Asetshenzisiwe');
  });

  it('translates Red-String Conspiracy Board controls, pins, and connection links across languages', () => {
    // Header & UI controls
    expect(t('board.header', '', 'af')).toBe('ROOI-TOU SAAMSWERINGSBORD');
    expect(t('board.header', '', 'zu')).toBe('IBHODI LOKULUKELANA KWAMANQINDA ENTSHAMBO EBOMVU');
    expect(t('board.links_verified', '', 'af')).toBe('SKAKELS BEVESTIG');
    expect(t('board.verified_link', '', 'af')).toBe('✓ GEVERIFIEERDE BEWYSSTUK-SKAKEL');
    expect(t('board.unverified_lead', '', 'af')).toBe('ONGEVERIFIEERDE LEIDRAAD');

    // Act 1 Links
    expect(t('board.link.link_auditor_phone.label', '', 'af')).toBe('N2-Sluipmoord Stemboodskap');
    expect(t('board.link.link_auditor_phone.label', '', 'zu')).toBe('I-Voice Note Yokubulawa e-N2');
    expect(t('board.link.link_masibi_shell.label', '', 'af')).toBe('40% Familietrust Terugbetaling');
    expect(t('board.link.link_zuko_shell.label', '', 'af')).toBe('60% Abasanta BVI-Aandeelhouding');

    // Act 2 Pins & Links
    expect(t('board.act2_title', '', 'af')).toContain('Sovereign Pearl Trust & Vlug ZS-900 Ontsnapping');
    expect(t('board.pin.pin_act1_legacy.title', '', 'af')).toBe('Die Berth 14-Gevolge');
    expect(t('board.pin.pin_act2_hangar7.title', '', 'af')).toBe('Vlug ZS-900 (Hangar 7)');
    expect(t('board.link.link_act2_telemetry_depot.label', '', 'af')).toBe('Watertrok GPS-Bondeltelemetrie');
    expect(t('board.link.link_act2_crates_tarmac.label', '', 'af')).toBe('Uitvoer Sitruspalette -> Hangar 7');
  });

  it('translates prologue character backgrounds and personalized selection messages across languages', () => {
    // Selection action labels
    expect(t('prologue.select_this_bg', '', 'en')).toBe('Select This Background');
    expect(t('prologue.select_this_bg', '', 'af')).toBe('Kies Hierdie Agtergrond');
    expect(t('prologue.select_this_bg', '', 'zu')).toBe('Khetha Lesi Simo');
    expect(t('prologue.chosen_path', '', 'af')).toBe('Gekose Pad');
    expect(t('prologue.chosen_path', '', 'zu')).toBe('Indlela Ekhethiwe');

    // Background titles and former units
    const afHawk = t('bg.forensic_hawk.title', '', 'af');
    expect(afHawk).toBe('Die Ouditeur van die Papier-spoor');
    const zuHawk = t('bg.forensic_hawk.title', '', 'zu');
    expect(zuHawk).toBe('Umcwaningi Wamacala Emali');

    const afBreacher = t('bg.trt_breacher.title', '', 'af');
    expect(afBreacher).toBe('Die Gebrande Toepasser');
    const zuBreacher = t('bg.trt_breacher.title', '', 'zu');
    expect(zuBreacher).toBe('Umphoqeleli Oshile');

    const afIntel = t('bg.crime_intel.title', '', 'af');
    expect(afIntel).toBe('Die Spook-Afluisteraar');
    const zuIntel = t('bg.crime_intel.title', '', 'zu');
    expect(zuIntel).toBe('Umhloli Wezingcingo Zomshoshaphansi');

    // Dialogue option labels
    expect(t('pnode_opt.pick_forensic.label', '', 'af')).toContain('Die Ouditeur van die Papier-spoor');
    expect(t('pnode_opt.pick_forensic.label', '', 'zu')).toContain('Umcwaningi Wamacala Emali');
  });

  it('translates dialogue notifications, rewards, moods, and left menu items across languages', () => {
    // 1. Dialogue notification screen & controls
    expect(t('dialogue.intel_secured', '', 'af')).toBe('INLIGTING VERKRY:');
    expect(t('dialogue.intel_secured', '', 'zu')).toBe('ULWAZI LUVUNYELWE:');
    expect(t('ui.dismiss', '', 'af')).toBe('Maak toe');
    expect(t('ui.dismiss', '', 'zu')).toBe('Susa');
    expect(t('dialogue.one_time_intel', '', 'af')).toBe('Eenmalige Inligting');
    expect(t('dialogue.one_time_intel', '', 'zu')).toBe('Ulwazi Lwesikhathi Esisodwa');
    expect(t('dialogue.select_response', '', 'af')).toBe('Kies Ondervraging / Reaksielyn (0 Dobbelsteen-koste)');
    expect(t('dialogue.select_response', '', 'zu')).toBe('Khetha Umugqa Wokuphenya / Impendulo (Izindleko Zedayisi ezingu-0)');

    // 2. Exact reward summary translations via getLocalizedTextByEnglishValue
    const enReward = '+1 Audit Docket #409 Clock, +10% Composure';
    expect(getLocalizedTextByEnglishValue(enReward, 'af')).toBe('+1 Oudit Dossier #409-horlosie, +10% Kalmte');
    expect(getLocalizedTextByEnglishValue(enReward, 'zu')).toBe('+1 Iwashi Le-Docket #409, +10% Ukuzola');

    // 3. Dialogue speaker moods
    const enMood = 'Tracing a trembling finger across the carbon-copy invoice.';
    expect(getLocalizedTextByEnglishValue(enMood, 'af')).toBe("Trek 'n bewende vinger oor die deurslagfaktuur.");
    expect(getLocalizedTextByEnglishValue(enMood, 'zu')).toBe('Ulandelela umunwe oqhaqhazelayo phezu kwe-invoice ye-carbon-copy.');

    // 4. Prologue feedback banner logs
    const enDisaster = 'You spot it immediately: the tender bypassed provincial treasury using a Fake Disaster Declaration signature.';
    expect(getLocalizedLogEntry(enDisaster, 'af')).toContain('Valse Rampverklaring-handtekening');
    expect(getLocalizedLogEntry(enDisaster, 'zu')).toContain('yeSimemezelo Senhlekelele Engamanga');

    const enDeadlocks = 'You haul Nandi inside and bolt the deadlocks as thunder shakes the arcade glass.';
    expect(getLocalizedLogEntry(enDeadlocks, 'af')).toContain('sluit die grendels');
    expect(getLocalizedLogEntry(enDeadlocks, 'zu')).toContain('ukhiya izingidi');

    // 5. Left menu items
    // Clock title
    expect(t('clock.audit_docket_409.title', '', 'af')).toBe('Oudit Dossier #409');
    expect(t('clock.audit_docket_409.title', '', 'zu')).toBe('Ukuhlolwa Kwe-Docket #409');

    // Clock types & triggers
    expect(t('clocks.type_threat', '', 'af')).toBe('Bedreigingshorlosie');
    expect(t('clocks.type_threat', '', 'zu')).toBe('Iwashi Lesisongelo');
    expect(t('clocks.type_opportunity', '', 'af')).toBe('Ondersoek');
    expect(t('clocks.type_opportunity', '', 'zu')).toBe('Uphenyo');
    expect(t('clocks.on_heat', '', 'af')).toBe('Op Hitte');
    expect(t('clocks.on_heat', '', 'zu')).toBe('Ekushiseni');
    expect(t('clocks.on_roll', '', 'af')).toBe('Per Rol');
    expect(t('clocks.on_roll', '', 'zu')).toBe('Ngokuphonsa');

    // Dossier & HUD
    expect(t('ui.evidence_dossier', '', 'af')).toBe('Bewysstukke & Toerusting-dossier');
    expect(t('ui.evidence_dossier', '', 'zu')).toBe('Ifayela Lobufakazi Nezinsiza');
    expect(t('ui.tap_to_inspect', '', 'af')).toBe('Tik om te inspekteer');
    expect(t('ui.tap_to_inspect', '', 'zu')).toBe('Thepha ukuze uhlole');
    expect(t('ui.speak_with_contact', '', 'af')).toBe('Praat met Kontak');
    expect(t('ui.speak_with_contact', '', 'zu')).toBe('Khuluma Nomuntu Oxhumana Naye');
    expect(t('ui.menu', '', 'af')).toBe('KIESLYS');
    expect(t('ui.menu', '', 'zu')).toBe('IMENU');

    // Roles & Whistleblower
    expect(t('role.whistleblower', '', 'af')).toBe('Fluitjieblaser');
    expect(t('role.whistleblower', '', 'zu')).toBe('Umdaluli Wemfihlo');
    expect(t('dialogue.n1_safehouse.role', '', 'af')).toBe('Gewonde Fluitjieblaser • Sleutelgetuie');
    expect(t('dialogue.n1_safehouse.role', '', 'zu')).toBe('Umdaluli Wemfihlo Olimele • Ufakazi Oqavile');
  });
});

