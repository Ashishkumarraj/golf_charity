import app from '../../lib/backend-api/server';

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false, // Express handles body parsing
  },
};

export default function handler(req, res) {
  // Pass the request and response objects directly to the Express app
  return app(req, res);
}
