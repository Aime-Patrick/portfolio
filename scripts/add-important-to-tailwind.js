// Script to add ! prefix to all Tailwind CSS classes in the project
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '..', 'src');

// Function to add ! prefix to Tailwind classes
function addImportantToTailwindClasses(content) {
  // Regular expression to match className attributes
  const classNameRegex = /(className="[^"]*)(")/g;
  
  // Replace function to add ! to each class
  return content.replace(classNameRegex, (match, classNames, endQuote) => {
    // Skip if already has ! prefixes
    if (classNames.includes('!')) {
      return match;
    }
    
    // Add ! to each class
    const modifiedClasses = classNames.replace(/([\w-]+:)?([\w-]+)/g, (classMatch, prefix, className) => {
      // Skip if it's just the className= part
      if (classMatch === 'className=') return classMatch;
      
      // Skip if it's already prefixed with !
      if (classMatch.startsWith('!')) return classMatch;
      
      // Add ! prefix
      return prefix ? `${prefix}!${className}` : `!${className}`;
    });
    
    return modifiedClasses + endQuote;
  });
}

// Function to process a file
async function processFile(filePath) {
  try {
    // Read the file
    const content = await fs.promises.readFile(filePath, 'utf8');
    
    // Skip if not a React/TSX file
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) {
      return;
    }
    
    // Add ! prefix to Tailwind classes
    const modifiedContent = addImportantToTailwindClasses(content);
    
    // Write the modified content back to the file
    if (content !== modifiedContent) {
      await fs.promises.writeFile(filePath, modifiedContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Function to recursively process all files in a directory
async function processDirectory(dirPath) {
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else {
        await processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error);
  }
}

// Main function
async function main() {
  console.log('Adding ! prefix to Tailwind classes...');
  await processDirectory(srcDir);
  console.log('Done!');
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});