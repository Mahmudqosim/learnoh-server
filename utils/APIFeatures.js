class APIFeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  search() {
    const keyword = this.queryString.keyword
      ? {
          name: {
            $regex: this.queryString.keyword,
            $options: "i",
          },
        }
      : {}

    this.query = this.query
      .find({ ...keyword })
      .populate("instructor", "_id username")

    return this
  }

  filter() {
    let searchQuery = { ...this.queryString }

    const fieldsToRemove = ["keyword", "page"]
    fieldsToRemove.forEach((field) => delete searchQuery[field])

    this.query = this.query.find(searchQuery)

    return this
  }

  pagination(resultsPerPage) {
    const currentPage = Number(this.queryString.page) || 1

    const skip = resultsPerPage * (currentPage - 1)

    this.query = this.query.limit(resultsPerPage).skip(skip)

    return this
  }
}

module.exports = APIFeatures
