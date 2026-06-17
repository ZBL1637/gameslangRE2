import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const imageDir = join(root, 'src', 'assets', 'images');

const conversions = [
  ['chapter1_forest_bg.png', 'chapter1_forest_bg.webp'],
  ['chapter2_intro_bg.png', 'chapter2_intro_bg.webp'],
  ['chapter2_end_bg.png', 'chapter2_end_bg.webp'],
  ['chapter3_intro_bg.png', 'chapter3_intro_bg.webp'],
  ['chapter4_data_bg.png', 'chapter4_data_bg.webp'],
  ['chapter5_bg.png', 'chapter5_bg.webp'],
  ['final_chapter_bg.png', 'final_chapter_bg.webp'],
  ['timeroad.png', 'timeroad.webp'],
  ['world_map.png', 'world_map.webp'],
  ['village.gif', 'village_poster.webp', ['-vframes', '1']],
  ['village_head.png', 'village_head.webp'],
  ['newman.png', 'newman.webp'],
  ['npc_forest_keeper.png', 'npc_forest_keeper.webp'],
  ['fragment_taxonomy.png', 'fragment_taxonomy.webp'],
  ['fragment_relation.png', 'fragment_relation.webp'],
  ['fragment_migration.png', 'fragment_migration.webp'],
  ['timelord.png', 'timelord.webp'],
  ['chip1.png', 'chip1.webp'],
  ['chip2.png', 'chip2.webp'],
  ['chip3.png', 'chip3.webp'],
  ['chip4.png', 'chip4.webp'],
  ['npc_ai_librarian.png', 'npc_ai_librarian.webp'],
  ['npc_dna_scientist.png', 'npc_dna_scientist.webp'],
  ['node_spectrum.png', 'node_spectrum.webp'],
  ['node_sentiment.png', 'node_sentiment.webp'],
  ['node_category.png', 'node_category.webp'],
  ['node_multigame.png', 'node_multigame.webp'],
  ['npc_data_weaver.png', 'npc_data_weaver.webp'],
  ['npc_translation_master.png', 'npc_translation_master.webp'],
  ['altar_keyword.png', 'altar_keyword.webp'],
  ['altar_style.png', 'altar_style.webp'],
  ['altar_culture.png', 'altar_culture.webp'],
  ['skill_logos_conversion.png', 'skill_logos_conversion.webp'],
  ['boss_algorithm_overlord.png', 'boss_algorithm_overlord.webp'],
  ['minion_gatekeeper.png', 'minion_gatekeeper.webp'],
];

const run = (args) => {
  const result = spawnSync('ffmpeg', args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`ffmpeg exited with status ${result.status}`);
  }
};

if (spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status !== 0) {
  throw new Error('ffmpeg is required for assets:optimize');
}

for (const [inputName, outputName, extra = []] of conversions) {
  const input = join(imageDir, inputName);
  const output = join(imageDir, outputName);

  if (!existsSync(input)) {
    console.warn(`skip missing input: ${inputName}`);
    continue;
  }
  if (existsSync(output) && statSync(output).size > 0) {
    console.log(`skip existing output: ${outputName}`);
    continue;
  }

  mkdirSync(dirname(output), { recursive: true });
  run([
    '-y',
    '-i',
    input,
    ...extra,
    '-vf',
    "scale='min(1920,iw)':-2",
    '-quality',
    '78',
    '-compression_level',
    '6',
    output,
  ]);
}

console.log('optimized image assets written to src/assets/images');
