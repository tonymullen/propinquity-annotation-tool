let annotatorsCollection;

class AnnotatorsDAO {
  static async injectDB(conn) {
    if (annotatorsCollection) {
      return;
    }
    try {
        annotatorsCollection = await conn.db(process.env.ANNOTATIONS_COLLECTION)
                      .collection('annotators');
        // console.log("Injected collection");
    }
    catch(e) {
      console.error(`Unable to connect in AnnotatorsDAO: ${e}`);
    }
  }

  static async getAnnotatorProgress(annot_name) {
    let cursor;
    try {
      cursor = await annotatorsCollection.find({
        annotator_name: annot_name
      });
      const annotator_data = await cursor.toArray();
      return annotator_data;
    } catch(e) {
      console.error(`Something went wrong in getAnnotations: ${e}`);
      throw e;
    }
  }

  static async updateProgress(annotator, lineIndex, docIndex) {
    console.log("Updating progress")
    console.log(lineIndex)
    try {
      const updateResponse = await annotatorsCollection.updateOne(
        { annotator_name: annotator },
        { $set: { "progress.current_line_ind": lineIndex,
                  "progress.current_doc_ind": docIndex }},
        { upsert: true }
      )
      return updateResponse
    } catch(e) {
      console.error(`Something went wrong in getAnnotations: ${e}`);
      throw e;
    }
  }
}

module.exports = AnnotatorsDAO
