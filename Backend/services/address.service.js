import Address from "../models/Address.js";

/**
 * Adds a new address for a user.
 */
export const addAddress = async (userId, addressData) => {
  // If the new address is set as default, unset other defaults
  if (addressData.isDefault) {
    await Address.updateMany({ userId }, { isDefault: false });
  } else {
    // If it's the user's first address, make it default
    const count = await Address.countDocuments({ userId });
    if (count === 0) {
      addressData.isDefault = true;
    }
  }

  const address = await Address.create({ ...addressData, userId });
  return address;
};

/**
 * Retrieves all addresses for a user.
 */
export const getAddresses = async (userId) => {
  return await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
};

/**
 * Updates an address.
 */
export const updateAddress = async (id, userId, updateData) => {
  const address = await Address.findOne({ _id: id, userId });
  if (!address) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  if (updateData.isDefault) {
    await Address.updateMany({ userId }, { isDefault: false });
  }

  Object.assign(address, updateData);
  await address.save();
  return address;
};

/**
 * Sets an address as default.
 */
export const setDefaultAddress = async (id, userId) => {
  await Address.updateMany({ userId }, { isDefault: false });
  const address = await Address.findOneAndUpdate(
    { _id: id, userId },
    { isDefault: true },
    { returnDocument: "after" }
  );

  if (!address) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  return address;
};

/**
 * Deletes an address.
 */
export const deleteAddress = async (id, userId) => {
  const address = await Address.findOneAndDelete({ _id: id, userId });
  
  if (!address) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  // If we deleted the default address, set another one as default if any exist
  if (address.isDefault) {
    const nextAddress = await Address.findOne({ userId });
    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  return true;
};
