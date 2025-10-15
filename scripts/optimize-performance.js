#!/usr/bin/env node

/**
 * Performance Optimization Script
 * 
 * This script helps optimize the Next.js application for better Core Web Vitals
 * by analyzing and suggesting improvements for:
 * - Image optimization
 * - JavaScript bundle size
 * - CSS optimization
 * - Layout shift prevention
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Performance Optimization Analysis...\n');

// Check for common performance issues
const performanceChecks = [
  {
    name: 'Image Optimization',
    check: () => {
      const imageFiles = findFiles('.tsx', 'src/components');
      let issues = [];
      
      imageFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for large image dimensions
        if (content.includes('width={') && content.includes('height={')) {
          const widthMatch = content.match(/width=\{(\d+)\}/);
          const heightMatch = content.match(/height=\{(\d+)\}/);
          
          if (widthMatch && heightMatch) {
            const width = parseInt(widthMatch[1]);
            const height = parseInt(heightMatch[1]);
            
            if (width > 400 || height > 400) {
              issues.push(`Large image dimensions in ${file}: ${width}x${height}`);
            }
          }
        }
        
        // Check for missing quality settings
        if (content.includes('<Image') && !content.includes('quality=')) {
          issues.push(`Missing quality setting in ${file}`);
        }
        
        // Check for missing sizes attribute
        if (content.includes('<Image') && !content.includes('sizes=')) {
          issues.push(`Missing sizes attribute in ${file}`);
        }
      });
      
      return issues;
    }
  },
  {
    name: 'JavaScript Bundle Size',
    check: () => {
      const issues = [];
      
      // Check for large imports
      const componentFiles = findFiles('.tsx', 'src/components');
      componentFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for large library imports
        if (content.includes('import * from') || content.includes('import {') && content.split('import {')[1]?.split('}')[0]?.split(',').length > 5) {
          issues.push(`Large import in ${file}`);
        }
      });
      
      return issues;
    }
  },
  {
    name: 'CSS Optimization',
    check: () => {
      const issues = [];
      const cssFile = 'src/app/globals.css';
      
      if (fs.existsSync(cssFile)) {
        const content = fs.readFileSync(cssFile, 'utf8');
        
        // Check for unused animations
        const animationCount = (content.match(/@keyframes/g) || []).length;
        if (animationCount > 10) {
          issues.push(`Too many animations (${animationCount}) - consider reducing`);
        }
        
        // Check for complex selectors
        const complexSelectors = content.match(/[.#][\w-]+\s+[.#][\w-]+\s+[.#][\w-]+/g);
        if (complexSelectors && complexSelectors.length > 5) {
          issues.push(`Complex CSS selectors found - consider simplifying`);
        }
      }
      
      return issues;
    }
  },
  {
    name: 'Layout Shift Prevention',
    check: () => {
      const issues = [];
      const componentFiles = findFiles('.tsx', 'src/components');
      
      componentFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for images without dimensions
        if (content.includes('<Image') && !content.includes('width=') && !content.includes('height=')) {
          issues.push(`Image without dimensions in ${file} - causes layout shift`);
        }
        
        // Check for dynamic content without skeleton
        if (content.includes('useState') && content.includes('loading') && !content.includes('skeleton')) {
          issues.push(`Dynamic content without loading skeleton in ${file}`);
        }
      });
      
      return issues;
    }
  }
];

// Helper function to find files
function findFiles(extension, directory) {
  const files = [];
  
  function traverse(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith(extension)) {
        files.push(fullPath);
      }
    });
  }
  
  if (fs.existsSync(directory)) {
    traverse(directory);
  }
  
  return files;
}

// Run performance checks
let totalIssues = 0;

performanceChecks.forEach(check => {
  console.log(`🔍 Checking ${check.name}...`);
  const issues = check.check();
  
  if (issues.length === 0) {
    console.log(`✅ ${check.name}: No issues found\n`);
  } else {
    console.log(`⚠️  ${check.name}: ${issues.length} issues found`);
    issues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
    console.log('');
    totalIssues += issues.length;
  }
});

// Performance recommendations
console.log('📋 Performance Recommendations:\n');

const recommendations = [
  '✅ Use Next.js Image component with proper sizing',
  '✅ Implement lazy loading for non-critical components',
  '✅ Optimize image quality (60-75 for thumbnails, 85+ for details)',
  '✅ Use responsive images with sizes attribute',
  '✅ Minimize JavaScript bundle size with dynamic imports',
  '✅ Reduce CSS complexity and unused animations',
  '✅ Add loading skeletons to prevent layout shifts',
  '✅ Use proper image dimensions to prevent CLS',
  '✅ Implement code splitting for better performance',
  '✅ Optimize font loading and reduce render blocking'
];

recommendations.forEach(rec => {
  console.log(rec);
});

console.log(`\n📊 Summary: ${totalIssues} performance issues found`);
console.log('🎯 Run "npm run build" to see the optimized bundle size');
console.log('🚀 Use Lighthouse to measure the improvements!');

// Create performance optimization report
const report = {
  timestamp: new Date().toISOString(),
  totalIssues,
  checks: performanceChecks.map(check => ({
    name: check.name,
    issues: check.check().length
  })),
  recommendations
};

fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Performance report saved to performance-report.json');
