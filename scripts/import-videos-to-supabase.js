/**
 * IntroCar US - Import Technical Videos to Supabase
 *
 * This script imports existing videos from technical-videos.json to Supabase.
 * Run AFTER running migrate-videos-schema.sql to add the array columns.
 *
 * Usage:
 *   node scripts/import-videos-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function importVideos() {
  console.log('🎬 IntroCar US - Import Technical Videos to Supabase');
  console.log('=====================================================\n');

  // Read JSON file
  const videosPath = path.join(__dirname, '..', 'data', 'json', 'technical-videos.json');

  if (!fs.existsSync(videosPath)) {
    console.error('❌ technical-videos.json not found at:', videosPath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(videosPath, 'utf-8'));
  const videos = data.videos || [];
  const categories = data.categories || [];

  console.log(`📂 Found ${videos.length} videos to import`);
  console.log(`📂 Found ${categories.length} categories\n`);

  // First, ensure categories exist
  console.log('📁 Importing video categories...');
  for (let i = 0; i < categories.length; i++) {
    const { error } = await supabase
      .from('video_categories')
      .upsert({
        name: categories[i],
        display_order: i + 1
      }, {
        onConflict: 'name'
      });

    if (error) {
      console.error(`   ❌ Error inserting category ${categories[i]}:`, error.message);
    }
  }
  console.log(`   ✓ ${categories.length} categories imported\n`);

  // Import videos
  console.log('🎥 Importing videos...');
  let imported = 0;
  let updated = 0;
  let errors = 0;

  for (const video of videos) {
    const videoData = {
      id: video.id,
      title: video.title,
      description: video.description || '',
      youtube_id: video.youtubeId,
      category: video.category,
      verified: video.verified || false,
      makes: video.makes || [],
      models: video.models || [],
      product_categories: video.productCategories || [],
    };

    // Check if video exists
    const { data: existing } = await supabase
      .from('technical_videos')
      .select('id')
      .eq('id', video.id)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('technical_videos')
        .update(videoData)
        .eq('id', video.id);

      if (error) {
        console.error(`   ❌ Error updating ${video.id}:`, error.message);
        errors++;
      } else {
        updated++;
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('technical_videos')
        .insert(videoData);

      if (error) {
        console.error(`   ❌ Error inserting ${video.id}:`, error.message);
        errors++;
      } else {
        imported++;
      }
    }

    // Progress indicator
    const progress = Math.round(((imported + updated + errors) / videos.length) * 100);
    process.stdout.write(`\r   Processing... ${progress}%`);
  }

  console.log(`\n\n=====================================================`);
  console.log(`✅ Import complete!`);
  console.log(`   New videos: ${imported}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Errors: ${errors}`);
  console.log(`\nVideos are now in Supabase. The admin will read/write directly to Supabase.`);
}

importVideos().catch(console.error);
