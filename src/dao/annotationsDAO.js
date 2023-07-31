let annotationsCollection;

class AnnotationsDAO {
  static async injectDB(conn) {
    if (annotationsCollection) {
      return;
    }
    try {
        annotationsCollection = await conn.db(process.env.ANNOTATIONS_COLLECTION)
                      .collection('annotations');
        // console.log("Injected collection");
    }
    catch(e) {
      console.error(`Unable to connect in AnnotationsDAO: ${e}`);
    }
  }

  static async updateAnnotations(userId, annotations) {
    try {
      const updateResponse = await annotationsCollection.updateOne(
        { _id: userId },
        { $set: { annotations: annotations }},
        { upsert: true }
      )
      return updateResponse
    }
    catch(e) {
      console.error(`Unable to update favorites: ${e}`);
      return { error: e };
    }
  }


  static async addAnnotation(userId, data_file, index, annotation) {
    try {
      const reviewDoc = {
        annotator: userId,
        data_file: data_file,
        index: index,
        annotation: annotation
      }
      return await annotationsCollection.insertOne(reviewDoc);
    } catch(e) {
      console.error(`Unable to post review: ${e}`);
      return { error: e };
    }
  }

//   static async getAnnotations(id) {
//     let cursor;
//     try {
//       cursor = await annotationsCollection.find({
//         _id: id
//       });
//       const annotations = await cursor.toArray();
//       return annotations[0];
//     } catch(e) {
//       console.error(`Something went wrong in getAnnotations: ${e}`);
//       throw e;
//     }
//   }
}

module.exports = AnnotationsDAO
