// ============================================
// PREDICTIONS ROUTES (SportsMonks Integration)
// ============================================
// These routes provide access to SportsMonks prediction model data.
// Includes model performance/accuracy stats by league.
// ============================================

import express from 'express';
import type { Request, Response } from 'express';
import { getPredictabilityByLeague } from '../services/sportsmonks.js';

// Import auth middleware - all routes require authentication
import authMiddleware from '../middleware/auth.js';

// Create a router
const router = express.Router();

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error';

const isInvalidNumber = (value: string) => Number.isNaN(Number(value));

// Apply auth middleware to all routes in this router
router.use(authMiddleware);

// ============================================
// GET PREDICTABILITY BY LEAGUE ID
// GET /predictions/predictability/leagues/:leagueId
// Example: GET /predictions/predictability/leagues/8 (Premier League)
// ============================================
// Returns the performance/accuracy metrics of the SportsMonks
// prediction model for a specific league.
//
// Known league IDs:
//   - 8: Premier League
//   - 24: FA Cup
//   - 27: Carabao Cup
//
// Response includes accuracy percentages for various markets:
//   - Fulltime Result (1X2)
//   - Over/Under goals
//   - Both Teams To Score
//   - Correct Score
//   - And more...

router.get('/predictability/leagues/:leagueId', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params;

    // Validate: leagueId must be a number
    if (isInvalidNumber(leagueId)) {
      return res.status(400).json({
        error: 'League ID must be a number'
      });
    }

    // Call the SportsMonks service
    const result = await getPredictabilityByLeague(leagueId);

    // Return the predictability data
    res.json({
      message: `Prediction model performance for league ${leagueId}`,
      leagueId: parseInt(leagueId),
      data: result.data || []
    });

  } catch (error) {
    console.error('Get predictability by league error:', getErrorMessage(error));
    res.status(500).json({
      error: 'Failed to get prediction model performance',
      details: getErrorMessage(error)
    });
  }
});

// ============================================
// EXPORT THE ROUTER
// ============================================

export default router;
