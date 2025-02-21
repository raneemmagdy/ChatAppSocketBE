export const pagination = async ({ page = 1, limit = 2, model, populate = [] }) => {
    let pageNum = Number(page) || 1;
    if (pageNum < 1) pageNum = 1;
  
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
  
    const totalCount = await model.countDocuments();
    const totalPages = Math.ceil(totalCount / limitNum);
  
    let query = model.find().limit(limitNum).skip(skip);
    if (populate.length) {
      query = query.populate(populate);
    }
    const data = await query;
  
    return { data, pageNum, limitNum, skip, totalCount, totalPages };
  };
  