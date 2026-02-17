import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { SheetConfig } from '../types';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Helper to get JWT credentials
function getServiceAccountAuth(): JWT {
  // Option 1: Load from JSON file path (easier and recommended)
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credentialsPath && fs.existsSync(credentialsPath)) {
    try {
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
      return new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    } catch (error) {
      throw new Error(`Failed to load credentials from ${credentialsPath}: ${error}`);
    }
  }

  // Option 2: Load from environment variables
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) {
    throw new Error(
      'Missing Google credentials. Either set GOOGLE_APPLICATION_CREDENTIALS (path to JSON file) ' +
      'or set both GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.'
    );
  }

  // Helper to parse private key from environment variable
  function parsePrivateKey(keyString: string): string {
    // Remove surrounding quotes if present
    let key = keyString.trim();
    if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
      key = key.slice(1, -1);
    }
    
    // Replace escaped newlines with actual newlines
    // Handle both \\n (double escaped) and \n (single escaped)
    key = key.replace(/\\n/g, '\n');
    
    return key;
  }

  return new JWT({
    email,
    key: parsePrivateKey(privateKey),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// Initialize Auth
const serviceAccountAuth = getServiceAccountAuth();

export const loadConfigFromSheet = async (sheetId: string): Promise<SheetConfig> => {
  if (!sheetId) {
    throw new Error('Sheet ID is required');
  }

  const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
  
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['Config']; // Make sure tab name matches
  if (!sheet) {
    throw new Error('Sheet tab "Config" not found. Please create a tab named "Config" in your Google Sheet.');
  }
  const rows = await sheet.getRows();

  // Helper to get non-empty values from a specific column
  const getColValues = (header: string) => {
    return rows
      .map((row: any) => row.get(header))
      .filter((val: any) => val && val.trim() !== ''); // Remove empty cells
  };

  return {
    avatars: getColValues('Avatar'),
    angles: getColValues('Angle'),
    awarenessLevels: getColValues('Awareness'),
    offers: getColValues('Offer'),
    fomoElements: getColValues('FOMO'),
  };
};

