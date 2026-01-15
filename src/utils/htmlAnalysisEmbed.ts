/**
 * Utility functions for embedding and extracting SavedAnalysis data in HTML exports.
 * This allows HTML reports to be "replayed" by importing them back into the application.
 */

import { SavedAnalysis } from '@/hooks/useSavedAnalyses';

// Unique marker for the embedded data block
const EMBED_START_MARKER = '<!--HANDWERK_STARS_ANALYSIS_DATA_START-->';
const EMBED_END_MARKER = '<!--HANDWERK_STARS_ANALYSIS_DATA_END-->';

/**
 * Creates the HTML block containing the embedded analysis data.
 * This is inserted into the HTML as a hidden script tag.
 */
export const createEmbeddedAnalysisBlock = (analysisData: Partial<SavedAnalysis>): string => {
  try {
    // Create a clean copy without circular references
    const cleanData = JSON.parse(JSON.stringify(analysisData));
    const jsonString = JSON.stringify(cleanData);
    const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
    
    return `
${EMBED_START_MARKER}
<script type="application/json" id="handwerk-stars-analysis-data" style="display:none;">
${base64Data}
</script>
${EMBED_END_MARKER}
`;
  } catch (error) {
    console.error('Failed to create embedded analysis block:', error);
    return '';
  }
};

/**
 * Extracts the SavedAnalysis data from an HTML string.
 * Returns null if no embedded data is found or parsing fails.
 */
export const extractAnalysisFromHTML = (htmlContent: string): SavedAnalysis | null => {
  try {
    // Check for markers
    if (!htmlContent.includes(EMBED_START_MARKER) || !htmlContent.includes(EMBED_END_MARKER)) {
      console.log('No embedded analysis data markers found in HTML');
      return null;
    }
    
    // Extract the script tag content
    const scriptMatch = htmlContent.match(/<script[^>]*id="handwerk-stars-analysis-data"[^>]*>\s*([\s\S]*?)\s*<\/script>/);
    if (!scriptMatch || !scriptMatch[1]) {
      console.log('Could not find analysis data script tag');
      return null;
    }
    
    const base64Data = scriptMatch[1].trim();
    const jsonString = decodeURIComponent(escape(atob(base64Data)));
    const analysisData = JSON.parse(jsonString) as SavedAnalysis;
    
    // Validate essential fields
    if (!analysisData.businessData || !analysisData.realData) {
      console.error('Extracted data is missing required fields');
      return null;
    }
    
    // Ensure manualData exists with defaults
    if (!analysisData.manualData) {
      analysisData.manualData = {
        competitors: [],
        competitorServices: {},
        removedMissingServices: []
      };
    }
    
    // Generate new ID for imported analysis
    analysisData.id = crypto.randomUUID();
    analysisData.savedAt = new Date().toISOString();
    
    console.log('Successfully extracted analysis data from HTML:', analysisData.name || 'Unnamed');
    return analysisData;
    
  } catch (error) {
    console.error('Failed to extract analysis from HTML:', error);
    return null;
  }
};

/**
 * Checks if an HTML file contains embedded analysis data.
 */
export const hasEmbeddedAnalysis = (htmlContent: string): boolean => {
  return htmlContent.includes(EMBED_START_MARKER) && htmlContent.includes(EMBED_END_MARKER);
};
