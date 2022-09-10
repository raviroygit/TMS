class BaseClass {
  static async insertData(data = {}) {
    const insertedData = await this.insertMany(data);

    return insertedData;
  }

  static async searchData(query) {
    const searchData = await this.find(query);

    return searchData;
  }

  static async searchOneDocument(query) {
    const searchData = await this.findOne(query);

    return searchData;
  }

  static async upsertData(condition, query) {
    const updatedData = await this.update(condition, query, {
      upsert: true,
      multi: true,
      setDefaultsOnInsert: true
    });

    return updatedData;
  }

  static async deleteData(query) {
    const deleteMultipleData = await this.deleteMany(query);

    return deleteMultipleData;
  }
}

module.exports = BaseClass;