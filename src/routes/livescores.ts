// ============================================
// LIVE SCORES ROUTES (SportsMonks Integration)
// ============================================
// These routes provide access to live match data from SportsMonks.
// Only returns matches from our subscribed leagues:
//   - Premier League (8)
//   - FA Cup (24)
//   - Carabao Cup (27)
// ============================================

import express from 'express';
import type { Request, Response } from 'express';
import {
  getLivescores,
  getLivescoresInplay
} from '../services/sportsmonks.js';

// Import auth middleware - all routes require authentication
import authMiddleware from '../middleware/auth.js';

// Create a router
const router = express.Router();

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error';

// Apply auth middleware to all routes in this router
router.use(authMiddleware);

// ============================================
// GET ALL LIVE SCORES
// GET /livescores
// Example: GET /livescores
// ============================================
// Returns all matches that are live or about to start today.
// Includes: teams, current score, league info

router.get('/', async (_req: Request, res: Response) => {
  try {
    // Call the SportsMonks service
    const result = await getLivescores();

    const fixtures = result.data || [];

    // Return the live scores
    res.json({
      message: `Found ${fixtures.length} live/upcoming fixtures`,
      count: fixtures.length,
      fixtures: fixtures
    });

  } catch (error) {
    console.error('Get live scores error:', getErrorMessage(error));
    res.status(500).json({
      error: 'Failed to get live scores',
      details: getErrorMessage(error)
    });
  }
});

// ============================================
// GET IN-PLAY MATCHES ONLY
// GET /livescores/inplay
// Example: GET /livescores/inplay
// ============================================
// Returns only matches that are currently being played.
// Includes: teams, current score, league info, match events (goals, cards)

router.get('/inplay', async (_req: Request, res: Response) => {
  try {
    // Call the SportsMonks service
    const result = await getLivescoresInplay();

    const fixtures = result.data || [];

    // Return the in-play fixtures
    res.json({
      message: `Found ${fixtures.length} matches currently in play`,
      count: fixtures.length,
      fixtures: fixtures
    });

  } catch (error) {
    console.error('Get in-play scores error:', getErrorMessage(error));
    res.status(500).json({
      error: 'Failed to get in-play scores',
      details: getErrorMessage(error)
    });
  }
});

// ============================================
// EXPORT THE ROUTER
// ============================================

export default router;
