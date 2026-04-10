import { loadConfigFromSheet } from './services/sheet';
import { AdTask } from './types';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '';

const generateAdTasks = async () => {
  console.log('🔄 Loading configuration from Google Sheets...');
  
  try {
    const config = await loadConfigFromSheet(SHEET_ID);
    
    console.log(`✅ Loaded: ${config.avatars.length} Avatars, ${config.angles.length} Angles.`);

    const tasks: AdTask[] = [];

    // The Logic: Avatar x Angle x Awareness x 3 Variations
    config.avatars.forEach(avatar => {
      config.angles.forEach(angle => {
        config.awarenessLevels.forEach(awareness => {
          // Create 3 variations for each combo
          for (let i = 1; i <= 3; i++) {
            tasks.push({
              id: `${avatar}_${angle}_${awareness}_v${i}`.replace(/\s+/g, '-').toLowerCase(),
              avatar,
              angle,
              awareness,
              variation: i
            });
          }
        });
      });
    });

    console.log(`🚀 Generated ${tasks.length} unique ad tasks to process.`);
    console.log('Example Task:', tasks[0]);

    return tasks;

  } catch (error) {
    console.error('Error loading sheet:', error);
    throw error;
  }
};

// Run if executed directly
if (require.main === module) {
  generateAdTasks().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { generateAdTasks };

