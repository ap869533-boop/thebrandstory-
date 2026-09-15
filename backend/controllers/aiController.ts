import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { creatorsStore } from './creatorController';

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Could not initialize GoogleGenAI client:', e);
    }
  }
  return aiClient;
}

export async function matchCreators(req: Request, res: Response) {
  try {
    const { campaign, creators = creatorsStore } = req.body;
    if (!campaign) {
      return res.status(400).json({ error: 'Missing campaign details' });
    }

    const ai = getAIClient();

    if (ai) {
      try {
        const prompt = `You are the AI Matchmaking Engine for "thebrandsstory. - India's Biggest Influencer Platform".
Match and rank the top creators for this brand campaign brief:
Campaign Details:
- Industry: ${campaign.industry || 'Any'}
- Objective: ${campaign.objective || 'Brand Awareness'}
- Target City/Region: ${campaign.city || 'Pan India'}
- Campaign Budget: ${campaign.budget || 'Flexible'}
- Target Category: ${campaign.category || 'General'}
- Target Audience Demographic: ${campaign.targetAudience || 'General'}
- Desired Follower Range: ${campaign.followerRange || 'Any'}
- Platform: ${campaign.platform || 'Instagram'}

Candidates (${creators.length} available creators):
${JSON.stringify(
  creators.map((c: any) => ({
    id: c.id,
    name: c.name,
    username: c.username,
    primaryCategory: c.primaryCategory,
    subCategories: c.subCategories,
    currentCity: c.currentCity,
    followers: c.followers,
    trustScore: c.trustScore,
    startingPrice: c.startingPrice,
    reelPrice: c.pricing?.reelPrice,
    collaborationTypes: c.collaborationTypes,
  }))
)}

Return a valid JSON array of objects with the best matches (maximum 6 creators) ordered from highest match score to lowest:
[
  {
    "creatorId": "string",
    "matchScore": number (70 to 99),
    "reasons": ["short bullet 1 with checkmark style", "short bullet 2", "short bullet 3"],
    "budgetFit": "Exact" | "Within Range" | "Slightly Above",
    "audienceFit": "Brief 1-sentence audience alignment explanation"
  }
]
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({ matches: parsed, source: 'gemini-ai' });
        }
      } catch (geminiError) {
        console.warn('Gemini AI matching error, falling back to algorithmic match:', geminiError);
      }
    }

    // Algorithmic fallback
    const ranked = creators
      .map((c: any) => {
        let score = 70;
        const reasons: string[] = [];

        if (campaign.category && (c.primaryCategory.toLowerCase() === campaign.category.toLowerCase() || c.subCategories?.some((s: string) => s.toLowerCase() === campaign.category.toLowerCase()))) {
          score += 15;
          reasons.push(`✓ Exact category alignment in ${c.primaryCategory}`);
        } else {
          reasons.push(`✓ Broad lifestyle & creator relevance`);
        }

        if (campaign.city && campaign.city !== 'All India') {
          if (c.currentCity.toLowerCase().includes(campaign.city.toLowerCase()) || c.preferredCities?.some((pc: string) => pc.toLowerCase().includes(campaign.city.toLowerCase()))) {
            score += 10;
            reasons.push(`✓ Strong local audience presence in ${campaign.city}`);
          }
        } else {
          reasons.push(`✓ High Pan-India reach across major Tier-1 & Tier-2 cities`);
        }

        if (c.trustScore >= 93) {
          score += 4;
          reasons.push(`✓ Elite thebrandsstory. Trust Score (${c.trustScore}/100)`);
        }



        score = Math.min(98, Math.max(72, score));

        return {
          creatorId: c.id,
          matchScore: score,
          reasons: reasons.slice(0, 4),
          budgetFit: 'Within Range',
          audienceFit: `Audience concentration aligns strongly with ${campaign.industry || 'brand'} consumers.`,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);

    return res.json({ matches: ranked, source: 'algorithm' });
  } catch (error) {
    console.error('AI Matching error:', error);
    res.status(500).json({ error: 'Failed to compute matches' });
  }
}

export async function naturalSearch(req: Request, res: Response) {
  try {
    const { query } = req.body;
    if (!query) {
      return res.json({ query: '', filters: {} });
    }

    const ai = getAIClient();
    if (ai) {
      try {
        const prompt = `Extract influencer search filters from this search query: "${query}".
Return valid JSON with these optional properties:
{
  "category": string | null,
  "city": string | null,
  "maxPrice": number | null,
  "minFollowers": number | null,
  "maxFollowers": number | null,
  "collaborationType": string | null
}
`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({ query, filters: parsed });
        }
      } catch (err) {
        console.warn('Natural search Gemini error:', err);
      }
    }

    // Fallback rule
    const qLower = query.toLowerCase();
    const filters: any = {};
    if (qLower.includes('delhi')) filters.city = 'Delhi NCR';
    else if (qLower.includes('mumbai')) filters.city = 'Mumbai';
    else if (qLower.includes('bangalore')) filters.city = 'Bangalore';
    else if (qLower.includes('pune')) filters.city = 'Pune';
    else if (qLower.includes('jaipur')) filters.city = 'Jaipur';

    if (qLower.includes('fashion')) filters.category = 'Fashion';
    else if (qLower.includes('food')) filters.category = 'Food';
    else if (qLower.includes('beauty')) filters.category = 'Beauty';
    else if (qLower.includes('tech')) filters.category = 'Technology';
    else if (qLower.includes('fitness')) filters.category = 'Fitness';

    if (qLower.includes('10k') || qLower.includes('10000') || qLower.includes('10,000')) filters.maxPrice = 10000;
    if (qLower.includes('5k') || qLower.includes('5000') || qLower.includes('5,000')) filters.maxPrice = 5000;

    return res.json({ query, filters });
  } catch (error) {
    res.status(500).json({ error: 'Search processing failed' });
  }
}
