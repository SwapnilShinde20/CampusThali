import Menu from '../models/Menu.js';

export const createMenuItem = async (menuData) => {
  const item = await Menu.create(menuData);
  return item;
};

export const getMenuItemsByChef = async (chefId) => {
  const items = await Menu.find({ chefId });
  return items;
};

export const updateMenuItem = async (id, updateData) => {
  const updated = await Menu.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  
  if (!updated) {
    const error = new Error('Menu item not found');
    error.statusCode = 404;
    throw error;
  }
  
  return updated;
};

export const deleteMenuItem = async (id) => {
  const deleted = await Menu.findByIdAndDelete(id);
  
  if (!deleted) {
    const error = new Error('Menu item not found');
    error.statusCode = 404;
    throw error;
  }
  
  return true;
};
