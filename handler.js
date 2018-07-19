const { getProcessedImages, getImageSigned, jpegifyImage, uploadImage } = require('./src/processImage')

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
      headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
      },
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
      statusCode: 302,
      headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials" : true, // Required for cookies, authorization headers with HTTPS
        Location: url
      }
    }
    callback(null, response)
  } catch (err) {
    callback(err, null)
  }
}

module.exports.uploadImage = async (event, context, callback) => {
  try {
    const body = JSON.parse(event.body)
    console.log('name ', body.name)
    console.log('event ', body)
    const res = await uploadImage(body.name, body.image, body.type)
    const response = {
      headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify({ res }),
      statusCode: 200
    }
    callback(null, response)
  } catch (err) {
    callback(err, null)
  }
}
