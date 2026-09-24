const User = require('../models/User');
const Policy = require('../models/Policy');

async function searchByUsername(req, res, next) {
  try {
    const username = (req.query.username || '').trim();
    if (!username) {
      return res.status(400).json({ message: 'username is required' });
    }
    
    const users = await User.find({ firstName: { $regex: username, $options: 'i' } });
    const userIds = users.map(user => user._id);

    const policies = await Policy.find({ userId: { $in: userIds } })
      .populate('userId', 'firstName email phone')
      .populate('agentId', 'name')
      .populate('accountId', 'accountName')
      .populate('categoryId', 'categoryName')
      .populate('carrierId', 'companyName')
      .lean();

    res.json({ count: policies.length, data: policies });
  } catch (error) {
    next(error);
  }
}

async function aggregateByUser(req, res, next) {
  try {
    const result = await Policy.aggregate([
      { $group: { _id: '$userId', policyCount: { $sum: 1 }, policies: { $push: '$$ROOT' } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: '$user.firstName',
          email: '$user.email',
          policyCount: 1,
          policies: 1
        }
      },
      { $sort: { policyCount: -1 } }
    ]);

    res.json({ count: result.length, data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = { searchByUsername, aggregateByUser };
