import ChefProfile from '../models/ChefProfile.js';

/**
 * Retrieves chefs that are approved and optionally filtered by college.
 * @param {string} [college] - Selected college filter
 * @returns {Promise<Array>}
 */
export const getApprovedChefs = async (college) => {
  const query = { isApproved: true };
  
  if (college) {
    // using regex for a case-insensitive search
    query.college = { $regex: new RegExp(college, 'i') };
  }

  const chefs = await ChefProfile.find(query).populate('userId', 'name');
  
  return chefs;
};

/**
 * Retrieves a single chef profile by ID.
 * @param {string} id - ChefProfile ID
 * @returns {Promise<Object>}
 */
export const getChefProfileById = async (id) => {
  const chef = await ChefProfile.findById(id).populate('userId', 'name');
  
  if (!chef) {
    const error = new Error('Chef not found');
    error.statusCode = 404;
    throw error;
  }
  
  return chef;
};

/**
 * Retrieves a chef profile by User ID.
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const getChefProfileByUserId = async (userId) => {
  const chef = await ChefProfile.findOne({ userId }).populate('userId', 'name');
  return chef;
};

/**
 * Updates a chef profile by User ID.
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>}
 */
export const updateChefProfile = async (userId, updateData) => {
  let chef = await ChefProfile.findOne({ userId });
  
  if (!chef) {
    chef = new ChefProfile({ userId });
  }

  if (updateData.bio !== undefined) chef.bio = updateData.bio;
  if (updateData.college !== undefined) chef.college = updateData.college;
  if (updateData.phone !== undefined) chef.phone = updateData.phone;
  if (updateData.profileImage !== undefined) chef.profileImage = updateData.profileImage;
  if (updateData.isAvailable !== undefined) chef.isAvailable = updateData.isAvailable;

  if (chef.bio && chef.college && chef.profileImage && chef.phone) {
    chef.isProfileComplete = true;
  }

  return await chef.save();
};
