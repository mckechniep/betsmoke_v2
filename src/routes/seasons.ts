// ============================================
// SEASONS ROUTES (SportsMonks Integration)
// ============================================
// These routes provide access to season data from SportsMonks.
// Useful for navigating historical data (standings, fixtures, stats by season).
// ============================================

import express from 'express';
import type { Request, Response } from 'express';
import {
  getAllSeasons,
  getSeasonById,
  getSeasonsByLeague
} from '../services/sportsmonks.js';

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
// GET ALL SEASONS
// GET /seasons
// Example: GET /seasons
// ============================================
// Returns all seasons from our subscribed leagues.
// Includes: league info for each season

router.get('/', async (_req: Request, res: Response) => {
  try {
    // Call the SportsMonks service
    const result = await getAllSeasons();

    const seasons = result.data || [];

    // Return the seasons
    res.json({
      message: `Found ${seasons.length} seasons`,
      count: seasons.length,
      seasons: seasons
    });

  } catch (error) {
    console.error('Get all seasons error:', getErrorMessage(error));
    res.status(500).json({
      error: 'Failed to get seasons',
      details: getErrorMessage(error)
    });
  }
});

// ============================================
// GET SEASONS BY LEAGUE
// GET /seasons/leagues/:leagueId
// Example: GET /seasons/leagues/8
// ============================================
// Returns all seasons for a specific league.
// Useful for building season selectors in the UI.
//
// Known league IDs:
//   - 8: Premier League
//   - 24: FA Cup
//   - 27: Carabao Cup

router.get('/leagues/:leagueId', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params;

    // Validate: leagueId must be a number
    if (isInvalidNumber(leagueId)) {
      return res.status(400).json({
        error: 'League ID must be a number'
      });
    }

    // Call the SportsMonks service (gets league with seasons included)
    const result = await getSeasonsByLeague(leagueId);

    // Check if league was found
    if (!result.data) {
      return res.status(404).json({
        error: `League with ID ${leagueId} not found`
      });
    }

    const seasons = result.data.seasons || [];

    // Return the seasons
    res.json({
      message: `Found ${seasons.length} seasons for league ${leagueId}`,
      leagueId: parseInt(leagueId),
      leagueName: result.data.name,
      count: seasons.length,
      seasons: seasons
    });

  } catch (error) {
    console.error('Get seasons by league error:', getErrorMessage(error));
    res.status(500).json({
      error: 'Failed to get seasons for league',
      details: getErrorMessage(error)
    });
  }
});

// ============================================
// GET SEASON BY ID
// GET /seasons/:id
// Example: GET /seasons/23614
// ============================================
// Get details for a specific season.
// Includes: league info, stages
//
// Known season IDs:
//   - 23614: Premier League 2024/25
//   - Use /seasons/leagues/:leagueId to find season IDs

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate: id must be a number
    if (isInvalidNumber(id)) {
      return res.status(400).json({
        error: 'Season ID must be a number'
      });
    }

    // Call the SportsMonks service
    const result = await getSeasonById(id);

    // Check if season was found
    if (!result.data) {
      return res.status(404).json({
        error: `Season with ID ${id} not found`
      });
    }

    // Return the season
    res.json({
      season: result.data
    });

  } catch (error) {
    console.error('Get season by ID error:', getErrorMessage(error));
    res.status(500).json({
      error: 'Failed to get season',
      details: getErrorMessage(error)
    });
  }
});

// ============================================
// EXPORT THE ROUTER
// ============================================

export default router;
