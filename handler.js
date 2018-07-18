const { getImage, getProcessedImages, getImageSigned, jpegifyImage } = require('./src/processImage')

module.exports.processImages = async (event, context, callback) => {
  for(const record of event.Records) {
    console.log(record)
    console.log('Processing ', record.s3.object.key)
    try {
      const res = await jpegifyImage(record.s3.object.key)
      callback(null, { res, msg: 'done' })
    } catch (err) {
      callback(err, null)
    }
  }

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

module.exports.getProcessedImages = async (event, context, callback) => {
  try {
    const imageList = await getProcessedImages()
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(imageList)
    })
  } catch (err) {
    callback(err, null)
  }
}

module.exports.getImageSigned = async (event, context, callback) => {
  try {
    const url = await getImageSigned(event.pathParameters.name)
    console.log('url ', url)
    const response = {
      body: null,
      statusCode: 307,
      headers: {
        Location: url
      }
    }
    callback(null, response)
  } catch (err) {
    callback(err, null)
  }
}
