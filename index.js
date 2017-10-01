'use strict';

const { Promise, promisify } = require('bluebird')
const readFile = promisify(require('fs').readFile)

const AWS = require('aws-sdk');
const s3 = new AWS.S3()

const BaseAdapter = require('ghost-storage-base');

class QGhostS3 extends BaseAdapter {

  constructor(config) {
    super();
    this.config = config
    
    AWS.config.setPromisesDependency(Promise)
    this.s3 = () => new AWS.S3({
      accessKeyId: this.config.accessKeyId,
      bucket: this.config.bucket,
      region: this.config.region,
      secretAccessKey: this.config.secretAccessKey
    })
  }

  save(image) {
    return new Promise((resolve, reject) => {
      const fileName = new Date().getTime() + image.name; //temporary method to generate a unique-ish filename to prove some code

      readFile(image.path)
        .then((file) => {
          console.log(image)
          this.s3()
            .putObject({
              ACL: 'public-read',
              Body: file,
              Key: fileName,
              Bucket: this.config.bucket
            }).promise()
            .then(resolve(`https://s3.${this.config.region}.amazonaws.com/${this.config.bucket}/${fileName}`)).catch(reject)
        })
    })
  }

  serve() {
    return function customServe(req, res, next) {
      next();
    }
  }

  delete() { }
  read() { }
  exists() { }  
}

module.exports = QGhostS3;