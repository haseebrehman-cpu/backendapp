import { prisma } from "../config/db.js";
import { redisClient } from "../config/redis.js";

const getUserProfile = async (req, res) => {
  try {
    const { id } = req.user;

    const cachedUser = await redisClient.get("RegisteredUser:" + id);
    if (cachedUser) {
      return res.status(200).json({ message: 'User profile fetched successfully', source: "redis", status: 'success', code: 200, data: JSON.parse(cachedUser) });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found', status: 'error', code: 404 });

    await redisClient.set("RegisteredUser:" + id, JSON.stringify(user), { EX: 60 });

    return res.status(200).json({ message: 'User profile fetched successfully', source: "database", status: 'success', code: 200, data: user });
  } catch (error) {
    console.error('getUserProfile error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 'error', code: 500 });
  }
}

export default { getUserProfile };