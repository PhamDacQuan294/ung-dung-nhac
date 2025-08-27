"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectPagination = void 0;
;
const objectPagination = (objectPagination, query, countTopics) => {
    if (query.page) {
        objectPagination.currentPage = parseInt(query.page, 10);
    }
    objectPagination["skip"] = (objectPagination.currentPage - 1) * objectPagination.limitItems;
    const totalPage = Math.ceil(countTopics / objectPagination.limitItems);
    objectPagination["totalPage"] = totalPage;
    return objectPagination;
};
exports.objectPagination = objectPagination;
