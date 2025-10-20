import fetch from 'node-fetch';

const QUOTABLE_API = 'https://api.quotable.io';

/**
 * Get a random motivational quote from Quotable API
 * @returns {Promise<{content: string, author: string, tags: string[]}>}
 */
export async function getRandomQuote() {
  try {
    // Fetch random quote with motivational/inspirational tags
    const response = await fetch(
      `${QUOTABLE_API}/random?tags=motivational|inspirational|wisdom|success`
    );

    if (!response.ok) {
      throw new Error(`Quotable API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.content,
      author: data.author,
      tags: data.tags || []
    };
  } catch (error) {
    console.error('Failed to fetch quote from Quotable:', error);

    // Return fallback quote
    return {
      content: 'A persistência é o caminho do êxito.',
      author: 'Charles Chaplin',
      tags: ['motivational']
    };
  }
}

/**
 * Get quote by ID
 * @param {string} id - Quote ID
 * @returns {Promise<Object>}
 */
export async function getQuoteById(id) {
  try {
    const response = await fetch(`${QUOTABLE_API}/quotes/${id}`);

    if (!response.ok) {
      throw new Error(`Quotable API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch quote by ID:', error);
    throw error;
  }
}

/**
 * Search quotes by keywords
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Promise<Object>}
 */
export async function searchQuotes(query, limit = 10) {
  try {
    const response = await fetch(
      `${QUOTABLE_API}/search/quotes?query=${encodeURIComponent(query)}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Quotable API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to search quotes:', error);
    throw error;
  }
}
