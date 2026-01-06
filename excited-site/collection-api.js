console.log('=== Step 1: Collecting items from .recent-news-cl ===');

// Get all items from recent news collection
const recentNewsItems = document.querySelectorAll('.recent-news-cl > *');
const newsData = {};

recentNewsItems.forEach((item, index) => {
  const nameElement = item.querySelector('[blog-name]');
  const name = nameElement?.textContent.trim();
  
  if (name) {
    const tagElements = item.querySelectorAll('[blog-tag]');
    const tags = Array.from(tagElements).map(tag => tag.textContent.trim());
    
    newsData[name] = {
      tags: tags,
      tagElements: Array.from(tagElements) // Store actual elements
    };
    
    console.log(`${index + 1}. "${name}"`);
    console.log(`   — Tags (${tags.length}): ${tags.join(', ')}`);
  }
});

console.log(`\nTotal items collected from recent news: ${Object.keys(newsData).length}`);

console.log('\n=== Step 2: Finding matches in dynamic collection lists ===');

const collectionLists = document.querySelectorAll('[dynamic-collection-list]');
console.log(`Found ${collectionLists.length} collection lists with [dynamic-collection-list]`);

let matchesFound = 0;
let tagsUpdated = 0;

collectionLists.forEach((list, listIndex) => {
  console.log(`\n--- Collection List ${listIndex + 1} ---`);
  
  const nameElements = list.querySelectorAll('[dynamic-collection-name]');
  console.log(`Found ${nameElements.length} items with [dynamic-collection-name]`);
  
  nameElements.forEach((nameElement) => {
    const name = nameElement.textContent.trim();
    const targetItem = nameElement.closest('[dynamic-collection-list] > *') || nameElement.parentElement;
    
    console.log(`  Checking: "${name}"`);
    
    if (newsData[name]) {
      matchesFound++;
      console.log(`    ✓ MATCH FOUND!`);
      console.log(`    → Recent news has ${newsData[name].tagElements.length} tags: ${newsData[name].tags.join(', ')}`);
      
      // Find target container for tags
      let targetTagsContainer = targetItem.querySelector('[dynamic-collection-tags]');
      
      if (!targetTagsContainer) {
        // Fallback: use parent of first existing tag
        const existingTag = targetItem.querySelector('[blog-tag]');
        if (existingTag) {
          targetTagsContainer = existingTag.parentElement;
        }
      }
      
      if (targetTagsContainer && newsData[name].tagElements.length > 0) {
        // Remove all existing tags
        targetTagsContainer.querySelectorAll('[blog-tag]').forEach(tag => tag.remove());
        
        // Clone and append ALL tags from recent news
        newsData[name].tagElements.forEach(sourceTag => {
          const clonedTag = sourceTag.cloneNode(true);
          targetTagsContainer.appendChild(clonedTag);
        });
        
        tagsUpdated++;
        console.log(`    ✓ Successfully cloned ${newsData[name].tagElements.length} tags!`);
      } else {
        console.log(`    ⚠️ No target container found or no source tags to clone`);
      }
    }
  });
});

console.log('\n=== Summary ===');
console.log(`Items in recent news: ${Object.keys(newsData).length}`);
console.log(`Matches found: ${matchesFound}`);
console.log(`Tags updated: ${tagsUpdated}`);
console.log('=== Done ===');
