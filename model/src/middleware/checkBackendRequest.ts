
const checkBackendRequest = (req: any, res: any, next: any) => {
  const internalSecret = req.headers['x-internal-secret'];

    if(!internalSecret || internalSecret !== process.env.INTERNAL_API_SECRET) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    next();

}

export default checkBackendRequest;