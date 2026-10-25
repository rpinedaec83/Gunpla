import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateDecalSheetSvg,
  DECAL_SHEET_PRESETS,
  PAPER_DIMENSIONS_MM,
  DECAL_COLOR_HEX
} from '../../packages/shared/dist/index.js';

test('Custom Decals & Masking Stencils Studio (DT18) Unit Tests', async (t) => {
  await t.test('1. Constants & Presets Data Integrity', async (st) => {
    await st.test('validates paper millimeter dimensions', () => {
      assert.equal(PAPER_DIMENSIONS_MM.A4.width, 210);
      assert.equal(PAPER_DIMENSIONS_MM.A4.height, 297);
      assert.equal(PAPER_DIMENSIONS_MM.A5.width, 148);
      assert.equal(PAPER_DIMENSIONS_MM.A5.height, 210);
      assert.equal(PAPER_DIMENSIONS_MM.A6.width, 105);
      assert.equal(PAPER_DIMENSIONS_MM.A6.height, 148);
    });

    await st.test('contains all 5 curated decal sheet presets', () => {
      assert.equal(DECAL_SHEET_PRESETS.length, 5);
      const presetIds = DECAL_SHEET_PRESETS.map((p) => p.id);
      assert.ok(presetIds.includes('gunpla-efsf-caution'));
      assert.ok(presetIds.includes('gunpla-zeon-markings'));
      assert.ok(presetIds.includes('military-tank-stencil'));
      assert.ok(presetIds.includes('aviation-jet-lowvis'));
      assert.ok(presetIds.includes('racing-motorsport-numbers'));
    });

    await st.test('presets have valid configuration and elements', () => {
      for (const preset of DECAL_SHEET_PRESETS) {
        assert.ok(preset.id);
        assert.ok(preset.name);
        assert.ok(preset.category);
        assert.ok(['A4', 'A5', 'A6'].includes(preset.paperSize));
        assert.ok(['transparent', 'white_film'].includes(preset.paperType));
        assert.ok(Array.isArray(preset.elements));
        assert.ok(preset.elements.length > 0);
        for (const el of preset.elements) {
          assert.ok(el.id);
          assert.ok(el.type);
          assert.ok(el.label);
          assert.ok(el.xMm >= 0);
          assert.ok(el.yMm >= 0);
          assert.ok(el.widthMm > 0);
          assert.ok(el.heightMm > 0);
        }
      }
    });

    await st.test('color hex mapping covers all standard decal colors', () => {
      assert.equal(DECAL_COLOR_HEX.white, '#ffffff');
      assert.equal(DECAL_COLOR_HEX.black, '#111827');
      assert.equal(DECAL_COLOR_HEX.red, '#ef4444');
      assert.equal(DECAL_COLOR_HEX.yellow, '#eab308');
      assert.equal(DECAL_COLOR_HEX.gold_metallic, '#d97706');
      assert.equal(DECAL_COLOR_HEX.silver_metallic, '#94a3b8');
      assert.equal(DECAL_COLOR_HEX.cyan, '#06b6d4');
    });
  });

  await t.test('2. SVG Generation Engine (generateDecalSheetSvg)', async (st) => {
    await st.test('renders valid root SVG with exact millimeter dimensions and viewBox', () => {
      const config = {
        title: 'Custom Test Sheet',
        scale: '1/144',
        paperSize: 'A6',
        paperType: 'transparent',
        marginMm: 5,
        includeCutLines: true,
        includeRegistrationMarks: true,
        elements: [
          {
            id: 'elem-1',
            type: 'warning_stencil',
            label: 'DANGER: EJECTION SEAT',
            subtext: 'ARMED CANOPY',
            xMm: 20,
            yMm: 20,
            widthMm: 25,
            heightMm: 10,
            color: 'red',
            fontSizeMm: 2.2,
            hazardStripes: true
          }
        ]
      };

      const svg = generateDecalSheetSvg(config, false);
      assert.ok(svg.startsWith('<svg'));
      assert.ok(svg.includes('width="105mm"'));
      assert.ok(svg.includes('height="148mm"'));
      assert.ok(svg.includes('viewBox="0 0 105 148"'));
      assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'));
      assert.ok(svg.includes('DANGER: EJECTION SEAT'));
      assert.ok(svg.includes('ARMED CANOPY'));
      assert.ok(svg.includes('Custom Test Sheet'));
    });

    await st.test('renders registration marks and cut lines when enabled', () => {
      const config = {
        title: 'Marks Test',
        scale: '1/100',
        paperSize: 'A5',
        paperType: 'transparent',
        marginMm: 5,
        includeCutLines: true,
        includeRegistrationMarks: true,
        elements: [
          {
            id: 'elem-box',
            type: 'unit_number',
            label: '42',
            xMm: 20,
            yMm: 20,
            widthMm: 15,
            heightMm: 10,
            color: 'white'
          }
        ]
      };

      const svg = generateDecalSheetSvg(config, false);
      // Registration crosshairs contain circles with r="2.2"
      assert.ok(svg.includes('circle cx='));
      // Cut lines contain dashed stroke rect
      assert.ok(svg.includes('stroke-dasharray="0.6,0.6"'));
    });

    await st.test('omits registration marks and cut lines when disabled', () => {
      const config = {
        title: 'Clean Sheet Test',
        scale: '1/100',
        paperSize: 'A5',
        paperType: 'transparent',
        marginMm: 5,
        includeCutLines: false,
        includeRegistrationMarks: false,
        elements: [
          {
            id: 'elem-box',
            type: 'unit_number',
            label: '42',
            xMm: 20,
            yMm: 20,
            widthMm: 15,
            heightMm: 10,
            color: 'white'
          }
        ]
      };

      const svg = generateDecalSheetSvg(config, false);
      assert.ok(!svg.includes('circle cx='));
      assert.ok(!svg.includes('stroke-dasharray="0.6,0.6"'));
    });

    await st.test('previewMode handles paper type contrast correctly', () => {
      const baseConfig = {
        title: 'Contrast Test',
        scale: '1/144',
        paperSize: 'A6',
        marginMm: 5,
        includeCutLines: false,
        includeRegistrationMarks: false,
        elements: []
      };

      // Transparent in preview mode renders dark slate backdrop for visibility
      const previewTransparentSvg = generateDecalSheetSvg(
        { ...baseConfig, paperType: 'transparent' },
        true
      );
      assert.ok(previewTransparentSvg.includes('fill="#0f172a"'));

      // Transparent in print mode (previewMode = false) does NOT render backdrop
      const printTransparentSvg = generateDecalSheetSvg(
        { ...baseConfig, paperType: 'transparent' },
        false
      );
      assert.ok(!printTransparentSvg.includes('fill="#0f172a"'));

      // White-film paper renders white/light backing in both preview and print
      const previewWhiteSvg = generateDecalSheetSvg(
        { ...baseConfig, paperType: 'white_film' },
        true
      );
      assert.ok(previewWhiteSvg.includes('fill="#f8fafc"'));

      const printWhiteSvg = generateDecalSheetSvg(
        { ...baseConfig, paperType: 'white_film' },
        false
      );
      assert.ok(printWhiteSvg.includes('fill="#ffffff"'));
    });

    await st.test('renders various decal element types properly', () => {
      const config = {
        title: 'Multi-Element Decals',
        scale: '1/100',
        paperSize: 'A4',
        paperType: 'transparent',
        marginMm: 5,
        includeCutLines: false,
        includeRegistrationMarks: false,
        elements: [
          {
            id: 'elem-unit',
            type: 'unit_number',
            label: '01',
            xMm: 10,
            yMm: 10,
            widthMm: 15,
            heightMm: 12,
            color: 'white',
            fontSizeMm: 8.0
          },
          {
            id: 'elem-pilot',
            type: 'pilot_name',
            label: 'LT. AMURO RAY',
            subtext: 'WHITE BASE',
            xMm: 30,
            yMm: 10,
            widthMm: 30,
            heightMm: 10,
            color: 'yellow',
            fontSizeMm: 2.0
          },
          {
            id: 'elem-kill',
            type: 'kill_marks',
            label: 'Victory Marks',
            count: 7,
            xMm: 65,
            yMm: 10,
            widthMm: 20,
            heightMm: 8,
            color: 'red'
          },
          {
            id: 'elem-checker',
            type: 'checker_band',
            label: 'Hazard Band',
            xMm: 90,
            yMm: 10,
            widthMm: 40,
            heightMm: 6,
            color: 'yellow'
          },
          {
            id: 'elem-emblem-star',
            type: 'faction_emblem',
            label: 'Allied Star',
            codeText: 'US-STAR',
            xMm: 135,
            yMm: 10,
            widthMm: 15,
            heightMm: 15,
            color: 'white'
          },
          {
            id: 'elem-emblem-zeon',
            type: 'faction_emblem',
            label: 'Zeon Emblem',
            codeText: 'ZEON',
            xMm: 155,
            yMm: 10,
            widthMm: 15,
            heightMm: 15,
            color: 'red'
          }
        ]
      };

      const svg = generateDecalSheetSvg(config, false);
      assert.ok(svg.includes('01'));
      assert.ok(svg.includes('LT. AMURO RAY'));
      assert.ok(svg.includes('WHITE BASE'));
      assert.ok(svg.includes('polygon points=')); // Star/Zeon polygons
      assert.ok(svg.includes('path d=')); // Zeon path
    });

    await st.test('renders all 5 bundled presets without throwing errors', () => {
      for (const preset of DECAL_SHEET_PRESETS) {
        const config = {
          title: preset.name,
          scale: preset.scale,
          paperSize: preset.paperSize,
          paperType: preset.paperType,
          marginMm: 5,
          includeCutLines: true,
          includeRegistrationMarks: true,
          elements: preset.elements
        };

        const svgPrint = generateDecalSheetSvg(config, false);
        assert.ok(svgPrint.length > 200);
        assert.ok(svgPrint.startsWith('<svg'));
        assert.ok(svgPrint.endsWith('</svg>'));

        const svgPreview = generateDecalSheetSvg(config, true);
        assert.ok(svgPreview.length > 200);
        assert.ok(svgPreview.startsWith('<svg'));
        assert.ok(svgPreview.endsWith('</svg>'));
      }
    });
  });
});
