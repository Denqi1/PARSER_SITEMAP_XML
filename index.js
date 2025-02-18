const fs = require('fs');
const xml2js = require('xml2js');

async function loadFile(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    return data
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);
  } catch (error) {
    console.error(`❌ Error during download ${filePath}:`, error);
    return [];
  }
}

async function parseSitemap(filePath) {
  try {
    const xmlData = await fs.promises.readFile(filePath, 'utf-8');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);

    return result.urlset.url.map((entry) => entry.loc[0]);
  } catch (error) {
    console.error('❌ Error parsing sitemap.xml:', error);
    return [];
  }
}

async function checkSitemap() {
  const sitemapUrls = await parseSitemap('sitemap.xml');
  const expectedUrls = await loadFile('expectedUrls.txt');
  const removedUrls = await loadFile('removedUrls.txt');

  const missingUrls = expectedUrls.filter((url) => !sitemapUrls.includes(url));

  const unwantedUrls = sitemapUrls.filter((url) => removedUrls.includes(url));

  console.log('\n✅ Verification complete:');
  if (missingUrls.length > 0) {
    console.log('❌ There are missing links that should be:');
    console.log(missingUrls.join('\n'));
  } else {
    console.log('✅ All of the expected references are present.');
  }

  if (unwantedUrls.length > 0) {
    console.log('\n❌ Found links that should be removed:');
    console.log(unwantedUrls.join('\n'));
  } else {
    console.log('✅ No unwanted links.');
  }
}

// Run program - node index.js
checkSitemap();
