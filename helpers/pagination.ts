interface ObjectPagination {
  currentPage: number;
  limitItems: number;
  skip: number;
};

export const objectPagination = (objectPagination: ObjectPagination, query: any, countTopics: number): ObjectPagination => {
  if (query.page) {
    objectPagination.currentPage = parseInt(query.page as string, 10);
  }

  objectPagination["skip"]= (objectPagination.currentPage - 1) * objectPagination.limitItems;

  const totalPage = Math.ceil(countTopics/objectPagination.limitItems);
  objectPagination["totalPage"] = totalPage;

  return objectPagination;
}