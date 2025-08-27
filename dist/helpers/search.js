"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectSearh = void 0;
const convertToSlug_1 = require("./convertToSlug");
const objectSearh = (query) => {
    if (query.keyword) {
        const keyword = `${query.keyword}`;
        const keywordRegex = new RegExp(keyword, "i");
        const stringSlug = (0, convertToSlug_1.convertToSlug)(keyword);
        const stringSlugRegex = new RegExp(stringSlug, "i");
        return {
            keyword,
            keywordRegex,
            stringSlugRegex
        };
    }
    ;
};
exports.objectSearh = objectSearh;
