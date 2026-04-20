const RewardItem = require('../models/RewardItem');
const Purchase = require('../models/Purchase');
const Reward = require('../models/Reward');
const User = require('../models/User');

// Get all reward items (for child)
exports.getMarketplace = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    let parentId;
    if (user.role === 'child') {
      parentId = user.parentId;
    } else {
      parentId = userId;
    }

    const items = await RewardItem.find({ 
      parentId, 
      isActive: true 
    }).sort({ cost: 1 });

    res.json(items);
  } catch (error) {
    console.error('Error fetching marketplace:', error);
    res.status(500).json({ message: 'Error fetching marketplace' });
  }
};

// Get child's purchases
exports.getPurchases = async (req, res) => {
  try {
    const userId = req.userId;

    const purchases = await Purchase.find({ childId: userId })
      .populate('rewardItemId')
      .sort({ purchasedAt: -1 });

    res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ message: 'Error fetching purchases' });
  }
};

// Purchase reward item
exports.purchaseItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const childId = req.userId;

    const item = await RewardItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (!item.isActive) {
      return res.status(400).json({ message: 'Item not available' });
    }

    // Check stock
    if (item.stock !== -1 && item.stock < 1) {
      return res.status(400).json({ message: 'Out of stock' });
    }

    // Check child's points
    const reward = await Reward.findOne({ userId: childId });
    if (!reward || reward.totalPoints < item.cost) {
      return res.status(400).json({ message: 'Not enough points' });
    }

    // Deduct points
    reward.totalPoints -= item.cost;
    await reward.save();

    // Decrease stock if not unlimited
    if (item.stock !== -1) {
      item.stock -= 1;
      await item.save();
    }

    // Create purchase
    const purchase = new Purchase({
      childId,
      rewardItemId: itemId,
      cost: item.cost,
      status: 'pending'
    });
    await purchase.save();

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('rewardItemId');

    res.json({ 
      message: 'Purchase successful!', 
      purchase: populatedPurchase,
      remainingPoints: reward.totalPoints
    });
  } catch (error) {
    console.error('Error purchasing item:', error);
    res.status(500).json({ message: 'Error purchasing item' });
  }
};

// Parent: Get all reward items they created
exports.getMyRewardItems = async (req, res) => {
  try {
    const parentId = req.userId;

    const items = await RewardItem.find({ parentId }).sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('Error fetching reward items:', error);
    res.status(500).json({ message: 'Error fetching reward items' });
  }
};

// Parent: Create reward item
exports.createRewardItem = async (req, res) => {
  try {
    const { title, description, cost, icon, category, stock } = req.body;
    const parentId = req.userId;

    const item = new RewardItem({
      parentId,
      title,
      description,
      cost,
      icon: icon || '🎁',
      category: category || 'other',
      stock: stock || -1
    });

    await item.save();

    res.json({ message: 'Reward item created!', item });
  } catch (error) {
    console.error('Error creating reward item:', error);
    res.status(500).json({ message: 'Error creating reward item' });
  }
};

// Parent: Update reward item
exports.updateRewardItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const updates = req.body;

    const item = await RewardItem.findByIdAndUpdate(
      itemId,
      updates,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item updated!', item });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Error updating item' });
  }
};

// Parent: Delete reward item
exports.deleteRewardItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    await RewardItem.findByIdAndDelete(itemId);

    res.json({ message: 'Item deleted!' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Error deleting item' });
  }
};

// Parent: Get all purchases (all children)
exports.getAllPurchases = async (req, res) => {
  try {
    const parentId = req.userId;

    // Get all children
    const children = await User.find({ parentId });
    const childrenIds = children.map(c => c._id);

    const purchases = await Purchase.find({ childId: { $in: childrenIds } })
      .populate('childId', 'name email')
      .populate('rewardItemId')
      .sort({ purchasedAt: -1 });

    res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ message: 'Error fetching purchases' });
  }
};

// Parent: Approve/Reject purchase
exports.updatePurchaseStatus = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const { status, notes } = req.body;

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    purchase.status = status;
    if (notes) purchase.notes = notes;

    if (status === 'approved') {
      purchase.approvedAt = new Date();
    } else if (status === 'fulfilled') {
      purchase.fulfilledAt = new Date();
    }

    await purchase.save();

    const updatedPurchase = await Purchase.findById(purchaseId)
      .populate('childId', 'name email')
      .populate('rewardItemId');

    res.json({ message: 'Purchase updated!', purchase: updatedPurchase });
  } catch (error) {
    console.error('Error updating purchase:', error);
    res.status(500).json({ message: 'Error updating purchase' });
  }
};