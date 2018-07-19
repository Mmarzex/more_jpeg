const S3 = require('aws-sdk/clients/s3')
const Sharp = require('sharp')
const util = require('util')

const s3 = new S3({ region: 'us-east-1' })

module.exports.jpegifyImage = async (key) => {
  try {
    const rawImage = await s3.getObject({
      Bucket: process.env.IMAGE_BUCKET,
      Key: key
    }).promise()

    const img = new Buffer(rawImage.Body.buffer, 'base64')
    const processedImage =  await Sharp(img)
      .jpeg({ quality: 1 })
      .toBuffer()

    const fileName = key.split('/')[1].split('.')[0]

    await s3.putObject({
      Body: processedImage,
      Bucket: process.env.IMAGE_BUCKET,
      Key: `processed/${fileName}.jpg`
    }).promise()
    return true
  } catch (err) {
    return Promise.reject(err)
  }
}

module.exports.getProcessedImages = async () => {
  try {
    const imageList = await s3.listObjectsV2({
      Bucket: process.env.IMAGE_BUCKET,
      Prefix: 'processed/'
    }).promise()

    return imageList.Contents.map(c => c.Key.split('/')[1].split('.')[0])
  } catch (err) {
    return Promise.reject(err)
  }
}

module.exports.getImageSigned = async (name) => {
  try {
    const getSignedUrl = util.promisify(s3.getSignedUrl)
    // const data = await getSignedUrl({ })
    const data = await (new Promise((resolve, reject) => {
      s3.getSignedUrl('getObject', {
        Bucket: process.env.IMAGE_BUCKET,
        Key: `processed/${name}.jpg`
      }, (err, data) => {
        console.log('err ', err)
        console.log('data ', data)
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }))
    return data
  } catch (err) {
    return Promise.reject(err)
  }
}

module.exports.uploadImage = async (name, imageBody, imageType) => {
  try {
    console.log('imageBody ', imageBody)
    const imageBuffer = new Buffer(imageBody, 'base64')
    const res = await s3.putObject({
      ContentEncoding: imageType,
      Body: imageBuffer,
      Bucket: process.env.IMAGE_BUCKET,
      Key: `uploads/${name}`
    }).promise()
    console.log('res ', res)
    return true
  } catch (err) {
    return Promise.reject(err)
  }
}
